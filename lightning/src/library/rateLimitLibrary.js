/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
export function debounce(func, delay, options) {
    var _options = options || {};
    var invokeLeading = _options.leading;
    var timer;
    return function debounced() {
        var args = Array.prototype.slice.apply(arguments);
        if (invokeLeading) {
            func.apply(this, args);
            invokeLeading = false;
        }
        clearTimeout(timer);
        timer = setTimeout(function() {
            func.apply(this, args);
            invokeLeading = _options.leading;
        }, delay);
    };
}
