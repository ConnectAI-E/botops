import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as authCommand from './auth'
import * as infoCommand from './info'
import * as deployCommand from './deploy'

const args = yargs(hideBin(process.argv))
  .scriptName('onebot')
  .command(infoCommand)
  .command(authCommand)
  .command(deployCommand)
  .demandCommand(1, 'Please provide a command')
  .usage('$0 [command] [options]')

  .example('$0 info', 'View current authorization status')
  .example('$0 auth --feishu', 'Interactive authorization bot')
  .example('$0 deploy https://gitmaya.com/feishubot.json ', 'Interactive deployment bot')
  .help()
  .argv

export default args
