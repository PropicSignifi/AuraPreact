// common functions
(function(w) {
    let currentApp = null;
    let empApi = null;
    let empHandlers = {};
    let navigationService = null;
    let navigationServices = {};
    let pageReferenceUtils = null;
    let regionWidth = null;
    let unsavedChangesMonitor = null;

    const eventListeners = [];
    let lastEvent = null;

    // namespaces used in comp xml
    const SUPPORTED_NAMESPACES = [
        "aura",
        "c",
        "force",
        "forceChatter",
        "forceCommunity",
        "lightning",
        "ltng",
        "ui",
        "wave",
        "user",
    ];

    const SUPPORTED_EXPRESSION_REGEX = /^[a-zA-Z0-9\[\].]+$/;

    const HINT_REGEX = /^#(.*?)#(.*)$/;

    const parseFromNode = (data, doc) => {
        if(_.isString(data)) {
            return doc.createTextNode(data);
        }
        else if(data.type === 1) {
            const tagName = data.name.endsWith('/') ? _.trimEnd(data.name, '/') : data.name;
            const node = doc.createElement(tagName);

            _.each(data.attributes, (value, key) => {
                node.setAttribute(key, value);
            });

            _.each(data.content, item => {
                node.appendChild(parseFromNode(item, doc));
            });

            return node;
        }
        else {
            throw new Error('Unsupported node type to parse');
        }
    };

    const parseFromString = (xml, type) => {
        const doc = document.implementation.createDocument(null, "root");
        try {
            const data = pjXML.parse(xml);
            const node = parseFromNode(data.content[1], doc);
            return node;
        }
        catch(e) {
            console.error(e);
        }
    };

    /*
     * A lightweight counterpart of Aura.Component/Aura.ComponentDefRef.
     * This object is mainly used to represent the lightning component before they
     * are created.
     * 
     * Please see $Utils.createComponent/createComponents.
     */
    class Comp {
        constructor(name, attrs, children, isDefRef) {
            if(!name) {
                throw new Error("Comp name is not set.");
            }

            // used to track the position in the list of comps
            this.index = 0;
            this.name = name;
            this.attrs = attrs || {};
            this.children = children || {};
            // when set, it denotes Aura.ComponentDefRef
            // Component and ComponentDefRef are different when it comes to creating
            // dynamic components. Please refer to 'rebuildComp'.
            this.isDefRef = isDefRef;
        }

        set(name, value) {
            this.attrs[name] = value;
            return this;
        }

        get(name) {
            return this.attrs[name];
        }

        assign(newAttrs) {
            _.assign(this.attrs, newAttrs);
            return this;
        }

        appendTo(name, children) {
            if(!this.children[name]) {
                this.children[name] = [];
            }
            if(_.isArray(children)) {
                this.children[name] = [...this.children[name], ...children];
            }
            else {
                this.children[name] = [...this.children[name], children];
            }
            return this;
        }

        prependTo(name, children) {
            if(!this.children[name]) {
                this.children[name] = [];
            }
            if(_.isArray(children)) {
                this.children[name] = [...children, ...this.children[name]];
            }
            else {
                this.children[name] = [children, ...this.children[name]];
            }
            return this;
        }
    }

    /*
     * Convenience function to create a Comp
     */
    // comp :: (String, Attrs, Children) -> Comp
    const comp = (name, attrs = {}, children = {}, isDefRef = false) => normalizeComp(new Comp(name, attrs, children, isDefRef));

    /*
     * Convenience function to create an Html Comp
     */
    // compHtml :: (String, Attrs, Children, Boolean) -> Comp
    const compHtml = (tag, attrs = {}, children = {}, isDefRef = false) => {
        return comp("aura:html", {
            tag,
            HTMLAttributes: attrs,
        }, children, isDefRef);
    };

    /*
     *  Convenience function to create a Text Comp
     */
    // compText :: (String, Boolean) -> Comp
    const compText = (text, isDefRef = false) => comp("aura:text", { value: text }, {}, isDefRef);

    /*
     * Turn all the Comps including itself and its recursive children into a flat list.
     */
    // getFlatCompList :: Comp -> [Comp]
    const getFlatCompList = comp => {
        let ret = [comp];

        _.each(comp.children, list => {
            _.each(list, child => {
                ret = ret.concat(getFlatCompList(child));
            });
        });

        return ret;
    };

    /*
     * Convert shorthand Comp into a normal Comp.
     * 
     * A shorthand Comp can be:
     *   1. Simple text.
     *     comp("c:Test", {}, { body: ["body"] })
     *   2. Single comp not in a list.
     *     comp("c:Test", {}, { body: "body" })
     */
    // normalizeComp :: Comp -> Comp
    const normalizeComp = comp => {
        if(_.isString(comp)) {
            return compText(comp);
        }

        return new Comp(comp.name, comp.attrs, _.mapValues(comp.children,
            list => {
                return (_.isString(list) ? [list] : list).map(normalizeComp);
            }
        ), comp.isDefRef);
    };

    /*
     * Map Comp into Salesforce $A.createComponents recognizable format.
     */
    // mapComp :: Comp -> [String, Attrs]
    const mapComp = comp => {
        if(comp.name === 'aura:if' || comp.name === 'aura:iteration') {
            return [correctNamespace(comp.name), forceToDefRef(comp).attributes.values];
        }
        else {
            return [correctNamespace(comp.name), comp.attrs];
        }
    };

    const correctNamespace = name => {
        const [ns, compName] = name.split(":");
        return ns === "c" ? window.$Config.getNamespace() + ":" + compName : name;
    };

    /*
     * Convert Comp into Aura.ComponentDefRef config.
     * This is Salesforce Lightning component internal structure, and hence is
     * subject to change in the future.
     */
    // toDefRef :: Comp -> DefRef
    const toDefRef = comp => {
        return {
            componentDef: {
                descriptor: "markup://" + comp.name,
            },
            attributes: {
                values: comp.attrs,
            },
            skipCreationPath: true,
        };
    };

    // forceToDefRef :: Comp -> DefRef
    const forceToDefRef = comp => {
        const descriptor = "markup://" + comp.name;
        const values = _.assign({}, comp.attrs);
        _.each(comp.children, (items, key) => {
            values[key] = _.map(items, forceToDefRef);
        });

        return {
            componentDef: {
                descriptor,
            },
            attributes: {
                values,
            },
            skipCreationPath: true,
        };
    };

    /*
     * Rebuild Component with the right hierarchy structure.
     * The passed in Comp will use the knowledge of its own hierarchy structure, and
     * pick Components from the Component list to build the correct corresponding
     * Component.
     * 
     * The hierarchy structures of Aura.Component and Aura.ComponentDefRef are different.
     */
    // rebuildComp :: (Comp, [Component]) -> Component
    const rebuildComp = (comp, newComps) => {
        if(comp.isDefRef) {
            let ret = toDefRef(comp);

            _.each(comp.children, (list, key) => {
                let container = [];
                _.each(list, c => {
                    container.push(rebuildComp(c, newComps));
                });
                ret.attributes.values[key] = container;
            });

            return ret;
        }
        else {
            let ret = newComps[comp.index];

            if(comp.name !== "aura:if" && comp.name !== "aura:iteration") {
                _.each(comp.children, (list, key) => {
                    let container = ret.get("v." + key);
                    _.each(list, c => {
                        container.push(rebuildComp(c, newComps));
                    });
                    ret.set("v." + key, container);
                });
            }

            return ret;
        }
    };

    /*
     * Convert Comp attrs into xml string.
     * 
     * It handles basic attribute values as well as data bindings.
     */
    // toAttrsXML :: Attrs -> String
    const toAttrsXML = attrs => {
        return _.map(attrs, (value, key) => {
            if(_.isObject(value)) {
                // Hacking based on the internal structure to detect the controller binding
                if(_.isFunction(value.toString)) {
                    const str = value.toString();
                    if(str && str.indexOf("{!c.") >= 0) {
                        return `${key}="{! c.${key} }"` ;
                    }
                }

                // default object binding will be simplied.
                return `${key}="{! v.${key} }"` ;
            }
            else {
                return `${key}="${value}"`;
            }
        }).join(" ");
    };

    /*
     * Convert Comp children to xml string.
     * 
     * Comp may have children under different names. Children under "body" will be
     * placed as direct descendants, while children under other names will be like:
     * 
     * <aura:set attribute="footer">
     *     Footer Text
     * </aura:set>
     */
    // toChildrenXMLByGroup :: ([Comp], String) -> String
    const toChildrenXMLByGroup = (list, name) => {
        const xml =  _.map(list, toXML).join("\n");
        if(name === "body") {
            return xml;
        }
        else {
            const indentedXml = _.chain(xml).
                split("\n").
                map(line => '    ' + line).
                join("\n").
                value();
            return (
`<aura:set attribute="${name}">
${indentedXml}
</aura:set>`);
        }
    };

    /*
     * Convert all Comp children into xml string.
     */
    // toChildrenXML :: Children -> String
    const toChildrenXML = children => {
        return _.map(children, toChildrenXMLByGroup).join("\n");
    };

    /*
     * Convert normal Comp into xml string.
     */
    // toXMLFromPlain :: Comp -> String
    const toXMLFromPlain = comp => {
        const attrsXML = toAttrsXML(comp.attrs);
        const childrenXML = _.chain(toChildrenXML(comp.children))
            .split("\n")
            .compact()
            .map(line => '    ' + line)
            .join("\n")
            .value();
        return _.isEmpty(childrenXML) ? `<${comp.name} ${attrsXML}/>` :
            `<${comp.name} ${attrsXML}>\n${childrenXML}\n</${comp.name}>`;
    };

    /*
     * Convert Html Comp into xml string.
     * 
     * Html Comp should be turned back into raw html.
     */
    // toXMLFromHtml :: Comp -> String
    const toXMLFromHtml = comp => {
        const attrsXML = toAttrsXML(comp.attrs.HTMLAttributes);
        const childrenXML = _.chain(toChildrenXML(comp.children))
            .split("\n")
            .compact()
            .map(line => '    ' + line)
            .join("\n")
            .value();
        return _.isEmpty(childrenXML) ? `<${comp.attrs.tag} ${attrsXML}/>` :
            `<${comp.attrs.tag} ${attrsXML}>\n${childrenXML}\n</${comp.attrs.tag}>`;
    };

    /*
     *  Convert Text Comp into xml string.
     */
    // toXMLFromText :: Comp -> String
    const toXMLFromText = comp => {
        return comp.attrs.value || "";
    };

    /*
     * Convert Comp into xml string.
     */
    // toXML :: Comp -> String
    const toXML = comp => {
        switch(comp.name) {
            case 'aura:html':
                return toXMLFromHtml(comp);
            case 'aura:text':
                return toXMLFromText(comp);
            default:
                return toXMLFromPlain(comp);
        }
    };

    /*
     * A wrapper of the browser native Promise.
     * 
     * This is used to avoid boated usage of $A.getCallback when you set a callback
     * to run outside a lightning rendering environment, such as from Promise, setTimeout
     * or other cases..
     */
    class $Promise {
        constructor(executor) {
            this.promise = new Promise($A.getCallback(executor));
        }

        then(succeed, fail) {
            this.promise = this.promise.then(
                succeed ? $A.getCallback(succeed) : null,
                fail ? $A.getCallback(fail) : null
            );
            return this;
        }

        catch(fail) {
            this.promise = this.promise.catch($A.getCallback(fail));
            return this;
        }

        finally(f) {
            this.promise = this.promise.finally($A.getCallback(f));
            return this;
        }
    }

    /*
     * Convenience function to create a wrapped promise.
     */
    const newPromise = executor => new $Promise(executor);

    // _invokeAction :: (Component, String, Params, Resolve, Reject, Options) -> _
    const _invokeAction = (component, actionName, actionParams, resolve, reject, options) => {
        const action = component.get("c." + actionName);
        if(options) {
            if(_.isBoolean(options)) {
                action.setStorable(options);
            }
            else if(_.isPlainObject(options)) {
                if(options.storable) {
                    action.setStorable(options.storable);
                }
                else if(options.abortable) {
                    action.setAbortable();
                }
                else if(options.background) {
                    action.setBackground();
                }
            }
        }
        action.setParams(actionParams || {});
        action.setCallback(component, response => {
            const state = response.getState();
            if (state === "SUCCESS") {
                resolve(response.getReturnValue());
            }
            else if (state === "INCOMPLETE") {
                if(options && options.reportIncomplete) {
                    resolve(options.reportIncomplete);
                }
            }
            else if (state === "ERROR") {
                reject(response.getError());
            }
        });

        $A.enqueueAction(action);
    };

    /*
     * Convenience function to invoke server side actions.
     * 
     * Either callback or promise is supported. If no callback is passed in, a promise
     * will be returned.
     */
    // invokeAction :: (Component, String, Params, Callback, Options) -> _
    const invokeAction = (component, actionName, actionParams, callback, options) => {
        if(_.isFunction(callback)) {
            _invokeAction(component, actionName, actionParams, callback, onError, options);
        }
        else {
            return newPromise((resolve, reject) => {
                _invokeAction(component, actionName, actionParams, resolve, reject, options);
            }).catch(onError);
        }
    };

    // _createComponents :: ([Comp], Resolve, Reject) -> _
    const _createComponents = (comps, resolve, reject) => {
        comps = _.isArray(comps) ? comps : [comps];
        const compList = _.flatMap(comps, getFlatCompList);
        // mark hierarchy structure information
        _.each(compList, (c, index) => c.index = index);
        $A.createComponents(_.map(compList, mapComp), function(newComps, status, errorMessage) {
            if(status === "SUCCESS") {
                resolve(
                    _.map(comps, comp => rebuildComp(comp, newComps))
                );
            }
            else if(status === "INCOMPLETE") {
                return;
            }
            else {
                reject(errorMessage);
            }
        });
    };

    /*
     * Create a list of Components from the list of Comps.
     * 
     * Either callback or promise is supported. If no callback is passed in, a promise
     * will be returned.
     */
    // createComponents :: [Comp] -> Promise [Component]
    const createComponents = (comps, callback) => {
        if(_.isFunction(callback)) {
            _createComponents(comps, callback, onError);
        }
        else {
            return newPromise((resolve, reject) => {
                _createComponents(comps, resolve, reject);
            }).catch(onError);
        }
    };

    /*
     * Create a Component from a Comp
     * 
     * Either callback or promise is supported. If no callback is passed in, a promise
     * will be returned.
     */
    // createComponent :: Comp -> Promise Component
    const createComponent = (comp, callback) => {
        if(_.isArray(comp)) {
            throw new Error("Expected a component, but met an array");
        }
        if(_.isFunction(callback)) {
            _createComponents([comp], newComps => {
                callback(newComps[0]);
            }, onError);
        }
        else {
            return newPromise((resolve, reject) => {
                _createComponents([comp], newComps => {
                    resolve(newComps[0]);
                }, reject);
            }).catch(onError);
        }
    };

    // create :: (String, Component) -> [Component]
    const create = (xml, component) => {
        return createComponents(fromXml(xml, component));
    };

    /*
     *  Convenience function to fire an event.
     */
    // fireEvent :: (Component, String, Object) -> Event
    const fireEvent = (component, eventName, eventParams = {}) => {
        const compEvent = component.getEvent(eventName);
        if(compEvent) {
            compEvent.setParams(eventParams);
            compEvent.fire();
        }
        return compEvent;
    };

    /*
     *  Convenience function to fire an application event.
     */
    // fireAppEvent :: (String, Object) -> Event
    const fireAppEvent = (eventName, eventParams = {}) => {
        const namespace = window.$Config.getNamespace();
        const evtName = _.startsWith(eventName, "e.") ? eventName : `e.${namespace}:${eventName}`;
        const appEvent = $A.get(evtName);
        if(appEvent) {
            appEvent.setParams(eventParams);
            appEvent.fire();
        }
        return appEvent;
    };

    const fireAppEventAsync = (eventName, eventParams = {}, delay = 0) => {
        window.setTimeout(() => {
            fireAppEvent(eventName, eventParams);
        }, delay);
    };

    const isCustomAppEvent = appEvent => {
        const namespace = window.$Config.getNamespace();
        return appEvent.getType() === `${namespace}:appEvent`;
    };

    const receiveAppEvent = appEvent => {
        if(lastEvent !== appEvent) {
            _.each(eventListeners, listener => {
                listener(appEvent);
            });

            lastEvent = appEvent;
        }
    };

    // routeTo :: (String, String, Object) -> _
    const routeTo = (routerName, routeName, routeParams) => {
        fireAppEvent("appEvent", {
            data: {
                type: "onRouteChange",
                name: routerName,
                routeName: routeName,
                routeParams: routeParams,
            },
        });
    };

    /*
     * Default behavior to handle the errors.
     */
    // onError :: Error -> _
    const onError = error => {
        error = _.isArray(error) ? error[0] : error;
        $A.log(error, error);
        $A.reportError((error && error.message) || error, error);
        if(typeof error === 'string') {
            throw new Error(error);
        }
        else {
            throw error;
        }
    };

    /*
     * Utility function to parse the JSON with error handling.
     */
    // parseJSON :: (String, a) -> a
    const parseJSON = (string, defaultJson) => {
        let ret = defaultJson;
        try {
            ret = JSON.parse(string);
        }
        catch(e) {
            onError(e);
        }

        return ret;
    };

    /*
     * Convert the JSON into a pretty formatted string.
     */
    // formatJSON :: JSON -> String
    const formatJSON = json => JSON.stringify(json, null, 4);

    /*
     * Utility function to open url in a new tab.
     */
    // openUrl :: Url -> _
    const openUrl = url => {
        window.open(url, "_blank");
    };

    const findPreactContainers = (preactContainers, preactName) => {
        if(_.isString(preactName)) {
            return preactContainers[preactName] ? [preactContainers[preactName]] : [];
        }
        else if(_.isArray(preactName)) {
            return _.chain(preactName)
                .filter(name => !!preactContainers[name])
                .map(name => preactContainers[name])
                .value();
        }
        else {
            return [];
        }
    };

    const containsPreactName = (preactContainers, preactName) => !_.isEmpty(findPreactContainers(preactContainers, preactName));

    /*
     * Wrapper function to try to start the busy loading.
     */
    // startLoading :: (Component, Boolean, String) -> Component
    const startLoading = (component, local, preactName) => {
        if(preactName && window.$preactContainers && containsPreactName(window.$preactContainers, preactName)) {
            const preactContainers = findPreactContainers(window.$preactContainers, preactName);
            _.each(preactContainers, preactContainer => {
                preactContainer.startLoading();
            });
            return component;
        }

        if(local) {
            component.set("v.loadingLocal", component.get("v.loadingLocal") + 1);
        }
        else {
            component.set("v.loading", true);
        }
        return component;
    };

    /*
     * Wrapper function to try to stop the busy loading.
     */
    // stopLoading :: (Component, Boolean, String) -> Component
    const stopLoading = (component, local, preactName) => {
        if(preactName && window.$preactContainers && containsPreactName(window.$preactContainers, preactName)) {
            const preactContainers = findPreactContainers(window.$preactContainers, preactName);
            _.each(preactContainers, preactContainer => {
                preactContainer.stopLoading();
            });
            return component;
        }

        if(local) {
            component.set("v.loadingLocal", component.get("v.loadingLocal") - 1 >= 0 ? component.get("v.loadingLocal") - 1 : 0);
        }
        else {
            component.set("v.loading", false);
        }
        return component;
    };

    /*
     * Add busy loading behavior to the promise.
     * 
     * The busy loading is provided by the component.
     */
    // busyloading :: (Component, Promise, Boolean) -> Promise
    const busyloading = (component, promise, local) => {
        if(!promise) {
            throw new Error("Promise is not provided.");
        }
        startLoading(component, local);
        return promise.then(() => stopLoading(component, local),
                            () => stopLoading(component, local));
    };

    /*
     * Create a new object based on the old object and the change object.
     * 
     * By default, a change object will only update the related fields, and all the
     * other fields will be left untouched.
     * 
     * If you want to update the whole object and remove the fields not set in the
     * change object, you would probably consider using this 'newObject', as it will
     * turn the other fields into undefined, which is a signal for the Store to remove
     * these fields.
     * 
     * Please refer to $Store#dispatch.
     */
    // newObject :: (a, b) -> a
    const newObject = (oldObject, changeObject) => {
        return _.merge({}, _.mapValues(oldObject, _.noop), changeObject);
    };

    /*
     * Create a deeply frozen object.
     * 
     * This will freeze the object recursively until all its children become frozen.
     */
    // freezeDeep :: a -> a
    const freezeDeep = o => {
        if (o === Object(o)) {
            if(!Object.isFrozen(o)) {
                Object.freeze(o);
            }
            Object.getOwnPropertyNames(o).forEach(function (prop) {
                if(prop !== 'constructor' && !_.isFunction(o[prop])) {
                    freezeDeep(o[prop]);
                }
            });
        }
        return o;
    };

    // isElementNode :: Node -> Boolean
    const isElementNode = node => node.nodeType === 1;

    // isTextNode :: Node -> Boolean
    const isTextNode = node => node.nodeType === 3;

    // isEmptyTextNode :: Node -> Boolean
    const isEmptyTextNode = node => {
        return isTextNode(node) && _.isEmpty(_.trim(node.textContent));
    };

    // isExpression :: String -> Boolean
    const isExpression = expr => _.startsWith(expr, "{!") && _.endsWith(expr, "}");

    // containsExpression :: String -> Boolean
    const containsExpression = expr => expr && expr.includes("{!") && expr.includes("}");

    // isDynamicExpressionSupported :: () -> Boolean
    const isDynamicExpressionSupported = () => false;

    // hydrateExpression :: (String, Component, String) -> Reference
    const hydrateExpression = (expr, component, descriptor) => {
        const compMap = {};
        if(component._) {
            _.assign(compMap, component);
        }
        else {
            compMap._ = component;
        }

        const expression = _.chain(expr).
            trimStart("{!").
            trimEnd("}").
            trim().
            value();

        if(SUPPORTED_EXPRESSION_REGEX.test(expression)) {
            const [provider, ...e] = expression.split(".");
            if(provider === "v" || provider === "c") {
                return compMap._.getReference(expression);
            }
            else if(compMap[provider]) {
                return compMap[provider].getReference(e.join("."));
            }
            else {
                const target = component && component.getType ? component.getType() : "";
                return {
                    descriptor,
                    value: {
                        exprType: "FUNCTION",
                        code: function(cmp, fn) {
                            return cmp.get(expression);
                        },
                        args: [
                            {
                                exprType: "PROPERTY",
                                byValue: false,
                                target,
                                path: expression,
                            }
                        ],
                        byValue: false,
                    }
                };
            }
        }
        else {
            if(!isDynamicExpressionSupported()) {
                throw new Error("Unsupported expression: " + expr);
            }

            const target = component && component.getType ? component.getType() : "";
            const parser = window.$Parser.getParser('jsep');
            const result = parser.parse(expression, component);
            const [code, ...paths] = result;
            const args = _.map(paths, path => {
                return {
                    exprType: "PROPERTY",
                    byValue: false,
                    target,
                    path,
                };
            });
            return {
                descriptor,
                value: {
                    exprType: "FUNCTION",
                    code,
                    args,
                    byValue: false,
                }
            };
        }
    };

    /*
     * Generate a wrapped xml to avoid namespace undefined issue when parsing.
     */
    // generateXmlWrapper :: String -> String
    const generateXmlWrapper = xml => {
        const namespaceDefs = _.chain(SUPPORTED_NAMESPACES).
            map(ns => `xmlns:${ns}="${ns}"`).
            join(" ").
            value();
        return (
            `<root ${namespaceDefs}>
                ${xml}
            </root>`
        );
    };

    /*
     * Parse xml value.
     * 
     * If it is "true" or "false", convert it into boolean values. Otherwise return it.
     */
    // parseXmlValue :: a -> b
    const parseXmlValue = value => value === "true" ? true :
        value === "false" ? false :
        value;

    /*
     * Parse comp attrs xml.
     * 
     * With component, it will try to resolve the reference bindings.
     */
    // parseCompAttrsXmlElement :: (Element, Component) -> Attrs
    const parseCompAttrsXmlElement = (element, component) => {
        return _.chain(element.attributes).
            map(attr => {
                if(component) {
                    return [
                        attr.name,
                        isExpression(attr.value) ?
                            hydrateExpression(attr.value, component, attr.name) :
                            parseXmlValue(attr.value)
                    ];
                }
                else {
                    return [attr.name, parseXmlValue(attr.value)];
                }
            }).
            fromPairs().
            value();
    };

    /*
     * Parse comp children xml.
     * 
     * It will resolve aura:set and move its children into correct children group.
     */
    // parseCompChildrenXmlElement :: (Element, Component) -> Children
    const parseCompChildrenXmlElement = (element, component) => {
        const rawCompList = _.chain(element.childNodes).
            reject(isEmptyTextNode).
            map(parseCompXmlNode(component)).
            value();
        const bodyChildren = _.reject(rawCompList, ["name", "aura:set"]);
        const children = {
            body: bodyChildren,
        };
        _.each(
            _.filter(rawCompList, ["name", "aura:set"]),
            comp => {
                children[comp.attrs.attribute] = comp.children.body;
            }
        );

        return children;
    };

    /*
     * Parse comp xml.
     * 
     * Return text comp if it is a text node.
     * 
     * Set user:ref="true" to indicate that this comp is component def ref.
     */
    // parseCompXmlNode :: Component -> Node -> Comp
    const parseCompXmlNode = _.curry((component, node) => {
        if(isElementNode(node)) {
            // element node
            const name = node.tagName;
            const attrs = parseCompAttrsXmlElement(node, component);
            const children = parseCompChildrenXmlElement(node, component);
            const isDefRef = attrs["user:ref"];
            delete attrs["user:ref"];
            if(name.indexOf(":") >= 0) {
                // comp
                return comp(name, attrs, children, isDefRef);
            }
            else {
                // html comp
                return compHtml(name, attrs, children, isDefRef);
            }
        }
        else if(isTextNode(node)) {
            // text node
            if(isExpression(node.textContent)) {
                return compText(hydrateExpression(node.textContent, component, "value"));
            }
            else {
                if(containsExpression(node.textContent)) {
                    throw new Error("Cannot render expression wrapped by texts");
                }
                else {
                    return compText(node.textContent);
                }
            }
        }
        else {
            throw new Error(`Invalid node for ${node}`);
        }
    });

    // parseCompsXmlDoc :: (XMLDoc, Component) -> [Comp]
    const parseCompsXmlDoc = (doc, component) => {
        return _.map(
            _.reject(doc.childNodes, isEmptyTextNode),
            parseCompXmlNode(component)
        );
    };

    // parseCompsXml :: (String, Component) -> [Comp]
    const parseCompsXml = (xml, component) => {
        const doc = parseFromString(generateXmlWrapper(xml || ""), "text/xml");
        return parseCompsXmlDoc(doc, component);
    };

    /*
     * Parse comp(s) from xml.
     * 
     * Parsing of only static markup is supported.
     * 
     * If there is only one comp, return it, otherwise return a list of comps.
     */
    // fromXml :: (String, Component) -> [Comp]
    const fromXml = (xml, component) => {
        const comps = parseCompsXml(xml, component);
        return comps.length === 1 ? comps[0] : comps;
    };

    /*
     * Make the first letter uppercase.
     */
    // toUpperCaseFirst :: String - String
    const toUpperCaseFirst = str => _.toUpper(str[0]) + str.substring(1);

    /*
     * Make the first letter lowercase.
     */
    // toLowerCaseFirst :: String - String
    const toLowerCaseFirst = str => _.toLower(str[0]) + str.substring(1);

    // setCurrentApp :: Component -> _
    const setCurrentApp = cmp => {
        currentApp = cmp;

        const tz = $A.get('$Locale.timezone');
        moment.tz.setDefault(tz);
    };

    // getCurrentApp :: () -> Component
    const getCurrentApp = () => currentApp;

    const registerEmpHandler = (name, handler) => {
        if(_.isString(name) && _.isFunction(handler)) {
            empHandlers[name] = handler;
        }
    };

    const unregisterEmpHandler = name => {
        delete empHandlers[name];
    };

    const setEmpApi = api => {
        if(api) {
            if(window.$Utils.isNonDesktopBrowser()) {
                return;
            }

            api.onError($A.getCallback(error => {
                console.error('EMP API error: ', JSON.stringify(error));
            }));

            const ns = window.$NAME_SPACE_PREFIX;

            api.subscribe(`/event/${ns}CTC_Event__e`, -1, $A.getCallback(eventReceived => {
                const Type__c = eventReceived.data.payload[`${ns}Type__c`];
                const Title__c = eventReceived.data.payload[`${ns}Title__c`];
                const Data__c = eventReceived.data.payload[`${ns}Data__c`];
                const handler = empHandlers[Type__c];
                if(handler) {
                    handler({
                        type: Type__c,
                        title: Title__c,
                        data: Data__c,
                    });
                }
            }))
            .then(subscription => {
                // Get the subscription to unsubscribe it
            });
        }

        empApi = api;
    };

    const getEmpApi = () => empApi;

    const getSrcElement = event => {
        return event && (event.srcElement || event.target || (event.getSource() && event.getSource().getElement()));
    };

    // findFromEvent :: (Event, String) -> String
    const findFromEvent = (event, attrName) => {
        let element = getSrcElement(event);
        while(element) {
            if(element.hasAttribute && element.hasAttribute(attrName)) {
                return element.getAttribute(attrName);
            }

            element = element.parentElement;
        }
    };

    /*
     * Used to cache the items to be set on the component.
     * Set the items later to avoid multiple set in the same rendering cycle.
     */
    const cachedItems = {};
    const cachedTimers = {};

    // getCacheKey :: (Component, String) -> String
    const getCacheKey = (cmp, name) => `${cmp.getGlobalId()}_${name}`;

    // getItems :: (Component, String) -> [Item]
    const getItems = (cmp, name) => {
        const key = getCacheKey(cmp, name);
        return cachedItems[key] || cmp.get(`v.${name}`);
    };

    // setItems :: (Component, String, [Item], Action) -> _
    const setItems = (cmp, name, items, action) => {
        const key = getCacheKey(cmp, name);
        if(cmp) {
            cachedItems[key] = items;
            if(!cachedTimers[key]) {
                cachedTimers[key] = setTimeout($A.getCallback(function() {
                    cmp.set(`v.${name}`, cachedItems[key]);
                    if(_.isFunction(action)) {
                        action();
                    }
                    delete cachedTimers[key];
                }), 5);
            }
        }
    };

    // findInstancesOf :: (Component, String) -> [Component]
    const findInstancesOf = (cmp, type) => {
        var comps = cmp.find({ instancesOf: 'aura:component' });
        var children = _.chain(comps).
            map(function(comp) {
                return $A.getComponent(comp.getGlobalId());
            }).
            filter(function(child) {
                return child.isInstanceOf(type);
            }).
            value();
        return children;
    };

    // checkDirty :: Component -> [String]
    const checkDirty = cmp => {
        const contentEditables = findChildren(cmp, window.$Config.getNamespace() + ":contentEditable");
        const dirtyNames = _.chain(contentEditables).
            filter(contentEditable => !!contentEditable.checkDirty()).
            map(contentEditable => contentEditable.get("v.name")).
            value();
        return dirtyNames;
    };

    const ajax = options => {
        //Creaet new request
        const xmlhttp = new XMLHttpRequest();
        const callback = options.callback || _.noop;
        const method = options.method || "GET";
        const headers = options.headers || {};
        const async = true;
        const url = options.url;
        if(!url) {
            throw new Error("Url is invalid");
        }

        //Set parameters for the request
        xmlhttp.open(method, url, async);

        _.each(headers, function(value, key) {
            xmlhttp.setRequestHeader(key, value);
        });

        //Handle response when complete
        xmlhttp.onreadystatechange = function(component) {
            if(xmlhttp.readyState === 4) {
                callback.call(this, xmlhttp);
            }
        };

        //Send the request
        if(options.data) {
            xmlhttp.send(options.data);
        }
        else {
            xmlhttp.send();
        }
    };

    // evaluate :: (String, Context) -> Object
    const evaluate = (expression, context) => {
        const parsed = window.$Filter.parse(expression);
        if(parsed) {
            return window.$Filter.evaluate(parsed, context);
        }
    };

    // extractHint :: String -> [[String], String]
    const extractHint = message => {
        const xArray = new RegExp(HINT_REGEX).exec(message);
        if(xArray) {
            const hint = xArray[1];
            const realMessage = xArray[2];
            return [_.split(hint, ";"), realMessage];
        }
        else {
            return [null, message];
        }
    };

    // isCustomComponent :: Component -> Boolean
    const isCustomComponent = component => {
        return component && (component.isInstanceOf(window.$Config.getNamespace() + ":baseComponent") ||
            component.isInstanceOf(window.$Config.getNamespace() + ":baseRoot") ||
            component.isInstanceOf(window.$Config.getNamespace() + ":baseApplication"));
    };

    // assert :: (Result, String) -> _
    const assert = (result, message) => {
        if(!result) {
            throw new Error(message);
        }
    };

    // findChildren :: (Component, String) -> [Component]
    const findChildren = (component, type) => {
        if(!isCustomComponent(component)) {
            return [];
        }

        const children = _.chain(component.getChildren()).
            filter(child => child.isInstanceOf(type)).
            value();
        const nestedChildren = _.chain(component.getChildren()).
            flatMap(child => findChildren(child, type)).
            value();
        return [...children, ...nestedChildren];
    };

    // findById :: (Component, String) -> [Component]
    const findById = (component, id) => {
        if(!isCustomComponent(component)) {
            return [];
        }

        const children = _.chain(component.getChildren()).
            filter(child => child.getLocalId() === id).
            value();
        const nestedChildren = _.chain(component.getChildren()).
            flatMap(child => findById(child, id)).
            value();
        return [...children, ...nestedChildren];
    };

    // isCheckable :: String -> Boolean
    const isCheckable = type => {
        return type === 'checkbox' ||
            type === 'checkbox-small' ||
            type === 'checkbox-medium' ||
            type === 'checkbox-big' ||
            type === 'checkbox-button' ||
            type === 'radio' ||
            type === 'radio-small' ||
            type === 'radio-medium' ||
            type === 'radio-big' ||
            type === 'toggle';
    };

    // isFieldValid :: Component -> Boolean
    const isFieldValid = input => {
        if(!input || !input.isInstanceOf(window.$Config.getNamespace() + ":inputable")) {
            return;
        }

        const validity = input.get("v.validity");
        return window.$validityLibrary.validity.isValid(validity);
    };

    // getFieldValue :: Component -> Object
    const getFieldValue = input => {
        if(!input || !input.isInstanceOf(window.$Config.getNamespace() + ":inputable")) {
            return;
        }

        if(input.isInstanceOf(window.$Config.getNamespace() + ":input")) {
            const type = input.get("v.type");
            if(isCheckable(type)) {
                return input.get("v.checked");
            }
            else {
                return input.get("v.value");
            }
        }
        else {
            return input.get("v.value");
        }
    };

    // setFieldValue :: (Component, Object) -> _
    const setFieldValue = (input, value) => {
        if(!input || !input.isInstanceOf(window.$Config.getNamespace() + ":inputable")) {
            return;
        }

        if(input.isInstanceOf(window.$Config.getNamespace() + ":input")) {
            const type = input.get("v.type");
            if(isCheckable(type)) {
                input.set("v.checked", !!value);
            }
            else {
                input.set("v.value", value);
            }
        }
        else {
            input.set("v.value", value);
        }
    };

    // each :: ([a], Function) -> _
    const each = (items, iteratee) => {
        _.each(_.isArray(items) ? items : [items], iteratee);
    };

    // getPositionFromBody :: Node -> Position
    const getPositionFromBody = elem => {
        const box = elem.getBoundingClientRect();
        const body = document.body;
        const docEl = document.documentElement;
        const bodyBox = body.getBoundingClientRect();

        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        const clientTop = docEl.clientTop || body.clientTop || 0;
        const clientLeft = docEl.clientLeft || body.clientLeft || 0;

        const bodyWidth = bodyBox.width;
        const bodyHeight = bodyBox.height;

        const top = box.top + scrollTop - clientTop;
        const bottom = bodyHeight - top - box.height;
        const left = box.left + scrollLeft - clientLeft;
        const right = bodyWidth - left - box.width;

        return {
            top: Math.round(top),
            bottom: Math.round(bottom),
            left: Math.round(left),
            right: Math.round(right),
        };
    };

    // isInOneApp :: () -> Boolean
    const isInOneApp = () => {
        return !!$A.get("e.force:showToast");
    };

    // isPromise :: Object -> Boolean
    const isPromise = target => {
        return target && _.isFunction(target.then);
    };

    const classnames = function() {
        return Array.prototype.slice.call(arguments).reduce(function(classes, arg) {
            var argType = typeof arg;
            if (argType === "string" || argType === "number") {
                classes.push(arg);
            } else if (Array.isArray(arg)) {
                classes.push(classnames.apply(null, arg));
            } else if (argType === "object") {
                for (var key in arg) {
                    if(arg.hasOwnProperty(key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
            return classes;
        }, []).join(" ");
    };

    const isNonDesktopBrowser = () => {
        return $A.get("$Browser.formFactor") !== "DESKTOP" || window.innerWidth < 768;
    };

    const isMobileScreenSize = () => {
        return window.innerWidth < 480;
    };

    const isTabletScreenSize = () => {
        return window.innerWidth < 768 && window.innerWidth >= 480;
    };

    const isDesktopScreenSize = () => {
        return window.innerWidth >= 768;
    };

    const setNavigationService = (service, preactContainerName) => {
        if(preactContainerName) {
            navigationServices[preactContainerName] = service;
            navigationService = service;
        }
        else {
            navigationService = service;
        }
    };

    const getNavigationService = preactContainerName => {
        return preactContainerName ? navigationServices[preactContainerName] || navigationService : navigationService;
    };

    const setPageReferenceUtils = utils => {
        pageReferenceUtils = utils;
    };

    const getPageReferenceUtils = () => {
        return pageReferenceUtils;
    };

    const createPageReference = (compName, params) => {
        const qualifiedCompName = correctNamespace(compName);
        const ns = window.$Config.getNamespace() + '__';
        const qualifiedParams = _.chain(params)
            .toPairs()
            .map(([name, value]) => {
                if(!_.includes(name, '__')) {
                    return [ns + name, value];
                }
                else {
                    return [name, value];
                }
            })
            .fromPairs()
            .value();
        if(navigationService) {
            return {
                type: 'standard__component',
                attributes: {
                    name: qualifiedCompName,
                    componentName: _.replace(qualifiedCompName, ':', '__'),
                },
                state: qualifiedParams,
            };
        }
        else {
            return {
                componentDef: qualifiedCompName,
                componentAttributes: qualifiedParams,
            };
        }
    };

    const navigateToComponent = (compName, params, replace) => {
        return navigateToComponentFromContainer(null, compName, params, replace);
    };

    const navigateToComponentFromContainer = (preactContainerName, compName, params, replace) => {
        const pageReference = createPageReference(compName, params, preactContainerName);
        const navigationService = getNavigationService(preactContainerName);
        if(pageReference.type) {
            navigationService.navigate(pageReference, replace);
        }
        else {
            fireAppEvent('e.force:navigateToComponent', pageReference);
        }
    };

    const navigateToPageReference = (pageReference, replace) => {
        navigationService.navigate(pageReference, replace);
    };

    const generateComponentUrl = (compName, params) => {
        return generateComponentUrlFromContainer(null, compName, params);
    };

    const generateComponentUrlFromContainer = (preactContainerName, compName, params) => {
        const pageReference = createPageReference(compName, params, preactContainerName);
        const navigationService = getNavigationService(preactContainerName);
        if(pageReference.type) {
            return navigationService.generateUrl(pageReference);
        }
        else {
            return Promise.reject('could not generate component url');
        }
    };

    const setRegionWidth = width => {
        regionWidth = width;
    };

    const getRegionWidth = () => regionWidth;

    const registerEventListener = listener => {
        if(_.isFunction(listener)) {
            eventListeners.push(listener);
        }
        else {
            throw new Error('Event listener is not a function');
        }

        return () => {
            _.pull(eventListeners, listener);
        };
    };

    const closeQuickAction = recordId => {
        if(!recordId) {
            throw new Error('Record id is required');
        }

        if(isRecordPage()) {
            fireAppEvent('e.force:closeQuickAction');
        }
        else {
            fireAppEvent('e.force:navigateToSObject', {
                recordId,
            });
        }
    };

    const isRecordPage = sObjectName => {
        const pattern = sObjectName ? `/lightning/r/${sObjectName}/` : '/lightning/r/';
        return _.startsWith(window.location.pathname, pattern);
    };

    const isComponentPage = () => {
        const pattern = '/lightning/cmp/';
        return _.startsWith(window.location.pathname, pattern);
    };

    const restRequest = (preactContainerName, request) => {
        const preactContainer = window.$preactContainers[preactContainerName];
        if(preactContainer) {
            return preactContainer.requireApiProxy().then(apiProxy => {
                const {
                    url,
                    method,
                    headers,
                    body,
                } = request;

                const newRequest = {
                    url,
                    method,
                    headers,
                    body: _.isPlainObject(body) ? JSON.stringify(body) : body,
                };
                return apiProxy.restRequest(newRequest);
            });
        }
    };

    const httpRequest = request => {
        const preactContainer = window.$preactContainers[preactContainerName];
        if(preactContainer) {
            return preactContainer.requireApiProxy().then(apiProxy => {
                return apiProxy.httpRequest(request);
            });
        }
    };

    const setUnsavedChangesMonitor = monitor => unsavedChangesMonitor = { handler: monitor };

    const getUnsavedChangesMonitor = () => unsavedChangesMonitor;

    const markUnsaved = (unsaved, label, onSave) => {
        if(unsavedChangesMonitor) {
            const options = label && {
                label,
            };

            unsavedChangesMonitor.handler.setUnsavedChanges(unsaved, options);
            unsavedChangesMonitor.onSave = onSave;
        }
    };

    const getUrlSearchParams = () => {
        const searchText = window.location.search;
        let searchString = decodeURIComponent(searchText);

        if(_.startsWith(searchString, '?')){
            searchString = searchString.substring(1);
        }

        return _.chain(searchString)
            .split('&')
            .map(item => _.split(item, '='))
            .fromPairs()
            .value();
    };

    const requireLibrary = (preactContainerName, libraries) => {
        if(!preactContainerName) {
            throw new Error('Preact container is not provided');
        }

        const libraryNames = _.isArray(libraries) ? libraries : [libraries];

        const preactContainer = window.$preactContainers[preactContainerName];
        return preactContainer.requireLibrary(libraryNames);
    };

    window.$Expose.add("common", {
        getFlatCompList,
        rebuildComp,
        toDefRef,
        hydrateExpression,
    });

    const $Utils = {
        fireEvent,
        fireAppEvent,
        fireAppEventAsync,
        onError,
        parseJSON,
        openUrl,
        comp,
        compHtml,
        compText,
        createComponent,
        createComponents,
        formatJSON,
        startLoading,
        stopLoading,
        busyloading,
        toXML,
        toXml: toXML,
        newObject,
        invokeAction,
        freezeDeep,
        fromXml,
        newPromise,
        toUpperCaseFirst,
        toLowerCaseFirst,
        create,
        setCurrentApp,
        getCurrentApp,
        findFromEvent,
        setItems,
        getItems,
        findInstancesOf,
        routeTo,
        checkDirty,
        ajax,
        evaluate,
        extractHint,
        findChildren,
        findById,
        isCheckable,
        getSrcElement,
        each,
        getFieldValue,
        setFieldValue,
        isFieldValid,
        getPositionFromBody,
        isInOneApp,
        isPromise,
        assert,
        classnames,
        isNonDesktopBrowser,
        correctNamespace,
        setNavigationService,
        navigateToComponent,
        navigateToComponentFromContainer,
        generateComponentUrl,
        generateComponentUrlFromContainer,
        setRegionWidth,
        getRegionWidth,
        registerEventListener,
        closeQuickAction,
        isRecordPage,
        isComponentPage,
        receiveAppEvent,
        isCustomAppEvent,
        isMobileScreenSize,
        isTabletScreenSize,
        isDesktopScreenSize,
        setEmpApi,
        getEmpApi,
        registerEmpHandler,
        unregisterEmpHandler,
        restRequest,
        httpRequest,
        setUnsavedChangesMonitor,
        getUnsavedChangesMonitor,
        markUnsaved,
        getUrlSearchParams,
        requireLibrary,
        setPageReferenceUtils,
        getPageReferenceUtils,
        navigateToPageReference,
    };

    w.$Utils = $Utils;
})(window);
