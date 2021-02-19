({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var layout = cmp.get('v.layout');
        var classnames = this.classnamesLibrary.classnames('slds-form', {
            'slds-form_compound': this.equal(variant, 'compound'),
            'slds-form_stacked': this.equal(layout, 'stacked') && !this.equal(variant, 'compound'),
            'slds-form_horizontal': this.equal(layout, 'horizontal') && !this.equal(variant, 'compound'),
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    findField: function(fields, name) {
        var ret = null;
        _.each(fields, function(field) {
            if(field.get("v.name") === name) {
                ret = field;
                return false;
            }
        });

        return ret;
    },

    validate: function(cmp) {
        cmp._validated = true;
        var helper = this;
        var name = cmp.get("v.name");
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");

        var validators = cmp.get("v.validators");
        if(validators) {
            var msgs = _.chain(validators).
                toPairs().
                map(function(pair) {
                    var key = name + "_" + pair[0];
                    var validator = pair[1];
                    if(_.isPlainObject(validator)) {
                        var fieldNames = validator.fieldNames;
                        var validate = validator.validate;
                        if(_.isArray(fieldNames) && !_.isEmpty(fieldNames) && _.isFunction(validate)) {
                            return helper.doValidation(cmp, fieldNames, validate, fields, key);
                        }
                        else {
                            return [key, false];
                        }
                    }
                    else {
                        return [key, false];
                    }
                }).
                fromPairs().
                value();
            this.validityLibrary.validity.setCustomMessages(msgs);
        }

        var allValid = _.reduce(fields, function(valid, field) {
            field.showHelpMessageIfInvalid();
            var fieldValid = helper.validityLibrary.validity.isValid(field.get("v.validity"));
            return valid && fieldValid;
        }, true);

        return allValid;
    },

    enforceSingleFieldValidations: function(cmp, event) {
        var helper = this;
        var name = cmp.get("v.name");

        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        var triggerField = event.getParam('data').cmp;

        var validators = cmp.get("v.validators");
        if(validators) {
            var msgs = _.chain(validators).
                toPairs().
                map(function(pair) {
                    var key = name + "_" + pair[0];
                    var validator = pair[1];
                    if(_.isPlainObject(validator)) {
                        var fieldNames = validator.fieldNames;
                        var validate = validator.validate;
                        if(_.isArray(fieldNames) && _.size(fieldNames) === 1 && _.isFunction(validate) && fieldNames[0] === triggerField.get('v.name')) {
                            return helper.doValidation(cmp, fieldNames, validate, fields, key);
                        }
                        else {
                            return [key, false];
                        }
                    }
                    else {
                        return [key, false];
                    }
                }).
                fromPairs().
                value();
            this.validityLibrary.validity.setCustomMessages(msgs);

            triggerField.showHelpMessageIfInvalid();
        }
    },

    doValidation: function(cmp, fieldNames, validate, fields, key, triggerFields) {
        var helper = this;
        var relatedFields = _.map(fieldNames, function(fieldName) {
            return helper.findField(fields, fieldName);
        });
        if(triggerFields) {
            _.each(relatedFields, function(field) {
                if(!_.includes(triggerFields, field)) {
                    triggerFields.push(field);
                }
            });
        }
        var msg = validate(relatedFields, cmp);
        if(msg && !_.isString(msg)) {
            msg = "Custom validation failed.";
        }
        if(msg) {
            _.each(relatedFields, function(field) {
                var validity = field.get("v.validity");
                validity[key] = true;
            });
            return [key, msg];
        }
        else {
            _.each(relatedFields, function(field) {
                var validity = field.get("v.validity");
                validity[key] = false;
            });
            return [key, false];
        }
    },

    enforceRevalidations: function(cmp, event) {
        if(!cmp._validated) {
            return;
        }
        var helper = this;
        var name = cmp.get("v.name");

        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        var triggerField = event.getParam('data').cmp;

        var validators = cmp.get("v.validators");
        if(validators) {
            var triggerFields = [];
            var msgs = _.chain(validators).
                toPairs().
                map(function(pair) {
                    var key = name + "_" + pair[0];
                    var validator = pair[1];
                    if(_.isPlainObject(validator)) {
                        var fieldNames = validator.fieldNames;
                        var validate = validator.validate;
                        if(_.isArray(fieldNames) &&  _.isFunction(validate) && _.includes(fieldNames, triggerField.get('v.name'))) {
                            return helper.doValidation(cmp, fieldNames, validate, fields, key, triggerFields);
                        }
                        else {
                            return [key, false];
                        }
                    }
                    else {
                        return [key, false];
                    }
                }).
                fromPairs().
                value();
            this.validityLibrary.validity.setCustomMessages(msgs);

            _.each(triggerFields, function(field) {
                field.showHelpMessageIfInvalid();
            });
        }
    },

    enforceConstraints: function(cmp, event) {
        var helper = this;

        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        var triggerField = event.getParam('data').cmp;

        var constraints = cmp.get("v.constraints");
        if(constraints) {
            _.chain(constraints).
                values().
                filter(function(constraint) {
                    return _.includes(constraint.watch, triggerField.get("v.name"));
                }).
                map(function(constraint) {
                    if(_.isPlainObject(constraint)) {
                        var fieldNames = constraint.fieldNames;
                        var enforce = constraint.enforce;
                        if(_.isArray(fieldNames) && !_.isEmpty(fieldNames) && _.isFunction(enforce)) {
                            var relatedFields = _.map(fieldNames, function(fieldName) {
                                return helper.findField(fields, fieldName);
                            });
                            enforce(relatedFields, cmp);
                        }
                    }
                }).
                value();
        }
    },

    addListeners: function(cmp) {
        var helper = this;
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");

        var onChangeListener = function(event) {
            cmp._dirty = true;

            helper.enforceConstraints(cmp, event);
        };
        _.each(fields, function(field) {
            field.addEventHandler("onchange", onChangeListener);
        });

        var onBlurListener = function(event) {
            helper.enforceSingleFieldValidations(cmp, event);
            helper.enforceRevalidations(cmp, event);
        };
        _.each(fields, function(field) {
            field.addEventHandler("onblur", onBlurListener);
        });
    },

    getValue: function(field) {
        if(field.isInstanceOf(window.$Config.getNamespace() + ":input") && window.$Utils.isCheckable(field.get("v.type"))) {
            return field.get("v.checked");
        }
        else {
            return field.get("v.value");
        }
    },

    setValue: function(field, value) {
        if(field.isInstanceOf(window.$Config.getNamespace() + ":input") && window.$Utils.isCheckable(field.get("v.type"))) {
            field.set("v.checked", !!value);
        }
        else {
            field.set("v.value", value);
        }
    },

    commitValues: function(cmp) {
        var helper = this;
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        var values = _.chain(fields).
            map(function(field) {
                return [field.get("v.name"), _.cloneDeep(helper.getValue(field))];
            }).
            fromPairs().
            value();
        cmp.set("v.privateCommittedValues", values);
    },

    checkDirty: function(cmp) {
        var saveable = cmp.get("v.saveable");
        return saveable && cmp._dirty;
    },

    save: function(cmp) {
        var valid = this.validate(cmp);
        var saveable = cmp.get("v.saveable");
        if(valid && saveable) {
            cmp._dirty = false;
            this.commitValues(cmp);
        }

        return valid;
    },

    cancel: function(cmp) {
        var saveable = cmp.get("v.saveable");
        if(!saveable) {
            return;
        }
        var helper = this;
        var values = cmp.get("v.privateCommittedValues");
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        _.each(values, function(value, key) {
            var field = helper.findField(fields, key);
            if(field) {
                helper.setValue(field, value);
            }
        });
        cmp._dirty = false;
    },

    handleFormReadonly: function(cmp) {
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        var readonly = cmp.get("v.readonly");
        _.each(fields, function(field) {
            if(field.isValid()) {
                field.set("v.readonly", readonly);
            }
        });
    },

    handleFormDisabled: function(cmp) {
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        var disabled = cmp.get("v.disabled");
        _.each(fields, function(field) {
            if(field.isValid()) {
                field.set("v.disabled", disabled);
            }
        });
    },

    getFields: function(cmp) {
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        return fields;
    },

    getValidFields: function(cmp) {
        var fields = window.$Utils.findInstancesOf(cmp, window.$Config.getNamespace() + ":inputable");
        return _.chain(fields).
            filter(function(field) {
                return window.$Utils.isFieldValid(field);
            }).
            value();
    },
})
