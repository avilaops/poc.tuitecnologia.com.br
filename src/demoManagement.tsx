import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Database,
  Download,
  FileText,
  Gauge,
  Globe2,
  KeyRound,
  Laptop2,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  Plus,
  Printer,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  Users,
  Wifi,
  XCircle,
} from 'lucide-react'
import { pocRequirements } from './data'
import type { AuditEvent } from './types'

export interface DemoSession {
  id: string
  contact: string
  company: string
  email: string
  code: string
  createdAt: string
  expiresAt: string
  status: 'Ativa' | 'Expirada' | 'Revogada'
  accesses: number
}

interface VisitorSummary {
  visitorId: string
  firstSeen: string
  lastSeen: string
  events: number
  authenticatedEvents: number
  device: string
}

interface VisitorEvent {
  at: string
  eventType: string
  success: boolean
  visitorId: string
  path: string
  device: string
}

interface VisitorsPayload {
  generatedAt: string
  totals: { visitors: number; authenticatedLogins: number; pageViews: number; attempts: number }
  visitors: VisitorSummary[]
  recentEvents: VisitorEvent[]
  source?: 'live' | 'demo'
}

interface MonitoringPayload {
  generatedAt: string
  uptimeSeconds: number
  databaseLatencyMs: number
  databaseSizeMb: number
  activeSessions: number
  logins24h: number
  failures24h: number
  alertConfigured: boolean
  portal: { ok: boolean; status: number | null; latencyMs: number | null }
  source?: 'live' | 'demo'
}

const visitorFallback: VisitorsPayload = {
  generatedAt: new Date().toISOString(),
  totals: { visitors: 4, authenticatedLogins: 3, pageViews: 18, attempts: 7 },
  visitors: [
    { visitorId: '3a8cf0ae2d99', firstSeen: '03/08/2026 18:20', lastSeen: '03/08/2026 18:42', events: 9, authenticatedEvents: 3, device: 'Edge · Windows' },
    { visitorId: 'd72d90d443ba', firstSeen: '03/08/2026 18:22', lastSeen: '03/08/2026 18:31', events: 5, authenticatedEvents: 2, device: 'Chrome · Android' },
    { visitorId: 'b036349d76f9', firstSeen: '03/08/2026 18:21', lastSeen: '03/08/2026 18:25', events: 3, authenticatedEvents: 1, device: 'Safari · iPhone' },
  ],
  recentEvents: [],
  source: 'demo',
}

const monitoringFallback: MonitoringPayload = {
  generatedAt: new Date().toISOString(), uptimeSeconds: 0, databaseLatencyMs: 0, databaseSizeMb: 0,
  activeSessions: 0, logins24h: 0, failures24h: 0, alertConfigured: true,
  portal: { ok: true, status: 200, latencyMs: 0 }, source: 'demo',
}

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
const formatDuration = (seconds: number) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`

function SourceBadge({ source }: { source?: 'live' | 'demo' }) {
  return <span className={`data-source-badge ${source === 'demo' ? 'demo' : ''}`}><span />{source === 'demo' ? 'Amostra visual' : 'Dados do servidor'}</span>
}

export function VisitorsView() {
  const [data, setData] = useState<VisitorsPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/visitors', { credentials: 'same-origin' })
      if (!response.ok) throw new Error('indisponível')
      setData({ ...(await response.json()), source: 'live' })
    } catch {
      setData({ ...visitorFallback, generatedAt: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])
  const payload = data || visitorFallback

  return <div className="management-stack">
    <section className="management-hero visitor-hero">
      <div><p className="section-kicker">Inteligência comercial</p><h2>Quem entrou e como explorou a demonstração</h2><p>Identificadores pseudonimizados permitem acompanhar interesse sem armazenar o IP bruto.</p></div>
      <div className="hero-actions"><SourceBadge source={payload.source} /><button className="secondary-button" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Atualizar</button></div>
    </section>
    <section className="insight-grid">
      <InsightCard icon={Users} label="Visitantes" value={payload.totals.visitors} detail="últimos 30 dias" tone="teal" />
      <InsightCard icon={UserRoundCheck} label="Logins autenticados" value={payload.totals.authenticatedLogins} detail="SSO confirmado" tone="green" />
      <InsightCard icon={Activity} label="Páginas vistas" value={payload.totals.pageViews} detail="navegação registrada" tone="blue" />
      <InsightCard icon={AlertTriangle} label="Tentativas bloqueadas" value={payload.totals.attempts} detail="sem acesso ao conteúdo" tone="amber" />
    </section>
    <section className="management-grid visitors-layout">
      <div className="panel management-panel"><ManagementHeading kicker="Visitantes recentes" title="Sessões identificadas" aside={`${payload.visitors.length} registros`} />
        <div className="visitor-list">{payload.visitors.map((visitor) => <article className="visitor-row" key={visitor.visitorId}>
          <span className="visitor-avatar"><Laptop2 size={18} /></span><div className="visitor-main"><div><strong>{visitor.visitorId}</strong><span>{visitor.authenticatedEvents ? 'Autenticado' : 'Anônimo'}</span></div><p>{visitor.device}</p><small>Primeiro acesso {formatDate(visitor.firstSeen)} · último {formatDate(visitor.lastSeen)}</small></div><div className="visitor-score"><strong>{visitor.events}</strong><small>eventos</small></div>
        </article>)}</div>
      </div>
      <aside className="panel management-panel"><ManagementHeading kicker="Leitura rápida" title="Sinais de interesse" />
        <div className="signal-list"><Signal tone="green" title="Acesso autenticado" text="A conta de apresentação concluiu o SSO com sucesso." /><Signal tone="blue" title="Exploração da solução" text="Cada mudança de módulo é registrada como visualização." /><Signal tone="amber" title="Privacidade preservada" text="IP bruto, senha e conteúdo jurídico não aparecem neste painel." /></div>
      </aside>
    </section>
  </div>
}

export function DemoSessionsView({ sessions, setSessions, notify }: { sessions: DemoSession[]; setSessions: React.Dispatch<React.SetStateAction<DemoSession[]>>; notify: (message: string) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [contact, setContact] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')

  const createSession = () => {
    if (!contact.trim() || !company.trim() || !email.includes('@')) return notify('Preencha contato, empresa e e-mail válido.')
    const now = new Date()
    const expiration = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const code = `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    setSessions((current) => [{ id: crypto.randomUUID(), contact: contact.trim(), company: company.trim(), email: email.trim(), code, createdAt: now.toISOString(), expiresAt: expiration.toISOString(), status: 'Ativa', accesses: 0 }, ...current])
    setContact(''); setCompany(''); setEmail(''); setShowForm(false)
    notify('Sessão individual criada na simulação. Integração de convite está no roadmap.')
  }

  const revoke = (id: string) => {
    setSessions((current) => current.map((item) => item.id === id ? { ...item, status: 'Revogada' } : item))
    notify('Sessão revogada e registrada na demonstração.')
  }

  return <div className="management-stack">
    <section className="management-hero"><div><p className="section-kicker">Acesso por interessado</p><h2>Salas individuais de demonstração</h2><p>Organize prospect, empresa, validade e atividade antes de integrar a emissão real do convite.</p></div><button className="primary-button" onClick={() => setShowForm((value) => !value)}><Plus size={17} /> Nova sessão</button></section>
    <div className="scope-notice"><ShieldCheck size={19} /><div><strong>Fluxo demonstrável, convite ainda simulado</strong><p>A criação e revogação funcionam nesta sessão. O envio de link autenticado individual exige uma conta administrativa separada da credencial compartilhada.</p></div></div>
    {showForm && <section className="panel session-form"><div><label>Contato<input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Nome da pessoa" /></label><label>Empresa<input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Órgão ou empresa" /></label><label>E-mail<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contato@empresa.com" type="email" /></label></div><div><button className="secondary-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" onClick={createSession}>Criar sessão simulada</button></div></section>}
    <section className="panel management-panel"><ManagementHeading kicker="Carteira de demonstrações" title={`${sessions.length} sessões organizadas`} aside="Validade padrão: 7 dias" />
      <div className="session-list">{sessions.map((session) => <article className="session-row" key={session.id}><span className="session-company"><Building2 size={18} /></span><div className="session-identity"><strong>{session.company}</strong><span>{session.contact} · {session.email}</span></div><code>{session.code}</code><div className="session-expiration"><small>Expira em</small><strong>{formatDate(session.expiresAt)}</strong></div><span className={`session-status ${session.status.toLowerCase()}`}>{session.status}</span><div className="session-actions"><button className="icon-button" onClick={() => { void navigator.clipboard?.writeText(session.code); notify('Código copiado.') }} aria-label={`Copiar código de ${session.company}`}><Copy size={16} /></button><button className="icon-button danger" onClick={() => revoke(session.id)} disabled={session.status !== 'Ativa'} aria-label={`Revogar sessão de ${session.company}`}><XCircle size={16} /></button></div></article>)}</div>
    </section>
  </div>
}

export function ReportsView({ audit, notify }: { audit: AuditEvent[]; notify: (message: string) => void }) {
  const demonstrable = pocRequirements.filter((item) => item.coverage === 'Demonstrável').length
  const exportJson = () => {
    const payload = { generatedAt: new Date().toISOString(), title: 'Relatório pós-apresentação — JurisFlow Municipal', requirements: pocRequirements, audit }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'jurisflow-relatorio-apresentacao.json'; anchor.click(); URL.revokeObjectURL(url)
    notify('Relatório estruturado exportado em JSON.')
  }

  return <div className="management-stack report-page">
    <section className="management-hero no-print"><div><p className="section-kicker">Evidência comercial e técnica</p><h2>Relatório pós-apresentação</h2><p>Consolide escopo, cobertura, limitações e eventos da sessão em um documento entregável.</p></div><div className="hero-actions"><button className="secondary-button" onClick={exportJson}><Download size={16} /> Exportar dados</button><button className="primary-button" onClick={() => window.print()}><Printer size={17} /> Imprimir / salvar PDF</button></div></section>
    <section className="report-sheet panel">
      <header><div className="report-brand"><span>§</span><div><strong>JurisFlow Municipal</strong><small>Prova de conceito · Pregão Eletrônico 110/2026</small></div></div><div><small>Gerado em</small><strong>{formatDate(new Date().toISOString())}</strong></div></header>
      <div className="report-title"><p>Relatório executivo</p><h2>Evidências da apresentação técnica</h2><span>Documento baseado em dados fictícios e eventos da sessão atual.</span></div>
      <div className="report-metrics"><span><strong>{demonstrable}/10</strong><small>fluxos demonstráveis</small></span><span><strong>{audit.length}</strong><small>eventos registrados</small></span><span><strong>100%</strong><small>dados fictícios</small></span></div>
      <section><h3>Cobertura do item 12.7</h3><div className="report-requirements">{pocRequirements.map((item) => <article key={item.ref}><span>{item.ref}</span><div><strong>{item.title}</strong><p>{item.evidence}</p></div><em className={item.coverage.toLowerCase()}>{item.coverage}</em></article>)}</div></section>
      <section><h3>Atividade mais recente</h3><div className="report-audit">{audit.slice(0, 6).map((event) => <article key={event.id}><span>{event.at}</span><div><strong>{event.action}</strong><p>{event.detail}</p></div></article>)}</div></section>
      <footer><ShieldCheck size={18} /><p>Integrações externas, assinatura A3 e aceite formal dependem de homologação. Este relatório não substitui avaliação da comissão.</p></footer>
    </section>
  </div>
}

export function MonitoringView() {
  const [data, setData] = useState<MonitoringPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/monitoring', { credentials: 'same-origin' })
      if (!response.ok) throw new Error('indisponível')
      setData({ ...(await response.json()), source: 'live' })
    } catch { setData({ ...monitoringFallback, generatedAt: new Date().toISOString() }) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const payload = data || monitoringFallback
  const healthy = payload.portal.ok && payload.databaseLatencyMs < 500

  return <div className="management-stack">
    <section className={`monitoring-hero ${healthy ? 'healthy' : 'warning'}`}><div className="health-orb"><Gauge size={30} /></div><div><p className="section-kicker">Estado operacional</p><h2>{healthy ? 'Ambiente disponível e respondendo' : 'Atenção necessária no ambiente'}</h2><p>Última leitura {formatDate(payload.generatedAt)} · uptime {formatDuration(payload.uptimeSeconds)}</p></div><div className="hero-actions"><SourceBadge source={payload.source} /><button className="secondary-button" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Verificar agora</button></div></section>
    <section className="service-grid"><ServiceCard icon={Server} title="Aplicação POC" status="Operacional" detail={`Uptime ${formatDuration(payload.uptimeSeconds)}`} ok /><ServiceCard icon={Database} title="PostgreSQL" status={`${payload.databaseLatencyMs} ms`} detail={`${payload.databaseSizeMb.toFixed(1)} MB utilizados`} ok={payload.databaseLatencyMs < 500} /><ServiceCard icon={Globe2} title="Portal do cliente" status={payload.portal.ok ? `HTTP ${payload.portal.status}` : 'Indisponível'} detail={payload.portal.latencyMs === null ? 'sem resposta' : `${payload.portal.latencyMs} ms`} ok={payload.portal.ok} /><ServiceCard icon={BellRing} title="Alertas" status={payload.alertConfigured ? 'Configurado' : 'Pendente'} detail="Discord privado" ok={payload.alertConfigured} /></section>
    <section className="management-grid"><div className="panel management-panel"><ManagementHeading kicker="Últimas 24 horas" title="Indicadores operacionais" /><div className="ops-stat-list"><span><em>Sessões ativas</em><strong>{payload.activeSessions}</strong></span><span><em>Logins concluídos</em><strong>{payload.logins24h}</strong></span><span><em>Falhas de autorização</em><strong>{payload.failures24h}</strong></span><span><em>Latência do banco</em><strong>{payload.databaseLatencyMs} ms</strong></span></div></div><aside className="panel management-panel"><ManagementHeading kicker="Próxima camada" title="Cobertura recomendada" /><div className="signal-list"><Signal tone="green" title="Health check ativo" text="Aplicação e banco são consultados em tempo real." /><Signal tone="amber" title="Monitor externo" text="Adicionar verificação fora do servidor para detectar queda total." /><Signal tone="blue" title="Histórico de SLA" text="Persistir leituras para calcular disponibilidade mensal." /></div></aside></section>
  </div>
}

export function SecurityView() {
  const controls = [
    ['Cloudflare proxy', 'Ativo', 'TLS e ocultação do endereço de origem.', true],
    ['SSO assinado', 'Ativo', 'HMAC-SHA256, audiência, validade e token de uso único.', true],
    ['Cookie de sessão', 'Ativo', 'Secure, HttpOnly e SameSite=Lax.', true],
    ['CSP e HSTS', 'Ativo', 'Bloqueio de frames, scripts externos e downgrade HTTPS.', true],
    ['IP pseudonimizado', 'Ativo', 'Hash com salt; IP bruto não é persistido.', true],
    ['Alerta de login', 'Ativo', 'Webhook privado após autenticação bem-sucedida.', true],
    ['Rate limiting no edge', 'Recomendado', 'Aplicar política Cloudflare específica para login e SSO.', false],
    ['Restrição geográfica', 'Opcional', 'Útil para sessões fechadas a uma região.', false],
  ] as const
  return <div className="management-stack"><section className="security-hero"><div className="security-shield"><ShieldCheck size={32} /></div><div><p className="section-kicker">Postura de proteção</p><h2>6 controles ativos, 2 evoluções disponíveis</h2><p>Segurança operacional sem transformar a apresentação em uma experiência burocrática.</p></div><span className="security-grade">A<small>POC protegida</small></span></section><section className="security-control-grid">{controls.map(([title, status, detail, active]) => <article className="security-control" key={title}><span className={active ? 'active' : 'planned'}>{active ? <Check size={17} /> : <Clock3 size={17} />}</span><div><strong>{title}</strong><p>{detail}</p></div><em className={active ? 'active' : 'planned'}>{status}</em></article>)}</section><div className="scope-notice"><LockKeyhole size={19} /><div><strong>Princípio de menor exposição</strong><p>Segredos ficam apenas no servidor; este painel apresenta o estado dos controles, nunca os valores configurados.</p></div></div></div>
}

export function MobileValidationView({ notify }: { notify: (message: string) => void }) {
  const [reviewed, setReviewed] = useState(false)
  const matrix = useMemo(() => [
    { device: 'Viewport compacto', detail: '320 × 568', status: 'Aprovado', automated: true },
    { device: 'Celular padrão', detail: '390 × 844', status: 'Aprovado', automated: true },
    { device: 'Android · Chrome', detail: 'Aparelho físico', status: reviewed ? 'Revisado' : 'Pendente', automated: false },
    { device: 'iPhone · Safari', detail: 'Aparelho físico', status: reviewed ? 'Revisado' : 'Pendente', automated: false },
    { device: 'Tablet', detail: '768 × 1024', status: 'Coberto por CSS', automated: true },
  ], [reviewed])
  return <div className="management-stack"><section className="management-hero mobile-qa-hero"><div><p className="section-kicker">Qualidade responsiva</p><h2>Validação mobile e matriz de aparelhos</h2><p>Separe evidência automatizada de inspeção física para não transformar previsão em fato.</p></div><button className="primary-button" onClick={() => { setReviewed(true); notify('Checklist físico marcado como revisado nesta demonstração.') }}><CheckCircle2 size={17} /> Registrar revisão manual</button></section><section className="device-grid">{matrix.map((item) => <article className="device-card" key={item.device}><span>{item.device.includes('iPhone') ? <Smartphone size={23} /> : item.device.includes('Android') ? <Smartphone size={23} /> : <MonitorSmartphone size={23} />}</span><div><strong>{item.device}</strong><small>{item.detail}</small></div><em className={item.status === 'Pendente' ? 'pending' : 'approved'}>{item.status}</em><p>{item.automated ? 'Layout, overflow e controles verificados automaticamente.' : 'Exige teclado, rotação, toque e navegador do aparelho real.'}</p></article>)}</section><section className="panel management-panel"><ManagementHeading kicker="Critérios verificados" title="Navegação mobile premium" aside="Última análise: 03/08/2026" /><div className="qa-checklist"><Signal tone="green" title="Tabelas em cartões" text="Processos e dívida ativa não dependem mais de rolagem horizontal." /><Signal tone="green" title="Alvos de toque" text="Controles principais foram elevados para aproximadamente 44 px." /><Signal tone="green" title="Menu e guia" text="Drawer, cabeçalho fixo e modo apresentação funcionam em 320 e 390 px." /><Signal tone="blue" title="Próximo teste" text="Validar teclado virtual, orientação e impressão em aparelhos físicos." /></div></section></div>
}

function InsightCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Users; label: string; value: string | number; detail: string; tone: string }) { return <article className="insight-card"><span className={tone}><Icon size={20} /></span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article> }
function ManagementHeading({ kicker, title, aside }: { kicker: string; title: string; aside?: string }) { return <div className="management-heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2></div>{aside && <span>{aside}</span>}</div> }
function Signal({ tone, title, text }: { tone: string; title: string; text: string }) { return <article className="signal"><i className={tone}>{tone === 'green' ? <Check size={14} /> : tone === 'amber' ? <AlertTriangle size={14} /> : <Activity size={14} />}</i><div><strong>{title}</strong><p>{text}</p></div></article> }
function ServiceCard({ icon: Icon, title, status, detail, ok }: { icon: typeof Server; title: string; status: string; detail: string; ok: boolean }) { return <article className="service-card"><span><Icon size={21} /></span><div><small>{title}</small><strong>{status}</strong><p>{detail}</p></div><i className={ok ? 'ok' : 'warning'}>{ok ? <Check size={13} /> : <AlertTriangle size={13} />}</i></article> }

export const managementSessionSeed: DemoSession[] = [
  { id: 'session-1', contact: 'Mariana Alves', company: 'Município Horizonte', email: 'mariana@exemplo.gov.br', code: 'DEMO-HORIZ7', createdAt: '2026-08-03T15:00:00.000Z', expiresAt: '2026-08-10T15:00:00.000Z', status: 'Ativa', accesses: 3 },
  { id: 'session-2', contact: 'Carlos Mendes', company: 'Consórcio Regional', email: 'carlos@exemplo.org.br', code: 'DEMO-CONS4X', createdAt: '2026-08-01T14:00:00.000Z', expiresAt: '2026-08-08T14:00:00.000Z', status: 'Revogada', accesses: 1 },
]
