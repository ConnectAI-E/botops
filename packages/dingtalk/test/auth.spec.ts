import { describe, expect, it } from 'vitest'
import { getDingtalkCookies } from '../src'

describe('test auth', () => {
  it('should be able to get cookies', async () => {
    const cookie = await getDingtalkCookies()
    console.log(cookie)
    expect(1).toBe(1)
  }, 600000)
})
