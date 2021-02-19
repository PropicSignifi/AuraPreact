/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
export const classnames = function() {
    return Array.prototype.slice.call(arguments).reduce(function(classes, arg) {
        var argType = typeof arg;
        if (argType === "string" || argType === "number") {
            classes.push(arg);
        } else {
            if (Array.isArray(arg)) {
                classes.push(classnames.apply(null, arg));
            } else {
                if (argType === "object") {
                    for (var key in arg) {
                        if (arg.hasOwnProperty(key) && arg[key]) {
                            classes.push(key);
                        }
                    }
                }
            }
        }
        return classes;
    }, []).join(" ");
};
