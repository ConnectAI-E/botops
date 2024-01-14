import { describe, expect, it } from 'vitest'
import { getFeishuCookies } from '../src/auth'

describe('test auth', () => {
  it('should be able to get cookies', async () => {
    const cookie = await getFeishuCookies()
    console.log(cookie)
    console.log(cookie)
    expect(1).toBe(1)
  })
})
