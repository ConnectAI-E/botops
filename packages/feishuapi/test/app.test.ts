import { describe, expect, it } from 'vitest'
import type { FeishuLoginCookies } from '../src/configuration'
import { Configuration } from '../src/configuration'
import type { AppInfo, EventUrlInfo } from '../src/app'
import { FeishuAppPlus, OpenApp } from '../src/app'

const testConfig: FeishuLoginCookies = {
  lark_oapi_csrf_token: 'iWlO+bXQoO+StV+YXqROtR+IFnmSckEYFQdLCaynZgI=',
  session: 'XN0YXJ0-02asc1af-0e16-4dbe-97a5-c192d4b72016-WVuZA',
}

const config = new Configuration(testConfig)
const app = new OpenApp(config)

describe('app', async () => {
  await app.init()
  it('should get app list', async () => {
    const result = await app.getAppList()
    expect(result).not.toBeUndefined()
    expect(result.length).toBeGreaterThan(1)
  })

  it('should get app version', async () => {
    const result = await app.requestAppVersionInfo('cli_a33d032e57f8900b')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should get  first app version', async () => {
    const appList = await app.getAppList()
    const firstApp = appList[0]
    const result = await app.requestAppVersionInfo(firstApp.appID)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should new app withOut avatar', async () => {
    const result = await app.newApp({
      name: 'a bot',
    })
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('should new app with avatar', async () => {
    const result = await app.newApp({
      name: 'a bot 22',
      avatar: 'https://s1-imfile.feishucdn.com/static-resource/v1/v2_2514eb9a-de2f-41cd-89b4-274940456f3g',
    })
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('should change app info', async () => {
    const result = await app.changeAppInfo('cli_a52fa4f61af4100d', {
      name: 'a botName',
      avatar: 'https://s1-imfile.feishucdn.com/static-resource/v1/v2_2514eb9a-de2f-41cd-89b4-274940456f3g',
    })
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should delete app', async () => {
    const result = await app.deleteApp('cli_a5281a3b6838500b')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('should get app secret', async () => {
    const result = await app.getAppSecret('cli_a52ca0ba25b2100d')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('create and back app Info', async () => {
    const result = await app.createAndQueryApp({
      name: 'a new bot',
    })
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should get blob form img link', async () => {
    const result = await app.getBlobFromUrl('https://s3-imfile.feishucdn.com/static-resource/v1/v2_f82ea090-361f-4483-bfee-682c1a495a9g')
    expect(result).not.toBeUndefined()
  })

  it('should get feishu image link ', async () => {
    const result = await app.uploadAppAvatar('https://s3-imfile.feishucdn.com/static-resource/v1/v2_f82ea090-361f-4483-bfee-682c1a495a9g')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  // 检测有没有同名的机器人,如果有返回appId
  it('should check app name', async () => {
    const result = await app.checkAppName('a 222')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should get appBaseInfo', async () => {
    const result = await app.getAppBaseInfo('cli_a52ca0ba25b2100d')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('should get appDeployinfo', async () => {
    const result = await app.getAppDeployInfo('cli_a52ca0ba25b2100d')
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
})

describe('scoop', async () => {
  await app.init()
  const id = 'cli_a52ca0ba25b2100d'
  it('get all scoop', async () => {
    const result = await app.getAllScope(id)
    // console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('get all scoop', async () => {
    const ids = await app.getAvailableScope(id)
    console.log(ids)
    expect(ids).not.toBeUndefined()
  })

  it('add scopes', async () => {
    await app.enableBot(id)
    const scopes0 = ['21001', '7', '21003', '21002', '20001', '20011', '3001', '20012', '6005', '20010', '3000', '20013', '20014', '20015', '20008', '1000', '1006', '1005', '20009', '26015']
    const scopes = [...scopes0,
      '41003', // 查看新版文档
      '26010', // 查看知识库
      '101221', // 获取客户端用户代理信息
    ]

    const result = await app.addScope(id, scopes)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
})
describe('bot', async () => {
  await app.init()
  const id = 'cli_a52ca0ba25b2100d'
  it('enable bot', async () => {
    const result = await app.botManager.enableBot(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('disable bot', async () => {
    const result = await app.botManager.disableBot(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('show BotCallBack', async () => {
    const result = await app.botManager.showBotCallBack(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('show if bot is enable', async () => {
    const result = await app.botManager.showIfBotEnable(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('show if bot menu is enable', async () => {
    const result = await app.botManager.showIfBotMenuEnable(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('checkBotCallBack', async () => {
    // https://open.feishu.cn/developers/v1/robot/check_url/cli_a416b219bd3a100e
    const verificationUrl = 'https://ai-feishu.forkway.cn/api/callback/lark/65/card'
    const result = await app.botManager.checkBotCallBack(id, verificationUrl)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('add BotCallBack', async () => {
    // https://open.feishu.cn/developers/v1/robot/check_url/cli_a416b219bd3a100e
    const verificationUrl = 'https://ai-feishu.forkway.cn/api/callback/lark/65/card'
    const result = await app.botManager.addBotCallBack(id, verificationUrl)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
})
describe('event test', async () => {
  await app.init()
  const id = 'cli_a52ffc2e8e3ad00d'

  it('get all event info', async () => {
    const result = await app.getEventInfo(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('add event', async () => {
    await app.enableBot(id)
    const events = ['im.message.message_read_v1', 'im.message.receive_v1', '20']
    const result = await app.addEvent(id, events)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('reset Encrypt random', async () => {
    const result = await app.eventManager.resetEventEncryptKey(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('reset Encrypt fixed value', async () => {
    const encrypt = 'v-Ohw8k6KwVynNmzXX'
    const result = await app.eventManager.resetEventEncryptKey(id, encrypt)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('reset verification token random', async () => {
    const result = await app.eventManager.resetEventVerificationToken(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('reset verification token fixed value', async () => {
    const token = 'e-fJKrqNbSz9NqSWL5'
    const result = await app.eventManager.resetEventVerificationToken(id, token)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })

  it('add event callback', async () => {
    const urlCallbackDetails: EventUrlInfo = {
      encryptKey: 'v-Ohw8k6KwVynNmzXX',
      verificationToken: 'e-fJKrqNbSz9NqSWL5',
      verificationUrl: 'http://159.75.122.50:9001/webhook/event',
    }
    const result = await app.eventManager.addEventCallBack(id, urlCallbackDetails)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('add event callback by url', async () => {
    const verificationUrl = 'http://159.75.122.50:9001/webhook/event'
    const result = await app.eventManager.addEventCallBackByUrl(id, verificationUrl)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
})
describe('format new app', async () => {
  it('test a app', () => {
    const appInfo: AppInfo = {
      name: 'test',
    }
    const result = app.formatNewAppBody(appInfo)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
})
describe('feishu app plus', async () => {
  // 已经启用的应用不能删除
  const appPlus = new FeishuAppPlus(config)
  it('del latest app', async () => {
    const result = await appPlus.delLatestApp()
    expect(result).not.toBeUndefined()
  })
  it('del latest 2 app', async () => {
    const result = await appPlus.delLatestNApp(10)
    expect(result).not.toBeUndefined()
  })
})
describe('feishu version', async () => {
  await app.init()
  const id = 'cli_a5c907b6ed3a1013'
  it(' app versions list', async () => {
    const result = await app.versionManager.getVersionInfo(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('app latest version', async () => {
    const result = await app.versionManager.getLatestVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('new version', async () => {
    const appVersion = '0.0.4'
    const result = await app.versionManager.createNewVersion(id, appVersion)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('new next version number', async () => {
    const result = await app.versionManager.getNewAppVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('create next version', async () => {
    const result = await app.versionManager.creatNextVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('del version', async () => {
    const versionNumber = '7252254280937472001'
    const result = await app.versionManager.delVersion(id, versionNumber)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('del latest can del able item ', async () => {
    const result = await app.versionManager.clearUnPublishedVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('if app can create version', async () => {
    const result = await app.versionManager.canCreateNewVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('publish version', async () => {
    const version = '7252254280937472001'
    const id = 'cli_a42ef85d81bad00e'
    const result = await app.versionManager.publishVersion(id, version)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('un publish version', async () => {
    const version = '7252255379459096604'
    const id = 'cli_a42ef85d81bad00e'
    const result = await app.versionManager.unPublishVersion(id, version)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('app publish latest version', async () => {
    const result = await app.versionManager.publishLatestVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
  it('create and publish next version', async () => {
    const result = await app.versionManager.createAndPublishNextVersion(id)
    console.log(JSON.stringify(result))
    expect(result).not.toBeUndefined()
  })
})
