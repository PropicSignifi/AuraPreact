({
    liveBindingAttrs: ["name", "value", "disabled", "readOnly", "required", "tabIndex", "accessKey", "placeholder"],

    appendToChild: function(cmp) {
        var helper = this;
        var elem = cmp.getElement();
        var popup = cmp.find("popup").getElement();
        popup.style.position = "absolute";
        document.body.appendChild(popup);
        cmp._popup = popup;
        this.adjustPopupPosition(cmp);

        cmp._adjustPopupPosition = $A.getCallback(function() {
            if(!cmp.get("v.privateVisible")) {
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

    initializeValue: function(component) {
        this.handleValueChange(component);

        var helper = this;
        var wait = component.get("v.wait");
        component._loadSuggestions = _.debounce($A.getCallback(function() {
            helper.loadSuggestions(component);
        }), wait);
    },

    initializeComputed: function(cmp) {
        this.setComputed(cmp, {
            template: function() {
                return '<c:privateSuggestionBoxItem option="{! v.object }" index="{! v.index }" onclick="{! cmp.c.onClickItem }"/>';
            },
            providers: function() {
                return {
                    cmp: cmp,
                };
            },
        });
    },

    handleValueChange: function(cmp) {
        var value = cmp.get("v.value");
        if(!value) {
            cmp.set("v.privateValue", "");
        }
        else {
            cmp.set("v.privateValue", value.value);
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
            this.computeOptions(component);
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
        }
    },

    handleNodeBlur: function(component, domNode, event) {
        this.leaveInteracting(component);
        component.set("v.privateFocused", false);
        this.fireEvent(component, "onblur");
    },

    handleNodeFocus: function(component, domNode, event) {
        this.enterInteracting(component);
        component.set("v.privateFocused", true);
        this.showDropdown(component);
        this.fireEvent(component, "onfocus");
    },

    bindInput: function(component) {
        var helper = this;
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();
        dom.updateAttr(domNode, "autocomplete", "off");
        dom.updateAttr(domNode, 'onKeyUp', $A.getCallback(function() {
            helper.showDropdown(component);
        }));
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

    computeOptions: function(cmp) {
        var value = cmp.get("v.privateValue");
        var privateOptions = cmp.get("v.privateOptions");
        var privateFilteredOptions = _.chain(privateOptions).
            filter(function(option) {
                return !value || (option.value && _.toLower(option.value).includes(_.toLower(value)));
            }).
            value();
        cmp.set("v.privateFilteredOptions", privateFilteredOptions);
        var itemList = cmp.find("itemList");
        cmp.set("v.privateIsRendering", true);
        itemList.renderItems(function() {
            cmp.set("v.privateIsRendering", false);
        });
    },

    loadSuggestions: function(cmp) {
        var helper = this;
        var getSuggestions = cmp.get("v.getSuggestions");
        var value = cmp.get("v.privateValue");
        var cache = cmp.get("v.cache");
        var privateOptions = cmp.get("v.privateOptions");
        if(cache && !_.isEmpty(privateOptions)) {
            helper.computeOptions(cmp);
        }
        else {
            if(_.isFunction(getSuggestions)) {
                var result = getSuggestions(value);
                if(_.isFunction(result.then)) {
                    cmp.set("v.privateLoadingOptions", true);
                    result.then($A.getCallback(function(data) {
                        cmp.set("v.privateOptions", data);
                        helper.computeOptions(cmp);
                        cmp.set("v.privateLoadingOptions", false);
                    }));
                }
                else {
                    cmp.set("v.privateOptions", result);
                    helper.computeOptions(cmp);
                    cmp.set("v.privateLoadingOptions", false);
                }
            }
        }
    },

    showDropdown: function(cmp) {
        var helper = this;
        var value = cmp.get("v.privateValue");
        if(_.size(value) < cmp.get("v.minlength")) {
            cmp.set("v.privateVisible", false);
        }
        else {
            this.adjustPopupPosition(cmp);
            cmp.set("v.privateVisible", true);

            if(!cmp._clickListener) {
                cmp._clickListener = $A.getCallback(function(event) {
                    helper.onClickOutsideSuggestionBox(cmp, event);
                });

                window.addEventListener("click", cmp._clickListener);
            }

            cmp._loadSuggestions();
        }
    },

    hideDropdown: function(cmp) {
        cmp.set("v.privateVisible", false);

        window.removeEventListener("click", cmp._clickListener);
        cmp._clickListener = null;
    },

    onClickOutsideSuggestionBox: function(component, event) {
        var isInSuggestionBox = window.$Utils.findFromEvent(event, "data-suggestion-box") === component.getGlobalId();

        if(!isInSuggestionBox) {
            this.hideDropdown(component);
        }
    },

    onClickItem: function(cmp, event) {
        var index = event.getParam('data').index;
        if(!isNaN(index)) {
            var options = cmp.get("v.privateFilteredOptions");
            var option = options[index];
            cmp.set("v.privateValue", option.value);
            cmp.set("v.privateId", option.id);
            cmp.set("v.value", option);
            cmp.set("v.readonly", true);
            this.hideDropdown(cmp);
            this.showHelpMessage(cmp);
            this.fireEvent(cmp, "onchange");
        }
        else {
            this.hideDropdown(cmp);
        }
    },

    onClearItem: function(cmp) {
        cmp.set("v.value", null);
        cmp.set("v.privateValue", null);
        cmp.set("v.privateId", null);
        cmp.set("v.readonly", false);
        this.fireEvent(cmp, "onchange");
        this.showHelpMessage(cmp);
    },
})
