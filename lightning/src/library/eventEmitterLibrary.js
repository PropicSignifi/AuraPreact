/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
export function EventEmitter() {
    this.registry = {};
}

EventEmitter.prototype.on = function(name, listener) {
    this.registry[name] = this.registry[name] || [];
    this.registry[name].push(listener);
}
;
EventEmitter.prototype.once = function(name, listener) {
    var doOnce = function() {
        listener.apply(null, arguments);
        this.removeListener(name, doOnce);
    }
    .bind(this);
    this.on(name, doOnce);
}
;
EventEmitter.prototype.emit = function(name) {
    var listeners = this.registry[name];
    if (listeners) {
        var args = Array.prototype.slice.call(arguments, 1);
        listeners.forEach(function(listener) {
            listener.apply(null, args);
        });
    }
    return !!listeners;
}
;
EventEmitter.prototype.removeListener = function(name, listener) {
    var listeners = this.registry[name];
    if (listeners) {
        var i = 0;
        for (var len = listeners.length; i < len; i += 1) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                return this;
            }
        }
    }
    return this;
}
;
