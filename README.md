# Derpy
A simple discord bot made with love, using Node.js.

This repository is mainly here to easily deploy Derpy on my server, but if someone can find any kind of use from it, go.

## What it can do
* Fetch the last PUBG match for a list of players
* Play youtube audio
* Fetch rss feeds (and send a message when a new entry is found)
* Fetch reddit 'hot', 'new', 'rising', 'controversial', 'top', 'gilded' listings (and send a message when a new entry is found)
* Respond to a member trigger message
* And some stupid/fun/whatever-you-name-it stuff

## Deploy Derpy
Before anything you will need:
* Node.js (Derpy was developed with version 10.15.3)
* MongoDB
* A web server to act as a proxy (NGINX/Apache)
* Python 2.7
* FFmpeg
* A discord token
* A PUBG api key
* A YouTube api key

### Linux
On Linux it is pretty straightforward, this should get you there (on Debian 9)
```bash
sudo apt install mongodb nginx python2.7 ffmpeg
```
For Node.js it is up to you, I personally create a new user for each app and use [nvm](https://github.com/nvm-sh/nvm).

### Windows
On Windows you should install Node.js globally, and google how to install FFmpeg.  
For Python you should use "windows-build-tools", open a console (Windows 10: shift+right-click on an explorer window => PowerShell).
```bash
npm i -g windows-build-tools
```

### Installing Derpy
Assuming you got Git installed:
```bash
mkdir derpy
cd derpy
git clone https://github.com/Shenton/derpy.git .
npm i
```
At this point you should take a look at the sample config file, rename/copy it to config.json and/or config-dev.json and edit it.

To get channels and members ID, activate the developer mode from the Discord application settings and use the context menu on them.

### Discord
Go to Discord [developer portal](https://discordapp.com/developers/applications/) and create a new application, add a bot and add an oauth redirect to:
```
<your base url>/api/discord/callback
```

### Inviting the bot
Get the bot application client id, it is located on the front page of your app. Edit and paste this URL in a browser:
```
https://discordapp.com/oauth2/authorize?&client_id=<your bot client id>&scope=bot&permissions=36829280
```
Then pick your guild.


### Building the front end
Before running Derpy the front end must be build. If you run Derpy in develoment, the front end must be build before running in production.
```bash
npm run build
```

### NGINX
Derpy require a secure web server acting as a proxy. You can get a certificate using [Let’s Encrypt](https://letsencrypt.org/).

Here is a virtual server configuration example for NGINX:
```nginx
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/derpy.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/derpy.example.com/privkey.pem;

    server_name derpy.example.com;

    if ($ssl_protocol = "") {
        return 301 https://$server_name$request_uri;
    }

    location / {
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Running Derpy
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

### Updating Derpy
```bash
cd derpy
npm stop
git pull
npm i
npm run build
npm start
```

## Disclaimer
Derpy is designed to serve one guild, and it will nether change. It contains private jokes, stupid things, etc.

I will not add new features if you ask me. The licence is MIT, fork it, copy it, take whatever you want from it, and create your own. But do take note that I am not a skilled developer and node/javascript is new to me.

## Licence
MIT