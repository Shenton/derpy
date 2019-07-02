const Axios = require('axios');
const EventEmitter = require('events');

const axios = Axios.create({
    baseURL: 'https://www.reddit.com/r/',
    headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
    },
});

const listings = ['hot', 'new', 'rising', 'controversial', 'top', 'gilded'];

class RedditCaller extends EventEmitter {
    constructor(url) {
        super();

        this.url = url;
        this.postsList = [];
        this.canWatch = false;

        this.getJson()
            .then(data => {
                if (!data) throw 'Reddit class - Data is undefined.';
                if (typeof data !== 'object') throw `Reddit class - Data is not an object. Type: ${typeof data}`;
                if (data.kind !== 'Listing') throw `Reddit class - Data.kind is not "Listing". Data.kind: ${data.kind}`;

                this.postsList = data.data.children.map(p => p.data.permalink);

                this.canWatch = true;
            })
            .catch(err => {
                throw err;
            });
    }

    getJson() {
        return axios(this.url)
            .then(res => {
                if (res.status == 200) return res.data;
                else throw new Error(`Reddit class - Axios: Status: ${res.status}`);
            })
            .catch(err => {
                let errorString;

                if (err.response) errorString = `Reddit class - Axios: Status: ${err.response.status} Data: ${err.response.data}`;
                else if (err.request) errorString = `Reddit class - Axios: Request: ${err.request}`;
                else errorString = `Reddit class - Axios: Message: ${err.message}`;

                throw new Error(`Reddit class - Axios: ${errorString}`);
            });
    }

    gotNew() {
        if (!this.canWatch) return;

        this.getJson()
            .then(data => {
                if (!data) return this.emit('error', 'RedditWatcher - Data is undefined.');
                if (typeof data !== 'object') return this.emit('error', `RedditWatcher - Data is not an object. Type: ${typeof data}`);
                if (data.kind !== 'Listing') return this.emit('error', `RedditWatcher - Data.kind is not "Listing". Data.kind: ${data.kind}`);

                const posts = data.data.children;

                for (let i = 0; i <= posts.length - 1; i++) {
                    const post = posts[i];
                    if (!this.postsList.includes(post.data.permalink)) {
                        this.postsList.push(post.data.permalink);
                        this.emit('gotNew', post);
                        break;
                    }
                }
            })
            .catch(err => {
                this.emit('error', err);
            });
    }
}

class RedditWatcher {
    constructor(callsPerMinute) {
        this.callsPerMinute = callsPerMinute || 12;
        this.updateInterval = (60 / this.callsPerMinute) * 1000;
        this.watched = {};
        this.index = 1;
        this.indexes = 0;

        setInterval(() => {
            if (!this.indexes) return;

            if (this.index == this.indexes) this.index = 1;
            else this.index++;

            this.watched[this.index].gotNew();
        }, this.updateInterval);
    }

    listingWatcher(options) {
        const name = options.name;
        const listing = options.listing || 'hot';
        const limit = options.limit || 25;

        if (!listings.includes(listing)) throw `The listing ${listing} for sub ${name} is not supported, use one of ${listings}`;

        const url = `${name}/${listing}.json?limit=${limit}`;

        this.indexes++;
        const caller = new RedditCaller(url);
        this.watched[this.indexes] = caller;
        return caller;
    }
}

module.exports = RedditWatcher;
