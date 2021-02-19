(function(window) {
    var sendMessage = function(userMessage) {
        if (typeof LCC !== "undefined" && typeof LCC.onlineSupport !== "undefined") {
            LCC.onlineSupport.sendMessage("containerUserMessage", {payload: userMessage});
        }
        else {
            // TODO: offline
        }
    };

    var addErrorHandler = function(handler) {
        if (typeof LCC !== "undefined" && typeof LCC.onlineSupport !== "undefined") {
            LCC.onlineSupport.addErrorHandler(handler);
        }
        else {
            // TODO: offline
        }
    };

    var removeErrorHandler = function(handler) {
        if (typeof LCC !== "undefined" && typeof LCC.onlineSupport !== "undefined") {
            LCC.onlineSupport.removeErrorHandler(handler);
        }
        else {
            // TODO: offline
        }
    };

    var addMessageHandler = function(handler) {
        if (typeof LCC !== "undefined" && typeof LCC.onlineSupport !== "undefined") {
            LCC.onlineSupport.addMessageHandler(handler);
        }
        else {
            // TODO: offline
        }
    };

    var removeMessageHandler = function(handler) {
        if (typeof LCC !== "undefined" && typeof LCC.onlineSupport !== "undefined") {
            LCC.onlineSupport.removeMessageHandler(handler);
        }
        else {
            // TODO: offline
        }
    };

    var getRESTAPISessionKey = function() {
        if (typeof LCC !== "undefined" && typeof LCC.onlineSupport !== "undefined") {
            return LCC.onlineSupport.getRESTAPISessionKey();
        }
        else {
            // TODO: offline
            return "";
        }
    };

    var callApex = function(fullyQualifiedApexMethodName,
                                       apexMethodParameters,
                                       callbackFunction,
                                       apexCallConfiguration) {
        if (typeof Visualforce !== "undefined" && 
            typeof Visualforce.remoting !== "undefined" &&
            typeof Visualforce.remoting.Manager !== "undefined") {
                Visualforce.remoting.Manager.invokeAction(fullyQualifiedApexMethodName,
                                                          apexMethodParameters,
                                                          callbackFunction,
                                                          apexCallConfiguration);
        }
        else {
            // TODO: offline
        }
    };

    var $LCC = {
        sendMessage: sendMessage,
        addErrorHandler: addErrorHandler,
        removeErrorHandler: removeErrorHandler,
        addMessageHandler: addMessageHandler,
        removeMessageHandler: removeMessageHandler,
        getRESTAPISessionKey: getRESTAPISessionKey,
        callApex: callApex,
    };

    window.$LCC = $LCC;
})(window);
