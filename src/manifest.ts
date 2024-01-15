import Ajv from 'ajv'
import fs from 'fs-extra'
import fetch from 'node-fetch'

export interface FeishuPlatformConfig {
  appId?: string
  events: string[]
  encryptKey: string
  verificationToken: string
  scopeIds: string[]
  cardRequestUrl: string
  verificationUrl: string

}

export interface DeployConfig {
  name: string
  desc: string
  avatar: string
  platform: string
  feishuConfig: FeishuPlatformConfig
}

export class DeployConfig {
  version = '0.0.1'
  ajv: Ajv
  config: DeployConfig = {} as any

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
        platform: {
          type: 'string',
          enum: ['feishu'],
        },
        feishuConfig: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
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
      required: ['name', 'desc', 'avatar', 'platform', 'feishuConfig'],
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
      throw new Error('the file is not exist')

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
    }
  }

  get botName() {
    return this.config.name
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
    return this.config.feishuConfig.appId === undefined
  }

  get events() {
    return this.config.feishuConfig.events
  }

  get eventCallbackUrl() {
    return {
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
}
