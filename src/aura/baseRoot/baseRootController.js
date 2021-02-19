({
    doInit : function(component, event, helper) {
        let appId = '';
        const userId = $A.get('$SObjectType.CurrentUser.Id');
        const personalizedApp = $A.get('$Resource.ctcPropertyLightningApp_' + userId);
        if(personalizedApp) {
            appId = userId;
        }
        const cmpType = component.getConcreteComponent().getType().split(':')[1];
        const concreteApp = $A.get('$Resource.ctcPropertyLightningApp_' + cmpType);
        if(concreteApp) {
            appId = cmpType;
        }

        component.set('v.personalized', appId);
        component.set('v.personalizedChecked', true);
        component._initialized = true;
        helper.checkReady(component);
        helper.addDirtyCheck(component);
    },

    onScriptsLoaded : function(component, event, helper) {
        component._scriptsLoaded = component._scriptsLoaded || [];
        component._scriptsLoaded.push(true);
        helper.checkReady(component);
    },

    onLocationChange : function(component, event, helper) {
        if(window.$Utils) {
            window.$Utils.fireEvent(component, "$destroy");
        }
    },

    alert: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            component.set("v.privateAlert", _.assign({
                header: "Are you sure?",
                onSaveText: "Yes",
                onCancelText: "Cancel",
            }, args.options));

            const context = {
                busyloading: function(p) {
                    helper.modalLoadingUntil(component, p);
                },
            };

            if(_.isFunction(args.options.renderModalContent) && window.$Utils.isNonDesktopBrowser() && !args.options.forceModal) {
                const body = component.find('body');
                $A.util.addClass(body, 'slds-hide');

                const mobileModal = component.find('mobileModal');
                $A.util.removeClass(mobileModal, 'slds-hide');

                const modalContent = component.find('mobileModalContent');
                args.options.renderModalContent(modalContent.getElement(), context);
            }
            else {
                component.find("alertModal").show();

                if(_.isFunction(args.options.renderModalContent)) {
                    const modalContent = component.find('modalContent');
                    args.options.renderModalContent(modalContent.getElement(), context);
                }
                else {
                    const modalContent = component.find('modalContent');
                    modalContent.getElement().innerHTML = '';
                }
            }
        }
    },

    popover: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            window.setTimeout($A.getCallback(function() {
                component.set("v.privatePopover", _.assign({
                    visible: true,
                    variant: 'base',
                    alignment: 'bottom-right',
                    width: 'medium',
                }, args.options));

                if(!helper.popoverInitialized) {
                    const popover = component.find('popover');
                    document.body.appendChild(popover.getElement());
                    helper.popoverInitialized = true;
                }

                helper.computePrivatePopoverClassnames(component);

                helper.adjustPopupPosition(component);

                const context = {
                };

                if(_.isFunction(args.options.renderPopoverContent)) {
                    component.set('v.popoverLoading', true);

                    window.setTimeout(() => {
                        const popoverContent = component.find('popoverContent');
                        args.options.renderPopoverContent(popoverContent.getElement(), context);

                        component.set('v.popoverLoading', false);
                    }, 10);
                }
                else {
                    const popoverContent = component.find('popoverContent');
                    popoverContent.getElement().innerHTML = '';
                }
            }), 0);
        }
    },

    toast: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            if(window.$Utils.isNonDesktopBrowser() || (window.$Utils.isInOneApp() && !args.options.position)) {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    type: args.options.variant || 'info',
                    message: args.options.content,
                });
                toastEvent.fire();
            }
            else {
                component.set("v.privateToast", _.assign({
                    visible: true,
                    variant: "info",
                }, args.options));
            }
        }
    },

    onAlertSave: function(component, event, helper) {
        var alert = component.get("v.privateAlert");
        var p = Promise.resolve(null);
        if(_.isFunction(alert.onSave)) {
            p = Promise.resolve(alert.onSave());
        }

        helper.modalLoadingUntil(
            component,
            p.then(result => {
                if(false === result) {
                    return;
                }

                helper.hideModal(alert, component);
            })
        );
    },

    onAlertOther: function(component, event, helper) {
        var alert = component.get("v.privateAlert");
        var p = Promise.resolve(null);
        if(_.isFunction(alert.onOther)) {
            p = Promise.resolve(alert.onOther());
        }

        helper.modalLoadingUntil(
            component,
            p.then(result => {
                if(false === result) {
                    return;
                }

                helper.hideModal(alert, component);
            })
        );
    },

    onAlertCancel: function(component, event, helper) {
        var alert = component.get("v.privateAlert");
        var p = Promise.resolve(null);
        if(_.isFunction(alert.onCancel)) {
            p = Promise.resolve(alert.onCancel());
        }

        helper.modalLoadingUntil(
            component,
            p.then(result => {
                if(false === result) {
                    return;
                }

                helper.hideModal(alert, component);
            })
        );
    },

    onPopoverCancel: function(component, event, helper) {
        helper.hidePopover(component);
    },

    getChildren: function(component, event, helper) {
        var children = component.get("v.privateChildren") || [];
        children = _.filter(children, function(child) {
            return child.isValid && child.isValid();
        });
        component.set("v.privateChildren", children);
        return children;
    },

    onPreactReady: function(component, event, helper) {
        helper.onPreactReady(component);
    },

    heartbeat: function(component, event, helper) {
        var data = event.getParam("data");
        var child = $A.getComponent(data.source.getGlobalId());
        var self = $A.getComponent(component.getGlobalId());
        if(child === self) {
            return;
        }
        else {
            event.stopPropagation();
            var privateChildren = component.get("v.privateChildren") || [];
            if(!_.includes(privateChildren, child)) {
                privateChildren.push(child);
            }
            component.set("v.privateChildren", privateChildren);
        }
    },

    startLoading: function(component, event, helper) {
        component.set('v.loadingLocal', component.get('v.loadingLocal') + 1);
    },

    stopLoading: function(component, event, helper) {
        component.set('v.loadingLocal', component.get('v.loadingLocal') - 1 >= 0 ? component.get('v.loadingLocal') - 1 : 0);
    },

    computePrivatePopoverClassnames: function(component, event, helper) {
        helper.computePrivatePopoverClassnames(component);
    }
})
