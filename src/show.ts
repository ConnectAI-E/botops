// commands/auth.ts
import type { Argv } from 'yargs'
import ora from 'ora'
import confirm from '@inquirer/confirm'
import { getFeishuCookies } from 'botops-feishu'
import { FeishuConfigManager } from './config'
import { greenIt, isValidFeishuID, redIt } from './utils'

// @ts-expect-error This is an expected error because no type definition for this package
import { DeployConfig } from './manifest'

export const command = 'show'
export const describe = 'Display detailed app information or write detailed configuration to a file'

export function builder(yargs: Argv) {
  return yargs
    .option('feishu', {
      describe: 'feishu appid',
      type: 'string',
      alias: 'f',
    })
    .option('write', {
      describe: 'write detail config to file',
      type: 'boolean',
      alias: 'w',
    })
}

export async function handler(argv: any) {
  const ifWrite = argv.write

  if (argv.feishu) {
    const appId = argv.feishu
    await showFeishuDetail(appId, ifWrite)
    process.exit(0)
  }
  // 获取最后一个元素
  // 默认一个元素走飞书
  const appId = argv._[argv._.length - 1]
  await showFeishuDetail(appId, ifWrite)
  process.exit(0)
}

async function showFeishuDetail(appId: string, ifWrite = false) {
  const spin = ora().info('checking feishu appid')
  const isValidateFeishuId = isValidFeishuID(appId)
  if (!isValidateFeishuId) {
    spin.fail('feishu appid is not valid')
    process.exit(1)
  }

  spin.info(`show feishu app detail infomation, appid is ${appId}`)
  const aLocalConfig = FeishuConfigManager.getInstance()

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

  const baseInfo = await appBuilder.getAppBaseInfo(appId)
  const deployInfo = await appBuilder.getAppDeployInfo(appId)
  const aDeployConfig = new DeployConfig()

  await aDeployConfig.addConfig({
    ...baseInfo,
  })
  await aDeployConfig.addConfig({
    platform: 'feishu',
  } as any)
  await aDeployConfig.addConfig({
    feishuConfig: {
      ...deployInfo,
    },
  } as any)

  aDeployConfig.printColorConfig()
  if (ifWrite) {
    const fileName = await aDeployConfig.exportConfig()
    spin.succeed(`Successfully wrote configuration to file. File name: ${fileName}`)
  }
}

async function checkFeishuAuth(detial = false) {
  const spinner = ora().start()
  const config = FeishuConfigManager.getInstance()
  spinner.info('checking auth status')
  const success = await config.isAuth()
  if (detial) {
    console.log('feishu detail config :')
    console.log(config.getFeishuConfig())
  }
  if (success)
  // 用英文
    spinner.succeed(`Hello ${config.nickname}, you have been granted authorization in Feishu.`)
  else
    spinner.fail('You are not authorized in feishu')
}
