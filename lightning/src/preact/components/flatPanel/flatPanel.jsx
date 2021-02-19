import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Helptext from '../helptext/helptext';
import styles from './styles.css';

export default class FlatPanel extends BaseComponent {
    constructor() {
        super();

        this.state = {
            isOpen: false,
        };
    }

    onClickHeader(e) {
        if(_.isFunction(this.prop("onClickHeader"))) {
            this.prop("onClickHeader")(this.prop("expanded"));
        }

        if(_.isNull(this.prop("expanded")) || _.isUndefined(this.prop("expanded"))) {
            this.setState({
                isOpen: !this.state.isOpen,
            });
        }
    }

    isExpanded() {
        return _.isNull(this.prop("expanded")) || _.isUndefined(this.prop("expanded")) ? this.state.isOpen : this.prop("expanded");
    }

    render(props, state) {
        const [{
            className,
            tooltip,
            header,
            headerActions,
            iconName,
            expandable,
            expanded,
            style,
            onClickHeader,
            children,
        }, rest] = this.getPropValues();
        return (
            <div className={ window.$Utils.classnames(
                'slds-flat-panel',
                {
                    'slds-flat-panel_expandable': expandable,
                    'slds-is-open': this.isExpanded(),
                },
                styles.flatPanel,
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <div className={ window.$Utils.classnames(
                    'header',
                    {
                        [styles.header]: style === 'base' || style === 'brand',
                        [styles.headerCenter]: style === 'panel',
                    }
                    ) } onClick={ e => this.onClickHeader(e) }>
                    { iconName ? <PrimitiveIcon variant="bare" iconName={ iconName } size={ style === 'brand' ? 'small' : 'x-small' } className="slds-m-right_xx-small"/> : null }
                    <div className={ window.$Utils.classnames({
                            [styles.headerText]: style === 'brand',
                        }) }>{ header }</div>
                    { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"/> : null }
                    { headerActions && (
                        <div className="slds-col_bump-left">
                            { headerActions }
                        </div>
                    ) }
                    { expandable ? <PrimitiveIcon variant="bare" iconName="ctc-utility:a_switch" size="x-small" className="slds-col_bump-left slds-flat-panel_action"/> : null }
                </div>
                <div className={ window.$Utils.classnames(
                    'content',
                    {
                        'content-panel': style === 'panel',
                    },
                    styles.content
                    ) }>
                    { children }
                </div>
            </div>
        );
    }
}

FlatPanel.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    tooltip: PropTypes.isString('tooltip').demoValue(''),
    header: PropTypes.isString('header').demoValue('Header'),
    headerActions: PropTypes.isObject('headerActions'),
    iconName: PropTypes.isIcon('iconName').demoValue('ctc-utility:info_info'),
    expandable: PropTypes.isBoolean('expandable').demoValue(false),
    expanded: PropTypes.isBoolean('expanded').demoValue(false),
    style: PropTypes.isString('style').values([
        'base',
        'panel',
        'brand',
    ]).defaultValue('base').demoValue('base'),
    onClickHeader: PropTypes.isFunction('onClickHeader'),
    children: PropTypes.isChildren('children'),
};

FlatPanel.propTypesRest = true;
FlatPanel.displayName = "FlatPanel";
