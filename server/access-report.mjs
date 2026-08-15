import pg from 'pg'

const { Pool } = pg
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória.')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  const { rows } = await pool.query(`
    SELECT
      e.created_at,
      e.event_type,
      e.success,
      COALESCE(u.username, 'anônimo') AS username,
      left(e.ip_hash, 12) AS visitor_id,
      left(e.user_agent, 90) AS user_agent
    FROM access_events e
    LEFT JOIN app_users u ON u.id = e.user_id
    ORDER BY e.created_at DESC
    LIMIT 50
  `)
  console.table(rows)
} finally {
  await pool.end()
}

