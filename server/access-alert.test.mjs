import { describe, expect, it, vi } from 'vitest'
import { buildAccessAlert, sendAccessAlert } from './access-alert.mjs'

describe('alerta de acesso', () => {
  const event = {
    displayName: 'Visitante POC',
    username: 'guest@example.com',
    visitorId: 'abc123def456',
    userAgent: 'Navegador de teste',
    at: new Date('2026-08-03T21:30:00.000Z'),
  }

  it('gera mensagem sem IP bruto e sem menções', () => {
    const payload = buildAccessAlert(event)
    expect(payload.content).toContain('Novo acesso autenticado')
    expect(payload.embeds[0].fields).toContainEqual(expect.objectContaining({ name: 'Visitante', value: 'abc123def456' }))
    expect(payload.allowed_mentions).toEqual({ parse: [] })
  })

  it('não chama rede quando webhook não está configurado', async () => {
    const fetchImpl = vi.fn()
    await expect(sendAccessAlert({ ...event, webhookUrl: '', fetchImpl })).resolves.toEqual({ sent: false, reason: 'not_configured' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('envia o alerta configurado', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    await expect(sendAccessAlert({ ...event, webhookUrl: 'https://example.com/webhook', fetchImpl })).resolves.toEqual({ sent: true })
    expect(fetchImpl).toHaveBeenCalledOnce()
  })
})
