import { describe, expect, it } from 'vitest'
import { anonymizeIp, hashPassword, parseCookies, tokenDigest, verifyPassword } from './security.mjs'

describe('segurança do backend', () => {
  it('armazena e valida somente hash scrypt da senha', () => {
    const hash = hashPassword('senha-ficticia', '00112233445566778899aabbccddeeff')
    expect(hash).not.toContain('senha-ficticia')
    expect(verifyPassword('senha-ficticia', hash)).toBe(true)
    expect(verifyPassword('senha-incorreta', hash)).toBe(false)
  })

  it('anonimiza IP de forma estável por ambiente', () => {
    expect(anonymizeIp('127.0.0.1', 'salt')).toBe(anonymizeIp('127.0.0.1', 'salt'))
    expect(anonymizeIp('127.0.0.1', 'salt')).not.toBe(anonymizeIp('127.0.0.2', 'salt'))
  })

  it('gera digest da sessão e interpreta cookies', () => {
    expect(tokenDigest('abc')).toHaveLength(64)
    expect(parseCookies('a=1; jurisflow_session=token%20seguro')).toEqual({ a: '1', jurisflow_session: 'token seguro' })
  })
})

