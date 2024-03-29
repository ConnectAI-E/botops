// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Conf from 'conf'

// @ts-expect-error  This is an expected error because no type definition for this package
import { Configuration, OpenApp } from 'botops-feishu'
import { name } from '../package.json'

export interface FeishuConfig {
  nickname?: string
  session?: string
  lark_oapi_csrf_token?: string
}

export const fakeFeishuConfig: FeishuConfig = {
  nickname: 'test',
  session: 'XN0YXJ0-8baub257-fb25-415c-9f6d-25be514ce31f-WVuZA',
  lark_oapi_csrf_token: 'YU7dWtWax1ssfbFF128kZfOluXHU8jHXf5MF1PAYGiM=',
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

export class FeishuConfigManager {
  private static instance: FeishuConfigManager

  config: Config

  private constructor() {
    this.config = Config.getInstance()
  }

  static getInstance() {
    if (!FeishuConfigManager.instance)
      FeishuConfigManager.instance = new FeishuConfigManager()

    return FeishuConfigManager.instance
  }

  getFeishuConfig(): FeishuConfig {
    const feishuConfig = this.config.get('feishuConfig') as FeishuConfig
    return feishuConfig
  }

  setFeishuConfig(config: FeishuConfig) {
    this.config.set('feishuConfig', config)
  }

  // 格式是否符合要求
  checkFeishuConfig(config: FeishuConfig) {
    const { session, lark_oapi_csrf_token } = config
    if (!session || !lark_oapi_csrf_token)
      return false
    return true
  }

  updateFeishuConfig(config: FeishuConfig) {
    const feishuConfig = this.getFeishuConfig()
    this.setFeishuConfig({ ...feishuConfig, ...config })
  }

  private createAConfig(): Configuration {
    const feishuConfig = this.getFeishuConfig()
    if (!feishuConfig)
      throw new Error('No Feishu config')

    return new Configuration({
      session: feishuConfig.session as string,
      lark_oapi_csrf_token: feishuConfig.lark_oapi_csrf_token as string,
    })
  }

  async updateNickname() {
    const aConfig = this.createAConfig()
    const nickname = await aConfig.getNickname() as string
    this.updateFeishuConfig({ nickname })
  }

  get nickname() {
    const feishuConfig = this.getFeishuConfig()
    return feishuConfig.nickname
  }

  async isAuth() {
    const feishuConfig = this.getFeishuConfig()
    if (!feishuConfig)
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
