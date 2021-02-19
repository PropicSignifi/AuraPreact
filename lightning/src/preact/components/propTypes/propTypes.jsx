const TYPE_STRING = "String";
const TYPE_NUMBER = "Number";
const TYPE_BOOLEAN = "Boolean";
const TYPE_OBJECT = "Object";
const TYPE_ICON = "Icon";
const TYPE_FUNCTION = "Function";
const TYPE_CHILDREN = "Children";
const TYPE_ARRAY = "Array";

export default class PropTypes {
    constructor(name, type, values, description, required, defaultValue, demoValue) {
        this.$name = name;
        this.$type = type;
        this.$values = values;
        this.$description = description;
        this.$required = required;
        this.$default = defaultValue;
        this.$demo = demoValue;
        this.$shape = null;
    }

    clone() {
        const copy = new PropTypes(
            this.$name,
            this.$type,
            this.$values,
            this.$description,
            this.$required,
            this.$default,
            this.$demo
        );
        copy.$shape = this.$shape;

        return copy;
    }

    verify(props, context) {
        const value = this.getValue(props);

        if(_.isArray(this.$values)) {
            if(!_.isUndefined(value) && !_.includes(this.$values, value)) {
                console.error(`Value [${value}] is not valid for '${this.$name}' in ${context}`);
            }
        }

        if(this.$required && (_.isNull(value) || _.isUndefined(value))) {
            console.error(`Value is required for '${this.$name}' in ${context}`);
        }

        if(!_.isUndefined(value) && this.$type === TYPE_OBJECT && this.$shape) {
            this.verifyShape(this.$shape, value, `Prop '${this.$name}' in ${context}`);
        }

        if(value && this.$type === TYPE_ARRAY) {
            if(!_.isArray(value)) {
                console.error(`Value of '${this.$name}' should be an array in ${context}`);
            }

            if(this.$shape) {
                _.each(value, (item, index) => this.verifyShape(this.$shape, item, `Item [${index}] of Prop '${this.$name}' in ${context}`));
            }
        }
    }

    verifyShape(shape, target, indicator) {
        if(!target) {
            return;
        }

        _.each(shape, (propType, name) => {
            const value = target[name];

            if(propType.$required && (_.isUndefined(value) || _.isNull(value))) {
                console.error(`Value missing for ${propType.$name} in ${indicator}`);
            }

            if(propType.$type === TYPE_STRING && value && !_.isString(value)) {
                console.error(`Value is not string for ${propType.$name} in ${indicator}`);
            }

            if(propType.$type === TYPE_NUMBER && value && !_.isNumber(value)) {
                console.error(`Value is not number for ${propType.$name} in ${indicator}`);
            }

            if(propType.$type === TYPE_BOOLEAN && value && !_.isBoolean(value)) {
                console.error(`Value is not boolean for ${propType.$name} in ${indicator}`);
            }

            if(propType.$type === TYPE_FUNCTION && value && !_.isFunction(value)) {
                console.error(`Value is not function for ${propType.$name} in ${indicator}`);
            }

            if(propType.$type === TYPE_ARRAY && value && !_.isArray(value)) {
                console.error(`Value is not array for ${propType.$name} in ${indicator}`);
            }
        });
    }

    getDefaultValue(props) {
        if(_.isFunction(this.$default)) {
            return this.$default(props);
        }

        if(!_.isUndefined(this.$default)) {
            return this.$default;
        }

        return null;
    }

    parseBoolean(value) {
        switch(value) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                return undefined;
        }
    }

    getValue(props) {
        let ret = props[this.$name];

        switch(this.$type) {
            case TYPE_STRING:
                ret = _.isString(ret) ? ret : _.toString(ret);
                break;
            case TYPE_NUMBER:
                ret = _.isNumber(ret) ? ret : _.toNumber(ret);
                break;
            case TYPE_BOOLEAN:
                ret = _.isBoolean(ret) ? ret : this.parseBoolean(ret);
                break;
            default:
                break;
        }

        if(_.isArray(this.$values) && !_.includes(this.$values, ret)) {
            return this.$default;
        }

        return _.isNull(ret) || _.isUndefined(ret) || _.isNaN(ret) || ret === "" ? this.getDefaultValue(props) : ret;
    }

    static isString(name) {
        return new PropTypes(name, TYPE_STRING, null);
    }

    static isNumber(name) {
        return new PropTypes(name, TYPE_NUMBER, null);
    }

    static isBoolean(name) {
        return new PropTypes(name, TYPE_BOOLEAN, null);
    }

    static isObject(name) {
        return new PropTypes(name, TYPE_OBJECT, null);
    }

    static isIcon(name) {
        return new PropTypes(name, TYPE_ICON, null);
    }

    static isFunction(name) {
        return new PropTypes(name, TYPE_FUNCTION, null);
    }

    static isChildren(name) {
        return new PropTypes(name, TYPE_CHILDREN, null);
    }

    static isArray(name) {
        return new PropTypes(name, TYPE_ARRAY, null);
    }

    static extend(basePropTypes, propTypes) {
        const copy = _.mapValues(basePropTypes, propType => propType.clone());
        return _.assign(copy, propTypes);
    }

    description(description) {
        this.$description = description;
        return this;
    }

    values(values) {
        this.$values = values;
        return this;
    }

    required() {
        this.$required = true;
        return this;
    }

    defaultValue(defaultValue) {
        this.$default = defaultValue;
        return this;
    }

    demoValue(demoValue) {
        this.$demo = demoValue;
        return this;
    }

    shape(shape) {
        if(!_.isPlainObject(shape)) {
            console.error("Shape should be a plain object with PropTypes");
        }

        this.$shape = shape;
        return this;
    }
}
