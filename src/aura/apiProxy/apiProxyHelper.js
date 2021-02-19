({
    handleOnPostmateScriptsLoaded: function(component, iframeContainerElmt, iframeURL) {
        var helper = this;

        // Kick off the handshake with the iframe
        const handshake = new Postmate({
            container: iframeContainerElmt,
            url: iframeURL,
        });

        // When parent <-> child handshake is complete, data may be requested from the child
        handshake.then($A.getCallback(function(child) {
            helper._postmate = child;
        }));
    },

    handleRestRequest: function(component, request) {
        var helper = this;

        var defaultRequest = {
            'method': 'get',
        };

        var defaultHeaders = {
            'Content-Type': 'application/json',
        };

        request = Object.assign({}, defaultRequest, request);
        request.headers = Object.assign({}, defaultHeaders, request.headers);

        return helper.getPostmateChild().then($A.getCallback(function(child) {
            return helper.makePostmateRestRequest(child, request);
        }));
    },

    handleHttpRequest: function(component, request) {
        var helper = this;

        var defaultRequest = {
            'method': 'GET',
        };

        var defaultHeaders = {
            'Content-Type': 'application/json',
        };

        request = Object.assign({}, defaultRequest, request);
        request.headers = Object.assign({}, defaultHeaders, request.headers);

        return helper.getPostmateChild().then($A.getCallback(function(child) {
            return helper.makePostmateHttpRequest(child, request);
        }));
    },

    // ------------------------------------------------------------

    /**
     * For internal use.
     * Returns a promise waiting for the parent-child postmate handshake to complete
     * then resolves with reference to the postmate child for making requests.
     */
    getPostmateChild: function() {
        var helper = this;

        return new Promise(function(resolve, reject) {
            var child = helper._postmate;

            if(child) {
                resolve(child);
            } else {
                // all time values in milliseconds
                var timeout = 10000; // ten seconds
                var pollFrequency = 500; // half a second
                var startTime = new Date().getTime();
                var endTime = startTime + timeout;

                var timerId = setInterval($A.getCallback(function() {
                    child = helper._postmate;

                    if (child) {
                        // parent-child postmate handshake now complete
                        clearInterval(timerId);
                        resolve(child);
                    } else {
                        // check if we have exceeded our timeout
                        var currentTime = new Date().getTime();
                        if(currentTime > endTime) {
                            clearInterval(timerId);
                            reject('Timeout Error: Could not establish Postmate handshake');
                        }
                        // else, keep polling
                    }
                }), pollFrequency);
            }
        });
    },

    /**
     * For internal use.
     * Returns a promise waiting for the parent-child postmate request to complete
     * then resolves with response from the child iframe.
     */
    makePostmateRestRequest: function(child, request) {
        return new Promise(function(resolve, reject) {
            // how postmate passes context/arguments to the child iframe
            // namely, the details of the REST API request to make
            child.call('restRequest', request);

            // how postmate solicits child iframe to send message back
            // namely, the response from the REST API request we asked for
            child.get('restResponse').then($A.getCallback(function(response) {
                if (response.success) {
                    resolve(response.data);
                } else {
                    reject(response.data);
                }
            })).catch($A.getCallback(function(err) {
                reject(err);
            }));
        });
    },

    /**
     * For internal use.
     * Returns a promise waiting for the parent-child postmate request to complete
     * then resolves with response from the child iframe.
     */
    makePostmateHttpRequest: function(child, request) {
        return new Promise(function(resolve, reject) {
            // how postmate passes context/arguments to the child iframe
            // namely, the details of the REST API request to make
            child.call('httpRequest', request);

            // how postmate solicits child iframe to send message back
            // namely, the response from the REST API request we asked for
            child.get('httpResponse').then($A.getCallback(function(response) {
                resolve(response);
            })).catch($A.getCallback(function(err) {
                reject(err);
            }));
        });
    },

    /**
     * For internal use.
     * Returns a promise waiting for the Apex request to complete
     * then resolves with the JSON response, or rejects if any error.
     *
     * @param component
     *      (required) Reference to the component who has access to the Aura Enabled method specified by `actionName`.
     * @param actionName
     *      (required) Name of the Aura Enabled Apex method in form `c.methodName`.
     * @param params
     *      (optional) JSON map of request parameters to pass to the Apex action.
     * @param options
     *      (optional) JSON map of options to customize the request.
     *      `background` set to true will execute request in background thread.
     *      `storable` set to true will cache the response.
     */
    makeApexRequest: function(component, actionName, params, options) {
        var helper = this;
        return new Promise(function(resolve, reject) {
            var action = component.get(actionName);

            if(params) {
                action.setParams(params);
            }

            if(options) {
                if(options.background) { action.setBackground(); }
                if(options.storable) { action.setStorable(); }
            }

            action.setCallback(helper, function(response) {
                if(component.isValid() && response.getState() === 'SUCCESS') {
                    resolve(response.getReturnValue());
                } else {
                    console.error('Error calling action "' + actionName + '" with state: ' + response.getState());
                    helper.logActionErrors(response.getError());
                    reject(response.getError());
                }
            });

            $A.enqueueAction(action);
        });
    },

    /**
     * For internal use.
     * Logs to console errors object.
     * Errors may be a String or Array.
     */
    logActionErrors: function(errors) {
        if(errors) {
            if(errors.length > 0) {
                for(var i = 0; i < errors.length; i++) {
                    console.error('Error: ' + errors[i].message);
                }
            } else {
                console.error('Error: ' + errors);
            }
        } else {
            console.error('Unknown error');
        }
    },
})
