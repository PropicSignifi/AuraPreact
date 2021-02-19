/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
function isValid(validity) {
    if(!validity) {
        return true;
    }

    var hasCustomError = false;
    Object.keys(customMessages).forEach(function(key) {
        if(validity[key]) {
            hasCustomError = true;
        }
    });
    if(hasCustomError) {
        return false;
    }

    var newValidity = _.pick(validity, priorityList);
    _.each(priorityList, function(key) {
        var override = key + "Override";
        if(!_.isUndefined(validity[override])) {
            newValidity[key] = validity[override];
        }
    });

    return _.every(newValidity, function(value) {
        return !value;
    });
}

function resolveBestMatch(validity) {
    var validityState;
    if (!isValid(validity)) {
        priorityList.some(function(stateName) {
            if (validity[stateName] === true) {
                validityState = stateName;
                return true;
            }
            return false;
        });

        if(!validityState) {
            Object.keys(customMessages).some(function(stateName) {
                if(validity[stateName] === true) {
                    validityState = stateName;
                    return true;
                }
                return false;
            });
        }
    }
    return validityState ? validityState : "badInput";
}

var priorityList = ["badInput", "patternMismatch", "rangeOverflow", "rangeUnderflow", "stepMismatch", "tooLong", "typeMismatch", "valueMissing"];
var keyToAttrName = {
    badInput: "messageWhenBadInput",
    patternMismatch: "messageWhenPatternMismatch",
    typeMismatch: "messageWhenTypeMismatch",
    valueMissing: "messageWhenValueMissing",
    rangeOverflow: "messageWhenRangeOverflow",
    rangeUnderflow: "messageWhenRangeUnderflow",
    stepMismatch: "messageWhenStepMismatch",
    tooLong: "messageWhenTooLong"
};
var defaultMessages = {
    messageWhenBadInput: "Input is not valid",
    messageWhenPatternMismatch: "Input does not match the pattern",
    messageWhenTypeMismatch: "Input has an incorrect type",
    messageWhenValueMissing: "Value is required.",
    messageWhenRangeOverflow: "Value is too high.",
    messageWhenRangeUnderflow: "Value is too low.",
    messageWhenStepMismatch: "Step value does not match",
    messageWhenTooLong: "Value is too long",
};

var customMessages = {
    customValueMissing: "Value is required.",
};

export const validity = {
    isValid: isValid,

    setCustomMessages: function(msgs) {
        customMessages = msgs;
    },

    getMessage: function(component, validity) {
        if(isValid(validity)) {
            return null;
        }

        var key = resolveBestMatch(validity);

        if(customMessages[key]) {
            return customMessages[key];
        }

        var attrName = key && keyToAttrName[key];
        return attrName && component.get("v." + attrName) || defaultMessages[attrName];
    },
};
