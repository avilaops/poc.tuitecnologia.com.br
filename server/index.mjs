import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHmac, timingSafeEqual } from 'node:crypto'
import express from 'express'
import helmet from 'helmet'
import pg from 'pg'
import { loginPage } from './login-page.mjs'
import { sendAccessAlert } from './access-alert.mjs'
import { registerIntegrationRoutes } from './integrations.mjs'
import { registerSigningRoutes } from './signing.mjs'
import { registerUserRoutes } from './users.mjs'
import {
  anonymizeIp,
  createSessionToken,
  parseCookies,
  tokenDigest,
} from './security.mjs'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')
const port = Number(process.env.PORT || 3012)
const databaseUrl = process.env.DATABASE_URL
const accessLogSalt = process.env.ACCESS_LOG_SALT
const pocSsoSecret = process.env.POC_SSO_SECRET
const pocAllowedEmail = process.env.POC_ALLOWED_EMAIL?.trim().toLowerCase()
const accessAlertWebhookUrl = process.env.ACCESS_ALERT_WEBHOOK_URL?.trim()
const sessionTtlHours = Math.max(1, Math.min(24, Number(process.env.SESSION_TTL_HOURS || 6)))

if (!databaseUrl || !accessLogSalt || !pocSsoSecret || pocSsoSecret.length < 32 || !pocAllowedEmail) {
  throw new Error('DATABASE_URL, ACCESS_LOG_SALT, POC_SSO_SECRET e POC_ALLOWED_EMAIL são obrigatórios.')
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 })
const app = express()

app.set('trust proxy', 'loopback')
app.disable('x-powered-by')
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'no-referrer' },
}))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: false, limit: '8kb' }))

function requestContext(req) {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown'
  return {
    ipHash: anonymizeIp(rawIp, accessLogSalt),
    userAgent: String(req.get('user-agent') || '').slice(0, 500),
  }
}

function describeDevice(userAgent) {
  const value = String(userAgent || '')
  const browser = value.includes('Edg/') ? 'Edge' : value.includes('Chrome/') ? 'Chrome' : value.includes('Safari/') ? 'Safari' : value.includes('Firefox/') ? 'Firefox' : 'Navegador'
  const platform = /Android/i.test(value) ? 'Android' : /iPhone|iPad/i.test(value) ? 'iOS' : /Windows/i.test(value) ? 'Windows' : /Mac OS/i.test(value) ? 'macOS' : /Linux/i.test(value) ? 'Linux' : 'dispositivo não identificado'
  return `${browser} · ${platform}`
}

async function probePortal() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4_000)
  const startedAt = performance.now()
  try {
    const response = await fetch('https://cliente.avilaops.com/login', { method: 'HEAD', signal: controller.signal })
    return { ok: response.ok, status: response.status, latencyMs: Math.round(performance.now() - startedAt) }
  } catch {
    return { ok: false, status: null, latencyMs: null }
  } finally {
    clearTimeout(timeout)
  }
}

async function recordEvent(req, eventType, { userId = null, success = false, metadata = {}, path: eventPath } = {}) {
  const context = requestContext(req)
  await pool.query(
    `INSERT INTO access_events (user_id, event_type, ip_hash, user_agent, path, success, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [userId, eventType, context.ipHash, context.userAgent, eventPath || req.originalUrl, success, JSON.stringify(metadata)],
  )
  console.log(JSON.stringify({ at: new Date().toISOString(), eventType, success, userId, visitorId: context.ipHash.slice(0, 12) }))
}

function setSessionCookie(res, token) {
  res.cookie('jurisflow_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionTtlHours * 60 * 60 * 1000,
  })
}

async function createSession(req, res, user) {
  const token = createSessionToken()
  const context = requestContext(req)
  await pool.query(
    `INSERT INTO app_sessions (user_id, token_digest, ip_hash, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, now() + ($5 * interval '1 hour'))`,
    [user.id, tokenDigest(token), context.ipHash, context.userAgent, sessionTtlHours],
  )
  setSessionCookie(res, token)
}

function verifySsoToken(token) {
  const [encodedPayload, providedSignature] = String(token || '').split('.')
  if (!encodedPayload || !providedSignature) return null
  const expectedSignature = createHmac('sha256', pocSsoSecret).update(encodedPayload).digest('base64url')
  const provided = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
    const now = Math.floor(Date.now() / 1000)
    if (
      payload.aud !== 'jurisflow-poc' ||
      typeof payload.jti !== 'string' ||
      typeof payload.exp !== 'number' ||
      typeof payload.iat !== 'number' ||
      payload.exp < now ||
      payload.exp > now + 90 ||
      payload.iat > now + 10 ||
      String(payload.email || '').trim().toLowerCase() !== pocAllowedEmail
    ) return null
    return payload
  } catch {
    return null
  }
}

async function getSession(req) {
  const token = parseCookies(req.headers.cookie).jurisflow_session
  if (!token) return null
  const digest = tokenDigest(token)
  const { rows } = await pool.query(
    `SELECT s.id AS session_id, s.user_id, u.username, u.display_name, u.role
       FROM app_sessions s
       JOIN app_users u ON u.id = s.user_id
      WHERE s.token_digest = $1 AND s.expires_at > now() AND u.active = TRUE`,
    [digest],
  )
  const session = rows[0]
  if (!session) return null
  await pool.query('UPDATE app_sessions SET last_seen_at = now() WHERE id = $1', [session.session_id])
  return session
}

async function requireSession(req, res, next) {
  try {
    const session = await getSession(req)
    if (!session) return res.status(401).json({ authenticated: false })
    req.auth = session
    next()
  } catch (error) {
    next(error)
  }
}

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    next(error)
  }
})

app.get('/sso', async (req, res, next) => {
  const payload = verifySsoToken(req.query.token)
  if (!payload) {
    await recordEvent(req, 'sso_login_failure', { success: false, path: '/sso' })
    return res.redirect(303, '/?error=1')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const used = await client.query(
      'INSERT INTO used_sso_tokens (jti) VALUES ($1) ON CONFLICT DO NOTHING RETURNING jti',
      [payload.jti],
    )
    if (!used.rowCount) {
      await client.query('ROLLBACK')
      await recordEvent(req, 'sso_replay_blocked', { success: false, path: '/sso' })
      return res.redirect(303, '/?error=1')
    }
    const result = await client.query(
      `INSERT INTO app_users (username, password_hash, display_name, role, active)
       VALUES ($1, 'sso-only', $2, 'guest', TRUE)
       ON CONFLICT (lower(username)) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         active = TRUE,
         updated_at = now()
       RETURNING id, username, display_name, role`,
      [payload.email, String(payload.name || 'Visitante da demonstração').slice(0, 160)],
    )
    const user = result.rows[0]
    const token = createSessionToken()
    const context = requestContext(req)
    await client.query(
      `INSERT INTO app_sessions (user_id, token_digest, ip_hash, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, now() + ($5 * interval '1 hour'))`,
      [user.id, tokenDigest(token), context.ipHash, context.userAgent, sessionTtlHours],
    )
    await client.query('COMMIT')
    setSessionCookie(res, token)
    await recordEvent(req, 'sso_login_success', { userId: user.id, success: true, path: '/sso' })
    void sendAccessAlert({
      webhookUrl: accessAlertWebhookUrl,
      displayName: user.display_name,
      username: user.username,
      visitorId: context.ipHash.slice(0, 12),
      userAgent: context.userAgent,
    }).then((result) => {
      console.log(JSON.stringify({ at: new Date().toISOString(), eventType: 'access_alert', sent: result.sent, reason: result.reason }))
    }).catch((alertError) => {
      console.error('Falha ao enviar alerta de acesso:', alertError.message)
    })
    return res.redirect(303, '/')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    next(error)
  } finally {
    client.release()
  }
})

app.get('/api/auth/session', async (req, res, next) => {
  try {
    const session = await getSession(req)
    await recordEvent(req, 'protected_page_requested', { userId: session?.user_id, success: Boolean(session), path: '/' })
    if (!session) return res.status(401).json({ authenticated: false })
    res.json({ authenticated: true, user: { username: session.username, displayName: session.display_name, role: session.role } })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', requireSession, async (req, res, next) => {
  try {
    const token = parseCookies(req.headers.cookie).jurisflow_session
    if (token) await pool.query('DELETE FROM app_sessions WHERE token_digest = $1', [tokenDigest(token)])
    await recordEvent(req, 'logout', { userId: req.auth.user_id, success: true })
    res.clearCookie('jurisflow_session', { path: '/', secure: true, sameSite: 'lax' })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.post('/api/access/page-view', requireSession, async (req, res, next) => {
  try {
    await recordEvent(req, 'authenticated_page_view', {
      userId: req.auth.user_id,
      success: true,
      path: String(req.body?.path || '/tr-poc/').slice(0, 200),
    })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/visitors', requireSession, async (_req, res, next) => {
  try {
    const [totalsResult, visitorsResult, eventsResult] = await Promise.all([
      pool.query(`
        SELECT
          count(DISTINCT ip_hash)::int AS visitors,
          count(*) FILTER (WHERE event_type = 'sso_login_success')::int AS authenticated_logins,
          count(*) FILTER (WHERE event_type = 'authenticated_page_view')::int AS page_views,
          count(*) FILTER (WHERE success = FALSE)::int AS attempts
        FROM access_events
        WHERE created_at >= now() - interval '30 days'
      `),
      pool.query(`
        SELECT
          left(ip_hash, 12) AS visitor_id,
          min(created_at) AS first_seen,
          max(created_at) AS last_seen,
          count(*)::int AS events,
          count(*) FILTER (WHERE success = TRUE)::int AS authenticated_events,
          (array_agg(user_agent ORDER BY created_at DESC))[1] AS user_agent
        FROM access_events
        WHERE created_at >= now() - interval '30 days'
        GROUP BY ip_hash
        ORDER BY last_seen DESC
        LIMIT 50
      `),
      pool.query(`
        SELECT created_at, event_type, success, left(ip_hash, 12) AS visitor_id, path, user_agent
        FROM access_events
        ORDER BY created_at DESC
        LIMIT 30
      `),
    ])
    const totals = totalsResult.rows[0]
    res.json({
      generatedAt: new Date().toISOString(),
      totals: { visitors: totals.visitors, authenticatedLogins: totals.authenticated_logins, pageViews: totals.page_views, attempts: totals.attempts },
      visitors: visitorsResult.rows.map((row) => ({ visitorId: row.visitor_id, firstSeen: row.first_seen, lastSeen: row.last_seen, events: row.events, authenticatedEvents: row.authenticated_events, device: describeDevice(row.user_agent) })),
      recentEvents: eventsResult.rows.map((row) => ({ at: row.created_at, eventType: row.event_type, success: row.success, visitorId: row.visitor_id, path: row.path, device: describeDevice(row.user_agent) })),
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/monitoring', requireSession, async (_req, res, next) => {
  try {
    const databaseStartedAt = performance.now()
    const databaseResult = await pool.query('SELECT pg_database_size(current_database())::bigint AS size_bytes')
    const databaseLatencyMs = Math.round(performance.now() - databaseStartedAt)
    const [sessionsResult, eventsResult, portal] = await Promise.all([
      pool.query('SELECT count(*)::int AS active_sessions FROM app_sessions WHERE expires_at > now()'),
      pool.query(`
        SELECT
          count(*) FILTER (WHERE event_type = 'sso_login_success')::int AS logins,
          count(*) FILTER (WHERE event_type IN ('sso_login_failure', 'sso_replay_blocked'))::int AS failures
        FROM access_events
        WHERE created_at >= now() - interval '24 hours'
      `),
      probePortal(),
    ])
    res.json({
      generatedAt: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      databaseLatencyMs,
      databaseSizeMb: Number(databaseResult.rows[0].size_bytes) / 1024 / 1024,
      activeSessions: sessionsResult.rows[0].active_sessions,
      logins24h: eventsResult.rows[0].logins,
      failures24h: eventsResult.rows[0].failures,
      alertConfigured: Boolean(accessAlertWebhookUrl),
      portal,
    })
  } catch (error) {
    next(error)
  }
})

registerUserRoutes(app, { pool, requireSession, recordEvent, createSession })
registerIntegrationRoutes(app, { requireSession, recordEvent })
registerSigningRoutes(app, { requireSession, recordEvent })

app.use(async (req, res, next) => {
  try {
    const session = await getSession(req)
    if (!session) {
      await recordEvent(req, 'protected_asset_requested', { success: false, path: req.originalUrl })
      if (req.accepts('html')) return res.status(401).type('html').send(loginPage({ error: req.query.error === '1' }))
      return res.status(401).json({ error: 'Autenticação necessária.' })
    }
    req.auth = session
    next()
  } catch (error) {
    next(error)
  }
})

app.use(express.static(distDir, { index: false, maxAge: '1h', immutable: false }))
app.get('*path', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Falha interna. Tente novamente.' })
})

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`JurisFlow POC disponível localmente em 127.0.0.1:${port}`)
})

async function shutdown() {
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
