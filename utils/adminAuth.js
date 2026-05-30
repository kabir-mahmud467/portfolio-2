import crypto from 'crypto'

const COOKIE_NAME = 'admin_auth'

function getSecret() {
  return process.env.SESSION_SECRET || 'secret'
}

function sign(value) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(value)
    .digest('hex')
}

function encodePayload(user) {
  return Buffer.from(JSON.stringify({
    id: user.id,
    isAdmin: Boolean(user.isAdmin),
    username: user.username,
  })).toString('base64url')
}

function decodePayload(payload) {
  const json = Buffer.from(payload, 'base64url').toString('utf8')
  return JSON.parse(json)
}

export function createAuthToken(user) {
  const payload = encodePayload(user)
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function verifyAuthToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null

  const [payload, signature] = token.split('.')
  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    return decodePayload(payload)
  } catch {
    return null
  }
}

export function getAuthUser(req) {
  const rawCookie = req.headers.cookie || ''
  const token = rawCookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1)

  return verifyAuthToken(token || '')
}

export function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, createAuthToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: Boolean(process.env.VERCEL),
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    sameSite: 'lax',
    secure: Boolean(process.env.VERCEL),
  })
}
