// vitest
import { describe, expect, it } from 'vitest'
import { Configuration, type DingTalkLoginCookies } from '../src/configuration'

const testConfig = {
  account: 'oauth_k1%3AYzUIiVA9E1SZc494rQkWQtHTxlsVfBKiyQWa20mx86AflvctWbOt%2FNZ%2FSqQiADEnF3A6rS76YidRK6KoGLg5L2u3ahSLWDPpBm%2FGyPnaDfg%3D',
  deviceid: '0652ac07a6e74f46a350000307b88533',
  corp_id: 'ding1d838a962d209041f2c783f7214b6d69',
  _o_a_u: 'eyJfbyI6Im9kNjM0OTExNDRhNjE5ODQ3MjJkNDE0N2U1MTk0YTNjNzMiLCJfYSI6ZmFsc2UsIl9zIjoiMDExNjU1NjY0OTYxMzc4NzIzMDciLCJfYyI6ZmFsc2UsIl91Ijoib2Q2Y2VhOGExMTNmMGU4MmVlMzc3Y2MwNjkzZTk3ZWFkZiIsIl9lIjoib2QyMjhhMzMxYzRiOTFkZjJjYThiMmZhNjIzNjM4NGVhMiJ9',
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
