import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Config from '../utils/config';
import Utils from '../utils/utils';
import ctcUtilitySprite from './icons/ctc-utility-sprite/svg/symbols.js';
import ctcStandardSprite from './icons/ctc-standard-sprite/svg/symbols.js';
import utilitySprite from './icons/utility-sprite/svg/symbols.js';
import standardSprite from './icons/standard-sprite/svg/symbols.js';
import actionSprite from './icons/action-sprite/svg/symbols.js';
import revealUtilitySprite from './icons/reveal-utility-sprite/svg/symbols.js';
import reveal2UtilitySprite from './icons/reveal2-utility-sprite/svg/symbols.js';

Config.defineConfig([
    {
        name: 'Icon - custom',
        path: '/System/UI/Icon/extension',
        type: Config.Types.Extension,
        description: 'Add custom icons',
    },
]);

const Icons = {
    'ctc-utility': ctcUtilitySprite,
    'ctc-standard': ctcStandardSprite,
    'utility': utilitySprite,
    'standard': standardSprite,
    'action': actionSprite,
    'reveal-utility': revealUtilitySprite,
    'reveal2-utility': reveal2UtilitySprite,
};

const splitIconName = iconName => {
    const items = _.split(iconName, ":");
    window.$Utils.assert(_.size(items) === 2, "Icon name should be in the format of 'category:name'");
    return items;
};

const getIconSvg = (source, iconName) => {
    if(!iconName) {
        return null;
    }

    const [category, name] = splitIconName(iconName);
    return _.get(source, `${category}.${name}`, '');
};

export class PrimitiveIcon extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            svg: null,
        });

        this._lastCustomIconName = null;
    }

    componentDidMount() {
        super.componentDidMount();

        this.loadCustomIcons(this.prop('customIconName'));
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        this.loadCustomIcons(nextProps.customIconName);
    }

    loadCustomIcons(customIconName) {
        if(customIconName && customIconName !== this._lastCustomIconName) {
            Config.loadExtension('/System/UI/Icon/extension', this.context.globalData)
                .then(resources => {
                    return Promise.all(_.map(resources, Utils.retrieve));
                })
                .then(extensions => {
                    const customIcons = {};
                    _.forEach(extensions, extension => {
                        _.merge(customIcons, extension);
                    });

                    if(!this.getBuiltinSvg()) {
                        const svg = getIconSvg(customIcons, customIconName);
                        this.setState({
                            svg,
                        }, () => {
                            this._lastCustomIconName = customIconName;
                        });
                    }
                });
        }
    }

    getBuiltinSvg() {
        return getIconSvg(Icons, this.prop('iconName'));
    }

    getSvg() {
        if(this.state.svg) {
            return this.state.svg;
        }
        else {
            return this.getBuiltinSvg();
        }
    }

    render(props, state) {
        const [{
            className,
            size,
            variant,
        }, rest] = this.getPropValues();
        const svg = this.getSvg();

        return (
            <svg className={ window.$Utils.classnames(
                {
                    [`slds-icon-text-${variant}`]: variant === 'light' || variant === 'error' || variant === 'warning' || variant === 'default',
                    [`slds-icon_${size}`]: size === 'x-small' || size === 'small' || size === 'large',
                },
                className
            ) } aria-hidden="true" data-type={ this.getTypeName() } { ...rest } dangerouslySetInnerHTML={ { __html: svg } } viewBox="0 0 24 24"
            />
        );
    }
}

PrimitiveIcon.propTypes = {
    className: PropTypes.isString('className'),
    iconName: PropTypes.isIcon('iconName'),
    customIconName: PropTypes.isIcon('customIconName'),
    size: PropTypes.isString('size').values([
        "x-small",
        "small",
        "large",
    ]),
    variant: PropTypes.isString('variant').values([
        "light",
        "error",
        "warning",
        "default",
    ]),
};

PrimitiveIcon.propTypesRest = true;

export class Icon extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            title,
            iconName,
            customIconName,
            size,
            variant,
            alternativeText,
        }, rest] = this.getPropValues();
        const [category, name] = splitIconName(iconName || customIconName);

        return (
            <span className={ `slds-icon_container slds-icon-${category}-${name}` } title={ title } data-type={ this.getTypeName() } { ...rest }>
                <PrimitiveIcon
                    className={ window.$Utils.classnames(
                    'slds-icon',
                    {
                        [`slds-icon-text-${variant}`]: variant === 'light' || variant === 'error' || variant === 'warning' || variant === 'default',
                        [`slds-icon_${size}`]: size === 'x-small' || size === 'small' || size === 'large',
                    },
                    className
                    ) }
                    iconName={ iconName }
                    customIconName={ customIconName }
                >
                </PrimitiveIcon>
                <span className="slds-assistive-text">{ alternativeText }</span>
            </span>
        );
    }
}

Icon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').demoValue(''),
    iconName: PropTypes.isIcon('iconName').demoValue('ctc-utility:info_info'),
    customIconName: PropTypes.isIcon('customIconName').demoValue(''),
    size: PropTypes.isString('size').values([
        'x-small',
        'small',
        'large',
    ]).demoValue('x-small'),
    variant: PropTypes.isString('variant').values([
        'light',
        'warning',
        'error',
        'default',
    ]).demoValue('default'),
    alternativeText: PropTypes.isString('alternativeText').demoValue(''),
};

Icon.propTypesRest = true;
Icon.displayName = "Icon";
