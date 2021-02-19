({
    liveBindingAttrs: ["name", "value", "disabled", "readOnly", "required", "tabIndex", "accessKey", "placeholder"],

    SECOND: 1000,

    MINUTE: 60000,

    HOUR: 3600000,

    appendToChild: function(cmp) {
        var helper = this;
        var elem = cmp.getElement();
        var popup = cmp.find("popup").getElement();
        popup.style.position = "absolute";
        document.body.appendChild(popup);
        cmp._popup = popup;
        this.adjustPopupPosition(cmp);

        cmp._adjustPopupPosition = $A.getCallback(function() {
            if(!cmp.get("v.privateExpanded")) {
                return;
            }
            helper.adjustPopupPosition(cmp);
        });

        window.addEventListener("resize", cmp._adjustPopupPosition, false);
        window.addEventListener("scroll", cmp._adjustPopupPosition, true);
    },

    adjustPopupPosition: function(cmp) {
        var elem = cmp.getElement();
        var popup = cmp._popup;
        var pos = window.$Utils.getPositionFromBody(elem);
        popup.style.left = pos.left + "px";
        popup.style.right = pos.right + "px";
        popup.style.top = pos.top + elem.getBoundingClientRect().height + "px";
    },

    doDestroy: function(cmp, event) {
        // Ommit removing child here because of lightning lazy handling of components
        window.removeEventListener("resize", cmp._adjustPopupPosition, false);
        window.removeEventListener("scroll", cmp._adjustPopupPosition, true);
    },

    formatTime: function(time) {
        var hours = _.floor(time / this.HOUR);
        var minutes = (time - hours * this.HOUR) / this.MINUTE;
        var am = hours >= 12 ? "pm" : "am";
        return hours + ":" + _.padStart(minutes, 2, '0') + am;
    },

    handleTimeValueChange: function(component, event) {
        var time = component.get("v.value") || 0;
        var value = this.formatTime(time);
        component.set("v.time", value);
    },

    generateOptions: function(component) {
        var options = component.get("v.options");
        if(_.isEmpty(options)) {
            options = [];
            var startTime = component.get("v.startTime") || 6 * 60;
            var endTime = component.get("v.endTime") || 18 * 60;
            var interval = component.get("v.interval") || 60;
            for(var i = startTime; i <= endTime; i += interval) {
                var value = i * this.MINUTE;
                options.push({
                    label: this.formatTime(value),
                    value: value,
                });
            }
            component.set("v.options", options);
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
        if (component.get("v.time") !== value) {
            component.set("v.validity", domNode.validity);
            component.set("v.time", value);
        }
    },

    onClickOutSideListener: function(component, event) {
        var isInsideTimePicker = window.$Utils.findFromEvent(event, "data-timepicker") === component.getGlobalId();
        if(!isInsideTimePicker) {
            this.hideDropdown(component);
            window.removeEventListener("click", component._clickListener);
        }
    },

    parseTime: function(input) {
        if(_.endsWith(input, "am") || _.endsWith(input, "pm")) {
            input = input.substring(0, input.length - 2);
        }
        var items = _.split(input, ":");
        var hours = _.parseInt(items[0]);
        var minutes = _.parseInt(items[1]);
        var value = (hours * 60 + minutes) * this.MINUTE;

        return value;
    },

    handleManualInput: function(component) {
        var input = component.get("v.time");
        var value = this.parseTime(input);
        var options = component.get("v.options");
        var selectedOption = _.find(options, ["value", value]);
        if(selectedOption) {
            _.each(options, function(option) {
                if(option.value === selectedOption.value) {
                    option.selected = true;
                    component.set("v.time", option.label);
                    component.set("v.value", option.value);
                }
                else {
                    option.selected = false;
                }
            });
            component.set("v.options", options);
            this.fireEvent(component, "onchange");
        }
    },

    handleNodeBlur: function(component, domNode, event) {
        this.leaveInteracting(component);
        this.handleManualInput(component);
        this.fireEvent(component, "onblur");
    },

    handleNodeFocus: function(component, domNode, event) {
        this.enterInteracting(component);
        this.showDropdown(component);
        var helper = this;
        component._clickListener = $A.getCallback(function(event) {
            helper.onClickOutSideListener(component, event);
        });
        window.addEventListener("click", component._clickListener);
        this.fireEvent(component, "onfocus");
    },

    showDropdown: function(component) {
        this.adjustPopupPosition(component);
        component.set("v.privateExpanded", true);
    },

    hideDropdown: function(component) {
        component.set("v.privateExpanded", false);
    },

    bindInput: function(component) {
        var helper = this;
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();
        this.liveBindingAttrs.forEach(function(domAttrName) {
            var expression = 'v.' + (domAttrName === "value" ? "time" : domAttrName.toLowerCase());

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

    handleNodeClick: function(component, event) {
        var index = _.parseInt(window.$Utils.findFromEvent(event, "data-index"));
        if(!_.isUndefined(index)) {
            var options = component.get("v.options");
            _.each(options, function(option, idx) {
                if(index === idx) {
                    option.selected = true;
                    component.set("v.time", option.label);
                    component.set("v.value", option.value);
                }
                else {
                    option.selected = false;
                }
            });
            component.set("v.options", options);
            this.fireEvent(component, "onchange");
            this.hideDropdown(component);
        }
    },

    unbindInput: function(component) {
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();
        dom.releaseNode(domNode);
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
