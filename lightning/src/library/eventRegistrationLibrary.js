/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
var runRemovalFunctions = function(removalFunctionsArray) {
    removalFunctionsArray.forEach(function(removalFunction) {
        removalFunction();
    });
};

var listenerRemovalFunctions = {};

export const eventRegistration = {
    addEventListener: function(sourceComponent, targetComponent, eventName, callback) {
        var element = targetComponent.getElement();
        if (!element) {
            throw new Error("Couldn't attach event '" + eventName + "' to component " + targetComponent.getGlobalId() + ". The component wasn't rendered yet.");
        }
        element.addEventListener(eventName, callback);
        var contextId = sourceComponent.getGlobalId();
        if (!listenerRemovalFunctions[contextId]) {
            listenerRemovalFunctions[contextId] = {};
        }
        var elementId = targetComponent.getGlobalId();
        if (!listenerRemovalFunctions[contextId][elementId]) {
            listenerRemovalFunctions[contextId][elementId] = [];
        }
        listenerRemovalFunctions[contextId][elementId].push(function() {
            element.removeEventListener(eventName, callback);
        });
    },

    removeAllEventListenersForTarget: function(sourceComponent, targetComponent) {
        var contextId = sourceComponent.getGlobalId();
        var elementId = targetComponent.getGlobalId();
        if (listenerRemovalFunctions[contextId] && listenerRemovalFunctions[contextId][elementId]) {
            runRemovalFunctions(listenerRemovalFunctions[contextId][elementId]);
        }
        delete listenerRemovalFunctions[contextId][elementId];
    },

    removeAllEventListeners: function(sourceComponent) {
        var contextId = sourceComponent.getGlobalId();
        var allElementIds = listenerRemovalFunctions[contextId] || {};
        Object.keys(allElementIds).forEach(function(elementId) {
            runRemovalFunctions(listenerRemovalFunctions[contextId][elementId]);
        });
        delete listenerRemovalFunctions[contextId];
    }
};
