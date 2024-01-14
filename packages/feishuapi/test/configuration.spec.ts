import { describe, expect, it } from 'vitest'
import type { FeishuLoginCookies } from '../src/configuration'
import { Configuration } from '../src/configuration'

const testConfig: FeishuLoginCookies = {
  session: 'XN0YXJ0-8baub257-fb25-415c-9f6d-25be514ce31f-WVuZA',
  lark_oapi_csrf_token: 'YU7dWtWax1ssfbFF128kZfOluXHU8jHXf5MF1PAYGiM=',
  // baseUrl: "https://open.larksuite.com"
}

describe('configuration', () => {
  const aClient = new Configuration(testConfig)

  it('should be able to get configuration', () => {
    expect(aClient).toBeDefined()
    expect(aClient.baseUrl).toBe('https://open.feishu.cn')
  })

  it('is authed', async () => {
    expect(aClient).toBeDefined()
    const isAuthed = await aClient.isAuthed()
    expect(isAuthed).toBe(true)
  })

  it('is not authed', async () => {
    testConfig.session = 'faksexxx'
    const fakeClient = new Configuration(testConfig)
    expect(fakeClient).toBeDefined()
    const isAuthed = await fakeClient.isAuthed()
    expect(isAuthed).toBe(false)
  })

  it('should can be request', async () => {
    await aClient.processCsrfToken()
    console.log(aClient._csrfToken)
    expect(aClient._csrfToken).not.toBeUndefined()
  })

  it('should can be request', async () => {
    expect(await aClient.requestBaseApp()).not.toBeUndefined()
  })

  it('should get username', async () => {
    const nickName = await aClient.getNickname()
    console.log(nickName)
    expect(nickName).toBe('雷圳鹏')
  })

  it('should can get avatar', async () => {
    const userInfo = await aClient.getUserInfo()
    console.log(userInfo)
    expect(userInfo.avatar).not.toBeUndefined()
  })
})
