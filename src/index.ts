import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as authCommand from './auth'

const args = yargs(hideBin(process.argv))
  .scriptName('one-bot')
  .command(authCommand)
  .demandCommand(1, 'Please provide a command')
  .usage('$0 [command] [options]')
  .example('$0 auth', 'View current authorization status')
  .example('$0 deploy', 'Interactive deployment bot')
  .help()
  .argv

export default args
