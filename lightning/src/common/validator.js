(function(window) {
    class FieldValidator {
        constructor(name, label, funcs = []) {
            this.$name = name;
            this.$label = label;
            this.$funcs = funcs;
        }

        add(validatorFunc) {
            return new FieldValidator(
                this.$name,
                this.$label,
                [...this.$funcs, validatorFunc]
            );
        }

        require(msg) {
            return this.add((value, label) => {
                if(!value && value !== 0) {
                    return msg || `'${this.$label || label}' is required`;
                }
            });
        }

        min(minValue, msg) {
            return this.add((value, label) => {
                if(value && _.parseInt(value) < _.parseInt(minValue)) {
                    return msg || `'${this.$label || label}' should be no less than ${minValue}`;
                }
            });
        }

        max(maxValue, msg) {
            return this.add((value, label) => {
                if(value && _.parseInt(value) > _.parseInt(maxValue)) {
                    return msg || `'${this.$label || label}' should be no greater than ${maxValue}`;
                }
            });
        }

        minlength(minlengthValue, msg) {
            return this.add((value, label) => {
                if(value && _.size(_.toString(value)) < minlengthValue) {
                    return msg || `'${this.$label || label}' should have a length of no less than ${minlengthValue}`;
                }
            });
        }

        maxlength(maxlengthValue, msg) {
            return this.add((value, label) => {
                if(value && _.size(_.toString(value)) > maxlengthValue) {
                    return msg || `'${this.$label || label}' should have a length of no greater than ${maxlengthValue}`;
                }
            });
        }

        pattern(patternValue, msg) {
            return this.add((value, label) => {
                if(value && !new RegExp(patternValue).test(_.toString(value))) {
                    return msg || `'${this.$label || label}' does not match the pattern`;
                }
            });
        }

        validate(value, label) {
            for(const func of this.$funcs) {
                const msg = func(value, label);
                if(msg) {
                    return msg;
                }
            }
        }

        toValidator() {
            return {
                fieldNames: [this.$name],
                validate: (values, fields) =>  {
                    const value = values[0];
                    const field = _.first(fields);
                    return this.validate(value, _.get(field, 'props.label'));
                },
            };
        }
    }

    const FieldGroupPolicy = {
        All: 'All',
        Any: 'Any',
        AllNonTrivial: 'AllNonTrivial',
        AnyNonTrivial: 'AnyNonTrivial',
    };

    class FieldGroupValidator {
        constructor(fieldValidators, label, policy = FieldGroupPolicy.All) {
            this.$fieldValidators = fieldValidators;
            this.$label = label;
            this.$policy = policy;
        }

        validateAll(values, labels) {
            const msgs = _.chain(this.$fieldValidators)
                .map((fieldValidator, index) => {
                    const value = values[index];
                    const label = labels[index];
                    return fieldValidator.validate(value, label);
                })
                .compact()
                .value();

            if(!_.isEmpty(msgs)) {
                return this.$label || _.first(msgs);
            }
        }

        validateAny(values, labels) {
            const msgs = _.chain(this.$fieldValidators)
                .map((fieldValidator, index) => {
                    const value = values[index];
                    const label = labels[index];
                    return fieldValidator.validate(value, label);
                })
                .compact()
                .value();

            return _.size(values) === _.size(msgs) ? (this.$label || _.first(msgs)) : null;
        }

        validate(values, labels) {
            if(this.$policy === FieldGroupPolicy.All) {
                return this.validateAll(values, labels);
            }
            else if(this.$policy === FieldGroupPolicy.Any) {
                return this.validateAny(values, labels);
            }
            else if(this.$policy === FieldGroupPolicy.AllNonTrivial) {
                if(!_.isEmpty(_.compact(values))) {
                    return this.validateAll(values, labels);
                }
            }
            else if(this.$policy === FieldGroupPolicy.AnyNonTrivial) {
                if(!_.isEmpty(_.compact(values))) {
                    return this.validateAny(values, labels);
                }
            }
        }

        toValidator() {
            return {
                fieldNames: _.map(this.$fieldValidators, '$name'),
                validate: (values, fields) =>  {
                    const labels = _.map(fields, field => _.get(field, 'props.label'));
                    return this.validate(values, labels);
                },
            };
        }
    }

    const of = (name, label) => new FieldValidator(name, label);
    const from = (fieldValidators, label, policy) => new FieldGroupValidator(fieldValidators, label, policy);

    const $Validator = {
        of,
        from,
        Policy: FieldGroupPolicy,
    };

    window.$Validator = $Validator;
})(window);
