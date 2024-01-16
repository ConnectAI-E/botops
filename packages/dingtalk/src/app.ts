import fetch, { FormData } from 'node-fetch'
import type { Configuration } from './configuration'

// todo: 如果运行浏览器环境中，需要注释掉

export interface AppInfo {
  appName: string
  appDesc?: string
  appType?: number
  appIcon?: string
  iconUrl?: string
}

export interface BotInfo {
  appId?: string
  appKey?: string
  brief?: string
  description?: string
  iconMediaId?: string
  mode?: number
  name: string
  outgoingUrl?: string
  previewMediaId?: string
}

export class OpenApp {
  configuration: Configuration
  botManager: BotManager
  versionManager: VersionManager
  uploadManager: UploadManager

  constructor(configuration: Configuration) {
    this.configuration = configuration
    this.botManager = new BotManager(configuration)
    this.versionManager = new VersionManager(configuration)
    this.uploadManager = new UploadManager(configuration)
  }

  async init() {
  }

  get cfg() {
    return this.configuration
  }

  async requestAppList() {
    const result = await this.cfg.aGetRequest('openapp/orginnerapp/listByCondition')
    return result.data.data as any
  }

  async requestAppBaseInfo(appId: string) {
    const result = await this.cfg.aGetRequest(`openapp/unifiedapp/${appId}/get`)
    return result as any
  }

  async getAppSecret(appId: string) {
    const access_token = this.cfg.access_token
    const result = await this.cfg.aGetRequest(`/openapp/unifiedapp/${appId}/get?access_token=${access_token}`)
    const data = result.data
    const { providerAppId, clientId, clientSecret } = data
    return {
      providerAppId,
      clientId,
      clientSecret,
    }
  }

  async deleteApp(appId: string) {
    const access_token = this.cfg.access_token
    const result = await this.cfg.aPostRequest(`openapp/unifiedapp/${appId}/delete?access_token=${access_token}&unifiedAppId=${appId}`)
    return result
  }

  async newApp(appInfo: AppInfo): Promise<string> {
    // 如果有avatar，先上传avatar
    const access_token = this.cfg.access_token
    if (appInfo.iconUrl)
      appInfo.iconUrl = await this.uploadManager.uploadAppAvatar(appInfo.iconUrl)

    const formatBody = await this.formatNewAppBody(appInfo)
    console.log(formatBody, '---formatBody---')
    const result = await this.cfg.aPostRequest(`/openapp/unifiedapp/create?access_token=${access_token}`, formatBody)
    console.log(result, '---result---')
    return result
  }

  // async createAndQueryApp(appInfo: AppInfo): Promise<{
  //   appID: string
  //   secret: string
  // }> {
  //   const appId = await this.newApp(appInfo);
  //   const secret = await this.getAppSecret(appId);
  //   return {
  //     appID: appId,
  //     secret: secret
  //   };
  // }
  getIconIdFromUrl(url: string) {
    const reg = /\/media\/(.*?)\_/
    const result = reg.exec(url)
    if (result)
      return `@${result[1]}`

    return ''
  }

  addAccessToken(url: string) {
    return `${url}?access_token=${this.cfg.access_token}`
  }

  async formatNewAppBody(appInfo: AppInfo) {
    let { appName, appDesc, appType, appIcon, iconUrl } = appInfo
    if (!appName)
      throw new Error('appName is required')

    if (!iconUrl)
      iconUrl = 'https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg'

    if (!appDesc)
      appDesc = 'a dingtalk bot'

    if (!appIcon)
      appIcon = this.getIconIdFromUrl(iconUrl)

    if (!appType)
      appType = 2

    return {
      appName,
      appDesc,
      appIcon,
      appType,
    }
  }

  async changeAppInfo(appId: string, appInfo: AppInfo) {
    const formatBody = await this.formatNewAppBody(appInfo)
    const link = `openapp/unifiedapp/${appId}/update`
    const result = await this.cfg.aPostRequest(this.addAccessToken(link), formatBody)
    return result
  }

  async getVersionInfo(appId: string) {
    return this.versionManager.getVersionInfo(appId)
  }

  // bot
  async enableBot(appId: string) {
    return this.botManager.enableBot(appId)
  }

  // 判断有没有app
  async ifHasApp(appId: string) {
    const { data } = await this.cfg.aGetRequest(`/openapp/orginnerapp/listByCondition?appGroupId=0&pageSize=20&currentPage=1&=&access_token=${this.cfg.access_token}`)
    if (data.data.filter((i: { unifiedAppId: string }) => i.unifiedAppId === appId)[0]) {
      console.log('有这个app')
      return { hasApp: true, msg: '有这个app' }
    }
    else {
      console.log('没有这个app')
      return { hasApp: false, msg: '没有这个app' }
    }
  }

  // 判断有没有bot
  async hasBot(appId: string) {
    const { data } = await this.cfg.aGetRequest(`/openapp/unifiedapp/${appId}/abilityList?access_token=${this.cfg.access_token}`)
    if (data.filter((i: { code: string }) => i.code === 'bot')[0].enabled) {
      console.log('开启了bot')
      return { hasBot: true, msg: '开启了bot' }
    }
    else {
      console.log('没有开启bot')
      return { hasBot: false, msg: '没有开启bot' }
    }
  }

  // TODO： name not ok
  // 给APP新建一个 bot
  async newBot(appId: string, botInfo: BotInfo) {
    const access_token = this.cfg.access_token

    // 判断有没有这个app
    const hasApp = await this.ifHasApp(appId)

    //  这个app有没有bot
    const openbot = await this.hasBot(appId)

    // 机器人头像 (和创建应用时相同)
    if (botInfo.iconMediaId)
      botInfo.iconMediaId = await this.uploadManager.uploadAppAvatar(botInfo.iconMediaId)

    // 机器人预览图
    if (botInfo.previewMediaId)
      botInfo.previewMediaId = await this.uploadManager.uploadBotpreview(botInfo.previewMediaId)

    // todo：获取配置
    // {
    //   providerAppId: '2849023341',
    //   clientId: 'dingideecpk8ppdrvnub',
    //   clientSecret: '7_eAhnX4W-F4Jlm_Q7t0Ld8XqdPbY3q7PvpMvJ7K0fqVURpFHWiNOnj-lQGN28XL'
    // }
    const data = await this.getAppSecret(appId)
    botInfo.appId = data.providerAppId
    botInfo.appKey = data.clientId

    const formatBody = await this.formatNewBotBody(botInfo)
    console.log(formatBody, '---formatBody---')
    const result = await this.cfg.aPostRequest(`/openapp/inner/robot/create?access_token=${access_token}`, formatBody)
    console.log(result, '---result---')
    return result
  }

  // todo: bot类全部放到BOTManager
  async changeBotConfig(appId: string, botInfo: BotInfo) {
    const access_token = this.cfg.access_token

    // 机器人头像 (和创建应用时相同)
    if (botInfo.iconMediaId)
      botInfo.iconMediaId = await this.uploadManager.uploadAppAvatar(botInfo.iconMediaId)

    // 机器人预览图
    if (botInfo.previewMediaId)
      botInfo.previewMediaId = await this.uploadManager.uploadBotpreview(botInfo.previewMediaId)

    // 拿到配置
    const data = await this.getAppSecret(appId)
    botInfo.appId = data.providerAppId
    botInfo.appKey = data.clientId

    const formatBody = await this.formatChangeBotBody(botInfo)
    console.log(formatBody, '---formatBody---')
    const result = await this.cfg.aPostRequest(`/openapp/inner/robot/update?access_token=${access_token}`, formatBody)
    console.log(result, '---result---')
    return result
  }

  async formatNewBotBody(botInfo: BotInfo) {
    let {
      appId,
      appKey,
      brief,
      description,
      iconMediaId,
      mode,
      name,
      outgoingUrl,
      previewMediaId,
    } = botInfo
    if (!name)
      throw new Error('appId is required')

    if (!iconMediaId)
      iconMediaId = this.getIconIdFromUrl('https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg')

    if (!previewMediaId)
      previewMediaId = this.getIconIdFromUrl('https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg')

    if (!mode)
      mode = 0

    return {
      appId,
      appKey,
      brief,
      description,
      iconMediaId,
      mode,
      name,
      outgoingUrl,
      previewMediaId,
    }
  }

  async formatChangeBotBody(botInfo: BotInfo) {
    let {
      appId,
      appKey,
      brief,
      description,
      iconMediaId,
      mode,
      name,
      outgoingUrl,
      previewMediaId,
    } = botInfo
    const {
      status,
      templateId,
    } = await this.cfg.aGetRequest(`/openapp/inner/robot/get?appId=${appId}&access_token=
    ${this.cfg.access_token}`)
    if (!name)
      throw new Error('appId is required')

    if (!iconMediaId)
      iconMediaId = this.getIconIdFromUrl('https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg')

    if (!previewMediaId)
      previewMediaId = this.getIconIdFromUrl('https://i01.lw.aliimg.com/media/lADPDfmVQafoVxrMyMzI_200_200.jpg')

    if (!mode)
      mode = 0

    return {
      appId,
      appKey,
      brief,
      description,
      iconMediaId,
      mode,
      name,
      outgoingUrl,
      previewMediaId,
      status,
      templateId,
    }
  }

  async getAppVersion(appId: string) {
    return this.versionManager.getAppVersion(appId)
  }

  // version 不应该写死
  async saveAppVersionDetail(appId: string) {
    return this.versionManager.saveAppVersionDetail(appId)
  }

  // 发布
  async publishApp(appId: string) {
    return this.versionManager.publishApp(appId)
  }

  async saveAndPublishApp(appId: string) {
    await this.saveAppVersionDetail(appId)
    await this.publishApp(appId)
    return { msg: 'save and publish success' }
  }

  // todo
  // 删除最近新建的n个APP，先获取列表，按照创建时间排序，依次删除
  async deleteLastApp(n: number) {
    const appList = await this.requestAppList()
    const appListid = appList.map((i: { unifiedAppId: any }) => i.unifiedAppId).slice(0, n)
    for (const id of appListid)
      await this.deleteApp(id)

    return { msg: 'delete app success' }
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
    const access_token = this.cfg.access_token
    const result = await this.cfg.aPostRequest(`/openapp/unifiedapp/${appId}/ability/enable?access_token=${access_token}`, {
      unifiedAppId: appId, abilityTypes: ['bot'],
    })
    return result
  }
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
    const access_token = this.cfg.access_token
    const result = await this.cfg.aGetRequest(`openapp/unifiedapp/${appId}/versionList?access_token=${access_token}&currentPage=1&pageSize=20&unifiedAppId=${appId}`)
    console.log(result.data.data, '---version list---')
    return result.data.data
  }

  // 创建version
  async getAppVersion(appId: string) {
    const access_token = this.cfg.access_token
    const result = await this.cfg.aGetRequest(`/openapp/unifiedapp/${appId}/get?access_token=${access_token}`)
    console.log(`versionId:${result.data.versionId}`)
    return result.data.versionId
  }

  // 获取最新版本
  async getLatestVersion(appId: string) {
    const versions = await this.getVersionInfo(appId)
    console.log(versions[0], '---最新版本---')
    return versions[0]
  }

  // 获取新的版本号并加1
  async getNewAppVersion(appId: string) {
    const data = await this.getLatestVersion(appId)
    console.log('data:', data)
    if (data === undefined) {
      // 钉钉版本最低为1.0.0 否则报错
      return '1.0.0'
    }
    // eslint-disable-next-line no-restricted-globals
    const [major, minor, patch] = data.version.split('.').map((v: string) => parseInt(v))
    return `${major}.${minor}.${patch + 1}`
  }

  // 保存版本详情
  async saveAppVersionDetail(appId: string) {
    const access_token = this.cfg.access_token
    const versionId = await this.getAppVersion(appId)
    const version = await this.getNewAppVersion(appId)
    const result = await this.cfg.aPostRequest(`/openapp/unifiedapp/${appId}/commitVersion?access_token=${access_token}&unifiedAppId=${appId}&versionId=${versionId}`, {
      unifiedAppId: appId,
      versionId,
      version,
      description: 'new action',
      scopeVO: {
        deptId: -1,
        uid: '',
        roleId: '',
        dynamicGroup: '',
        isHidden: false,
      },
      scopeSelf: false,
      relatedAbility: {},
    })
    // console.log(result);
    return result
  }

  // 发布新版本
  async publishApp(appId: string) {
    const access_token = this.cfg.access_token
    const versionId = await this.getAppVersion(appId)
    const result = await this.cfg.aPostRequest(`/openapp/unifiedapp/${appId}/publishVersion?access_token=${access_token}`, {
      unifiedAppId: appId,
      versionId,
    })
    // console.log(result);
    return result
  }
}

class UploadManager {
  configuration: Configuration

  get cfg() {
    return this.configuration
  }

  constructor(configuration: Configuration) {
    this.configuration = configuration
  }

  // fetch请求图片链接获取Blob对象
  async getBlobFromUrl(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    return blob
  }

  async uploadAppAvatar(avatarlink: string) {
    const access_token = this.cfg.access_token
    const blob = await this.getBlobFromUrl(avatarlink)
    const data = new FormData()
    data.append('file', blob)
    data.append('uploadType', '4')
    data.append('isIsv', 'false')
    data.append('scale', JSON.stringify({
      width: 240,
      height: 240,
    }))
    const result = await this.cfg.aPostMultipartRequest(`/microapp/uploadPic/logo.json?access_token=${access_token}`, data)
    console.log(result)
    return result.data
  }

  async uploadBotpreview(avatarlink: string) {
    const access_token = this.cfg.access_token
    const blob = await this.getBlobFromUrl(avatarlink)
    const data = new FormData()
    data.append('file', blob)
    data.append('uploadType', '4')
    data.append('isIsv', 'false')
    data.append('scale', JSON.stringify({
      width: 240,
      height: 240,
    }))
    const result = await this.cfg.aPostMultipartRequest(`/microapp/uploadLogo.json?access_token=${access_token}`, data)
    console.log(result)
    return result.data.logoImgUrl
  }
}
