const MAX_USER_AGENT_LENGTH = 160

export function buildAccessAlert({ displayName, username, visitorId, userAgent, at = new Date() }) {
  const safeAgent = String(userAgent || 'não informado').replace(/\s+/g, ' ').slice(0, MAX_USER_AGENT_LENGTH)
  const timestamp = at instanceof Date ? at.toISOString() : new Date(at).toISOString()

  return {
    content: '🔐 **Novo acesso autenticado à POC JurisFlow**',
    embeds: [{
      color: 0x0d897e,
      fields: [
        { name: 'Conta', value: `${displayName || 'Visitante'}\n${username}`, inline: true },
        { name: 'Visitante', value: visitorId, inline: true },
        { name: 'Horário', value: timestamp, inline: false },
        { name: 'Dispositivo', value: safeAgent || 'não informado', inline: false },
      ],
      footer: { text: 'IP pseudonimizado; endereço bruto não armazenado' },
    }],
    allowed_mentions: { parse: [] },
  }
}

export async function sendAccessAlert({ webhookUrl, fetchImpl = fetch, ...event }) {
  if (!webhookUrl) return { sent: false, reason: 'not_configured' }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4_000)
  try {
    const response = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAccessAlert(event)),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Webhook de acesso respondeu HTTP ${response.status}`)
    return { sent: true }
  } finally {
    clearTimeout(timeout)
  }
}
