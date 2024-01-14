import type { OpenApp } from './app'

export interface DeployConfig {
  appId?: string
  appSecret?: string
  avatar?: string
  name?: string
  desc?: string
  encryptKey?: string
  verificationToken?: string
  events?: string[]
  scopeIds?: string[]
  cardRequestUrl?: string
  verificationUrl?: string
}

export class DeployTool {
  rawConfig: DeployConfig

  openApi: OpenApp

  constructor(private config: DeployConfig) {
    this.rawConfig = config
    this.openApi = undefined as any
  }

  async loadOpenApi(openApi: OpenApp) {
    this.openApi = openApi
    await this.openApi.init()
  }

  get configString() {
    return JSON.stringify(this.rawConfig)
  }

  ifFirstDeploy() {
    return this.rawConfig.appId === undefined
  }

  async creatNewBot() {
    const result = await this.openApi.createAndQueryApp({
      name: this.rawConfig.name as string,
      desc: this.rawConfig.desc,
    })
    this.rawConfig.appId = result.appID
    this.rawConfig.appSecret = result.secret
    console.log(result)
    return result
  }

  get appid() {
    return this.rawConfig.appId as string
  }

  async resetToken() {
    await this.openApi.eventManager.resetEventEncryptKey(this.appid, this.rawConfig.encryptKey)
    await this.openApi.eventManager.resetEventVerificationToken(this.appid, this.rawConfig.verificationToken)
  }

  async addBot() {
    await this.openApi.enableBot(this.appid)
    await this.openApi.addScope(this.appid, this.rawConfig.scopeIds as string[])
    await this.openApi.botManager.addBotCallBack(this.appid, this.rawConfig.cardRequestUrl as string)
  }

  async addEvent() {
    await this.openApi.eventManager.addEvent(this.appid, this.rawConfig.events as string[])
    await this.openApi.eventManager.addEventCallBackByUrl(this.appid, this.rawConfig.verificationUrl as string)
  }

  async publishBot() {
    await this.openApi.versionManager.createAndPublishNextVersion(this.appid)
  }

  async deployBot() {
    await this.resetToken()
    await this.addEvent()
    await this.addBot()
  }

  async createAndDeploy() {
    await this.creatNewBot()
    await this.deployBot()
    await this.publishBot()
  }
}
