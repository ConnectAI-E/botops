// commands/auth.ts
import type { Argv } from 'yargs'

export const command = 'auth'
export const describe = 'View current authorization status or reauthorize for specific bot platform'

export function builder(yargs: Argv) {
  return yargs
    .option('feishu', {
      describe: 'Reauthorize Feishu',
      type: 'boolean',
    })
    .option('dingtalk', {
      describe: 'Reauthorize DingTalk',
      type: 'boolean',
    })
}

export function handler(argv: any) {
  if (argv.feishu)
    console.log('Reauthorizing Feishu')
  else if (argv.dingtalk)
    console.log('Reauthorizing DingTalk')
  else
    console.log('Viewing current authorization status')
}
