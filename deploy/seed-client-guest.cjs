const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const email = process.env.GUEST_EMAIL?.trim().toLowerCase()
const password = process.env.GUEST_PASSWORD

if (!email || !password) throw new Error('GUEST_EMAIL e GUEST_PASSWORD são obrigatórios.')

async function main() {
  const passwordHash = await bcrypt.hash(password, 12)
  const existing = await prisma.client.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  })

  if (existing) {
    await prisma.client.update({
      where: { id: existing.id },
      data: { senhaHash: passwordHash, senhaProvisoria: false },
    })
    console.log('Conta convidada atualizada no portal.')
    return
  }

  await prisma.client.create({
    data: {
      nome: 'Visitante POC',
      cpf: 'POC-GUEST-2026',
      email,
      senhaHash: passwordHash,
      senhaProvisoria: false,
    },
  })
  console.log('Conta convidada criada no portal.')
}

main().finally(() => prisma.$disconnect())
