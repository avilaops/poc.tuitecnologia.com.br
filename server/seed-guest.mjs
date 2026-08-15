import fs from 'node:fs/promises'
import pg from 'pg'
import { hashPassword } from './security.mjs'

const { Pool } = pg
const databaseUrl = process.env.DATABASE_URL
const username = process.env.GUEST_USERNAME
const password = process.env.GUEST_PASSWORD

if (!databaseUrl || !username || !password) {
  throw new Error('DATABASE_URL, GUEST_USERNAME e GUEST_PASSWORD são obrigatórios para o seed.')
}

const pool = new Pool({ connectionString: databaseUrl })

try {
  const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  await pool.query(schema)
  await pool.query(
    `INSERT INTO app_users (username, password_hash, display_name, role, active)
     VALUES ($1, $2, $3, 'guest', TRUE)
     ON CONFLICT (lower(username)) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       display_name = EXCLUDED.display_name,
       role = 'guest',
       active = TRUE,
       updated_at = now()`,
    [username, hashPassword(password), 'Visitante da demonstração'],
  )
  console.log('Usuário convidado criado/atualizado com senha armazenada como hash.')
} finally {
  await pool.end()
}

