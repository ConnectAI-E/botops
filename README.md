<h1 align="center">📦 OneBot</h1>

<p align="center">A modern cli tool that deploy chatbot fast</p>

<pre align="center">npx <b>one-bot</b></pre>

## Features

- Compatible with various ChatBot platforms: Feishu, WeChat, Slack, Dingtalk, Telegram, Discord, and more.
- Hassle-free setup — simply use `npx onebot` to get started.
- Default safety ensured — receive updates within your authorized version range.

## Installation

#### Running on-demand:

Using `npx` you can run the script without installing it first:

    npx one-bot [command] [options]

#### Globally via `npm`

    npm install --global one-bot

This will install `one-bot` globally so that it may be run from the command line anywhere.

#### Globally via Homebrew

    brew install one-bot
    
## Usage

```
$ one-bot [command] [options]

Commands:
  one-bot info    View current authorization status
  one-bot auth    Request authorize for specific bot platform
  one-bot deploy  Deploy bot to specific bot platform, support local file or url

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]

Examples:
  one-bot info                                  Check current authorization status
  one-bot auth --feishu                         Interactively log in and authorize with Feishu
  one-bot deploy one-bot.json                   Deploy the bot to a specific platform using a local configuration file
  one-bot deploy https://example.one-bot.json   Deploy the bot to a specific platform using a remote configuration URL

```

## Development
```bash
pnpm install
pnpm start
```

## Configuration

See `onebot --help` for more details

## License

MIT License © 2024 [river](https://github.com/leizhenpeng)

