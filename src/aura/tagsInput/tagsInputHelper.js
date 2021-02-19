({
    liveBindingAttrs: ["name", "value", "disabled", "readOnly", "required", "tabIndex", "accessKey", "placeholder"],

    appendToChild: function(cmp) {
        var helper = this;
        var elem = cmp.find("input").getElement();
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
        var inputElem = cmp.find("input").getElement();
        var popup = cmp._popup;
        var pos = window.$Utils.getPositionFromBody(elem);
        var inputPos = window.$Utils.getPositionFromBody(inputElem);
        popup.style.left = inputPos.left + "px";
        popup.style.right = inputPos.right + "px";
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
        component._loadTags = _.debounce($A.getCallback(function() {
            helper.loadTags(component);
        }), wait);
    },

    initializeComputed: function(cmp) {
        this.setComputed(cmp, {
            template: function() {
                return '<c:privateTagsInputItem tag="{! v.object }" index="{! v.index }" onclick="{! cmp.c.onClickItem }"/>';
            },
            providers: function() {
                return {
                    cmp: cmp,
                };
            },
        });
    },

    doCustomValidation: function(cmp) {
        var required = cmp.get("v.required");
        var value = cmp.get("v.value");
        var validity = cmp.get("v.validity");
        if(validity) {
            if(required && _.isEmpty(value)) {
                validity.valueMissingOverride = true;
            }
            else {
                validity.valueMissingOverride = false;
            }
        }
    },

    handleValueChange: function(cmp) {
        cmp.set("v.privateValue", "");
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

        var classes = ['slds-combobox__form-element'];
        var hasIconLeft = !!component.get('v.iconNameLeft');
        var hasIconRight = !!component.get('v.iconNameRight');
        var shouldHideIconLeft = component.get('v.style') === 'inside' && !_.isEmpty(component.get('v.value'));
        if(hasIconLeft && hasIconRight) {
            if(shouldHideIconLeft) {
                classes.push('slds-input-has-icon slds-input-has-icon_right');
            }
            else {
                classes.push('slds-input-has-icon slds-input-has-icon_left-right');
            }
        }
        else if(hasIconLeft) {
            if(!shouldHideIconLeft) {
                classes.push('slds-input-has-icon slds-input-has-icon_left');
            }
        }
        else if(hasIconRight) {
            classes.push('slds-input-has-icon slds-input-has-icon_right');
        }

        component.set('v.privateComputedFormElementClass', classes.join(' '));
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
        if(validity && !validity.valid && validity.valueMissing) {
            var value = component.get("v.value");
            message = _.isEmpty(value) ? message : "";
        }
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
            this.computeTags(component);
        } else {
            this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
        }
    },

    onNodeValueChange: function(component, domNode, event) {
        this.interacting(component);
        var value = domNode.value;
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

    computeTags: function(cmp) {
        var value = cmp.get("v.value");
        var privateValue = cmp.get("v.privateValue");
        var privateTags = cmp.get("v.privateTags");
        var privateFilteredTags = _.chain(privateTags).
            filter(function(tag) {
                return !privateValue || (tag.label && _.toLower(tag.label).includes(_.toLower(privateValue)));
            }).
            filter(function(tag) {
                return !_.includes(value, tag);
            }).
            value();
        cmp.set("v.privateFilteredTags", privateFilteredTags);
        var itemList = cmp.find("itemList");
        cmp.set("v.privateIsRendering", true);
        itemList.renderItems(function() {
            cmp.set("v.privateIsRendering", false);
        });
    },

    loadTags: function(cmp) {
        var helper = this;
        var getTags = cmp.get("v.getTags");
        var value = cmp.get("v.privateValue");
        var cache = cmp.get("v.cache");
        var privateTags = cmp.get("v.privateTags");
        if(cache && !_.isEmpty(privateTags)) {
            helper.computeTags(cmp);
        }
        else {
            if(_.isFunction(getTags)) {
                var result = getTags(value);
                if(_.isFunction(result.then)) {
                    cmp.set("v.privateLoadingTags", true);
                    result.then($A.getCallback(function(data) {
                        cmp.set("v.privateTags", data);
                        helper.computeTags(cmp);
                        cmp.set("v.privateLoadingTags", false);
                    }));
                }
                else {
                    cmp.set("v.privateTags", result);
                    helper.computeTags(cmp);
                    cmp.set("v.privateLoadingTags", false);
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
                    helper.onClickOutsideTagsInput(cmp, event);
                });

                window.addEventListener("click", cmp._clickListener);
            }

            cmp._loadTags();
        }
    },

    hideDropdown: function(cmp) {
        cmp.set("v.privateVisible", false);

        window.removeEventListener("click", cmp._clickListener);
        cmp._clickListener = null;
    },

    onClickOutsideTagsInput: function(component, event) {
        var isInTagsInput = window.$Utils.findFromEvent(event, "data-tags-input") === component.getGlobalId();

        if(!isInTagsInput) {
            this.hideDropdown(component);
        }
    },

    onClickItem: function(cmp, event) {
        var index = event.getParam('data').index;
        if(!isNaN(index)) {
            var tags = cmp.get("v.privateFilteredTags");
            var tag = tags[index];
            cmp.set("v.privateValue", "");
            var value = cmp.get("v.value");
            value.push(tag);
            cmp.set("v.value", value);
            this.hideDropdown(cmp);
            this.showHelpMessage(cmp);
            this.fireEvent(cmp, "onchange");
        }
        else {
            this.hideDropdown(cmp);
        }
    },

    onRemoveTag: function(cmp, event) {
        var pill = event.getSource();
        var tagValue = pill.get("v.name");
        var value = cmp.get("v.value");
        var tag = _.find(value, ["value", tagValue]);
        _.pull(value, tag);
        cmp.set("v.value", value);
        this.showHelpMessage(cmp);
        this.fireEvent(cmp, "onchange");
    },
})
