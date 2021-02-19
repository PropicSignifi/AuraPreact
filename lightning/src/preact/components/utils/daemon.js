export default class DaemonManager {
    constructor() {
        this.$lastPromise = Promise.resolve(null);
        this.$queue = [];
        this.$idMappings = {};
    }

    runTask(promiseGenerator) {
        if(!_.isFunction(promiseGenerator)) {
            return;
        }

        this.$queue.push(promiseGenerator);

        this.$lastPromise = this.$lastPromise.then(() => {
            if(_.isEmpty(this.$queue)) {
                return;
            }

            const nextPromiseGenerator = this.$queue[0];
            return Promise.resolve(nextPromiseGenerator()).then(() => this.$queue.shift(), () => this.$queue.shift());
        });

        return 'daemon_id_' + _.uniqueId();
    }

    hasRunningTasks() {
        return !_.isEmpty(this.$queue);
    }

    clearQueue() {
        return new Promise((resolve, reject) => {
            const p = window.setInterval(() => {
                if(_.isEmpty(this.$queue)) {
                    window.clearInterval(p);
                    resolve(null);
                }
            }, 100);
        });
    }

    registerId(src, target) {
        if(src && target) {
            this.$idMappings[src] = target;
        }
    }

    getId(src) {
        return this.$idMappings[src] || src;
    }

    wrap(api, mappings = {}) {
        const newApi = {};

        _.forEach(api, (fn, key) => {
            const mapping = mappings[key];
            if(mapping === true) {
                newApi[key] = (...args) => {
                    this.runTask(() => fn(...args));

                    return Promise.resolve(null);
                };
            }
            else if(_.isFunction(mapping)) {
                newApi[key] = mapping;
            }
            else {
                newApi[key] = fn;
            }
        });

        return newApi;
    }
}
