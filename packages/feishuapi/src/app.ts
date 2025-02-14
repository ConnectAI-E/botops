import fetch, { FormData } from 'node-fetch'
import type { Configuration } from './configuration'

export interface AppInfo {
  name: string
  desc?: string
  avatar?: string
}

export class OpenApp {
  configuration: Configuration
  botManager: BotManager
  scopeManager: ScopeManager
  eventManager: EventManager
  versionManager: VersionManager
  peopleManager: PeopleManager

  constructor(configuration: Configuration) {
    this.configuration = configuration
    this.botManager = new BotManager(configuration)
    this.scopeManager = new ScopeManager(configuration)
    this.eventManager = new EventManager(configuration)
    this.versionManager = new VersionManager(configuration)
    this.peopleManager = new PeopleManager(configuration)
  }

  async init() {
    await this.configuration.processCsrfToken()
  }

  get cfg() {
    return this.configuration
  }

  async requestAppList() {
    // "developers/v1/app/list"
    const result = await this.cfg.aGetRequest('developers/v1/app/list')
    return result as any
  }

  async uploadAppAvatar(avatarlink: string) {
    const blob = await this.getBlobFromUrl(avatarlink)
    const data = new FormData()
    data.append('file', blob)
    data.append('uploadType', '4')
    data.append('isIsv', 'false')
    data.append('scale', JSON.stringify({
      width: 240,
      height: 240,
    }))
    const result = await this.cfg.aPostMultipartRequest('developers/v1/app/upload/image', data)
    return result.data.url
  }

  // fetch请求图片链接获取Blob对象
  async getBlobFromUrl(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    return blob
  }

  async getAppSecret(appId: string) {
    // https://open.feishu.cn/developers/v1/secret/cli_a416b219bd3a100e
    const result = await this.cfg.aGetRequest(`developers/v1/secret/${appId}`)
    return result.data.secret
  }

  async getAppList() {
    const appList = await this.requestAppList()
    return appList.data.apps
  }

  async requestAppVersionInfo(appId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/app_version/list/${appId}`)
    return result.data
  }

  async deleteApp(appId: string) {
    const result = await this.cfg.aDeleteRequest(`developers/v1/app/delete/${appId}`)
    return result.data
  }

  async newApp(appInfo: AppInfo): Promise<string> {
    // 如果有avatar，先上传avatar
    if (appInfo.avatar)
      appInfo.avatar = await this.uploadAppAvatar(appInfo.avatar)

    const formatBody = await this.formatNewAppBody(appInfo)
    // console.log(formatBody)
    const result = await this.cfg.aPostRequest('developers/v1/app/create', formatBody)
    // console.log(result);
    return result.data.ClientID
  }

  async createAndQueryApp(appInfo: AppInfo): Promise<{
    appID: string
    secret: string
  }> {
    const appId = await this.newApp(appInfo)
    const secret = await this.getAppSecret(appId)
    return {
      appID: appId,
      secret,
    }
  }

  async formatNewAppBody(appInfo: AppInfo) {
    let { avatar, desc, name } = appInfo
    if (!avatar) {
      // 需要获取上传之后的头像链接
      const defaultAvatar = 'https://s1-imfile.feishucdn.com/static-resource/v1/v2_8d04e97a-bc0d-4949-b858-20a260064b4g'
      avatar = await this.uploadAppAvatar(defaultAvatar)
    }
    if (!desc)
      desc = ''

    return {
      appSceneType: 0,
      name,
      desc,
      avatar,
      i18n: {
        zh_cn: {
          name,
          description: desc,
        },
        // 必须要有英文名字，不然会报错 lark
        en_us: {
          name,
          description: desc,
        },
      },
      primaryLang: 'en_us',
    }
  }

  async changeAppInfo(appId: string, appInfo: AppInfo) {
    if (appInfo.avatar)
      appInfo.avatar = await this.uploadAppAvatar(appInfo.avatar)
    const formatBody = await this.formatNewAppBody(appInfo)
    const result = await this.cfg.aPostRequest(`developers/v1/base_info/${appId}`, formatBody)
    return result.data
  }

  // https://open.feishu.cn/developers/v1/app/cli_a52ca0ba25b2100d
  async getApp(appId: string) {
    const result = await this.cfg.aGetRequest(`developers/v1/app/${appId}`)
    return result.data
  }

  // "name": "demoName",
  // "desc": "onebot test demo",
  // "avatar": "https://avatars.githubusercontent.com/u/145313435?s=200&v=4",
  async getAppBaseInfo(appId: string) {
    const result = await this.getApp(appId)
    return {
      name: result.name,
      desc: result.desc,
      avatar: result.avatar,
    }
  }

  async getB2CShareStatus(appId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/b2c_share/${appId}`, {})
    return {
      b2cShareConfigHint: result.data.b2cShareConfigHint,
      b2cShareSuggest: result.data.b2cShareSuggest,
      onlineB2CShareEnable: result.data.onlineB2CShareEnable,
    }
  }

  //
  // "events": [
  //   "im.message.message_read_v1",
  //   "im.message.receive_v1"
  // ],
  // "encryptKey": "e-fJKrqNbSz9NqSWL5",
  // "verificationToken": "v-Ohw8k6KwVynNmzXX",
  // "scopeIds": [
  //   "21001",
  //   "7",
  //   "21003",
  //   "21002",
  //   "20001",
  //   "20011",
  //   "3001",
  //   "20012",
  //   "6005",
  //   "20010",
  //   "3000",
  //   "20013",
  //   "20014",
  //   "20015",
  //   "20008",
  //   "1000",
  //   "1006",
  //   "1005",
  //   "20009"
  // ],
  // "cardRequestUrl": "https://connect-ai-e.com/feishu/64af64fab84e8e000162ef66/card",
  // "verificationUrl": "https://connect-ai-e.com/feishu/64af64fab84e8e000162ef66/event"
  async getAppDeployInfo(appId: string) {
    const scopeIds = await this.getAvailableScope(appId)
    const cardRequestUrl = await this.botManager.showBotCallBack(appId)
    const eventInfos = await this.eventManager.getEventInfo(appId)
    const appSecret = await this.getAppSecret(appId)
    const verificationUrl = eventInfos.verificationUrl
    const verificationToken = eventInfos.verificationToken
    const encryptKey = eventInfos.encryptKey
    const events = eventInfos.events
    const b2cShareStatus = (await this.getB2CShareStatus(appId)).b2cShareSuggest
    return {
      appSecret,
      b2cShareStatus,
      events,
      encryptKey,
      verificationToken,
      scopeIds,
      cardRequestUrl,
      verificationUrl,
    }
  }

  // bot
  async enableBot(appId: string) {
    return this.botManager.enableBot(appId)
  }

  // scope
  // 获取所有权限
  async getAllScope(appId: string) {
    return this.scopeManager.getAllScope(appId)
  }

  async getAvailableScope(appId: string) {
    const allScope = await this.scopeManager.getAllAvailableScope(appId)
    return this.scopeManager.showIds(allScope)
  }

  // 添加权限
  // https://open.feishu.cn/developers/v1/scope/update/cli_a416b219bd3a100e
  // {
  //   "scopeIds": ["21001", "7", "21003", "21002", "20001", "20011", "3001", "20012", "6005", "20010", "3000", "20013", "20014", "20015", "20008", "1000", "1006", "1005", "20009","26015"],
  //   "operation": "add"
  // }
  async addScope(appId: string, scopes: string[]) {
    return this.scopeManager.addScope(appId, scopes)
  }

  // event
  async addEvent(appId: string, events: string[]) {
    return this.eventManager.addEvent(appId, events)
  }

  async getEventInfo(appId: string) {
    return this.eventManager.getEventInfo(appId)
  }

  async getEventEncryptKey(appId: string) {
    const eventInfo = await this.getEventInfo(appId)
    return eventInfo.encryptKey
  }

  async getEventVerificationToken(appId: string) {
    const eventInfo = await this.getEventInfo(appId)
    return eventInfo.verificationToken
  }

  async getEventVerificationUrl(appId: string) {
    const eventInfo = await this.getEventInfo(appId)
    return eventInfo.verificationUrl
  }

  async getEvents(appId: string) {
    const eventInfo = await this.getEventInfo(appId)
    return eventInfo.events
  }

  // 检测有没有同名的机器人,如果有返回appId
  async checkAppName(aBot: string) {
    const appList = await this.getAppList()
    const bot = appList.find(app => app.name === aBot)
    if (bot)
      return bot.appID
    return ''
  }
}

class BotManager {
  configuration: Configuration

  get cfg() {
    return this.configuration
  }

  constructor(configuration: Configuration) {
    this.configuration = configuration
  }

  async enableBot(appId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/robot/switch/${appId}`, {
      enable: true,
    })
    return result.data
  }

  async disableBot(appId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/robot/switch/${appId}`, {
      enable: false,
    })
    return result.data
  }

  // https://open.feishu.cn/developers/v1/robot/check_url/cli_a416b219bd3a100e
  async checkBotCallBack(appId: string, url: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/robot/check_url/${appId}`, {
      cardRequestUrl: url,
    })
    return result.data.access
  }

  // https://open.feishu.cn/developers/v1/robot/cli_a52ca0ba25b2100d
  async showBotCallBack(appId: string) {
    const result = await this.cfg.aGetRequest(`developers/v1/robot/${appId}`)
    return result.data.cardRequestUrl
  }

  async showIfBotEnable(appId: string) {
    const result = await this.cfg.aGetRequest(`developers/v1/robot/${appId}`)
    return result.data.enable
  }

  async showIfBotMenuEnable(appId: string) {
    const result = await this.cfg.aGetRequest(`developers/v1/robot/${appId}`)
    return result.data.botMenuEnable
  }

  async addBotCallBack(appId: string, url: string) {
    let result
    try {
      result = await this.cfg.aPostRequest(`developers/v1/robot/update_changed/${appId}`, {
        cardURL: {
          cardRequestURL: url,
        },
      })
    }
    catch (e: any) {
      console.log(e.response.data)
    }

    return result.data
  }

  async addBotCallBackV2(appId: string, url: string) {
    let result
    try {
      result = await this.cfg.aPostRequest(`developers/v1/callback/update_url/${appId}`, {
        verificationUrl: url,
      })
    }
    catch (e: any) {
      console.log(e.response.data)
    }
    return result.data
  }

  async updateBotCallBackV2(appId: string, callbacks: string[], operation: 'add' | 'del' = 'add') {
    // callbacks: ["card.action.trigger", "card.action.trigger_v1", "url.preview.get", "profile.view.get"]
    let result
    try {
      result = await this.cfg.aPostRequest(`developers/v1/callback/update/${appId}`, {
        callbackMode: 1,
        callbacks,
        operation,
      })
    }
    catch (e: any) {
      console.log(e.response.data)
    }
    return result.data
  }
}

export interface versionMeta {
  appVersion: string
  bindTenantId: string
  bindTenantName: string
  createUser: string
  publishTime: number
  unshelveTime: number
  updateRemark: string
  versionId: string
  // versionStatus:0 未发布 1 已发布在审核 2 审核后替换当前版本 100 历史版本
  versionStatus: number
}

class VersionManager {
  configuration: Configuration

  get cfg() {
    return this.configuration
  }

  constructor(configuration: Configuration) {
    this.configuration = configuration
  }

  async getVersionInfo(appId: string) {
    //   https://open.feishu.cn/developers/v1/app_version/list/cli_a4e6931a39bfd013
    const result = await this.cfg.aGetRequest(`developers/v1/app_version/list/${appId}`)
    return result.data.versions
  }

  async getLatestVersion(appId: string): Promise<Partial<versionMeta>> {
    const versions = await this.getVersionInfo(appId)
    return versions[0]
  }

  async getNewAppVersion(appId: string): Promise<string> {
    // 获取最近的版本号然后加1 0.0.3 -> 0.0.4
    const version = await this.getLatestVersion(appId)
    if (!version)
      return '0.0.1'

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [major, minor, patch] = version.appVersion?.split('.').map(v => Number.parseInt(v))
    return `${major}.${minor}.${patch + 1}`
  }

  // 是否已经创建了版本但是没有发布
  async canCreateNewVersion(appId: string): Promise<boolean> {
    const version = await this.getLatestVersion(appId)
    if (!version)
      return true

    return version.versionStatus !== 0 && version.versionStatus !== 1
  }

  async creatNextVersion(appId: string) {
    const ifCanCreate = await this.canCreateNewVersion(appId)
    if (!ifCanCreate) {
      return {
        success: false,
      }
    }
    const newVersion = await this.getNewAppVersion(appId)
    const versionId = await this.createNewVersion(appId, newVersion)
    return {
      success: true,
      data: versionId,
    }
  }

  canDelVersion(versionMeta: Partial<versionMeta>) {
    return versionMeta.versionStatus === 0
  }

  // 已上传但是没有通过的版本
  canUnPassVersion(versionMeta: Partial<versionMeta>) {
    return versionMeta.versionStatus === 1
  }

  async delVersion(appId: string, versionId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/app_version/delete/${appId}/${versionId}`)
    return result.data
  }

  async cancelPublishVersion(appId: string, versionId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/publish/cancel_commit/${appId}/${versionId}`)
    return result.data
  }

  // 删除最近一个可以删除的version
  async clearUnPublishedVersion(appId: string) {
    const version = await this.getLatestVersion(appId)
    if (!version)
      return false

    const versionId = version.versionId as string
    if (this.canDelVersion(version))
      await this.delVersion(appId, versionId)

    if (this.canUnPassVersion(version)) {
      await this.cancelPublishVersion(appId, versionId)
      await this.delVersion(appId, versionId)
    }

    return true
  }

  // {
  //   "appVersion": "0.0.3",
  //   "mobileDefaultAbility": "bot",
  //   "pcDefaultAbility": "bot",
  //   "changeLog": "update"
  // }
  //   https://open.feishu.cn/developers/v1/app_version/create/cli_a42ef85d81bad00e
  async createNewVersion(appId: string, appVersion: string): Promise<string> {
    // 其实服务端校验，只要不和上一个一样就行，至于不小于前一个，没有做校验
    const data = {
      appVersion,
      mobileDefaultAbility: 'bot',
      pcDefaultAbility: 'bot',
      changeLog: 'update',
      b2cShareSuggest: this.cfg.deployConfig?.b2cShareSuggest ?? false,
      visibleSuggest: {
        departments: [],
        members: [],
        groups: [],
        isAll: 1,
      },
    }
    console.log(data)
    const result = await this.cfg.aPostRequest(`developers/v1/app_version/create/${appId}`, data)
    return result.data.versionId
  }

  async publishLatestVersion(appId: string) {
    const version = await this.getLatestVersion(appId)
    if (!version)
      return false

    return this.publishVersion(appId, version.versionId as string)
  }

  async publishVersion(appId: string, versionNumber: string) {
    let result
    try {
      result = await this.cfg.aPostRequest(`developers/v1/publish/commit/${appId}/${versionNumber}`, {})
    }
    catch (e: any) {
      console.log(e.response)
    }
    return result.data
  }

  async unPublishVersion(appId: string, versionNumber: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/publish/cancel_commit/${appId}/${versionNumber}`)
    return result.data
  }

  async createAndPublishNextVersion(appId: string) {
    await this.clearUnPublishedVersion(appId)
    const r = await this.creatNextVersion(appId)
    if (!r.success)
      return false

    const versionId = r.data as string
    await this.publishVersion(appId, versionId)
    return true
  }
}

export class ScopeManager {
  configuration: Configuration

  get cfg() {
    return this.configuration
  }

  constructor(configuration: Configuration) {
    this.configuration = configuration
  }

  async getAllScope(appId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/scope/all/${appId}`)
    return result.data.scopes
  }

  async getAllAvailableScope(appId: string) {
    const result = await this.getAllScope(appId)
    const openedScope = result.filter(scope => scope.status !== 0)
    return openedScope
  }

  showIds(scopes: any[]) {
    const ids = scopes.map(scope => scope.id)
    return ids
  }

  async addScope(appId: string, scopes: string[]) {
    const result = await this.cfg.aPostRequest(`developers/v1/scope/update/${appId}`, {
      scopeIds: scopes,
      operation: 'add',
    })
    return result.data
  }
}

export interface TokenInfo {
  type: 'encrypt_key' | 'verification_token'
  value?: string
}

export interface EventUrlInfo {
  verificationToken?: string
  encryptKey?: string
  verificationUrl: string
}

export class EventManager {
  configuration: Configuration

  get cfg() {
    return this.configuration
  }

  constructor(configuration: Configuration) {
    this.configuration = configuration
  }

  async addEvent(appId: string, events: string[]) {
    const result = await this.cfg.aPostRequest(`developers/v1/event/update/${appId}`, {
      operation: 'add',
      eventMode: 1,
      events,
      eventCloudFuncs: [],
    })
    return result.data
  }

  async getEventInfo(appId: string) {
    const result = await this.cfg.aPostRequest(`developers/v1/event/${appId}`)
    return result.data
  }

  async _resetToken(appId: string, tokenInfo: TokenInfo) {
    const result = await this.cfg.aPostRequest(`developers/v1/event/reset_token/${appId}`, tokenInfo)
    return result.data
  }

  async resetEventEncryptKey(appId: string, value?: string) {
    let tokenInfo
    if (!value) {
      tokenInfo = {
        type: 'encrypt_key',
      }
    }
    else {
      tokenInfo = {
        type: 'encrypt_key',
        value,
      }
    }

    const result = await this.cfg.aPostRequest(`developers/v1/event/reset_token/${appId}`, tokenInfo)
    return result.data
  }

  async resetEventVerificationToken(appId: string, value?: string) {
    let tokenInfo
    if (!value) {
      tokenInfo = {
        type: 'verification_token',
      }
    }
    else {
      tokenInfo = {
        type: 'verification_token',
        value,
      }
    }

    const result = await this.cfg.aPostRequest(`developers/v1/event/reset_token/${appId}`, tokenInfo)
    return result.data
  }

  async addEventCallBack(appId: string, opt: EventUrlInfo) {
    if (opt.verificationToken)
      await this.resetEventVerificationToken(appId, opt.verificationToken)

    if (opt.encryptKey)
      await this.resetEventEncryptKey(appId, opt.encryptKey)

    const result = await this.cfg.aPostRequest(`developers/v1/event/check_url/${appId}`, { ...opt })
    return result.data
  }

  async addEventCallBackByUrl(appId: string, url: string) {
    // eventInfo
    const eventInfo = await this.getEventInfo(appId)
    const verificationToken = eventInfo.verificationToken
    const encryptKey = eventInfo.encryptKey
    const verificationUrl = url
    const result = await this.addEventCallBack(appId, {
      verificationToken,
      encryptKey,
      verificationUrl,
    })
    return result
  }
}

interface peopleInfo {
  name: string
  id: string
  depName: string
}

export class PeopleManager {
  configuration: Configuration

  get cfg() {
    return this.configuration
  }

  constructor(configuration: Configuration) {
    this.configuration = configuration
  }

  async getAllPeople() {
    const peopleList: peopleInfo[] = []
    await this.getPeopleListByDep('-1', peopleList)
    return peopleList
  }

  async getPeopleListByDep(depId: string, peopleList: peopleInfo[]) {
    const body = {
      parentID: depId,
      subType: 0, // 获取所有员工+部门
      memberOffset: 0,
      memberLimit: 1000,
      needAvatar: false,
    }
    const result = await this.cfg.aPostRequest('developers/v1/visible/sublist', body)
    const data = result.data
    const depName = await this.getLastParentName(depId)
    data.users.forEach((user) => {
      peopleList.push({
        depName,
        id: user.id,
        name: user.name,
      })
    })
    if (this.hasSubOus(data)) {
      const ousPool = data.ous as any[]
      for (let i = 0; i < ousPool.length; i++)
        await this.getPeopleListByDep(ousPool[i].id, peopleList)
    }
  }

  hasSubOus(res: any) {
    const ousPool = res.ous as any[]
    if (ousPool.length > 0)
      return true
  }

  // [{
  //   "depName": "Connect-AI",
  //   "id": "0",
  //   "parentID": "-2",
  //   "visible": true
  // }]
  async getLastParentName(ouId: string) {
    const body = {
      ouId,
    }
    const result = await this.cfg.aPostRequest('developers/v1/visible/ou_info', body)
    const data = result.data
    return data.ouInfo.name
  }
}

export class FeishuAppPlus extends OpenApp {
  constructor(configuration: Configuration) {
    super(configuration)
  }

  get latestApp() {
    return this.getAppList()[0]
  }

  get latestAppId() {
    return this.latestApp.appID
  }

  async delLatestApp() {
    const appList = await this.getAppList()
    const latestApp = appList[0]
    const appId = latestApp.appID
    const result = await this.deleteApp(appId)
    return result
  }

  async delLatestNApp(N?: number) {
    if (!N)
      N = 1

    // acquire app list
    const appList = await this.getAppList()
    const latestAppList = appList.slice(0, N)
    const appIdList = latestAppList.map(app => app.appID) as any
    const result = await Promise.all(appIdList.map(appId => this.deleteApp(appId)))
    return {
      delNumber: appIdList.length,
    }
  }
}
