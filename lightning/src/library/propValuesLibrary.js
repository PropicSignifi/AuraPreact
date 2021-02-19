/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
function fixValue(cmp, attr) {
    var attrName = "v." + attr.name;
    var value = cmp.get(attrName);
    if (attr.oneOf && Array.isArray(attr.oneOf)) {
        if (!isSomeMatch(value, attr.oneOf)) {
            if (attr.force) {
                cmp.set(attrName, attr.force);
            } else {
                throw new Error("The attribute " + attr.name + " should be one of " + attr.oneOf.join() + ".");
            }
        } else {
            if (attr.lowercase && !isLowercase(value)) {
                cmp.set(attrName, value.toLowerCase());
            }
        }
    }
}

function isLowercase(value) {
    return value === value.toLowerCase();
}

function isSomeMatch(value, values) {
    return values.some(function(v) {
        return equal(value, v);
    });
}

function equal(s1, s2) {
    return s1 && s2 && s1.toLowerCase() === s2.toLowerCase();
}

export function propValues(cmp, attributes) {
    if (Array.isArray(attributes)) {
        attributes.forEach(function(attr) {
            if (attr && attr.name) {
                fixValue(cmp, attr);
            }
        });
    } else {
        throw new Error("Argument attributes should be Array.");
    }
}

export function normalize(value, configObj) {
    var config = configObj || {};
    var fallbackValue = config.fallbackValue || "";
    var validValues = config.validValues;
    var normalized = typeof value === "string" && value.trim() || "";
    normalized = normalized.toLowerCase();
    if (validValues && validValues.indexOf(normalized) === -1) {
        normalized = fallbackValue;
    }
    return normalized;
}
