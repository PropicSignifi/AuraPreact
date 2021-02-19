({
    getPreactContainerName: function(cmp) {
        var name = cmp.get('v.name');
        var identifier = cmp.get('v.identifier');
        return identifier ? name + ':' + identifier : name;
    },

    servicesReady: function(waitForList) {
        return _.isEmpty(waitForList) || _.every(waitForList, function(service) {
            return !!window.$ActionService[service];
        });
    },

    startLoading: function(cmp) {
        window.$Utils.fireEvent(cmp, '$startLoading');
    },

    stopLoading: function(cmp) {
        window.$Utils.fireEvent(cmp, '$stopLoading');
    },

    doPreactInit: function(cmp) {
        if(cmp._initialized) {
            return;
        }
        cmp._initialized = true;
        var name = this.getPreactContainerName(cmp);
        window.$Utils.setNavigationService(cmp.find('navService'), name);
        window.$Utils.setPageReferenceUtils(cmp.find('pageReferenceUtils'));
        window.$Utils.setEmpApi(cmp.find('empApi'));
        window.$Utils.setUnsavedChangesMonitor(cmp.find('unsavedChangesMonitor'));

        this.handlePropsChange(cmp);

        var preactContainers = window.$preactContainers || {};
        preactContainers[name] = cmp;
        window.$preactContainers = preactContainers;

        window.$Shadow = {
            instances: [],
        };

        var isCreating = false;

        window.$Shadow.create = $A.getCallback(function(markup) {
            return new Promise($A.getCallback((res, rej) => {
                var t = window.setInterval($A.getCallback(() => {
                    if(isCreating) {
                        return;
                    }
                    isCreating = true;

                    var index = _.size(window.$Shadow.instances);
                    markup = markup.replace(/v\.value/g, 'v.value[' + index + ']');
                    markup = markup.replace(/v\.config/g, 'v.config[' + index + ']');
                    markup = '<div>' + markup + '</div>';

                    cmp.set('v.config[' + index + ']', {});

                    window.$Utils.create(markup, cmp)
                        .then(function(newComps) {
                            var container = cmp.find("shadow");
                            var body = container.get("v.body");
                            body.push(newComps[0]);
                            container.set("v.body", body);

                            return new Promise(function(resolve, reject) {
                                var t1 = window.setInterval($A.getCallback(function() {
                                    var container = cmp.find("shadow");

                                    var instance = {
                                        index: index,
                                        node: container.getElement().childNodes[0],
                                    };

                                    if(!instance.node) {
                                        return;
                                    }

                                    instance.show = $A.getCallback(function(parentNode, value, onValueChange) {
                                        if(!parentNode) {
                                            var hidden = document.getElementsByClassName('hiddenShadows')[0];
                                            if(!hidden) {
                                                hidden = document.createElement('div');
                                                hidden.classList.add('hiddenShadows');
                                                hidden.style.display = 'none';
                                                document.body.appendChild(hidden);
                                            }
                                            parentNode = hidden;
                                        }

                                        isCreating = false;
                                        window.clearInterval(t);
                                        parentNode.appendChild(this.node);
                                        cmp.set('v.value[' + this.index + ']', value);

                                        if(onValueChange) {
                                            this.onValueChange = onValueChange;
                                        }
                                    });

                                    instance.setValue = $A.getCallback(function(value) {
                                        cmp.set('v.value[' + this.index + ']', value);
                                    });

                                    instance.getValue = $A.getCallback(function(value) {
                                        return cmp.get('v.value[' + this.index + ']');
                                    });

                                    instance.getConfig = $A.getCallback(function(name) {
                                        var config = cmp.get('v.config[' + this.index + ']');
                                        return config && config[name];
                                    });

                                    instance.setConfig = $A.getCallback(function(name, value) {
                                        var config = cmp.get('v.config[' + this.index + ']');
                                        if(config) {
                                            config[name] = value;
                                            cmp.set('v.config[' + this.index + ']', config);
                                        }
                                    });

                                    window.$Shadow.instances[index] = instance;
                                    window.clearInterval(t1);
                                    resolve(instance);
                                }), 50);
                            });
                        })
                        .then(res, rej);
                }), 50);
            }));
        });
    },

    renderPreact: function(cmp) {
        var helper = this;
        var container = cmp.find("container");
        var name = cmp.get("v.name");
        var preactlet = cmp.get("v.preactlet");
        if(name) {
            var renderer = window.PreactStore.getComponent(name);
            if(renderer) {
                var props = cmp.get("v.props") || {};
                var preactContainer = helper.getPreactContainerName(cmp);

                var doRender = function(globalData) {
                    const delayList = window.$Config.getValue('/System/UI/preactContainers/priority/delayList');
                    const delay = _.defaultTo(window.$Config.getValue('/System/UI/preactContainers/priority/delay'), 200);
                    if(delayList) {
                        const preactContainerDelayList = _.split(delayList, ',');
                        if(_.includes(preactContainerDelayList, name)) {
                            window.setTimeout(() => {
                                doRenderFinally(globalData);
                            }, delay);
                        }
                        else {
                            return doRenderFinally(globalData);
                        }
                    }
                    else {
                        return doRenderFinally(globalData);
                    }
                };

                var doRenderFinally = function(globalData) {
                    try {
                        renderer(container.getElement(), _.assign(props, { preactContainer: preactContainer, }), $A.getCallback(function(data) {
                            helper.fireEvent(cmp, "onPreactEvent", data);
                        }), globalData);
                    }
                    catch(e) {
                        window.$Utils.getCurrentApp().toast({
                            position: 'fixed-one',
                            variant: 'error',
                            content: e.message,
                        });
                    }

                    helper.fireEvent(cmp, 'onPreactReady', {});
                };

                const globalData = {
                    preactContainer,
                };

                if(props.recordId && window.$ActionService.DataLightningExtension) {
                    window.$ActionService.DataLightningExtension.invoke('getRecordTypeName', {
                        recordId: props.recordId,
                    }).then(recordTypeName => {
                        globalData.recordId = props.recordId;
                        globalData.recordTypeName = recordTypeName;

                        doRender(globalData);
                    }, error => {
                        doRender(globalData);
                    });
                }
                else {
                    doRender(globalData);
                }
            }
            else {
                window.$Utils.getCurrentApp().toast({
                    variant: 'error',
                    content: 'No valid preact renderer could be found',
                });
            }
        }
        else if(preactlet) {
            container.getElement().innerHTML = "";
            window.PreactStore.renderPreactlet(preactlet, container.getElement());
        }
    },

    handlePropsChange: function(cmp) {
        if(!cmp._initialized) {
            return;
        }

        window.$Utils.setRegionWidth(cmp.get('v.width'));

        var helper = this;
        var waitForList = _.chain(cmp.get("v.waitFor")).
            split(",").
            map(v => _.trim(v)).
            compact().
            value();
        if(!cmp.timer) {
            cmp.timer = window.setInterval(function() {
                if(window.$Utils.getCurrentApp() && helper.servicesReady(waitForList)) {
                    window.clearInterval(cmp.timer);
                    cmp.timer = undefined;
                    if(window.$ActionService.DataLightningExtension && !window.$SystemConfig) {
                        var configItems = window.$Storage.load('ConfigItems');

                        if(configItems) {
                            window.$SystemConfig = configItems;
                            helper.renderPreact(cmp);
                        }

                        window.$ActionService.DataLightningExtension.invoke('getConfigItems').then(function(items) {
                            window.$SystemConfig = items;
                            window.$Storage.save('ConfigItems', null, items);

                            if(!configItems) {
                                helper.renderPreact(cmp);
                            }
                        });
                    }
                    else {
                        helper.renderPreact(cmp);
                    }
                }
            }, 1);
        }
    },

    handleValueChange: function(cmp, event) {
        _.each(window.$Shadow.instances, function(instance, index) {
            var value = cmp.get('v.value');
            if(instance && _.isFunction(instance.onValueChange)) {
                instance.onValueChange(value[index]);
            }
        });
    },

    handleApplicationEvent: function(cmp, event) {
        window.$Utils.receiveAppEvent(event);
    },

    registerPreactlet: function(cmp, event) {
        var args = event.getParam("arguments");
        if(args) {
            window.PreactStore.registerPreactlet(args.name, args.preactlet);
        }
    },

    wrap: function(cmp, event) {
        var args = event.getParam("arguments");
        if(args) {
            return window.PreactStore.wrap(args.markup);
        }
    },

    requireComponent: function(cmp, event) {
        var args = event.getParam("arguments");
        if(args) {
            var name = args.name;
            var preactletManager = window.PreactStore.getPreactletManager();
            return preactletManager.getRenderingComponent(name);
        }
    },

    handleSave: function(cmp, event) {
        var monitor = window.$Utils.getUnsavedChangesMonitor();
        if(_.isFunction(monitor.onSave)) {
            var ret = monitor.onSave();
            var p = null;
            if(_.isFunction(ret.then)) {
                p = ret;
            }
            else {
                p = Promise.resolve(ret);
            }

            return p.then(function(success) {
                if(success) {
                    window.$Utils.markUnsaved(false);
                }
                else {
                    window.$Utils.markUnsaved(true);
                }
            });
        }
    },

    requireApiProxy: function(cmp, event) {
        var apiProxyEnabled = cmp.get('v.apiProxyEnabled');
        if(apiProxyEnabled) {
            return Promise.resolve(cmp.find('apiProxy'));
        }
        else {
            cmp.set('v.apiProxyEnabled', true);

            return new Promise((resolve, reject) => {
                const pid = window.setInterval(() => {
                    const apiProxy = cmp.find('apiProxy');
                    if(apiProxy) {
                        window.clearInterval(pid);
                        resolve(apiProxy);
                    }
                }, 100);
            });
        }
    },

    requireLibrary: function(cmp, event) {
        var args = event.getParam("arguments");
        if(args) {
            var libraryNames = args.libraryNames;
            const libraryCache = cmp._libraryCache || {};
            const allLoaded = _.every(libraryNames, libraryName => {
                return !!libraryCache[libraryName];
            });
            if(allLoaded) {
                return Promise.resolve(null);
            }

            const components = _.chain(libraryNames)
                .map(libraryName => {
                    const library = window.$CustomLibraries[libraryName];
                    if(library) {
                        return {
                            name: 'ltng:require',
                            attrs: {
                                styles: _.chain(library.styles).map(style => window.$A.get('$Resource.ctcPropertyLightning') + style).join(',').value(),
                                scripts: _.chain(library.scripts).map(script => window.$A.get('$Resource.ctcPropertyLightning') + script).join(',').value(),
                            },
                        };
                    }
                })
                .compact()
                .value();

            return window.$Utils.createComponents(components).then(function(newComps) {
                var body = cmp.get("v.body");
                body.push(...newComps);
                cmp.set("v.body", body);

                return new Promise((resolve, reject) => {
                    const pid = window.setInterval(() => {
                        const allReady = _.every(libraryNames, libraryName => {
                            const library = window.$CustomLibraries[libraryName];
                            if(library && _.isFunction(library.validate)) {
                                return library.validate();
                            }

                            return true;
                        });

                        if(allReady) {
                            window.clearInterval(pid);
                            cmp._libraryCache = cmp._libraryCache || {};
                            _.forEach(libraryNames, libraryName => {
                                cmp._libraryCache[libraryName] = true;
                            });

                            resolve(null);
                        }
                    }, 50);
                });
            });
        }
    },
})
