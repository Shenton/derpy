const { fork } = require('child_process');

const forkMe = ['bot', 'web'];
const forked = [];

class ForkMe {
    constructor(name, cb) {
        this.name = name;
        this.app = null;
        this.messageCallback = cb;
    }

    sendMessage(message) {
        this.app.send(message);
    }

    forkApp() {
        this.app = fork(this.name + '.js', {
            cwd: './' + this.name,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                npm_package_version: process.env.npm_package_version,
            },
            stdio: 'pipe',
        });
        this.app.stdout.on('data', data => process.stdout.write(data));
        this.app.stderr.on('data', data => process.stderr.write(data));
        this.app.on('exit', code => {
            if (code !== 0) setTimeout(() => this.forkApp(), 5000);
            else process.exit(0);
        });
        this.app.on('error', data => console.log(`\x1b[41m[fork]\x1b[0m error: ${this.name} - %o`, data));

        // Messages
        this.app.on('message', message => {
            console.log(`\x1b[41m[fork]\x1b[0m message: ${this.name} - %o`, message);
            this.messageCallback(this.name, message);
        });
    }
}

function messageCallback(sendingApp, message) {
    if (typeof message !== 'object') return;
    if (!message.app) return;

    for (let i = 0; i < forked.length; i++) {
        const forkedApp = forked[i];

        if (forkedApp.name !== sendingApp) {
            forkedApp.sendMessage(message);
        }
    }
}

forkMe.forEach(app => {
    const newFork = new ForkMe(app, messageCallback);
    newFork.forkApp();
    //forked.push({ app: app, object: newFork });
    forked.push(newFork);
});
