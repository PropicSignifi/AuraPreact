({
    liveBindingAttrs: ["name", "value", "disabled", "readOnly", "required", "tabIndex", "accessKey"],

    initializeValue: function(component) {
        var domNode = component.find('private').getElement();
        var compValue = component.get('v.value');

        if (compValue === undefined) {
            component.set('v.value', domNode.value);
        }

        var dataProducer = component.get("v.dataProducer");
        if(dataProducer) {
            window.$DataProducer.produce(dataProducer).then(function(data) {
                component.set("v.options", data);
            });
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
                var helper = this;
                // Avoid race condition with dynamic option generation
                window.setTimeout($A.getCallback(function() {
                    helper.domLibrary.dom.updateAttr(domNode, domAttrName, value);
                    component.set('v.validity', domNode.validity);
                }), 20);
            }
        } else {
            this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
        }
    },

    onNodeValueChange: function(component, domNode, event) {
        this.interacting(component);
        var value = domNode.value;
        var action;
        if (component.get("v.value") !== value) {
            component.set("v.validity", domNode.validity);
            component.set("v.value", value);
            this.fireEvent(component, "onchange");
        }
    },

    handleNodeBlur: function(component, domNode, event) {
        this.leaveInteracting(component);
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
            var expression = 'v.' + domAttrName.toLowerCase();

            if(domAttrName === "value") {
                window.setTimeout($A.getCallback(function() {
                    dom.updateAttr(domNode, domAttrName, component.get(expression));
                }), 20);
            }
            else {
                dom.updateAttr(domNode, domAttrName, component.get(expression));
            }

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
})
