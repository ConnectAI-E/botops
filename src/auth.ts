// commands/auth.ts
import type { Argv } from 'yargs'
import ora from 'ora'
import select, { Separator } from '@inquirer/select'
import { getFeishuCookies } from 'onebot-feishu'
import { FeishuConfigManager } from './config'

export const command = 'auth'
export const describe = 'View current authorization status or reauthorize for specific bot platform'

export function builder(yargs: Argv) {
  return yargs
    .option('feishu', {
      describe: 'Reauthorize Feishu',
      type: 'boolean',
      alias: 'f',
    })
    .option('dingtalk', {
      describe: 'Reauthorize DingTalk',
      type: 'boolean',
    })
    .option('clear', {
      describe: 'clear all auth',
      type: 'boolean',
      alias: 'c',
    })
}

export async function handler(argv: any) {
  if (argv.clear) {
    resetAllAuth()
    return
  }
  if (argv.feishu) {
    await reauthorizeFeishu()
  }
  else if (argv.dingtalk) {
    console.log('Reauthorizing DingTalk')
  }
  else {
    const answer = await select({
      message: 'Select a bot platform',
      choices: [
        {
          name: 'feishu',
          value: 'feishu',
          description: '先进团队先用飞书',
        },
        {
          name: 'dingtalk',
          value: 'dingtalk',
          description: '让进步发生',
        },
        new Separator(),
      ],
    })
    if (answer === 'feishu')
      await reauthorizeFeishu()
  }
}

async function reauthorizeFeishu() {
  const spinner = ora('Reauthorizing Feishu').start()
  const config = FeishuConfigManager.getInstance()
  const newCookie = await getFeishuCookies()
  // console.log(newCookie);
  config.setFeishuConfig(newCookie)
  spinner.succeed('Reauthorized Feishu')
  return newCookie
}

async function resetAllAuth() {
  const spinner = ora('Reset all auth').start()
  const config = FeishuConfigManager.getInstance()
  config.setFeishuConfig({})
  spinner.succeed('Reset all platform auth status')
}
