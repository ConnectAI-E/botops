import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as authCommand from './auth'
import * as infoCommand from './info'
import * as deployCommand from './deploy'

const args = yargs(hideBin(process.argv))
  .scriptName('botops')
  .wrap(100)
  .command(infoCommand)
  .command(authCommand)
  .command(deployCommand)
  .demandCommand(1, 'Please provide a command')
  .usage('$0 [command] [options]')
  .epilogue('👻 Explore our manual on https://github.com/ConnectAI-E/botops-cli')
  .example('$0 info', 'Check current authorization status')
  .example('$0 auth --feishu', 'Interactively log in and authorize with Feishu')
  .example('$0 deploy bot.json ', 'Deploy the bot to a specific platform using a local configuration file')
  .example('$0 deploy https://example.bot.json ', 'Deploy the bot to a specific platform using a remote configuration URL')

  .help()
  .argv

export default args
