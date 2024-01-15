// commands/auth.ts
import type { Argv } from 'yargs'
import clipboard from 'clipboardy'
import confirm from '@inquirer/confirm'
import Listr from 'listr'
import { greenIt, redIt } from './utils'
import { DeployConfig } from './manifest'
import { FeishuConfigManager } from './config'

export const command = 'deploy'
export const describe = 'Deploy bot to specific bot platform, support local file or url'

export function builder(yargs: Argv) {
  return yargs
    .option('interactive', {
      describe: 'interactive deploy',
      type: 'boolean',
      alias: 'i',
    })
    .option('clipboard', {
      describe: 'load manifest from clipboard',
      type: 'boolean',
      alias: 'c',
    })
}

export async function handler(argv: any) {
  // 如果没有接收到参数，默认读取同级目录下的 one-bot.json 文件
  if (argv._.length === 1) {
    const answer = await confirm({
      message: 'read the deployment configuration file from the clipboard ?',
      default: false,
    })
    if (answer) {
      const text = readClipboard()
      console.log('manifest from clipbord ：', text)
      return
    }
  }
  // 如果接收到参数，就读取参数
  if (argv._.length > 1) {
    const pathFile = argv._[1]
    const aDeployConfig = new DeployConfig()
    if (!await aDeployConfig.validateConfigByPath(pathFile))
      redIt('the config file is not valid')
    await aDeployConfig.loadConfig(pathFile)
    const aLocalConfig = FeishuConfigManager.getInstance()
    const appBuilder = aLocalConfig.appBuilder
    await appBuilder.init()

    if (aDeployConfig.ifFirstDeploy) {
      const appId = await appBuilder.newApp(aDeployConfig.botBaseInfo)

      const tasks = new Listr([
        {
          title: '初始化机器人',
          task: async (ctx, task) => {
            const appId = await appBuilder.newApp(aDeployConfig.botBaseInfo)
            await appBuilder.versionManager.clearUnPublishedVersion(appId)

            ctx.appId = appId
          },
        },

        {
          title: '添加事件权限',
          task: async (ctx, task) => {
            const appId = ctx.appId
            await appBuilder.eventManager.addEvent(appId, aDeployConfig.events)
          },
        },
        {
          title: '添加事件回调',
          task: async (ctx, task) => {
            const appId = ctx.appId
            await appBuilder.eventManager.addEventCallBack(appId, aDeployConfig.eventCallbackUrl)
          },
        },
        {
          title: '启用机器人',
          task: async (ctx) => {
            const appId = ctx.appId
            await appBuilder.enableBot(appId)
          },
        },
        {
          title: '添加权限范围',
          task: async (ctx) => {
            const appId = ctx.appId
            await appBuilder.addScope(appId, aDeployConfig.scopeIds)
          },
        },
        {
          title: '添加机器人回调',
          task: async (ctx) => {
            const appId = ctx.appId
            await appBuilder.botManager.addBotCallBack(appId, aDeployConfig.cardRequestUrl)
          },
        },
        {
          title: '创建并发布下一个版本',
          task: async (ctx) => {
            const appId = ctx.appId
            await appBuilder.versionManager.createAndPublishNextVersion(appId)
          },
        },
      ])

      await tasks.run()
      greenIt((`机器人创建成功，appId: ${appId}`))
    }
  }
}

function readClipboard() {
  return clipboard.readSync()
}
