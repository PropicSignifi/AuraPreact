import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class PageHeader extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            iconName,
            iconClass,
            title,
            children,
            actions,
        }, rest] = this.getPropValues();

        return (
            <div className={ `slds-page-header ${className}` } data-type={ this.getTypeName() } { ...rest }>
                <div className="slds-grid">
                    <div className="slds-col slds-has-flexi-truncate">
                        <div className="slds-media slds-no-space slds-grow">
                            <div className="slds-media__figure">
                                <span className={ `slds-icon_container ${iconClass}` } title={ title }>
                                    <PrimitiveIcon iconName={ iconName } variant="bare" className="slds-icon"></PrimitiveIcon>
                                </span>
                            </div>
                            <div className="slds-media__body">
                                <nav>
                                    <ol className="slds-breadcrumb slds-line-height_reset">
                                        <li className="slds-breadcrumb__item">
                                            <span>{ title }</span>
                                        </li>
                                    </ol>
                                </nav>
                                <h1 className="slds-page-header__title slds-p-right_x-small">
                                    { children }
                                </h1>
                            </div>
                            {
                                actions ?
                                <div className="slds-media__figure">
                                    { actions }
                                </div> : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

PageHeader.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    iconName: PropTypes.isIcon('iconName').required().demoValue('standard:opportunity'),
    iconClass: PropTypes.isString('iconClass').demoValue('slds-icon-standard-opportunity'),
    title: PropTypes.isString('title').required().demoValue('Opportunities'),
    children: PropTypes.isChildren('children'),
    actions: PropTypes.isChildren('actions'),
};

PageHeader.propTypesRest = true;
PageHeader.displayName = "PageHeader";
