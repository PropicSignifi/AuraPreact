import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.less';

export default class DockedComposer extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            iconName,
            header,
            visible,
            buttons,
            footer,
            children,
        }, rest] = this.getPropValues();

        const id = this.id();

        return (
            <div className={ `slds-docked_container ${styles.dockedComposer} ${className}` } data-type={ this.getTypeName() } { ...rest }>
                <section
                    className={ window.$Utils.classnames(
                    "slds-docked-composer slds-grid slds-grid_vertical",
                    {
                        'slds-is-open': visible,
                    }
                    ) }
                    role="dialog"
                    aria-labelledby={ `heading-${id}` }
                    aria-describedby={ `content-${id}` }
                >
                    <header className="slds-docked-composer__header slds-grid slds-shrink-none" aria-live="assertive">
                        <div className="slds-media slds-media_center slds-no-space">
                            {
                                iconName && (
                                <div className="slds-media__figure slds-m-right_x-small">
                                    <span className="slds-icon_container">
                                        <PrimitiveIcon
                                            iconName={ iconName }
                                            className="slds-icon slds-icon_small slds-icon-text-default"
                                            variant="bare"
                                        >
                                        </PrimitiveIcon>
                                    </span>
                                </div>
                                )
                            }
                            <div className="slds-media__body">
                                <h2 className="slds-truncate" id={ `heading-${id}` } title={ header }>{ header }</h2>
                            </div>
                        </div>
                        <div className="slds-col_bump-left slds-shrink-none">
                            {
                                _.map(buttons, btn => {
                                    return (
                                    <button className="slds-button slds-button_icon slds-button_icon" title={ btn.alternativeText } onClick={ () => btn.onClick() }>
                                        <PrimitiveIcon
                                            iconName={ btn.iconName }
                                            className="slds-button__icon"
                                            variant="bare"
                                        >
                                        </PrimitiveIcon>
                                    </button>
                                    );
                                })
                            }
                        </div>
                    </header>
                    <div className="slds-docked-composer__body" id={ `content-${id}` }>
                        { children }
                    </div>
                    {
                        footer && (
                            <footer className="slds-docked-composer__footer slds-shrink-none">
                                { footer }
                            </footer>
                        )
                    }
                </section>
            </div>
        );
    }
}

DockedComposer.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    visible: PropTypes.isBoolean('visible').demoValue(true),
    iconName: PropTypes.isString('iconName').demoValue('standard:call'),
    header: PropTypes.isString('header').demoValue('Header'),
    buttons: PropTypes.isArray('buttons').shape({
        iconName: PropTypes.isString('iconName'),
        alternativeText: PropTypes.isString('alternativeText'),
        onClick: PropTypes.isFunction('onClick'),
    }),
    footer: PropTypes.isObject('footer'),
    children: PropTypes.isChildren('children'),
};

DockedComposer.propTypesRest = true;
DockedComposer.displayName = "DockedComposer";
