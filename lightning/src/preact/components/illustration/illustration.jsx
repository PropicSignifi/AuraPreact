import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Config from '../utils/config';
import Utils from '../utils/utils';
import data from './illustration.data';

Config.defineConfig([
    {
        name: 'Illustration - custom',
        path: '/System/UI/Illustration/extension',
        type: Config.Types.Extension,
        description: 'Add custom illustrations',
    },
]);

export default class Illustration extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            item: null,
        });

        this._lastCustomType = null;
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadCustomData(this.prop('customType'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.loadCustomData(nextProps.customType);
    }

    loadCustomData(customType) {
        if(customType && customType !== this._lastCustomType) {
            Config.loadExtension('/System/UI/Illustration/extension', this.context.globalData)
                .then(resources => {
                    return Promise.all(_.map(resources, Utils.retrieve));
                })
                .then(extensions => {
                    const customData = {};

                    _.forEach(extensions, extension => {
                        _.merge(customData, extension);
                    });

                    this.setState({
                        item: customData[customType],
                    }, () => {
                        this._lastCustomType = customType;
                    });
                });
        }
    }

    getItem() {
        if(this.state.item) {
            return this.state.item;
        }
        else {
            return data[this.prop('type')];
        }
    }

    render(props, state) {
        const [{
            className,
            title,
            message,
            type,
            variant,
        }, rest] = this.getPropValues();

        const item = this.getItem();

        return (
            <div className={ `slds-illustration slds-illustration_${variant} ${className}` } data-type={ this.getTypeName() } { ...rest }>
                <svg
                    className="slds-illustration_small"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={ { __html: item.content } }
                    viewBox={ item.viewBox }
                >
                </svg>
                <div className="slds-text-longform">
                    {
                        title && (
                        <h3 className="slds-text-heading_medium">{ title }</h3>
                        )
                    }
                    {
                        message && (
                        <p class="slds-text-body_regular">{ message }</p>
                        )
                    }
                </div>
            </div>
        );
    }
}

Illustration.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').demoValue('Title'),
    message: PropTypes.isString('message').demoValue('Message'),
    type: PropTypes.isString('type').values(Object.keys(data)).defaultValue('fishing_deals').demoValue('fishing_deals'),
    customType: PropTypes.isString('customType').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'small',
        'large',
    ]).defaultValue('small').demoValue('small'),
};

Illustration.propTypesRest = true;
Illustration.displayName = "Illustration";
