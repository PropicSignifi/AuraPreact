({
    liveBindingAttrs: ["name", "value", "disabled", "readOnly", "required", "tabIndex", "accessKey", "placeholder", "maxLength", "minLength", "pattern", "max", "min", "step", "checked", "accept", "multiple"],

    computeClassNames: function(component) {
        this.computeContainerClassNames(component);
        this.computeFormElementClassNames(component);
        this.computeLabelClassNames(component);
    },

    initializeDefaultValues: function(component) {
        var type = component.get("v.type");
        var min = component.get("v.min");
        var max = component.get("v.max");
        if(type === "percent") {
            if(_.isUndefined(min)) {
                min = 0;
            }
            if(_.isUndefined(max)) {
                max = 100;
            }
        }
        else if(type === "days") {
            if(_.isUndefined(min)) {
                min = 0;
            }
        }
        else if(type === "current") {
            if(_.isUndefined(min)) {
                min = 0;
            }
        }

        component.set("v.min", min);
        component.set("v.max", max);
    },

    computeFormElementClassNames: function(component) {
        var isTypeSearch = component.get('v.type') === 'search';
        var value = ['slds-form-element__control', 'slds-grow'];

        if (isTypeSearch) {
            value.push('slds-input-has-icon', 'slds-input-has-icon--left-right');
        }
        else {
            var hasIconLeft = !!component.get("v.iconNameLeft");
            var hasIconRight = !!component.get("v.iconNameRight");
            if(hasIconLeft && hasIconRight) {
                value.push('slds-input-has-icon', 'slds-input-has-icon--left-right');
            }
            else if(hasIconLeft) {
                value.push('slds-input-has-icon', 'slds-input-has-icon--left');
            }
            else if(hasIconRight) {
                value.push('slds-input-has-icon', 'slds-input-has-icon--right');
            }
        }

        if(component.get("v.addonBefore") || component.get("v.addonAfter")) {
            value.push('slds-input-has-fixed-addon');
        }

        if(component.get("v.style") === 'tradition') {
            value.push('slds-input-tradition');
        }

        if(component.get('v.type') === 'text' || component.get('v.type') === 'number') {
            value.push('corrected-height');
        }

        component.set('v.privateFormElementComputedClass', value.join(' '));
    },

    computeContainerClassNames: function(component) {
        var value = ['slds-form-element'];
        var classAttr = component.get('v.class');
        if (classAttr) {
            value.push(classAttr);
        }
        if (component.get('v.variant') === 'label-hidden') {
            value.push('slds-form--inline');
        }
        var required = component.get('v.required');
        if (required) {
            value.push('is-required');
        }
        if (!this.isInteracting(component) && !this.isInputValid(component)) {
            value.push('slds-has-error');
        }
        component.set('v.privateContainerComputedClass', value.join(' '));
    },

    computeLabelClassNames: function(component) {
        var classnames = ['slds-form-element__label'];

        var type = component.get('v.type');
        if (type === 'checkbox' || type === 'checkbox-button' || type === 'radio' || type === 'file') {
        } else if (type === 'toggle') {
            classnames.push('slds-m-bottom--none');
        } else {
            classnames.push('slds-no-flex');
        }

        if (component.get('v.variant') === 'label-hidden') {
            classnames.push('slds-m-right--xxx-small');
        }

        component.set('v.privateLabelComputedClass', classnames.join(' '));
    },

    updateAriaDescribedBy: function(cmp) {
        var inputCmp = cmp.find('private');
        if (!inputCmp) {
            return;
        }

        var domNode = inputCmp.getElement();
        if (!domNode) {
            return;
        }

        var globalId = cmp.getGlobalId();
        var isToggle = cmp.get('v.type') === 'toggle';

        if (cmp.get('v.privateHelpMessage')) {
            this.domLibrary.dom.updateAttr(domNode, 'aria-describedby', (isToggle ? globalId + '-toggle-desc ' : '') + globalId + '-message');
        } else {
            if (isToggle) {
                this.domLibrary.dom.updateAttr(domNode, 'aria-describedby', globalId + '-toggle-desc');
            } else {
                this.domLibrary.dom.removeAttr(domNode, 'aria-describedby');
            }
        }
    },

    updateHelpMessage: function(component) {
        var validity = component.get('v.validity');
        var message = this.validityLibrary.validity.getMessage(component, validity);
        component.set('v.privateHelpMessage', message);
        this.updateAriaDescribedBy(component);
    },

    validateAttrPattern: function(component) {
        var pattern = component.get('v.pattern');
        if (pattern) {
            try {
                pattern = new RegExp(pattern);
            } catch (e) {
                throw new Error("`pattern` attribute in <c:input> must be a valid javascript regular expression. " + e);
            }
        }

        return pattern;
    },

    validateAttrType: function(component) {
        var type = component.get('v.type');
        if (!type) {
            throw new Error('Invalid `type` attribute for <c:input> component. ' + 'The `type` attribute is required, E.g.: <c:input label="Resume" type="password" value="..." />');
        }
        if (type === "radio") {
            var isRequired = component.get('v.required');
            if (isRequired === true) {
                throw new Error('Invalid `required` attribute for <c:input type="radio">. ' + 'The `required` attribute is not supported on radio inputs directly. It should be implemented ' + 'at the radio group level.');
            }
        } else if (type === 'hidden') {
            throw new Error('Invalid `type="hidden"` attribute for <c:input> component. ' + 'Use a regular <input type="hidden"> instead.');
        } else if (type === 'submit' || type === 'reset' || type === 'image' || type === 'button') {
            throw new Error('Invalid `type="' + type + '"` attribute for <c:input> component. ' + 'Use <c:button> instead.');
        }
    },

    validateAttrBody: function(component) {
        var body = component.get('v.body');
        if (body && body.length > 0) {
            throw new Error('Invalid `body` attribute for <c:input> component. ' + 'Use the `value` attribute instead, E.g.: <c:input label="..." value="..." />');
        }
    },

    validateAttrFormatter: function(component) {
        var formatter = component.get('v.formatter');
        var formatters = ['decimal', 'percent', 'currency'];
        if (formatter && formatters.indexOf(formatter) === -1 && !window.$Formatter.getFormatter(formatter)) {
            throw new Error('Invalid `formatter` attribute for <c:input> component.');
        }
    },

    validateAttrLabel: function(component) {
        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:input> component.' + 'The `label` attribute is required, E.g.: <c:input label="Resume" value="..." />');
        }
    },

    validateAttribute: function(component, domAttrName) {
        switch (domAttrName) {
        case 'type':
            this.validateAttrType(component);
            break;
        case 'pattern':
            this.validateAttrPattern(component);
            break;
        default:
            break;
        }
    },

    validateAllAttributes: function(component) {
        this.validateAttrBody(component);
        this.validateAttrFormatter(component);
        this.validateAttrLabel(component);
        this.validateAttrType(component);
        this.liveBindingAttrs.forEach(this.validateAttribute.bind(this, component));
    },

    getFormattedValue: function(component, value) {
        var formatStyle = component.get('v.formatter') || 'decimal';
        var step = component.get('v.step');
        var defaultValue = component.get('v.placeholder');

        var options = formatStyle === 'decimal' ? {
            step: step,
            defaultValue: defaultValue,
        } : {};

        var formatter = window.$Formatter.getFormatter(component.get("v.formatter"));
        var formatterOptions = window.$Formatter.getFormatterOptions(component.get("v.formatter"));
        if(formatterOptions) {
            options = formatterOptions;
        }
        if(formatter) {
            return formatter.format(value, options);
        }

        if(_.isNull(value) || _.isUndefined(value)) {
            return "";
        }
        else {
            return value;
        }
    },

    onAttrChangeFromOutside: function(component, domNode, domAttrName, event) {
        var value = component.get(event.getParam('expression'));

        if (domAttrName === 'value') {
            value = value || "";
            if (domNode.value !== value) {
                this.validateAttribute(component, domAttrName);
                this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
                component.set('v.validity', domNode.validity);
                if (document.activeElement !== domNode) {
                    this.showFormattedValue(component);
                }
            }
        } else {
            this.validateAttribute(component, domAttrName);
            this.domLibrary.dom.updateAttr(domNode, domAttrName, value);
        }
    },

    onNodeValueChange: function(component, domNode, event) {
        var value = domNode.value;
        var action;
        var isCheckable = this.isCheckableNode(domNode);
        if (component.get('v.value') !== value || isCheckable) {
            var formatter = window.$Formatter.getFormatter(component.get("v.formatter"));
            component.set('v.validity', domNode.validity);
            if (isCheckable) {
                component.set('v.checked', domNode.checked);
            } else {
                this.interacting(component);
                if(this.shouldFireOnChangeImmediately(component, formatter)) {
                    component.set('v.value', value);
                }
                if (domNode.type === 'file') {
                    component.set('v.files', domNode.files);
                }
            }
            if(this.shouldFireOnChangeImmediately(component, formatter)) {
                this.fireEvent(component, "onchange");
            }
        }
    },

    shouldFireOnChangeImmediately: function(cmp, formatter) {
        if(cmp.get("v.forceOnChange")) {
            return true;
        }

        return !formatter;
    },

    handleNodeBlur: function(component, domNode, event) {
        this.leaveInteracting(component);

        var formatter = window.$Formatter.getFormatter(component.get("v.formatter"));
        var formatterOptions = window.$Formatter.getFormatterOptions(component.get("v.formatter"));
        if(formatter) {
            component.set('v.value', formatter.parse(domNode.value, formatterOptions));
        }
        this.showFormattedValue(component);

        this.fireEvent(component, "onblur");
        if(!this.shouldFireOnChangeImmediately(component, formatter)) {
            this.fireEvent(component, "onchange");
        }
    },

    handleNodeFocus: function(component, domNode, event) {
        this.enterInteracting(component);
        this.showRawValue(component);
        this.fireEvent(component, "onfocus");
    },

    bindInput: function(component) {
        var helper = this;
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();

        this.liveBindingAttrs.forEach(function(domAttrName) {
            var expression = 'v.' + domAttrName.toLowerCase();
            var exprValue = component.get(expression);
            if(domAttrName === "pattern" && !exprValue) {
                exprValue = ".*";
            }
            if(domAttrName === "value" && (_.isNull(exprValue) || _.isUndefined(exprValue))) {
                exprValue = "";
            }

            dom.updateAttr(domNode, domAttrName, exprValue);

            component.addValueHandler({
                event: 'change',
                value: expression,
                method: this.onAttrChangeFromOutside.bind(this, component, domNode, domAttrName)
            });
        }, this);

        dom.addChangeEvent(domNode, $A.getCallback(this.onNodeValueChange.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onFocus', $A.getCallback(this.handleNodeFocus.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onBlur', $A.getCallback(this.handleNodeBlur.bind(this, component, domNode)));
        dom.updateAttr(domNode, 'onKeyPress', $A.getCallback(function(event) {
            helper.handleNodeInput(component, event, domNode);
        }));
        component.set('v.validity', domNode.validity);
        if (domNode.type === 'file') {
            component.set('v.files', domNode.files);
        }
        this.showFormattedValue(component);
        return domNode;
    },

    handleNodeInput: function(cmp, event, domNode) {
        var str = domNode.value + event.nativeEvent.key;
        var allowedPattern = cmp.get("v.allowedPattern");
        if(allowedPattern) {
            if(str && !str.match(allowedPattern)) {
                event.preventDefault();
            }
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

    showFormattedValue: function(component) {
        if (component.get('v.type') !== 'number' &&
            component.get('v.type') !== 'text'
        ) {
            return;
        }
        var value = component.get('v.value');
        var formattedValue = this.getFormattedValue(component, value);
        var dom = this.domLibrary.dom;
        var domNodeFormatted = component.find('private-formatted').getElement();
        if(domNodeFormatted) {
            dom.updateText(domNodeFormatted, formattedValue);
        }
        var domNode = component.find('private').getElement();
        if(domNode) {
            dom.updateAttr(domNode, 'style', {
                opacity: 0
            });
        }
    },

    showRawValue: function(component) {
        if (component.get('v.type') !== 'number' &&
            component.get('v.type') !== 'text'
        ) {
            return;
        }
        var dom = this.domLibrary.dom;
        var domNode = component.find('private').getElement();
        dom.updateAttr(domNode, 'style', {
            opacity: 1
        });
        var formattedValue = this.getFormattedValue(component, component.get("v.value"));
        dom.updateAttr(domNode, 'value', formattedValue);
    },

    showHelpMessageIfInvalid: function(component) {
        this.showHelpMessage(component);
    },

    showHelpMessage: function(component) {
        this.computeClassNames(component);
        this.updateHelpMessage(component);
    },

    isCheckableNode: function(domNode) {
        return window.$Utils.isCheckable(domNode.type);
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

    clearInputValue: function(component) {
        var domNode = component.find('private').getElement();
        domNode.value = '';
        this.fireInputEvent(domNode);
    },

    fireInputEvent: function(node) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("input", true, false);
        node.dispatchEvent(event);
    },

    handleDropFiles: function(component, event) {
        this.setValidityValid(component);
        this.interacting(component);

        component.set('v.files', event.dataTransfer && event.dataTransfer.files);

        var changeEvent = document.createEvent('HTMLEvents');
        changeEvent.initEvent('change', true, false);

        var handleChangeOnce = $A.getCallback(function() {
            this.fireEvent(component, "onchange");
        }
        .bind(this));

        var el = component.getElement();
        el.addEventListener('change', handleChangeOnce);
        el.dispatchEvent(changeEvent);
        el.removeEventListener('change', handleChangeOnce);
    },

    setValidityValid: function(component) {
        var input = document.createElement('input');
        component.set('v.validity', input.validity);
    },

    isNonPrintableKeyStroke: function(keyCode) {
        var keyCodes = this.utilsLibrary.keyCodes;
        return Object.keys(keyCodes).some(function(code) {
            return keyCodes[code] === keyCode;
        });
    },

    isFunctionKeyStroke: function(event) {
        return event.ctrlKey || event.metaKey || this.isNonPrintableKeyStroke(event.keyCode);
    },

    isValidNumericKeyStroke: function(event) {
        return /^[0-9eE.+-]$/.test(event.key);
    },
})
