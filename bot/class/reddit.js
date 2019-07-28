const Axios = require('axios');
const EventEmitter = require('events');

const axios = Axios.create({
    baseURL: 'https://www.reddit.com/r/',
    headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
    },
    maxRedirects: 0,
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
                if (!data) throw new Error('Reddit class: data is undefined.');
                if (typeof data !== 'object') throw new Error(`Reddit class: data is not an object. Type: ${typeof data}`);
                if (data.kind !== 'Listing') throw new Error(`Reddit class: data.kind is not "Listing". Data.kind: ${data.kind}`);

                this.postsList = data.data.children.map(p => p.data.permalink);

                this.canWatch = true;
            })
            .catch(err => {
                this.emit('error', err);
            });
    }

    getJson() {
        return axios(this.url)
            .then(res => {
                if (res.status === 200) return res.data;
                else this.emit('error', `Reddit class => Axios status: ${res.status}`);
            })
            .catch(err => {
                this.canWatch = false;
                setTimeout(function() {
                    this.canWatch = true;
                }, 60000);

                let errorString;

                if (err.response) {
                    if (err.response.status === 302) {
                        const url = err.response.config.url;
                        errorString = `Reddit class: Reddit tried to redirect the request, this often mean the subreddit does not exists. URL: ${url}`;
                    }
                    else {
                        errorString = `Reddit class => Axios status: ${err.response.status}, data: ${err.response.data}`;
                    }
                }
                else if (err.request) {
                    errorString = `Reddit class => Axios request: ${err.request}`;
                }
                else {
                    errorString = `Reddit class => Axios message: ${err.message}`;
                }

                this.emit('error', errorString);
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
        this.updateInterval = 60 / this.callsPerMinute * 1000;
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

        if (!listings.includes(listing)) throw new Error(`The listing ${listing} for sub ${name} is not supported, use one of ${listings}`);

        const url = `${name}/${listing}.json?limit=${limit}`;

        this.indexes++;
        const caller = new RedditCaller(url);
        this.watched[this.indexes] = caller;
        return caller;
    }

    destroy() {
        if (!this.indexes) return;

        this.indexes = 0;

        for (const index in this.watched) {
            this.watched[index] = null;
        }

        this.index = 1;
        this.watched = {};
    }
}

module.exports = RedditWatcher;
