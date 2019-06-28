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

const duration = 6000;

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

function doToast(type, message, title) {
    const html = getToastHTML(type, message, title);
    const toastObject = $(html);

    showToast(toastObject);
}

function showToast(toastObject) {
    toastObject.appendTo('#toast-container');
    toastObject.animate({ opacity: 1, left: '-=100' }, 500);

    const timer = new Timer(() => hideToast(toastObject), duration);

    toastObject.click(function() {
        timer.stop();
        hideToast(toastObject);
    });

    toastObject.hover(function() {
        timer.pause();
    }, function() {
        timer.resume();
    });
}

function hideToast(toastObject) {
    toastObject.animate({ opacity: 0, left: '+=100' }, 500, function() {
        this.remove();
    });
}

Vue.prototype.$toast = {
    success: message => doToast('success', message),
    info: message => doToast('info', message),
    warning: message => doToast('warning', message),
    error: message => doToast('danger', message),
};
