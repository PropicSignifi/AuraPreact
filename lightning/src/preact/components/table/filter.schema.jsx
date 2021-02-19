import renderField from '../renderField/renderField';

const normalizePattern = pattern => '.*' + _.chain(pattern)
    .replace(/\*/g, '.*')
    .replace(/\?/g, '\\w')
    .value() + '.*';

const isBlank = value => value === null ||
    value === '' ||
    value === undefined;

export default {
    resources: [
        {
            name: 'Boolean',
            label: 'Boolean',
            acceptedTypes: [
                'Boolean',
            ],
            operators: [
                'equals_boolean',
                'not_equals_boolean',
                'is_blank',
                'is_not_blank',
            ],
        },
        {
            name: 'Number',
            label: 'Number',
            acceptedTypes: [
                'Number',
                'Integer',
                'Currency',
            ],
            operators: [
                'equals_number',
                'not_equals_number',
                'less_than_number',
                'greater_than_number',
                'less_or_equal_number',
                'greater_or_equal_number',
                'is_blank',
                'is_not_blank',
            ],
        },
        {
            name: 'Date',
            label: 'Date',
            acceptedTypes: [
                'Date',
                'DateTime',
            ],
            operators: [
                'is_date',
                'is_before_date',
                'is_after_date',
                'is_blank',
                'is_not_blank',
            ],
        },
        {
            name: 'String',
            label: 'String',
            acceptedTypes: [
                'String',
            ],
            operators: [
                'equals_string',
                'not_equals_string',
                'contains_string',
                'not_contains_string',
                'starts_with_string',
                'not_starts_with_string',
                'matches_string',
                'not_matches_string',
                'is_blank',
                'is_not_blank',
            ],
        },
    ],

    operators: [
        {
            name: 'is_blank',
            label: 'is blank',
            valueOmitted: true,
            execute: (a, b) => {
                return isBlank(a);
            },
        },
        {
            name: 'is_not_blank',
            label: 'is not blank',
            valueOmitted: true,
            execute: (a, b) => {
                return !isBlank(a);
            },
        },
        {
            name: 'equals_boolean',
            label: 'equals',
            valueRequired: true,
            type: 'Picklist',
            renderConfig: {
                options: [
                    {
                        label: 'True',
                        value: 'true',
                    },
                    {
                        label: 'False',
                        value: 'false',
                    },
                ],
            },
            execute: (a, b) => {
                return _.toString(!!a) === b;
            },
        },
        {
            name: 'not_equals_boolean',
            label: 'not equal to',
            valueRequired: true,
            type: 'Picklist',
            renderConfig: {
                options: [
                    {
                        label: 'True',
                        value: 'true',
                    },
                    {
                        label: 'False',
                        value: 'false',
                    },
                ],
            },
            execute: (a, b) => {
                return _.toString(!!a) !== b;
            },
        },
        {
            name: 'equals_number',
            label: 'equals',
            valueRequired: true,
            type: 'Number',
            execute: (a, b) => {
                return a === b;
            },
        },
        {
            name: 'not_equals_number',
            label: 'not equal to',
            valueRequired: true,
            type: 'Number',
            execute: (a, b) => {
                return a !== b;
            },
        },
        {
            name: 'less_than_number',
            label: 'less than',
            valueRequired: true,
            type: 'Number',
            execute: (a, b) => {
                return a < b;
            },
        },
        {
            name: 'greater_than_number',
            label: 'greater than',
            valueRequired: true,
            type: 'Number',
            execute: (a, b) => {
                return a > b;
            },
        },
        {
            name: 'less_or_equal_number',
            label: 'less or equal',
            valueRequired: true,
            type: 'Number',
            execute: (a, b) => {
                return a <= b;
            },
        },
        {
            name: 'greater_or_equal_number',
            label: 'greater or equal',
            valueRequired: true,
            type: 'Number',
            execute: (a, b) => {
                return a >= b;
            },
        },
        {
            name: 'equals_string',
            label: 'equals',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                return a === b;
            },
            renderValueUI: ({ type, resource, condition, index, name, label, required, disabled, value, onValueChange, }) => {
                if(resource && resource.values) {
                    return renderField('Enum', {
                        values: resource.values,
                        name,
                        label,
                        required,
                        disabled,
                        value,
                        onValueChange,
                    });
                }
                else {
                    return renderField(type, {
                        name,
                        label,
                        required,
                        disabled,
                        value,
                        onValueChange,
                    });
                }
            },
        },
        {
            name: 'not_equals_string',
            label: 'not equal to',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                return a !== b;
            },
            renderValueUI: ({ type, resource, condition, index, name, label, required, disabled, value, onValueChange, }) => {
                if(resource && resource.values) {
                    return renderField('Enum', {
                        values: resource.values,
                        name,
                        label,
                        required,
                        disabled,
                        value,
                        onValueChange,
                    });
                }
                else {
                    return renderField(type, {
                        name,
                        label,
                        required,
                        disabled,
                        value,
                        onValueChange,
                    });
                }
            },
        },
        {
            name: 'contains_string',
            label: 'contains',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                return _.includes(a, b);
            },
        },
        {
            name: 'not_contains_string',
            label: 'does not contain',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                return !_.includes(a, b);
            },
        },
        {
            name: 'starts_with_string',
            label: 'starts with',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                return _.startsWith(a, b);
            },
        },
        {
            name: 'not_starts_with_string',
            label: 'does not start with',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                return !_.startsWith(a, b);
            },
        },
        {
            name: 'matches_string',
            label: 'matches',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                const pattern = normalizePattern(b);
                return pattern && new RegExp(pattern, 'g').test(a);
            },
        },
        {
            name: 'not_matches_string',
            label: 'does not match',
            valueRequired: true,
            type: 'Text',
            execute: (a, b) => {
                const pattern = normalizePattern(b);
                return pattern && !new RegExp(pattern, 'g').test(a);
            },
        },
        {
            name: 'is_date',
            label: 'is',
            valueRequired: true,
            type: 'DatePicker',
            getValueLabel: value => {
                return moment(value).format('DD/MM/YYYY');
            },
            execute: (a, b) => {
                if(!a){
                    return false;
                }
                const m_a = moment(a).startOf('day');
                const m_b = moment(b).startOf('day');
                return m_a.isSame(m_b);
            },
        },
        {
            name: 'is_before_date',
            label: 'is before',
            valueRequired: true,
            type: 'DatePicker',
            getValueLabel: value => {
                return moment(value).format('DD/MM/YYYY');
            },
            execute: (a, b) => {
                if(!a){
                    return false;
                }
                const m_a = moment(a).startOf('day');
                const m_b = moment(b).startOf('day');
                return m_a.isBefore(m_b);
            },
        },
        {
            name: 'is_after_date',
            label: 'is after',
            valueRequired: true,
            type: 'DatePicker',
            getValueLabel: value => {
                return moment(value).format('DD/MM/YYYY');
            },
            execute: (a, b) => {
                if(!a){
                    return false;
                }
                const m_a = moment(a).startOf('day');
                const m_b = moment(b).startOf('day');
                return m_a.isAfter(m_b);
            },
        },
    ],
};
