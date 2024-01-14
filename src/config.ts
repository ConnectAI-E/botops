// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Conf from 'conf'
import { Configuration } from 'onebot-feishu'
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

  updateFeishuConfig(config: FeishuConfig) {
    const feishuConfig = this.getFeishuConfig()
    this.setFeishuConfig({ ...feishuConfig, ...config })
  }

  updateNickname(nickname: string) {
    this.updateFeishuConfig({ nickname })
  }

  async isAuth() {
    const feishuConfig = this.getFeishuConfig()
    // todo 真实校验
    const aConfig = new Configuration({
      session: feishuConfig.session as string,
      lark_oapi_csrf_token: feishuConfig.lark_oapi_csrf_token as string,
    })
    const isAuthed = await aConfig.isAuthed()
    return isAuthed
  }
}
