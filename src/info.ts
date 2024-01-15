// commands/auth.ts
import type { Argv } from 'yargs'
import ora from 'ora'
import { FeishuConfigManager, fakeFeishuConfig } from './config'

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
    console.log('Reauthorizing DingTalk')
  else
    await checkFeishuAuth(argv.detail)
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
    console.log('飞书配置信息：')
    console.log(config.getFeishuConfig())
  }
  if (success)
    spinner.succeed('飞书已经授权')
  else
    spinner.fail('飞书未授权')
}
