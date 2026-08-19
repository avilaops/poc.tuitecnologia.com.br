const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const connection = await prisma.$queryRawUnsafe('SELECT current_database() AS database, current_schema() AS schema, inet_server_addr()::text AS server')
  const guest = await prisma.client.findFirst({
    where: { email: { equals: 'guest@tuitecnologia.com.br', mode: 'insensitive' } },
    select: { nome: true, email: true, senhaProvisoria: true },
  })
  console.log(JSON.stringify({ connection, guest }))
}

main().finally(() => prisma.$disconnect())
