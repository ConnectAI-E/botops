import Ajv from 'ajv'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import colorize from 'json-colorizer'

export interface FeishuPlatformConfig {
  appId?: string
  events: string[]
  encryptKey: string
  verificationToken: string
  scopeIds: string[]
  cardRequestUrl: string
  verificationUrl: string
  b2cShareSuggest?: boolean
}

export interface CallBack {
  hook: string
  url: string
}

export interface IDeployConfig {
  name: string
  desc: string
  avatar: string
  help_use?: string
  platform: string
  callback?: CallBack[]
  feishuConfig: FeishuPlatformConfig
}

export class DeployConfig {
  version = '0.0.1'
  ajv: Ajv
  config: IDeployConfig = {} as any

  constructor() {
    this.ajv = new Ajv()
  }

  get schema() {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        desc: {
          type: 'string',
        },
        avatar: {
          type: 'string',
        },
        help_use: {
          type: 'string',
          description: 'help use url',
        },
        platform: {
          type: 'string',
          enum: ['feishu'],
        },
        callback: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hook: {
                type: 'string',
              },
              url: {
                type: 'string',
              },
            },
            required: ['hook', 'url'],
          },
        },
        feishuConfig: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
            },
            b2cShareSuggest: {
              type: 'boolean',
              default: false,
              description: 'Whether to suggest b2c share',
            },
            events: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            encryptKey: {
              type: 'string',
            },
            verificationToken: {
              type: 'string',
            },
            scopeIds: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            cardRequestUrl: {
              type: 'string',
            },
            verificationUrl: {
              type: 'string',
            },
          },
          required: ['events', 'encryptKey', 'verificationToken', 'scopeIds', 'cardRequestUrl', 'verificationUrl'],
        },
      },
      required: ['name', 'platform'],
    }
  }

  get validate() {
    return this.ajv.compile(this.schema)
  }

  validateConfig(config: object) {
    return this.validate(config)
  }

  async isFileExist(path: string) {
    return fs.pathExistsSync(path)
  }

  isJson(path: string) {
    return path.endsWith('.json')
  }

  isUrl(path: string) {
    // 区别是本地链接还是远程链接
    return path.startsWith('http')
  }

  async loadFileByPath(path: string) {
    if (this.isUrl(path))
      return this.remoteLoadFile(path)
    else
      return this.loadLocalFile(path)
  }

  async loadLocalFile(path: string): Promise<string> {
    if (!await this.isFileExist(path))
      return ''

    return fs.readFile(path, 'utf-8')
      .catch((error) => {
        // 处理错误，例如文件不存在等情况
        console.error(`Error loading file: ${error.message}`)
        return '' // 或者抛出错误
      })
  }

  // http://127.0.0.1:8080/mock.config.json
  async remoteLoadFile(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      const jsonData = await response.text() as string
      return jsonData
    }
    catch (error: any) {
      console.error(`Error making request to ${url}: ${error.message}`)
      throw error
    }
  }

  // 检验配置文件的schema是否符合
  async validateConfigByPath(path: string) {
    if (!this.isJson(path))
      return false

    const config = await this.loadFileByPath(path)
    // console.log(config)
    if (!config)
      return false
    return this.validateConfig(JSON.parse(config))
  }

  async loadConfig(path: string) {
    const config = await this.loadFileByPath(path)
    this.config = JSON.parse(config)
  }

  get botBaseInfo() {
    // name: string
    // desc?: string
    // avatar?: string
    return {
      name: this.config.name,
      desc: this.config.desc,
      avatar: this.config.avatar,
      help_use: this.config.help_use,
    }
  }

  get botName() {
    return this.config.name
  }

  get botHelpUse() {
    return this.config.help_use
  }

  get botDesc() {
    return this.config.desc
  }

  get botAvatar() {
    return this.config.avatar
  }

  get botPlatform() {
    return this.config.platform
  }

  get botFeishuConfig() {
    return this.config.feishuConfig
  }

  get ifFirstDeploy() {
    return !this.appId
  }

  get events() {
    return this.config.feishuConfig.events
  }

  get eventCallbackUrl() {
    return {
      encryptKey: this.config.feishuConfig.encryptKey,
      verificationToken: this.config.feishuConfig.verificationToken,
      verificationUrl: this.config.feishuConfig.verificationUrl,
    }
  }

  get scopeIds() {
    return this.config.feishuConfig.scopeIds
  }

  get cardRequestUrl() {
    return this.config.feishuConfig.cardRequestUrl
  }

  get appId() {
    return this.config.feishuConfig.appId
  }

  get warpConfig() {
    return JSON.stringify(this.config, null, 2)
  }

  async addConfig(newConfig: IDeployConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
    }
  }

  printColorConfig() {
    console.log(colorize(this.warpConfig))
  }

  async writeContent(filePath: string, str: string) {
    try {
      // 格式化字符串或者进行其他处理
      // 写入文件
      await fs.writeFile(filePath, str)
    }
    catch (error) {
      console.error('写入文件时出错：', error)
    }
  }

  formatName(name: string) {
    // change blank to -
    return name.replace(/\s+/g, '-')
  }

  async exportConfig(filename = 'default.json') {
    if (!this.config)
      return

    if (filename === 'default.json')
      filename = `${this.formatName(this.botName)}.botops.json`

    const config = JSON.stringify(this.config, null, 2)
    await this.writeContent(filename, config)
    return filename
  }

  ifHasCallback() {
    return this.config.callback && this.config.callback.length > 0
  }

  getAfterAppIdChangeHookUrl() {
    if (!this.ifHasCallback())
      return
    const callback = this.config.callback as CallBack[]
    // find
    const find = callback.find(item => item.hook === 'appid_changed')
    if (!find)
      return
    // replace APPID / APPSECRET
    return find.url
  }

  async hookAfterAppIdChange(url: string, appId: string, secret: string) {
    url = url.replace(/APPID/g, appId).replace(/APPSECRET/g, secret)
    // 请求一次
    console.log(url)
    await fetch(url)
  }
}
