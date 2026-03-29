const CUID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const CUID_PREFIX = 'c'

function randomBytes(count: number): number[] {
  const bytes: number[] = []
  for (let i = 0; i < count; i++) {
    bytes.push(Math.floor(Math.random() * CUID_ALPHABET.length))
  }
  return bytes
}

function encodeAlphabet(bytes: number[], alphabet: string): string {
  return bytes.map(b => alphabet[b % alphabet.length]).join('')
}

export function generateCuid2(): string {
  const timestamp = Date.now().toString(36).toLowerCase()
  const random1 = encodeAlphabet(randomBytes(13), CUID_ALPHABET)
  const random2 = encodeAlphabet(randomBytes(13), CUID_ALPHABET)
  const counter = (Math.random() * 1000 | 0).toString(36).toLowerCase()
  return `${CUID_PREFIX}${timestamp}${random1}${random2}${counter}`
}
