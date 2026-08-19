import { hashPassword, verifyPassword } from './security.mjs'

const ROLES = new Set(['guest', 'presenter', 'owner'])

export function registerUserRoutes(app, { pool, requireSession, recordEvent, createSession }) {
  // Autenticação local com usuário e senha (além do convite SSO do portal).
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const username = String(req.body?.username || '').trim().toLowerCase()
      const password = String(req.body?.password || '')
      const wantsHtml = Boolean(req.accepts('html')) && !req.is('application/json')
      const fail = async () => {
        await recordEvent(req, 'password_login_failure', { success: false, path: '/api/auth/login' })
        if (wantsHtml) return res.redirect(303, '/?error=1')
        return res.status(401).json({ error: 'Usuário ou senha inválidos.' })
      }
      if (!username || !password) return fail()

      const { rows } = await pool.query(
        `SELECT id, username, password_hash, display_name, role
           FROM app_users
          WHERE lower(username) = $1 AND active = TRUE`,
        [username],
      )
      const user = rows[0]
      if (!user || user.password_hash === 'sso-only' || !verifyPassword(password, user.password_hash)) return fail()

      await createSession(req, res, user)
      await recordEvent(req, 'password_login_success', { userId: user.id, success: true, path: '/api/auth/login' })
      if (wantsHtml) return res.redirect(303, '/')
      res.json({ ok: true, user: { username: user.username, displayName: user.display_name, role: user.role } })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/admin/users', requireSession, async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, username, display_name, role, active, created_at,
                (password_hash = 'sso-only') AS sso_only
           FROM app_users
          ORDER BY created_at DESC
          LIMIT 100`,
      )
      res.json({
        users: rows.map((row) => ({
          id: String(row.id),
          username: row.username,
          displayName: row.display_name,
          role: row.role,
          active: row.active,
          ssoOnly: row.sso_only,
          createdAt: row.created_at,
        })),
      })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/admin/users', requireSession, async (req, res, next) => {
    try {
      const username = String(req.body?.username || '').trim().toLowerCase()
      const displayName = String(req.body?.displayName || '').trim()
      const password = String(req.body?.password || '')
      const role = String(req.body?.role || 'guest')
      if (!/^[a-z0-9@._-]{3,80}$/.test(username)) return res.status(400).json({ error: 'Usuário inválido (3–80 caracteres, letras, números, @ . _ -).' })
      if (displayName.length < 3) return res.status(400).json({ error: 'Informe o nome completo.' })
      if (password.length < 8) return res.status(400).json({ error: 'A senha precisa de pelo menos 8 caracteres.' })
      if (!ROLES.has(role)) return res.status(400).json({ error: 'Perfil inválido.' })

      const { rows } = await pool.query(
        `INSERT INTO app_users (username, password_hash, display_name, role, active)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (lower(username)) DO NOTHING
         RETURNING id, username, display_name, role, active, created_at`,
        [username, hashPassword(password), displayName, role],
      )
      if (!rows.length) return res.status(409).json({ error: 'Já existe um usuário com esse nome.' })
      const user = rows[0]
      await recordEvent(req, 'user_created', {
        userId: req.auth.user_id,
        success: true,
        metadata: { createdUser: user.username, role: user.role },
      })
      res.status(201).json({
        user: { id: String(user.id), username: user.username, displayName: user.display_name, role: user.role, active: user.active, ssoOnly: false, createdAt: user.created_at },
      })
    } catch (error) {
      next(error)
    }
  })

  app.patch('/api/admin/users/:id', requireSession, async (req, res, next) => {
    try {
      const id = String(req.params.id || '').replace(/\D/g, '')
      const active = Boolean(req.body?.active)
      if (!id) return res.status(400).json({ error: 'Identificador inválido.' })
      const { rows } = await pool.query(
        `UPDATE app_users SET active = $2, updated_at = now() WHERE id = $1
         RETURNING id, username, active`,
        [id, active],
      )
      if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' })
      await recordEvent(req, active ? 'user_activated' : 'user_deactivated', {
        userId: req.auth.user_id,
        success: true,
        metadata: { targetUser: rows[0].username },
      })
      res.json({ ok: true, user: { id: String(rows[0].id), active: rows[0].active } })
    } catch (error) {
      next(error)
    }
  })
}
