# Derpy
A simple discord bot made with love, using Node.js.

This repository is mainly here to easily deploy Derpy on my server, but if someone can find any kind of use from it, go.

## Deploy Derpy
Before anything you will need:
* Node.js (Derpy was developed with version 10.15.3)
* Python 2.7
* FFmpeg
* A discord token
* A PUBG api key
* A YouTube api key

At this point you should take a look at the sample config file, rename/copy it to config.json and/or config-dev.json and edit it.

To get channels and members ID, activate the developer mode from the Discord application settings and use the context menu on them.

```bash
mkdir derpy
cd derpy
git clone https://github.com/Shenton/derpy.git .
npm i
```
You can activate the log rotation of pm2 by running:
```bash
npm run pm2logrotate
```
Starting Derpy in production:
```bash
npm start
```
Stopping Derpy:
```bash
npm stop
```
You can start Derpy in development mode by running:
```bash
npm run dev
```

## Diclaimer
Derpy is designed to server one guild, and it will nether change. It contains private jokes, stupid things, etc.

I will not add new features if you ask me. The licence is MIT, fork it, copy it, take whatever you want from it, and create your own. But do take note that I am not a skilled developer and node/javascript is new to me.