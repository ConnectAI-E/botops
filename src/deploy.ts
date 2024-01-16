// commands/auth.ts
import type { Argv } from 'yargs'
import clipboard from 'clipboardy'
import Listr from 'listr'
import ora from 'ora'
import confirm from '@inquirer/confirm'

// @ts-expect-error This is an expected error because no type definition for this package
import { getFeishuCookies } from 'botops-feishu'
import { changeArgvToString, greenIt, redIt } from './utils'
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

const DEFAULT_MANIFEST_FILE = 'botops.json'

export async function handler(argv: any) {
  let pathFile = ''
  const spin = ora('Loading manifest file...').start()
  if (argv._.length === 1) {
    spin.info('Not specify manifest file, will load botops.json in current directory')
    spin.info(`Loading default manifest from botops.json in ${process.cwd()}`)
    pathFile = DEFAULT_MANIFEST_FILE
  }
  if (argv._.length > 1) {
    pathFile = changeArgvToString(argv._[1])
    spin.info(`Loading manifest from ${pathFile}`)
  }

  const aDeployConfig = new DeployConfig()
  if (!await aDeployConfig.validateConfigByPath(pathFile)) {
    spin.fail('Manifest file of deploy is not valid.')
    spin.clear()
    return
  }
  await aDeployConfig.loadConfig(pathFile)
  spin.succeed('Manifest file loaded successfully.')
  const aLocalConfig = FeishuConfigManager.getInstance()
  // 先检查是否登录授权
  const isLogin = await aLocalConfig.isAuth()
  if (!isLogin) {
    const answer = await confirm({ message: 'Looks like you\'re not logged in to Feishu. Would you like to log in now?' })
    if (!answer) {
      redIt('Please log in to Feishu first')
      process.exit(1)
    }
    const newCookie = await getFeishuCookies() as any
    aLocalConfig.setFeishuConfig(newCookie)
    await aLocalConfig.updateNickname()
    greenIt(`🚀Successfully reauthorized Feishu! Welcome, ${aLocalConfig.nickname}!`)
  }
  const appBuilder = aLocalConfig.appBuilder
  await appBuilder.init()

  let appId = ''
  // 配置文件是否含有appID
  if (aDeployConfig.ifFirstDeploy) {
    // 检测是否有重名的机器人
    const oldAppId = await appBuilder.checkAppName(aDeployConfig.botName)
    if (oldAppId) {
      const answer = await confirm({ message: `A bot with the name '${aDeployConfig.botName}' has been detected. Do you wish to overwrite it?` })
      if (answer) {
        greenIt(`即将覆盖飞书机器人 ${aDeployConfig.botName}(${oldAppId})`)
        appId = oldAppId
      }
    }
    else {
      appId = await appBuilder.newApp(aDeployConfig.botBaseInfo)
      greenIt(`新的飞书机器人 ${aDeployConfig.botName}(${appId}) 初始化成功`)
    }
  }
  else {
    appId = aDeployConfig.appId as string
    try {
      await appBuilder.versionManager.clearUnPublishedVersion(appId)
    }
    catch (e) {
      redIt(`没有对飞书机器人 ${aDeployConfig.botName}(${appId}) 的操作权限`)
      process.exit(1)
    }

    await appBuilder.changeAppInfo(appId, aDeployConfig.botBaseInfo)
    greenIt(`即将为飞书机器人 ${aDeployConfig.botName}(${appId}) 部署新版本`)
  }
  const tasks = new Listr([
    {
      title: '操作前检查',
      task: async (ctx, task) => {
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
  greenIt((`🚀 飞书机器人 ${aDeployConfig.botName}(${appId}) 部署成功`))
  process.exit(0)
}

function readClipboard() {
  return clipboard.readSync()
}
