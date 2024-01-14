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
}

export async function handler(argv: any) {
  if (argv.feishu)
    reauthorizeFeishu()
  else if (argv.dingtalk)
    console.log('Reauthorizing DingTalk')
  else
    await checkFeishuAuth()
}

function reauthorizeFeishu() {
  const spinner = ora('Reauthorizing Feishu').start()
  const config = FeishuConfigManager.getInstance()
  config.setFeishuConfig(fakeFeishuConfig)
  spinner.succeed('Reauthorized Feishu')
}

async function checkFeishuAuth() {
  const spinner = ora().start()
  const config = FeishuConfigManager.getInstance()
  spinner.info('checking auth status')
  const success = await config.isAuth()
  if (success)
    spinner.succeed('飞书已经授权')
  else
    spinner.fail('飞书未授权')
}
