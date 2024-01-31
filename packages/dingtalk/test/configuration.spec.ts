// vitest
import { describe, expect, it } from 'vitest'
import { Configuration, type DingTalkLoginCookies } from '../src/configuration'

const testConfig = {
  access_token: '3135dfa4-7381-4a09-aa83-9b1500ca7f80',
  corp_id: 'ding97db296bbb01fab5f5bf40eda33b7ba0',
  account: 'oauth_k1%3AfDrzMqWIE0yw6vb3InAAInpzLQDwKx82xT9mhaEk2xOJXV%2FlJrHczH0Oo%2FXO0WBkLpr%2FlwuiegWY1mR%2BvhoTrGu3ahSLWDPpBm%2FGyPnaDfg%3D',
  deviceid: '89e8d6de7f984393a75e59a88546f86e',
  _o_a_u: 'eyJfbyI6Im9kNjNjOGExMDJlOTQ5YjdhOWRlZTk4ZGRmZGQ1NmVhNWEiLCJfYSI6ZmFsc2UsIl9zIjoiNjEwMzM1MDMyNzI2MTcyNjUzIiwiX2MiOmZhbHNlLCJfdSI6Im9kODJmMGUyNjMwYzNlODVhY2JlMzA2YjA5ODUzMDRhYjciLCJfZSI6Im9kZGM2MGQxZDA0YWI1Yzc5NDgwNjIyZWQ0YWQ2NmMwMGUifQ==',
}
describe('configuration', () => {
  const aClient = new Configuration(testConfig as DingTalkLoginCookies)

  it('should be able to get configuration', () => {
    expect(aClient).toBeDefined()
    expect(aClient.baseUrl).toBe('https://open-dev.dingtalk.com')
  })

  it('should can be request', async () => {
    const appList = await aClient.requestAppList()
    console.log(appList)
    expect(appList).not.toBeUndefined()
  })

  // get nick name
  it('should get nick name', async () => {
    const result = await aClient.getNickname()
    console.log(result)
    expect(result).not.toBeUndefined()
  })
  // it("should can get avatar", async () => {
  //   const userInfo = await aClient.getUserInfo();
  //   console.log(userInfo);
  //   expect(userInfo.avatar).not.toBeUndefined();
  // });
})
