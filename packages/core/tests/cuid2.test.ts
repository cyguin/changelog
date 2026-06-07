import { describe, it, expect } from 'vitest'
import { generateCuid2 } from '../src/cuid2'

describe('generateCuid2', () => {
  it('returns a string starting with "c"', () => {
    const id = generateCuid2()
    expect(id).toMatch(/^c/)
  })

  it('returns a string of consistent length', () => {
    const ids = Array.from({ length: 10 }, () => generateCuid2())
    const lengths = ids.map(id => id.length)
    expect(new Set(lengths).size).toBe(1)
  })

  it('produces unique values', () => {
    const ids = Array.from({ length: 100 }, () => generateCuid2())
    expect(new Set(ids).size).toBe(100)
  })

  it('contains only lowercase alphanumeric characters after prefix', () => {
    const id = generateCuid2()
    const rest = id.slice(1)
    expect(rest).toMatch(/^[a-z0-9]+$/)
  })
})
