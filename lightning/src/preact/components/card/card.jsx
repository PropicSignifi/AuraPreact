import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class Card extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            iconName,
            title,
            titleComponent,
            actions,
            footer,
            children,
        }, rest] = this.getPropValues();

        const [category, icon] = _.split(iconName, ':');

        return (
            <article className={ `slds-card ${className}` } data-type={ this.getTypeName() } { ...rest }>
                <div className="slds-card__header slds-grid">
                    <header className="slds-media slds-media_center slds-has-flexi-truncate">
                        {
                            iconName && (
                            <div className="slds-media__figure">
                                <span className={ `slds-icon_container slds-icon-${category}-${icon}` } title={ title }>
                                    <PrimitiveIcon
                                        variant="bare"
                                        iconName={ iconName }
                                        className="slds-icon slds-icon_small"
                                    >
                                    </PrimitiveIcon>
                                </span>
                            </div>
                            )
                        }
                        <div className="slds-media__body">
                            <h2 className="slds-card__header-title">
                                {
                                    titleComponent ? titleComponent : (
                                        <a href="javascript:void(0);" className="slds-card__header-link slds-truncate" title={ title }>
                                            <span>{ title }</span>
                                        </a>
                                    )
                                }
                            </h2>
                        </div>
                        {
                            actions && (
                            <div className="slds-no-flex">
                                { actions }
                            </div>
                            )
                        }
                    </header>
                </div>
                <div className="slds-card__body slds-card__body_inner">
                    { children }
                </div>
                {
                    footer && (
                    <footer className="slds-card__footer">
                        { footer }
                    </footer>
                    )
                }
            </article>
        );
    }
}

Card.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    iconName: PropTypes.isString('iconName').demoValue('standard:account'),
    title: PropTypes.isString('title').required().demoValue('Account'),
    actions: PropTypes.isObject('actions'),
    footer: PropTypes.isObject('footer'),
    children: PropTypes.isChildren('children'),
    titleComponent: PropTypes.isObject('titleComponent'),
};

Card.propTypesRest = true;
Card.displayName = "Card";
