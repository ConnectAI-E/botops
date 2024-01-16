
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


## 🤯 Usage

```
# login in first
$ botops auth

# deploy by local manifest.json
$ botops deploy botops.json

# export old feishu app manifest
$ botops show cli_a52ffc2e8e3ad00d -w

# other 
$ botops [command] [options]

Commands:
  botops info    View current authorization status
  botops auth    Request authorize for specific bot platform
  botops deploy  Deploy bot to specific bot platform, support local file or url
  botops show    Display detailed app information or write detailed configuration to a file

Options:
  --version  Show version number                                                           [boolean]
  --help     Show help                                                                     [boolean]

Examples:
  botops info                              Check current authorization status
  botops auth --feishu                     Interactively log in and authorize with Feishu
  botops deploy bot.json                   Deploy the bot to a specific platform using a local confi
                                           guration file
  botops deploy https://example/bot.json   Deploy the bot to a specific platform using a remote conf
                                           iguration URL
  botops show cli_a52ca0ba25b2100d         Show the detail of a feishu app

👻 Explore our manual on https://github.com/ConnectAI-E/botops

```

## Manifest file example

Easily generate a manifest file from your old app using the following commands:

```
# Display manifest file
botops show [appid]

# Export local file
botops show [appid] -w
```

whole manifest file example 
```
{
  "name": "botops bot name",
  "desc": "botops test demo desc",
  "avatar": "https://avatars.githubusercontent.com/u/145313435?s=200&v=4",
  "platform": "feishu",
   "callback": [
    {
      "hook": "appid_changed",
      "url": "https://gitmaya.com/feishu/uuidxxxxx?appid=APPID&appsecret=APPSECRET"
    }
  ],
  "feishuConfig": {
    "events": [
      "im.message.message_read_v1",
      "im.message.receive_v1"
    ],
    "encryptKey": "e-fJKrqNbSz9NqSWL5",
    "verificationToken": "v-Ohw8k6KwVynNmzXX",
    "scopeIds": [
      "21001",
      "7",
      "21003",
      "21002",
      "20001",
      "20011",
      "3001",
      "20012",
      "6005",
      "20010",
      "3000",
      "20013",
      "20014",
      "20015",
      "20008",
      "1000",
      "1006",
      "1005",
      "20009"
    ],
    "cardRequestUrl": "https://connect-ai-e.com/feishu/64af64fab84e8e000162ef66/card",
    "verificationUrl": "https://connect-ai-e.com/feishu/64af64fab84e8e000162ef66/event"
  }
}

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

