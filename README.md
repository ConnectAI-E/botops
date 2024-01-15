<h1 align="center">📦 BotOps</h1>

<p align="center">A modern cli tool that deploy ChatBot fast</p>

<pre align="center">npx <b>botops</b></pre>

## Features

- Compatible with various ChatBot platforms: Feishu, WeChat, Slack, Dingtalk, Telegram, Discord, and more.
- Hassle-free setup — simply use `npx botops` to get started.
- Default safety ensured — receive updates within your authorized version range.

## Installation

#### Running on-demand:

Using `npx` you can run the script without installing it first:

    npx botops [command] [options]

#### Globally via `npm`

    npm install --global botops

This will install `botops` globally so that it may be run from the command line anywhere.

#### Globally via Homebrew

    brew install botops
    
## 🤯 Usage

```
// login feishu platform
$ botops auth

$ botops [command] [options]

Commands:
  botops info    View current authorization status
  botops auth    Request authorize for specific bot platform
  botops deploy  Deploy bot to specific bot platform, support local file or url

Options:
  --version  Show version number                                                           [boolean]
  --help     Show help                                                                     [boolean]

Examples:
  botops info                              Check current authorization status
  botops auth --feishu                     Interactively log in and authorize with Feishu
  botops deploy bot.json                   Deploy the bot to a specific platform using a local
                                           configuration file
  botops deploy https://example/bot.json   Deploy the bot to a specific platform using a remote
                                           configuration URL

👻 Explore our manual on https://github.com/ConnectAI-E/botops 


```

## Development
```bash
pnpm install
pnpm start
```

## Configuration

See `botops --help` for more details

## License

MIT License © 2024 [river](https://github.com/leizhenpeng)

