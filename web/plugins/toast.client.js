import Vue from 'vue';

class Timer {
    constructor(cb, duration) {
        this.cb = cb;
        this.duration = duration;
        this.start = Date.now();
        this.tObject = setTimeout(cb, duration);
    }

    pause() {
        this.duration -= (Date.now() - this.start);
        clearTimeout(this.tObject);
    }

    resume() {
        this.start = Date.now();
        this.tObject = setTimeout(this.cb, this.duration);
    }

    stop() {
        clearTimeout(this.tObject);
    }
}

const toastDuration = 6000;
const animationDuration = 400;

const icons = {
    success: 'check-circle',
    info: 'info-circle',
    warning: 'exclamation-circle',
    danger: 'times-circle',
};

const titles = {
    success: 'Succès',
    info: 'Information',
    warning: 'Avertissement',
    danger: 'Erreur',
};

function getToastHTML(type, message, title) {
    const icon = icons[type];
    title = title ? title : titles[type];

    return `<div class="toast border border-${type}" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header text-${type} border-${type}">
        <i class="fas fa-${icon} mr-1"></i>
        <strong class="mr-auto">${title}</strong>
    </div>
    <div class="toast-body">
        ${message}
    </div>
</div>`;
}

function toast(type, message, title) {
    const html = getToastHTML(type, message, title);
    const toastObject = $(html);

    showToast(toastObject);
}

function showToast(toastObject) {
    toastObject.appendTo('#toast-container');
    toastObject.animate({ opacity: 1, left: '-=200' }, animationDuration);

    const timer = new Timer(() => hideToast(toastObject), toastDuration);

    toastObject.click(() => {
        timer.stop();
        hideToast(toastObject);
    });

    toastObject.hover(() => timer.pause(), () => timer.resume());
}

function hideToast(toastObject) {
    toastObject.animate({ opacity: 0, left: '+=200' }, animationDuration, function() {
        this.remove();
    });
}

Vue.prototype.$toast = {
    success: message => toast('success', message),
    info: message => toast('info', message),
    warning: message => toast('warning', message),
    error: message => toast('danger', message),
};
