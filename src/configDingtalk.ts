// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Conf from 'conf'

// @ts-expect-error  This is an expected error because no type definition for this package
import { Configuration, OpenApp } from '../packages/dingtalk/src/index'
import { name } from '../package.json'

export interface DingtalkConfig {
  nickname?: string
  account: string
  deviceid: string
  corp_id: string
  _o_a_u: string
  access_token: string
}

export const fakeDingtalkConfig: DingtalkConfig = {
  nickname: 'test',
  account: 'oauth_k1%3AhEHKdGoXga3hCRUyIgUpJdKfe%2BGSGQ%2B4avWLMFfyjrzPkvGXyrWg%2BGphuNDJVDpmi%2BMUXhD3Hfm3p0HqiE2W8%2FjFBdPDvctNnX8QaW7Kuuw%3D',
  deviceid: 'e3b2444d87f441f38b2be8798be2ae30',
  corp_id: 'ding97db296bbb01fab5f5bf40eda33b7ba0',
  access_token: 'af800b35-21ef-4aaf-855a-ac575ddb0cb3',
  _o_a_u: 'eyJfbyI6Im9kNjNjOGExMDJlOTQ5YjdhOTIxNjBhOWM0MDJlNTljOWEiLCJfYSI6ZmFsc2UsIl9zIjoiNjEwMzM1MDMyNzI2MTcyNjUzIiwiX2MiOmZhbHNlLCJfdSI6Im9kODJmMGUyNjMwYzNlODVhYzMwZGQ3YTNjMTFkYzZhOGUiLCJfZSI6Im9kMWU0OGRiYjJjYTE0NWIwMGRjMTc1ZmU0Y2ZkNTc1N2IifQ==',
}

export class Config {
  private static instance: Config

  conf: Conf

  private constructor() {
    this.conf = new Conf({ projectName: name })
  }

  static getInstance() {
    if (!Config.instance)
      Config.instance = new Config()

    return Config.instance
  }

  public get(key: string) {
    return this.conf.get(key)
  }

  public set(key: string, value: any) {
    return this.conf.set(key, value)
  }
}

export class DingtalkConfigManager {
  private static instance: DingtalkConfigManager

  config: Config

  private constructor() {
    this.config = Config.getInstance()
  }

  static getInstance() {
    if (!DingtalkConfigManager.instance)
      DingtalkConfigManager.instance = new DingtalkConfigManager()

    return DingtalkConfigManager.instance
  }

  getDingtalkConfig(): DingtalkConfig {
    const DingtalkConfig = this.config.get('DingtalkConfig') as DingtalkConfig
    return DingtalkConfig
  }

  setDingtalkConfig(config: DingtalkConfig) {
    this.config.set('DingtalkConfig', config)
  }

  // 格式是否符合要求
  checkDingtalkConfig(config: DingtalkConfig) {
    const { account, _o_a_u, corp_id, deviceid, access_token } = config
    if (!account || !_o_a_u || !corp_id || !deviceid || !access_token)
      return false
    return true
  }

  updateDingtalkConfig(config: DingtalkConfig) {
    const DingtalkConfig = this.getDingtalkConfig()
    this.setDingtalkConfig({ ...DingtalkConfig, ...config })
  }

  private createAConfig(): Configuration {
    const DingtalkConfig = this.getDingtalkConfig()
    if (!DingtalkConfig)
      throw new Error('No Feishu config')

    return new Configuration({
      session: DingtalkConfig.session as string,
      lark_oapi_csrf_token: DingtalkConfig.lark_oapi_csrf_token as string,
    })
  }

  async updateNickname() {
    const aConfig = this.createAConfig()
    const nickname = await aConfig.getNickname() as string
    this.updateDingtalkConfig({ nickname })
  }

  get nickname() {
    const DingtalkConfig = this.getDingtalkConfig()
    return DingtalkConfig.nickname
  }

  async isAuth() {
    const DingtalkConfig = this.getDingtalkConfig()
    if (!DingtalkConfig)
      return false
    const aConfig = this.createAConfig()
    const isAuthed = await aConfig.isAuthed()
    return isAuthed
  }

  get appBuilder() {
    const aConfig = this.createAConfig()
    const appBuilderInstance = new OpenApp(aConfig)
    return appBuilderInstance
  }
}
