import { h, render, Component } from 'preact';
import Config from '../utils/config';
import Utils from '../utils/utils';

Config.defineConfig([
    {
        name: 'Component - custom',
        path: '/System/UI/Component/${name}/custom',
        type: 'Folder',
        description: 'Override specific props of a component specified by the name, or form name together with name',
    },
    {
        name: 'Component - query',
        path: '/System/UI/Query/${name}/query',
        type: Config.Types.String,
        description: 'Provide the query for customizing components',
    },
    {
        name: 'Component - query',
        path: '/System/UI/Query/${name}/data',
        type: 'Folder',
        description: 'Provide the query data for customizing components',
    },
]);

export default class BaseComponent extends Component {
    constructor() {
        super();

        this.$id = `${this.constructor.displayName}-${_.uniqueId()}`;

        this.state = {
            customData: {},
        };
    }

    id() {
        return this.$id;
    }

    setCustomData(data) {
        this.setState({
            customData: _.assign({}, this.state.customData, data),
        });
    }

    getCustomData(key) {
        return key ? _.get(this.state.customData, key) : this.state.customData;
    }

    getTypeName() {
        return this.constructor.displayName;
    }

    bind(names) {
        _.forEach(names, name => {
            const originalFunc = this[name];
            if(_.isFunction(originalFunc)) {
                this[name] = originalFunc.bind(this);
            }
        });
    }

    getForm() {
        let form = null;
        if(_.isFunction(this.context.getForm)) {
            form = this.context.getForm();
        }
        else if(this.context.form) {
            form = this.context.form;
        }

        return form;
    }

    getPropTypes() {
        return this.constructor.propTypes;
    }

    supportPropTypesRest() {
        return this.constructor.propTypesRest === true;
    }

    getPropValues() {
        const propTypes = this.getPropTypes();
        const values = _.chain(propTypes).
            mapValues((propType, name) => this.prop(name)).
            value();

        const rest = _.chain(this.props).
            omit(_.keys(values)).
            value();

        if(this.supportPropTypesRest()) {
            return [values, rest];
        }
        else {
            return values;
        }
    }

    verifyProps(props) {
        let context = this.id();
        if(props.name) {
            context += `[${props.name}]`;
        }
        if(props.label) {
            context += `[${props.labe}]`;
        }

        _.each(this.getPropTypes(), propType => propType.verify(props, context));
    }

    prop(name) {
        const props = _.assign({}, this.props, this.state.customData);

        const propTypes = this.getPropTypes();
        return propTypes && propTypes[name] ? propTypes[name].getValue(props) : props[name];
    }

    getChildContext(context) {
        const componentPath = context.componentPath || [];

        return {
            componentPath: [
                ...componentPath,
                this,
            ],
        };
    }

    getCustomConfigPath() {
        let name = this.props.name;
        if(!name) {
            return;
        }

        if(this.context.form) {
            name = this.context.form.getName() + '_' + name;
        }

        return `/System/UI/Component/${name}/custom`;
    }

    componentWillMount() {
        this.verifyProps(this.props);
    }

    componentDidMount() {
        const rawCustomData = Config.getValues(this.getCustomConfigPath(), this.context.globalData) || {};
        const customData = {};
        const parentCustomData = {};
        _.forEach(rawCustomData, (value, key) => {
            if(key.startsWith('^')) {
                parentCustomData[key.substring(1)] = value;
            }
            else {
                customData[key] = value;
            }
        });

        const customQuery = Config.getValuesHierarchy('/System/UI/Query/', this.context.globalData);
        _.forEach(customQuery, query => {
            if(Utils.matchesCustomQuery([...(this.context.componentPath || []), this], query.query)) {
                _.assign(customData, query.data);
            }
        });

        if(!_.isEmpty(customData)) {
            this.setCustomData(customData);
        }

        if(this.base.setAttribute) {
            this.base.setAttribute('data-locator', this.id());
        }

        if(!_.isEmpty(parentCustomData)) {
            const parent = _.last(this.context.componentPath);
            if(parent) {
                parent.setCustomData(_.assign({}, parent.getCustomData(), parentCustomData));
            }
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        this.verifyProps(nextProps);
    }

    shouldComponentUpdate(nextProps, nextState) {
    }

    componentWillUpdate() {
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
    }

    getPreactContainerName() {
        return _.get(this.context, 'globalData.preactContainer');
    }
}

BaseComponent.displayName = "BaseComponent";
