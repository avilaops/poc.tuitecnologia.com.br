// Especificação OpenAPI da API real do JurisFlow Municipal (item 6.4.27 do TR).
// Servida autenticada em /api/docs (HTML) e /api/docs/openapi.json (máquina).

const errorSchema = { type: 'object', properties: { error: { type: 'string' } } }

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'JurisFlow Municipal — API',
    version: '1.1.0',
    description: 'API do ambiente de prova de conceito (Pregão Eletrônico nº 110/2026). Autenticação por sessão em cookie httpOnly; toda chamada autenticada gera evento na trilha de auditoria.',
    contact: { name: 'Tui Tecnologia', url: 'https://poc.tuitecnologia.com.br' },
  },
  servers: [{ url: 'https://poc.tuitecnologia.com.br' }],
  components: {
    securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: 'jurisflow_session' } },
    schemas: {
      Error: errorSchema,
      User: { type: 'object', properties: { id: { type: 'string' }, username: { type: 'string' }, displayName: { type: 'string' }, role: { type: 'string', enum: ['guest', 'presenter', 'owner'] }, active: { type: 'boolean' }, ssoOnly: { type: 'boolean' }, createdAt: { type: 'string', format: 'date-time' } } },
      DatajudProcess: { type: 'object', properties: { numeroProcesso: { type: 'string' }, tribunal: { type: 'string' }, grau: { type: 'string' }, classe: { type: 'string', nullable: true }, assuntos: { type: 'array', items: { type: 'string' } }, orgaoJulgador: { type: 'string', nullable: true }, sistema: { type: 'string', nullable: true }, dataAjuizamento: { type: 'string', nullable: true }, totalMovimentos: { type: 'integer' }, ultimoMovimento: { type: 'object', nullable: true, properties: { nome: { type: 'string', nullable: true }, dataHora: { type: 'string', nullable: true } } } } },
    },
  },
  security: [{ session: [] }],
  paths: {
    '/health': { get: { summary: 'Verificação de saúde da aplicação e do banco', security: [], responses: { 200: { description: 'Aplicação e banco operacionais' } } } },
    '/api/auth/login': { post: { summary: 'Autenticação local com usuário e senha', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string', format: 'password' } } } } } }, responses: { 200: { description: 'Sessão criada; cookie httpOnly emitido' }, 401: { description: 'Credenciais inválidas' } } } },
    '/api/auth/session': { get: { summary: 'Situação da sessão atual', responses: { 200: { description: 'Sessão válida com dados do usuário' }, 401: { description: 'Não autenticado' } } } },
    '/api/auth/logout': { post: { summary: 'Encerra a sessão atual', responses: { 200: { description: 'Sessão encerrada' } } } },
    '/api/admin/users': {
      get: { summary: 'Lista todos os usuários cadastrados (base do relatório do item 6.4.3)', responses: { 200: { description: 'Lista de usuários', content: { 'application/json': { schema: { type: 'object', properties: { users: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } } } },
      post: { summary: 'Cria usuário com senha (hash scrypt) e perfil', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['username', 'password', 'displayName'], properties: { username: { type: 'string' }, password: { type: 'string', minLength: 8 }, displayName: { type: 'string' }, role: { type: 'string', enum: ['guest', 'presenter', 'owner'] } } } } } }, responses: { 201: { description: 'Usuário criado' }, 409: { description: 'Usuário já existe' } } },
    },
    '/api/admin/users/{id}': { patch: { summary: 'Ativa ou desativa uma conta', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { active: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Situação atualizada' }, 404: { description: 'Usuário não encontrado' } } } },
    '/api/integrations/status': { get: { summary: 'Saúde real dos conectores DataJud/CNJ (consulta cronometrada por tribunal)', responses: { 200: { description: 'Latência e disponibilidade por tribunal' } } } },
    '/api/integrations/datajud/process': { post: { summary: 'Consulta processual real por número CNJ na API Pública DataJud', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['tribunal', 'number'], properties: { tribunal: { type: 'string', enum: ['TJSP', 'TRF-3', 'TRT-15', 'STJ', 'TST'] }, number: { type: 'string', description: 'Número CNJ com 20 dígitos' } } } } } }, responses: { 200: { description: 'Processo localizado', content: { 'application/json': { schema: { type: 'object', properties: { latencyMs: { type: 'integer' }, process: { $ref: '#/components/schemas/DatajudProcess' } } } } } }, 404: { description: 'Processo não localizado no índice público' } } } },
    '/api/sign/certificate': { get: { summary: 'Certificado ativo do serviço de assinatura (A1/A3)', responses: { 200: { description: 'Metadados do certificado e modo de operação' } } } },
    '/api/sign/petition': { post: { summary: 'Gera petição em PDF e aplica assinatura digital PAdES (CMS/PKCS#7)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['processNumber'], properties: { processNumber: { type: 'string' }, title: { type: 'string' } } } } } }, responses: { 200: { description: 'PDF assinado (application/pdf)' } } } },
    '/api/access/page-view': { post: { summary: 'Registra visualização de página na trilha de auditoria', responses: { 204: { description: 'Evento registrado' } } } },
    '/api/admin/visitors': { get: { summary: 'Métricas de visitantes e eventos da demonstração', responses: { 200: { description: 'Totais, visitantes e eventos recentes' } } } },
    '/api/admin/monitoring': { get: { summary: 'Monitoramento operacional (banco, sessões, portal)', responses: { 200: { description: 'Indicadores de operação' } } } },
  },
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function renderOperations() {
  const blocks = []
  for (const [path, methods] of Object.entries(openApiSpec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const responses = Object.entries(op.responses || {}).map(([code, r]) => `${code} — ${r.description}`).join('\n')
      const reqSchema = op.requestBody?.content?.['application/json']?.schema
      blocks.push(`<details class="op">
        <summary><span class="method ${method}">${method.toUpperCase()}</span><span class="path">${escapeHtml(path)}</span><span class="summary">${escapeHtml(op.summary || '')}</span></summary>
        <div class="body">
          ${op.security?.length === 0 ? '<span class="tag">público</span>' : '<span class="tag">sessão obrigatória</span>'}
          ${reqSchema ? `<p><strong>Corpo da requisição</strong></p><pre>${escapeHtml(JSON.stringify(reqSchema, null, 2))}</pre>` : ''}
          <p><strong>Respostas</strong></p><pre>${escapeHtml(responses)}</pre>
        </div>
      </details>`)
    }
  }
  return blocks.join('\n')
}

function docsPage() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow,noarchive" />
<title>JurisFlow Municipal — Documentação da API</title>
<style>
  :root { font-family: "Segoe UI", system-ui, sans-serif; color: #162634; }
  body { margin: 0; background: #f3f5f6; }
  header { padding: 26px 32px; color: #eaf7f5; background: linear-gradient(150deg, #0a343f, #092332); }
  header h1 { margin: 0 0 4px; font-size: 22px; letter-spacing: -.03em; }
  header p { margin: 0; color: #9db6bc; font-size: 13px; }
  header a { color: #45c8b8; font-size: 12px; }
  main { max-width: 880px; margin: 0 auto; padding: 26px 20px 60px; }
  .op { margin-bottom: 12px; background: #fff; border: 1px solid #dde4e7; border-radius: 12px; overflow: hidden; }
  .op summary { display: flex; align-items: center; gap: 10px; padding: 13px 16px; cursor: pointer; list-style: none; }
  .op summary::-webkit-details-marker { display: none; }
  .method { min-width: 54px; padding: 3px 0; border-radius: 7px; font-size: 11px; font-weight: 700; text-align: center; color: #fff; }
  .get { background: #0d7a43; } .post { background: #0b62a8; } .patch { background: #a3660b; }
  .path { font-family: Consolas, monospace; font-size: 13px; }
  .summary { color: #687984; font-size: 12px; margin-left: auto; text-align: right; }
  .body { padding: 4px 16px 15px; border-top: 1px solid #eef1f2; color: #405660; font-size: 12.5px; line-height: 1.55; }
  .body pre { padding: 11px 13px; background: #0e2230; color: #cfe6df; border-radius: 9px; font-size: 11.5px; overflow-x: auto; }
  .tag { display: inline-block; margin: 2px 4px 2px 0; padding: 2px 8px; background: #eef6f4; color: #087f76; border-radius: 20px; font-size: 11px; font-weight: 650; }
</style>
</head>
<body>
<header>
  <h1>JurisFlow Municipal — API</h1>
  <p>Especificação viva da API real deste ambiente (item 6.4.27 do TR) · <a href="/api/docs/openapi.json">baixar openapi.json</a></p>
</header>
<main>
${renderOperations()}
</main>
</body>
</html>`
}

export function registerApiDocsRoutes(app, { requireSession }) {
  app.get('/api/docs/openapi.json', requireSession, (_req, res) => {
    res.json(openApiSpec)
  })
  app.get('/api/docs', requireSession, (_req, res) => {
    res.type('html').send(docsPage())
  })
}
