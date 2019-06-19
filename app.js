const { fork } = require('child_process');

const forkMe = ['api', 'bot', 'web'];

class ForkMe {
    constructor(name) {
        this.name = name;
        this.app = null;
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
            if (code !== 0) {
                setTimeout(() => this.forkApp(), 5000);
            }
        });
        this.app.on('error', data => console.log(`\x1b[41m[fork]\x1b[0m error: ${this.name} - ${data}`));
    }
}

forkMe.forEach(app => {
    new ForkMe(app).forkApp();
});
