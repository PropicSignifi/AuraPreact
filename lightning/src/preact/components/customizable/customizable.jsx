import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import AuraComponent from './auraComponent';
import Spinner from '../spinner/spinner';
import Utils from '../utils/utils';
import Preactlet from '../preactlet/preactlet';
import { $require, } from '../modules/modules';

const isAuraComponentName = name => _.includes(name, ':');

export default class Customizable extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            loading: false,
            preactlet: null,
        });
    }

    componentDidMount() {
        super.componentDidMount();

        this.reload(this.prop('provider'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(this.props.provider !== nextProps.provider) {
            this.reload(nextProps.provider);
        }
    }

    reload(provider) {
        if(provider && !isAuraComponentName(provider)) {
            this.setState({
                loading: true,
            });

            $require(provider).then(preactlet => {
                this.setState({
                    loading: false,
                    preactlet,
                });
            }, Utils.catchError);
        }
    }

    renderCustomized() {
        const [{
            props,
            provider,
            provide,
            children,
        },] = this.getPropValues();

        if(_.isFunction(provide)) {
            return provide(props);
        }
        else if(provider) {
            if(isAuraComponentName(provider)) {
                return (
                    <AuraComponent
                        name={ provider }
                        props={ props }
                    >
                    </AuraComponent>
                );
            }
            else if(this.state.preactlet) {
                return Preactlet.render(this.state.preactlet, props);
            }
        }
        else {
            return children;
        }
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        return (
            <div className={ window.$Utils.classnames(
                'slds-is-relative',
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                {
                    this.state.loading && (
                    <Spinner></Spinner>
                    )
                }
                {
                    this.renderCustomized()
                }
            </div>
        );
    }
}

Customizable.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    props: PropTypes.isObject('props'),
    provider: PropTypes.isString('provider').demoValue(''),
    provide: PropTypes.isFunction('provide'),
    children: PropTypes.isChildren('children'),
};

Customizable.propTypesRest = true;
Customizable.displayName = "Customizable";
