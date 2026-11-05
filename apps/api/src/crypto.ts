import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

function scrypt(pw: string, salt: Buffer, len: number): Promise<Buffer> {
  return new Promise((resolve, reject) => scryptCb(pw, salt, len, SCRYPT, (err, key) => (err ? reject(err) : resolve(key))))
}

/** Password → "scrypt$salt$hash" (base64url). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, 32)
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false
  const [kind, salt, hash] = stored.split('$')
  if (kind !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64url')
  const got = await scrypt(password, Buffer.from(salt, 'base64url'), expected.length)
  return got.length === expected.length && timingSafeEqual(got, expected)
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

/** URL-safe random id / token. */
export const randomId = (bytes = 16) => randomBytes(bytes).toString('base64url')

/** Short id for share links: 10 chars from an unambiguous alphabet. */
export function shortId(len = 10) {
  const abc = 'abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < len; i++) s += abc[randomInt(abc.length)]
  return s
}

/** 6-digit numeric code. */
export const sixDigits = () => String(randomInt(0, 1_000_000)).padStart(6, '0')
