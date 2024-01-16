import { describe, expect, it } from 'vitest'
import type { DingTalkLoginCookies } from '../src/configuration'
import { Configuration } from '../src/configuration'
import { OpenApp } from '../src/app'

// const testConfig: DingTalkLoginCookies = {
//   "account": "oauth_k1%3AYzUIiVA9E1SZc494rQkWQtHTxlsVfBKiyQWa20mx86AflvctWbOt%2FNZ%2FSqQiADEnF3A6rS76YidRK6KoGLg5L2u3ahSLWDPpBm%2FGyPnaDfg%3D",
//   "deviceid": "0652ac07a6e74f46a350000307b88533",
//   "corp_id": "ding1d838a962d209041f2c783f7214b6d69",
//   "access_token": "300361dc-60fe-417f-8379-8604f58853b5",
//   "_o_a_u": "eyJfbyI6Im9kNjM0OTExNDRhNjE5ODQ3MmY5N2ZlZGRiMTMwZGY0NjEiLCJfYSI6ZmFsc2UsIl9zIjoiMDExNjU1NjY0OTYxMzc4NzIzMDciLCJfYyI6ZmFsc2UsIl91Ijoib2Q2Y2VhOGExMTNmMGU4MmVlYTg2MGZiNDdiM2NkOWY3OSIsIl9lIjoib2Q4ODMxYTUwZGI4MjNmYmVlMzBjOGM3ZjE2NjdkYTFkZSJ9"
// };

const testConfig: DingTalkLoginCookies = {
  account: 'oauth_k1%3AhEHKdGoXga3hCRUyIgUpJdKfe%2BGSGQ%2B4avWLMFfyjrzPkvGXyrWg%2BGphuNDJVDpmi%2BMUXhD3Hfm3p0HqiE2W8%2FjFBdPDvctNnX8QaW7Kuuw%3D',
  deviceid: 'e3b2444d87f441f38b2be8798be2ae30',
  corp_id: 'ding97db296bbb01fab5f5bf40eda33b7ba0',
  access_token: 'af800b35-21ef-4aaf-855a-ac575ddb0cb3',
  _o_a_u: 'eyJfbyI6Im9kNjNjOGExMDJlOTQ5YjdhOTIxNjBhOWM0MDJlNTljOWEiLCJfYSI6ZmFsc2UsIl9zIjoiNjEwMzM1MDMyNzI2MTcyNjUzIiwiX2MiOmZhbHNlLCJfdSI6Im9kODJmMGUyNjMwYzNlODVhYzMwZGQ3YTNjMTFkYzZhOGUiLCJfZSI6Im9kMWU0OGRiYjJjYTE0NWIwMGRjMTc1ZmU0Y2ZkNTc1N2IifQ==',
}
const testAppId = 'ba7b4d3a-8014-4e74-88f7-2726f580823c'
const config = new Configuration(testConfig)

const app = new OpenApp(config)
describe('app', async () => {
  await app.init()
  it('should get app list', async () => {
    const result = await app.requestAppList()
    console.log(result)
    expect(result).not.toBeUndefined()
  })
  // get app base info
  it('should get app base info', async () => {
    const result = await app.requestAppBaseInfo(testAppId)
    console.log(result)
    expect(result).not.toBeUndefined()
  })
  it('should get Icon from url', async () => {
    // https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg"
    // @lADPDfmVQafoVxrMyMzI
    // https://i01.lw.aliimg.com/media/lALPM2rOLLkVzbvNEODNEOA_4320_4320.png
    // @lALPM2rOLLkVzbvNEODNEOA
    const result = await app.getIconIdFromUrl('https://i01.lw.aliimg.com/media/lALPM2rOLLkVzbvNEODNEOA_4320_4320.png')
    expect(result).toEqual('@lALPM2rOLLkVzbvNEODNEOA')
    const result2 = await app.getIconIdFromUrl('https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg')
    expect(result2).toEqual('@lADPDfmVQafoVxrMyMzI')
  })

  it('should change app base info', async () => {
    const result = await app.changeAppInfo('7c9d7b54-4f54-4686-944c-dd2040033014', {
      appName: '羊皮纸下的第二次书写',
    })
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
    const result2 = await app.changeAppInfo('7c9d7b54-4f54-4686-944c-dd2040033014', {
      appName: '羊皮纸下的第二次书写',
      appDesc: '新的应用',
    })
    console.log(JSON.stringify(result2))
    expect(result2).not.toBeUndefined()
  })

  it('should new app withOut avatar', async () => {
    const result = await app.newApp({
      appName: '2024111',
      appDesc: 'a bot desc',
      appType: 2,
    })
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should new app with avatar', async () => {
    const result = await app.newApp({
      appName: 'botzzz',
      appDesc: 'a bot desc',
      appType: 2,
      iconUrl: 'https://s1-imfile.feishucdn.com/static-resource/v1/v2_2514eb9a-de2f-41cd-89b4-274940456f3g',
    })
    expect(result).not.toBeUndefined()
  })
  it('should delete app', async () => {
    const result = await app.deleteApp('85c1c926-5a74-4504-bdb4-329f47ffc7fd')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('should delete recently create app', async () => {
    const result = await app.deleteLastApp(1)
    console.log(result)
    expect(result).not.toBeUndefined()
  })

  it('should get app secret', async () => {
    const result = await app.getAppSecret(testAppId)
    console.log(result)
    expect(result).not.toBeUndefined()
  })

  // 开通机器人权限
  it('should open bot enable', async () => {
    // const result = await app.enableBot(testAppId);
    const result = await app.enableBot(testAppId)
    console.log(result)
    expect(result).not.toBeUndefined()
  })

  // 是否有app
  it('should has app', async () => {
    const result = await app.ifHasApp(testAppId)
    expect(result).not.toBeUndefined()
  })

  // 是否有bot
  it('should has bot', async () => {
    const result = await app.hasBot(testAppId)
    expect(result).not.toBeUndefined()
  })

  // 机器人配置
  it('should bot config ', async () => {
    const result = await app.newBot(testAppId, {
      name: 'test',
      brief: '机器人简介111',
      description: '机器人描述222',
      outgoingUrl: 'https://connect-ai-e.com/dingding/658147f7631be800019d295f/event',
    })
    console.log(result)
    expect(result).not.toBeUndefined()
  })

  // 修改机器人的配置并发布
  it('should change bot config', async () => {
    const result = await app.changeBotConfig(testAppId, {
      name: '修改后test777',
      brief: '修改后的简介111',
      description: '修改后---机器人55555',
      outgoingUrl: 'https://connect-ai-e.com/dingding/658147f7631be800019d295f/event',
    })
    console.log(result)
    expect(result).not.toBeUndefined()
  })

  it('should get app version', async () => {
    const result = await app.getVersionInfo(testAppId)
    expect(result).not.toBeUndefined()
  })

  // 获取最新的versionId
  it('should get app version detail', async () => {
    const result = await app.getAppVersion(testAppId)
    expect(result).not.toBeUndefined()
  })

  // 创建版本
  it('should save app version detail', async () => {
    const result = await app.saveAppVersionDetail(testAppId)
    expect(result).not.toBeUndefined()
  })

  // 发布版本
  it('should publish app', async () => {
    const result = await app.publishApp(testAppId)
    expect(result).not.toBeUndefined()
  })

  // 创建并保存版本
  it('should publish app', async () => {
    const result = await app.saveAndPublishApp(testAppId)
    expect(result).not.toBeUndefined()
  })
})
