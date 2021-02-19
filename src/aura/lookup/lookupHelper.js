({
    liveBindingAttrs: ["name", "value", "disabled", "required", "tabIndex", "accessKey"],

    initializeValue: function(component) {
        this.handleValueChange(component);
    },

    doCustomValidation: function(component) {
        var required = component.get("v.required");
        var validity = component.get("v.validity");
        if(validity) {
            if (required && !component.get("v.privateValue")) {
                validity.customValueMissing = true;
            }
            else {
                validity.customValueMissing = false;
            }
        }
    },

    computeClassNames: function(component) {
        var value = ['slds-form-element'];

        var classAttr = component.get('v.class');
        if (classAttr) {
            value.push(classAttr);
        }
        var required = component.get('v.required');
        if (required) {
            value.push('is-required');
        }
        if (!this.isInteracting(component) && !this.isInputValid(component)) {
            value.push('slds-has-error');
        }
        if (component.get('v.variant') === 'label-hidden') {
            value.push('slds-form--inline');
        }

        component.set('v.privateComputedClass', value.join(' '));
    },

    updateAriaDescribedBy: function(cmp) {
        var element = cmp.find('private').getElement();
        if (!element) {
            return;
        }
        if (cmp.get('v.privateHelpMessage')) {
            this.domLibrary.dom.updateAttr(element, 'aria-describedby', cmp.getGlobalId() + '-desc');
        } else {
            this.domLibrary.dom.removeAttr(element, 'aria-describedby');
        }
    },

    updateHelpMessage: function(component) {
        var validity = component.get('v.validity');
        var message = this.validityLibrary.validity.getMessage(component, validity);
        component.set('v.privateHelpMessage', message);
        this.updateAriaDescribedBy(component);
    },

    onAttrChangeFromOutside: function(component, domNode, domAttrName, event) {
        var value = component.get(event.getParam('expression'));

        if (domAttrName === 'value') {
            if (domNode.value !== value) {
                this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
                component.set('v.validity', domNode.validity);
            }
        } else {
            this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
        }
    },

    onNodeValueChange: function(component, domNode, event) {
        this.interacting(component);
        var value = domNode.value;
        var action;
        if (component.get("v.privateValue") !== value) {
            component.set("v.validity", domNode.validity);
            component.set("v.privateValue", value);
            this.fireEvent(component, "onchange");
        }
    },

    handleNodeBlur: function(component, domNode, event) {
        this.leaveInteracting(component);
        this.showHelpMessage(component);
        this.fireEvent(component, "onblur");
    },

    handleNodeFocus: function(component, domNode, event) {
        this.enterInteracting(component);
        this.fireEvent(component, "onfocus");
    },

    bindInput: function(component) {
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();

        this.liveBindingAttrs.forEach(function(domAttrName) {
            var expression = 'v.' + (domAttrName === "value" ? "privateValue" : domAttrName.toLowerCase());

            dom.updateAttr(domNode, domAttrName, component.get(expression));

            component.addValueHandler({
                event: 'change',
                value: expression,
                method: this.onAttrChangeFromOutside.bind(this, component, domNode, domAttrName)
            });
        }, this);
        dom.addChangeEvent(domNode, $A.getCallback(this.onNodeValueChange.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onFocus', $A.getCallback(this.handleNodeFocus.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onBlur', $A.getCallback(this.handleNodeBlur.bind(this, component, domNode)));
        component.set('v.validity', domNode.validity);
        return domNode;
    },

    unbindInput: function(component) {
        var domNode = component.find('private').getElement();
        this.domLibrary.dom.releaseNode(domNode);
    },

    setFocusOnDOMNode: function(component) {
        var domNode = component.find('private').getElement();
        domNode.focus();
    },

    showHelpMessageIfInvalid: function(component) {
        this.showHelpMessage(component);
    },

    showHelpMessage: function(component) {
        this.doCustomValidation(component);
        this.computeClassNames(component);
        this.updateHelpMessage(component);
    },

    isInputValid: function(component) {
        return this.validityLibrary.validity.isValid(component.get('v.validity'));
    },

    isInteracting: function(component) {
        return component._interactingState.isInteracting();
    },

    initializeInteractingState: function(component) {
        var InteractingState = this.interactingStateLibrary.InteractingState;
        component._interactingState = new InteractingState({
            duration: 2000
        });
        component._interactingState.onleave($A.getCallback(function() {
            this.showHelpMessage(component);
        }
        .bind(this)));
    },

    interacting: function(component) {
        component._interactingState.interacting();
    },

    enterInteracting: function(component) {
        component._interactingState.enter();
    },

    leaveInteracting: function(component) {
        component._interactingState.leave();
    },

    onLookup: function(component, event) {
        var id = component.get("v.privateId");
        var disabled = component.get("v.disabled");
        if(disabled) {
            return;
        }
        if(id) {
            component.set("v.value", null);
            component.set("v.privateId", null);
            component.set("v.privateValue", null);
            this.showHelpMessage(component);
        }
        else {
            this.fireEvent(component, "onlookup", {
                event: event,
            });
        }
    },

    handleValueChange: function(cmp, event) {
        var value = cmp.get("v.value");
        if(value) {
            cmp.set("v.privateId", value.id);
            cmp.set("v.privateValue", value.value);
        }
        else {
            cmp.set("v.privateValue", "");
        }
    },

    setObject: function(component, event) {
        var args = event.getParam("arguments");
        if(args) {
            var object = args.object;
            if(object) {
                component.set("v.value", object);
                component.set("v.privateValue", object.value);
                component.set("v.privateId", object.id);
            }
            else {
                component.set("v.value", null);
                component.set("v.privateValue", null);
                component.set("v.privateId", null);
            }
            this.showHelpMessage(component);
        }
    },
})
