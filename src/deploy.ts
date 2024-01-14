// commands/auth.ts
import type { Argv } from 'yargs'
import clipboard from 'clipboardy'
import confirm from '@inquirer/confirm'
import { redIt } from './utils'
import { DeployConfig } from './manifest'

export const command = 'deploy'
export const describe = 'Deploy bot to specific bot platform, support local file or url'

export function builder(yargs: Argv) {
  return yargs
    .option('interaction', {
      describe: '交互式部署',
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
  // 如果没有接收到参数，就询问是否从剪切板读取
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
    const aConfig = new DeployConfig()
    if (!await aConfig.validateConfigByPath(pathFile))
      redIt('the config file is not valid')
    await aConfig.loadConfig(pathFile)
    console.log(aConfig.botName)
  }
}

function readClipboard() {
  return clipboard.readSync()
}
