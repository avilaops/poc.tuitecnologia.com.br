import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `scrypt$${salt}$${derived}`
}

export function verifyPassword(password, encoded) {
  const [algorithm, salt, expectedHex] = String(encoded).split('$')
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false

  try {
    const actual = scryptSync(password, salt, KEY_LENGTH)
    const expected = Buffer.from(expectedHex, 'hex')
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function tokenDigest(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function anonymizeIp(ip, salt) {
  return createHash('sha256').update(`${salt}:${ip || 'unknown'}`).digest('hex')
}

export function parseCookies(header = '') {
  return header.split(';').reduce((cookies, pair) => {
    const separator = pair.indexOf('=')
    if (separator < 0) return cookies
    const key = pair.slice(0, separator).trim()
    const value = pair.slice(separator + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
    return cookies
  }, {})
}

