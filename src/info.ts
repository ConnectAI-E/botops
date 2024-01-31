// commands/auth.ts
import type { Argv } from 'yargs'
import ora from 'ora'
import { FeishuConfigManager, fakeFeishuConfig } from './config'
import { DingtalkConfigManager } from './configDingtalk'

export const command = 'info'
export const describe = 'View current authorization status '

export function builder(yargs: Argv) {
  return yargs
    .option('feishu', {
      describe: 'only show Feishu',
      type: 'boolean',
      alias: 'f',
    })
    .option('dingtalk', {
      describe: 'only show DingTalk',
      type: 'boolean',
      alias: 'd',
    })
    .option('detail ', {
      describe: 'show detail',
      type: 'boolean',
    })
}

export async function handler(argv: any) {
  if (argv.feishu)
    await checkFeishuAuth(argv.detail)
  else if (argv.dingtalk)
    await checkDingtalkAuth(argv.detail)
  else
    await checkFeishuAuth(argv.detail)
  await checkDingtalkAuth(argv.detail)
}

function reauthorizeFeishu() {
  const spinner = ora('Reauthorizing Feishu').start()
  const config = FeishuConfigManager.getInstance()
  config.setFeishuConfig(fakeFeishuConfig)
  spinner.succeed('Reauthorized Feishu')
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

async function checkDingtalkAuth(detial = false) {
  const spinner = ora().start()
  const config = DingtalkConfigManager.getInstance()
  spinner.info('checking auth status')
  const success = await config.isAuth()
  if (detial) {
    console.log('dingtalk detail config :')
    console.log(config.getDingtalkConfig())
  }
  if (success)
    spinner.succeed(`Hello ${config.nickname}, you have been granted authorization in Dingtalk.`)
  else
    spinner.fail('You are not authorized in Dingtalk')
}
