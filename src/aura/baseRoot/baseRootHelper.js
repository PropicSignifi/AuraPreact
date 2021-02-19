({
    popoverInitialized: false,

    isReady: function(component) {
        return component._initialized && component._scriptsLoaded && component._scriptsLoaded.length === 4;
    },

    checkReady : function(component) {
        if(this.isReady(component) && !component._initFired) {
            component.set("v.loading", false);
            window.$Utils.setCurrentApp(component);
            component.set("v.privateAlert", {});
            window.$Utils.fireEvent(component, "$init");
            component._initFired = true;

            this.onInit(component);
        }
    },

    addDirtyCheck: function(component) {
        window.addEventListener("beforeunload", function(e) {
            if(window.$Utils) {
                var msgs = window.$Utils.checkDirty(component);
                var ret = !_.isEmpty(msgs) ? 'You have unsaved changes. Do you want to discard?' : '';
                if(ret) {
                    e.returnValue = ret;
                    return ret;
                }
            }
        });
    },

    setComputed: function(cmp, computedProperties) {
        var handlers = window.$Computed.getComputedChangeHandlers(cmp, 'computed', computedProperties);
        _.each(handlers, function(handler, name) {
            if(name) {
                cmp.addValueHandler({
                    event: 'change',
                    value: 'v.' + name,
                    method: handler,
                });
            }

            handler();
        });
    },

    onPreactReady: function(cmp) {
        window.$Utils.fireEvent(cmp, '$ready', {});
    },

    hideModal: function(alert, component) {
        if(_.isFunction(alert.renderModalContent) && window.$Utils.isNonDesktopBrowser() && !alert.forceModal) {
            const body = component.find('body');
            $A.util.removeClass(body, 'slds-hide');

            const mobileModal = component.find('mobileModal');
            $A.util.addClass(mobileModal, 'slds-hide');
        }
        else {
            alert.visible = false;
            component.find("alertModal").hide();
            component.set("v.privateAlert", alert);
        }
    },

    modalLoadingStart: function(component) {
        component.set('v.mobileModalLoading', true);
        component.set('v.modalLoading', true);
    },

    modalLoadingStop: function(component) {
        component.set('v.mobileModalLoading', false);
        component.set('v.modalLoading', false);
    },

    modalLoadingUntil: function(component, p) {
        var helper = this;
        helper.modalLoadingStart(component);

        p.then($A.getCallback(function() {
            helper.modalLoadingStop(component);
        }), $A.getCallback(function() {
            helper.modalLoadingStop(component);
        }));
    },

    hidePopover: function(cmp) {
        const privatePopover = cmp.get('v.privatePopover');
        privatePopover.visible = false;
        cmp.set('v.privatePopover', privatePopover);

        const popoverContent = cmp.find('popoverContent');
        if(popoverContent) {
            popoverContent.getElement().innerHTML = '';
        }
    },

    onInit: function(cmp) {
        const helper = this;

        window.addEventListener("click", $A.getCallback(function(e) {
            const privatePopover = cmp.get('v.privatePopover');
            if(privatePopover && privatePopover.visible) {
                const isInside = window.$Utils.findFromEvent(e, "data-popup-source") === 'app-popover';
                if(!isInside) {
                    helper.hidePopover(cmp);
                }
            }
        }));

        window.addEventListener("resize", $A.getCallback(function(e) {
            helper.adjustPopupPosition(cmp);
        }), false);

        window.addEventListener("scroll", $A.getCallback(function(e) {
            helper.adjustPopupPosition(cmp);
        }), true);

        window.addEventListener("touchmove", $A.getCallback(function(e) {
            helper.adjustPopupPosition(cmp);
        }), true);

        helper.computePrivatePopoverClassnames(cmp);
    },

    computePopupStyle: function(cmp, pos, elem) {
        const privatePopover = cmp.get('v.privatePopover');
        const rect = elem.getBoundingClientRect();

        const popupStyle = {
            position: "absolute",
        };

        const nubbingRadius = 15;

        const alignment = privatePopover.alignment;
        switch(alignment) {
            case 'left':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + (rect.height / 2) + "px";
                break;
            case 'left-top':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top - nubbingRadius * 2 / 3 + "px";
                break;
            case 'left-top-corner':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 1 / 3 + "px";
                break;
            case 'left-bottom':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 8 / 3 + "px";
                break;
            case 'left-bottom-corner':
                popupStyle.left = pos.left + rect.width + nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 5 / 3 + "px";
                break;
            case 'right':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + (rect.height / 2) + "px";
                break;
            case 'right-top':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top - nubbingRadius * 2 / 3 + "px";
                break;
            case 'right-top-corner':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 1 / 3 + "px";
                break;
            case 'right-bottom':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 8 / 3 + "px";
                break;
            case 'right-bottom-corner':
                popupStyle.left = pos.left - nubbingRadius + "px";
                popupStyle.top = pos.top + nubbingRadius * 5 / 3 + "px";
                break;
            case 'top':
                popupStyle.left = pos.left + rect.width / 2 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-left':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-left-corner':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-right':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'top-right-corner':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top + rect.height + nubbingRadius + "px";
                break;
            case 'bottom':
                popupStyle.left = pos.left + rect.width / 2 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-left':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-left-corner':
                popupStyle.left = pos.left + rect.width / 2 - nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-right':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 5 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            case 'bottom-right-corner':
                popupStyle.left = pos.left + rect.width / 2 + nubbingRadius * 2 / 3 +  "px";
                popupStyle.top = pos.top - nubbingRadius + "px";
                break;
            default:
                break;
        }

        return popupStyle;
    },

    adjustPopupPosition: function(cmp) {
        const privatePopover = cmp.get('v.privatePopover');
        const popover = cmp.find('popover');
        if(!popover) {
            return;
        }
        const popoverElement = popover.getElement();

        if(!privatePopover || !privatePopover.visible) {
            return;
        }

        const elem = privatePopover.referenceElement;
        if(!elem) {
            return;
        }

        const pos = window.$Utils.getPositionFromBody(elem);
        const popupStyle = this.computePopupStyle(cmp, pos, elem);

        _.forEach(popupStyle, (value, key) => {
            popoverElement.style[key] = value;
        });
    },

    computePrivatePopoverClassnames: function(cmp) {
        const privatePopover = cmp.get('v.privatePopover') || {};
        const alignment = privatePopover.alignment;
        const width = privatePopover.width;
        const variant = privatePopover.variant;
        const visible = privatePopover.visible;

        const privatePopoverClassnames = window.$Utils.classnames(
            "slds-popover",
            `slds-nubbin_${alignment} popover-${alignment}`,
            `slds-popover_${width}`,
            {
                'slds-popover_error': variant === 'error',
                'slds-popover_warning': variant === 'warning',
                'slds-popover_walkthrough': variant === 'feature' || variant === 'walkthrough',
                'slds-popover_feature': variant === 'feature',
            },
            {
                'slds-hide': !visible,
            }
        );
        cmp.set('v.privatePopoverClassnames', privatePopoverClassnames);

        const privatePopoverButtonClassnames = window.$Utils.classnames(
            "slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close",
            {
                "slds-button_icon-inverse": variant === 'error' || variant === 'feature',
            }
        );
        cmp.set('v.privatePopoverButtonClassnames', privatePopoverButtonClassnames);
    }
})
