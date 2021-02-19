({
    liveBindingAttrs: ["name", "disabled", "required", "tabIndex", "accessKey"],

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

    _initializeValue: function(component, options) {
        var configurer = component.get("v.configurer");
        var privateOptions = _.chain(options).
            map(function(option) {
                var privateOption = _.cloneDeep(option);
                if(configurer && _.isFunction(configurer.getLabel)) {
                    privateOption.labelHtml = configurer.getLabel(privateOption);
                }
                return privateOption;
            }).
            value();
        component._privateOptions = privateOptions;
        component.set("v.privateSearchText", "");

        var domNode = component.find('private').getElement();
        var compValue = component.get('v.privateValue');

        if (compValue === undefined && domNode) {
            component.set('v.privateValue', domNode.value);
        }

        this.handleValueChange(component, true);
    },

    initializeValue: function(component) {
        var helper = this;
        var options = component.get("v.options");
        var dataProducer = component.get("v.dataProducer");
        if(dataProducer) {
            window.$DataProducer.produce(dataProducer).then($A.getCallback(function(data) {
                helper._initializeValue(component, data);
            }));
        }
        else {
            this._initializeValue(component, options);
        }
    },

    initializeComputed: function(cmp) {
        this.setComputed(cmp, {
            optionTemplate: function() {
                return '<c:privatePicklistItem index="{! v.index }" option="{! v.object }" style="{! picklist.v.style }" onclick="{! picklist.c.handleNodeClick }"/>';
            },
            providers: function() {
                return {
                    picklist: cmp,
                };
            },
            noResultFound: function(privateOptions) {
                return _.chain(privateOptions).
                    filter(["filtered", true]).
                    isEmpty().
                    value();
            },
        });
    },

    setItemList: function(cmp, privateOptions, isInitializing) {
        cmp.set("v.privateOptions", privateOptions);

        if(isInitializing) {
            var itemList = cmp.find("itemList");
            cmp.set("v.privateIsRendering", true);
            itemList.renderItems(function() {
                cmp.set("v.privateIsRendering", false);
            });
        }
    },

    doCustomValidation: function(component) {
        var required = component.get("v.required");
        var value = component.get("v.value");
        var validity = component.get("v.validity");
        if(validity) {
            if(required && _.isEmpty(value)) {
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

    onClickOutSideListener: function(component, event) {
        var isInsidePicklist = window.$Utils.findFromEvent(event, "data-picklist") === component.getGlobalId();
        if(!isInsidePicklist) {
            component.set("v.privateExpanded", false);
            component.set("v.privateSearchText", "");
            window.removeEventListener("click", component._clickListener);
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

    handleValueChange: function(component, isInitializing) {
        var value = component.get("v.value");
        var select = component.get("v.select");
        var privateOptions = component._privateOptions;
        var configurer = component.get("v.configurer");
        var searchable = component.get("v.searchable");
        var searchText = component.get("v.privateSearchText");
        var selected;
        if(select === "single") {
            selected = _.find(privateOptions, ["value", value]);
            if(selected) {
                if(configurer && _.isFunction(configurer.getTotalSelectionLabel)) {
                    component.set("v.privateValue", configurer.getTotalSelectionLabel([selected]));
                }
                else if(configurer && _.isFunction(configurer.getLabel)) {
                    component.set("v.privateValue", configurer.getLabel(selected));
                }
                else {
                    component.set("v.privateValue", selected.label);
                }
            }

            _.each(privateOptions, function(option) {
                option.selected = (selected && option.value === selected.value);
                option.filtered = _.toLower(option.label).includes(_.toLower(searchText));
            });
            this.setItemList(component, privateOptions, isInitializing);
        }
        else {
            var numOfSelected = _.size(value);
            var msg = numOfSelected <= 1 ? numOfSelected + " Option Selected" : numOfSelected + " Options Selected";
            if(configurer && _.isFunction(configurer.getTotalSelectionLabel)) {
                msg = configurer.getTotalSelectionLabel(value);
            }
            if(!msg || numOfSelected === 0) {
                component.set("v.privateValue", "");
            }
            else {
                component.set("v.privateValue", msg);
            }
            component.set("v.privatePills", _.filter(privateOptions, function(option) {
                return _.includes(value, option.value);
            }));
            _.each(privateOptions, function(option) {
                option.selected = _.includes(value, option.value);
                option.filtered = _.toLower(option.label).includes(_.toLower(searchText));
            });
            this.setItemList(component, privateOptions, isInitializing);
        }
    },

    updateValue: function(component, newValue) {
        var select = component.get("v.select");
        var value = component.get("v.value");
        if(select === "single") {
            component.set("v.value", newValue);
        }
        else {
            value = value || [];
            if(!_.includes(value, newValue)) {
                value.push(newValue);
            }
            else {
                _.pull(value, newValue);
            }
            component.set("v.value", value);
        }

        this.fireEvent(component, "onchange");
    },

    handleNodeClick: function(component, event) {
        var index = event.getParam('data').index;
        if(!_.isUndefined(index)) {
            var options = component.get("v.privateOptions");
            var option = options[index];
            if(!option.isGroupLabel) {
                this.updateValue(component, option.value);
                this.showHelpMessage(component);
                component.set("v.privateSearchText", "");
                if(component.get("v.select") === "single") {
                    component.set("v.privateExpanded", false);
                }
            }
        }
    },

    bindInput: function(component) {
        var helper = this;
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();

        this.liveBindingAttrs.forEach(function(domAttrName) {
            var expression = 'v.' + domAttrName.toLowerCase();

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

    trigger: function(component) {
        if(component.get("v.disabled")) {
            return;
        }

        this.adjustPopupPosition(component);
        component.set("v.privateExpanded", !component.get("v.privateExpanded"));

        var helper = this;
        component._clickListener = $A.getCallback(function(event) {
            helper.onClickOutSideListener(component, event);
        });
        window.addEventListener("click", component._clickListener);
    },

    removePill: function(component, event) {
        var val = event.getParam("name");
        var value = component.get("v.value");
        if(val) {
            component.set("v.value", _.pull(value, val));
        }
    },
})
