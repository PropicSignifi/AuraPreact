import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Spinner from '../spinner/spinner';

export default class AuraComponent extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.instance = null;
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
    }

    reload() {
        const id = this.id();

        const name = this.prop('name');
        const props = this.prop('props');
        const propsStr = _.chain(props)
            .keys()
            .map(key => {
                const propVal = props[key];
                return `${key}="${propVal}"`;
            })
            .join(' ')
            .value();
        const markup = _.isEmpty(propsStr) ? `<${name}></${name}>` : `<${name} ${propsStr}></${name}>`;

        window.$Shadow.create(markup)
            .then(shadow => {
                const parent = document.getElementById(id);
                while(parent && parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
                this.instance = shadow;
                shadow.show(parent, null, _.noop);
            });
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        const id = this.id();

        return (
            <div
                id={ id }
                className={ window.$Utils.classnames(
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <Spinner visible={ !this.instance }>
                </Spinner>
            </div>
        );
    }
}

AuraComponent.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    props: PropTypes.isObject('props'),
    name: PropTypes.isString('name'),
};

AuraComponent.propTypesRest = true;
AuraComponent.displayName = "AuraComponent";
