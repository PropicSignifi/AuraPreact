const generateNewValues = (values, newVal) => {
    if(_.isNil(newVal)) {
        return values;
    }

    if(_.includes(values, newVal)) {
        return _.without(values, newVal);
    }
    else {
        return [
            ...(values || []),
            newVal,
        ];
    }
};

const isAdding = (values, newVal) => {
    return _.includes(values, newVal);
};

const optionConstraintRules = [
    {
        name: 'Dependent',
        apply: (values, newVal, source, target) => {
            if(!_.isNil(newVal) && !_.includes(target, newVal)) {
                return;
            }

            const enabled = _.every(target, item => _.includes(values, item));
            const disabled = [];
            if(!enabled) {
                return {
                    addDisabled: [source],
                };
            }
            else {
                return {
                    removeDisabled: [source],
                };
            }
        },
    },
    {
        name: 'Inclusive',
        apply: (values, newVal, source, target) => {
            if(_.isNil(newVal)) {
                return;
            }

            const add = isAdding(values, newVal);
            if(source === newVal) {
                if(add) {
                    return {
                        addSelected: target,
                    };
                }
            }
            else if(_.includes(target, newVal)) {
                if(add) {
                    const all = _.every(target, item => _.includes(values, item));
                    if(all) {
                        return {
                            addSelected: [source],
                        };
                    }
                }
                else {
                    return {
                        removeSelected: [source],
                    };
                }
            }
        },
    },
];

/*
 * OptionConstraint
 * {
 *     "rule": "Inclusive",
 *     "source": "",
 *     "target": [],
 * }
 */
const applyOptionConstraints = (oldValues, newVal, optionConstraints) => {
    const newValues = generateNewValues(oldValues, newVal);
    const result = {
        selected: newValues,
        disabled: [],
    };

    _.forEach(optionConstraints, constraint => {
        const rule = _.find(optionConstraintRules, ['name', constraint.rule]);
        if(!rule) {
            return;
        }

        const op = rule.apply(result.selected, newVal, constraint.source, constraint.target) || {};

        _.forEach(op.addDisabled, val => {
            if(!_.includes(result.disabled, val)) {
                result.disabled.push(val);
            }
        });

        _.forEach(op.removeDisabled, val => {
            _.pull(result.disabled, val);
        });

        _.forEach(op.addSelected, val => {
            if(!_.includes(result.selected, val)) {
                result.selected.push(val);
            }
        });

        _.forEach(op.removeSelected, val => {
            _.pull(result.selected, val);
        });
    });

    return result;
};

export default applyOptionConstraints;
