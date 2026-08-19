const DATAJUD_BASE = 'https://api-publica.datajud.cnj.jus.br'

// Chave pública documentada pelo CNJ para a API Pública do DataJud.
// https://datajud-wiki.cnj.jus.br/api-publica/acesso
const DEFAULT_PUBLIC_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

const apiKey = process.env.DATAJUD_API_KEY || DEFAULT_PUBLIC_KEY

export const datajudAliases = {
  TJSP: 'api_publica_tjsp',
  'TRF-3': 'api_publica_trf3',
  'TRT-15': 'api_publica_trt15',
  STJ: 'api_publica_stj',
  TST: 'api_publica_tst',
}

async function datajudSearch(tribunal, body, timeoutMs = 10_000) {
  const alias = datajudAliases[tribunal]
  if (!alias) throw Object.assign(new Error(`Tribunal não suportado: ${tribunal}`), { status: 400 })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = performance.now()
  try {
    const response = await fetch(`${DATAJUD_BASE}/${alias}/_search`, {
      method: 'POST',
      headers: { Authorization: `APIKey ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const latencyMs = Math.round(performance.now() - startedAt)
    if (!response.ok) {
      throw Object.assign(new Error(`DataJud respondeu ${response.status}`), { status: 502, latencyMs })
    }
    return { payload: await response.json(), latencyMs }
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeHit(hit) {
  const source = hit._source || {}
  const movements = Array.isArray(source.movimentos) ? source.movimentos : []
  const lastMovement = movements.length
    ? [...movements].sort((a, b) => String(a.dataHora || '').localeCompare(String(b.dataHora || ''))).at(-1)
    : null
  return {
    numeroProcesso: source.numeroProcesso,
    tribunal: source.tribunal,
    grau: source.grau,
    classe: source.classe?.nome ?? null,
    assuntos: (source.assuntos || []).map((item) => item?.nome).filter(Boolean).slice(0, 5),
    orgaoJulgador: source.orgaoJulgador?.nome ?? null,
    sistema: source.sistema?.nome ?? null,
    formato: source.formato?.nome ?? null,
    dataAjuizamento: source.dataAjuizamento ?? null,
    dataUltimaAtualizacao: source.dataHoraUltimaAtualizacao ?? null,
    totalMovimentos: movements.length,
    ultimoMovimento: lastMovement
      ? { nome: lastMovement.nome ?? null, dataHora: lastMovement.dataHora ?? null }
      : null,
  }
}

export function registerIntegrationRoutes(app, { requireSession, recordEvent }) {
  // Saúde real dos conectores DataJud: uma consulta cronometrada por tribunal.
  app.get('/api/integrations/status', requireSession, async (req, res, next) => {
    try {
      const results = await Promise.all(Object.keys(datajudAliases).map(async (tribunal) => {
        try {
          const { payload, latencyMs } = await datajudSearch(tribunal, { size: 0, query: { match_all: {} } }, 8_000)
          return {
            tribunal,
            ok: true,
            latencyMs,
            totalIndexed: payload?.hits?.total?.value ?? null,
            totalRelation: payload?.hits?.total?.relation ?? null,
          }
        } catch (error) {
          return { tribunal, ok: false, latencyMs: error.latencyMs ?? null, error: error.message }
        }
      }))
      await recordEvent(req, 'integration_health_check', {
        userId: req.auth.user_id,
        success: results.every((item) => item.ok),
        metadata: { source: 'datajud', okCount: results.filter((item) => item.ok).length },
      })
      res.json({ generatedAt: new Date().toISOString(), provider: 'API Pública DataJud/CNJ', results })
    } catch (error) {
      next(error)
    }
  })

  // Consulta processual real por número, no índice público do tribunal escolhido.
  app.post('/api/integrations/datajud/process', requireSession, async (req, res, next) => {
    try {
      const tribunal = String(req.body?.tribunal || '').toUpperCase()
      const digits = String(req.body?.number || '').replace(/\D/g, '')
      if (!datajudAliases[tribunal]) return res.status(400).json({ error: 'Tribunal não suportado.' })
      if (digits.length !== 20) return res.status(400).json({ error: 'Informe o número CNJ completo (20 dígitos).' })

      const { payload, latencyMs } = await datajudSearch(tribunal, {
        size: 1,
        query: { match: { numeroProcesso: digits } },
      })
      const hit = payload?.hits?.hits?.[0]
      await recordEvent(req, 'integration_process_lookup', {
        userId: req.auth.user_id,
        success: Boolean(hit),
        metadata: { tribunal, number: digits, found: Boolean(hit), latencyMs },
      })
      if (!hit) return res.status(404).json({ error: 'Processo não localizado no índice público do tribunal.', latencyMs })
      res.json({ latencyMs, provider: 'API Pública DataJud/CNJ', process: normalizeHit(hit) })
    } catch (error) {
      next(error)
    }
  })
}
