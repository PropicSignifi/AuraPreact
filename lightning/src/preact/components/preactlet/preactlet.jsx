import { h, render, Component } from 'preact';
import Utils from '../utils/utils';

const EXPRESSION_PATTERN = /^\{!(.*)\}$/;

const registeredComponents = {};
const registeredPreactlets = {};
const parser = new DOMParser();

const registerComponent = (name, component) => {
    if(name && component) {
        registeredComponents[name] = component;
    }
};

const unregisterComponent = name => {
    if(name) {
        delete registeredComponents[name];
    }
};

const getComponent = name => {
    let comp = registeredComponents[name];
    if(!comp) {
        const components = require('components');
        comp = components[name];
    }

    return comp;
};

const registerPreactlet = (name, component) => {
    if(name && component) {
        registeredPreactlets[name] = props => {
            return (
                <Wrapper
                    name={ name }
                    view={ component.view }
                    props={ _.assign({}, component.props, props) }
                    initialState={ component.state }
                    actions={ component.actions }
                    callbacks={ component.callbacks }
                >
                </Wrapper>
            );
        };
    }
};

const unregisterPreactlet = name => {
    if(name) {
        delete registeredPreactlets[name];
    }
};

const getPreactlet = name => {
    let comp = registeredPreactlets[name];

    return comp;
};

const getRenderingComponent = name => {
    let comp = getPreactlet(name);
    if(!comp) {
        comp = getComponent(name);
    }

    return comp;
};

const renderMarkup = (key, markup, props, state, boundActions) => {
    const doc = parser.parseFromString(markup, 'text/xml');
    const root = doc.childNodes[0];
    return renderNode(key, root, props, state, boundActions);
};

const renderNode = (key, node, props, state, boundActions) => {
    if(node.nodeType === 3) {
        // text node
        return evaluateExpressionValue(key, node.textContent, props, state, boundActions);
    }

    const name = node.tagName;
    const comp = name.substring(0, 1) === _.toUpper(name.substring(0, 1)) ? getRenderingComponent(name) : name;
    const attributes = {};
    _.forEach(node.getAttributeNames(), attrName => {
        const attrValue = node.getAttribute(attrName);
        const value = evaluateExpressionValue(key, attrValue, props, state, boundActions);
        attributes[attrName] = value;
    });
    const children = _.chain(node.childNodes)
        .map(child => renderNode(key, child, props, state, boundActions))
        .reject(child => _.isString(child) && !_.trim(child))
        .value();
    return h(comp, attributes, ...children);
};

const evaluateExpressionValue = (key, value, props, state, boundActions) => {
    if(EXPRESSION_PATTERN.test(value)) {
        const expression = value.replace(EXPRESSION_PATTERN, '$1').replace(/actions\./g, `actions.${key}.`)
            .replace(/state\./g, `state.${key}.`).replace(/props\./g, `props.${key}.`);
        const context = {
            props: {
                [key]: props,
            },
            state: {
                [key]: state,
            },
            actions: {
                [key]: boundActions,
            },
        };

        return Utils.evalInContext(expression, context, false);
    }
    else {
        return value;
    }
};

const renderPreactlet = (component, outerProps) => {
    const preactlet = _.isPlainObject(component) ? component : {
        view: component,
    };

    const {
        name,
        view,
        props,
        state,
        actions,
        callbacks,
    } = preactlet;

    return (
        <Wrapper
            name={ name || 'temp' }
            view={ view }
            props={ _.assign({}, props, { key: (props && props.key) || `${_.uniqueId()}` }, outerProps) }
            initialState={ state }
            actions={ actions }
            callbacks={ callbacks }
        >
        </Wrapper>
    );
};

const Preactlet = {
    registerComponent,
    unregisterComponent,
    getComponent,
    registerPreactlet,
    unregisterPreactlet,
    getPreactlet,
    getRenderingComponent,
    render: renderPreactlet,
};

class Wrapper extends Component {
    constructor() {
        super();

        this.state = {
            state: null,
        };

        this.boundActions = {};
    }

    componentWillMount() {
        const componentWillMount = _.get(this.props, 'callbacks.componentWillMount');
        if(_.isFunction(componentWillMount)) {
            componentWillMount(this.boundActions);
        }
    }

    componentDidMount() {
        if(this.props.initialState) {
            this.setState({
                state: this.props.initialState,
            });
        }

        const componentDidMount = _.get(this.props, 'callbacks.componentDidMount');
        if(_.isFunction(componentDidMount)) {
            componentDidMount(this.boundActions);
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        const componentWillReceiveProps = _.get(this.props, 'callbacks.componentWillReceiveProps');
        if(_.isFunction(componentWillReceiveProps)) {
            componentWillReceiveProps(this.boundActions, nextProps, nextState);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const shouldComponentUpdate = _.get(this.props, 'callbacks.shouldComponentUpdate');
        if(_.isFunction(shouldComponentUpdate)) {
            return shouldComponentUpdate(this.boundActions, nextProps, nextState);
        }
    }

    componentWillUpdate() {
        const componentWillUpdate = _.get(this.props, 'callbacks.componentWillUpdate');
        if(_.isFunction(componentWillUpdate)) {
            componentWillUpdate(this.boundActions);
        }
    }

    componentDidUpdate() {
        const componentDidUpdate = _.get(this.props, 'callbacks.componentDidUpdate');
        if(_.isFunction(componentDidUpdate)) {
            componentDidUpdate(this.boundActions);
        }
    }

    componentWillUnmount() {
        const componentWillUnmount = _.get(this.props, 'callbacks.componentWillUnmount');
        if(_.isFunction(componentWillUnmount)) {
            componentWillUnmount(this.boundActions);
        }
    }

    doSetState(newState) {
        this.setState({
            state: _.assign({}, this.state.state, newState),
        });
    }

    render(props) {
        const {
            name,
            view,
            initialState,
            actions,
        } = props;
        const innerProps = props.props || {};

        const state = this.state.state || initialState;
        const key = innerProps.key ? `${name}_${innerProps.key}` : name;

        this.boundActions = {};

        if(_.isFunction(actions)) {
            const newActions = actions.call(null, state, this.doSetState.bind(this));
            _.forEach(_.keys(newActions), key => {
                const action = newActions[key];
                if(_.isFunction(action)) {
                    this.boundActions[key] = action.bind({
                        state,
                        actions: this.boundActions,
                    });
                }
            });
        }
        else {
            _.forEach(_.keys(actions), key => {
                const action = actions[key];
                if(_.isFunction(action)) {
                    this.boundActions[key] = action.bind({
                        state,
                        actions: this.boundActions,
                    }, state, this.doSetState.bind(this));
                }
            });
        }

        const computedView = _.isFunction(view) ? view(state, this.boundActions) : _.toString(view);

        const comp = renderMarkup(key, computedView, innerProps, state, this.boundActions);
        return comp;
    }
}

Wrapper.displayName = 'PreactletWrapper';

export default Preactlet;
