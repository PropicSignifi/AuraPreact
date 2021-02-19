/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
import { debounce } from './rateLimitLibrary.js';
import { EventEmitter } from './eventEmitterLibrary.js';

export function InteractingState(options) {
    var duration = options.duration || 2E3;
    this.eventemitter = new EventEmitter();
    this._interacting = false;
    this._debouncedLeave = debounce(this.leave.bind(this), duration);
}

InteractingState.prototype.isInteracting = function() {
    return this._interacting;
}
;
InteractingState.prototype.enter = function() {
    if (!this._interacting) {
        this._interacting = true;
        this.eventemitter.emit("enter");
    }
}
;
InteractingState.prototype.onenter = function(handler) {
    this.eventemitter.on("enter", handler);
}
;
InteractingState.prototype.leave = function() {
    if (this._interacting) {
        this._interacting = false;
        this.eventemitter.emit("leave");
    }
}
;
InteractingState.prototype.onleave = function(handler) {
    this.eventemitter.on("leave", handler);
}
;
InteractingState.prototype.interacting = function() {
    this.enter();
    this._debouncedLeave();
}
;
