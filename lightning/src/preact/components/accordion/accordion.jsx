import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import AccordionSection from './accordionSection';

export default class Accordion extends BaseComponent {
    constructor() {
        super();

        this.state = {
            activeSectionName: null,
        };

        this.$sections = {};
    }

    getActiveSectionName() {
        return !_.isUndefined(this.prop("activeSectionName")) ? this.prop("activeSectionName") : this.state.activeSectionName;
    }

    onSelect(e, section) {
        if(_.isFunction(this.prop("onSelect"))) {
            this.prop("onSelect")(section.attributes.name);
        }

        if(_.isUndefined(this.prop("activeSectionName"))) {
            this.setState({
                activeSectionName: section.attributes.name,
            });
        }
    }

    render(props, state) {
        const [{
            className,
            variant,
            activeSectionName,
            children,
        }, rest] = this.getPropValues();

        this.$sections = {};
        _.each(children, child => {
            if(child && child.attributes.name) {
                this.$sections[child.attributes.name] = child;
            }
        });

        return (
            <ul className={ window.$Utils.classnames(
                {
                    'slds-accordion': variant === 'standard' || variant === 'standard-right',
                },
                className
            ) } data-type={ this.getTypeName() } { ...rest }>
                {
                    _.map(this.$sections, (section, index) => {
                        return (
                        <li className={ window.$Utils.classnames(
                            {
                                'slds-accordion__list-item': variant === 'standard' || variant === 'standard-right',
                            }
                            ) } data-type="AccordionSection" data-name={ section.attributes.name }>
                            <section className={ window.$Utils.classnames(
                                {
                                    'slds-accordion__section': variant === 'standard' || variant === 'standard-right',
                                    'slds-section': variant === 'section',
                                },
                                {
                                    'slds-is-open': section.attributes.name === this.getActiveSectionName(),
                                },
                                section.attributes.className
                                ) }>
                                {
                                    variant === 'standard' && (
                                    <div className="slds-accordion__summary">
                                        <h3 className="slds-text-heading_small slds-accordion__summary-heading">
                                            <button aria-controls={ `accordion-section-${index}` } aria-expanded={ section.attributes.name === this.getActiveSectionName() } className="slds-button slds-button_reset slds-accordion__summary-action" onClick={ e => this.onSelect(e, section) }>
                                                <PrimitiveIcon variant="bare" size="x-small" iconName="utility:switch" className="slds-accordion__summary-action-icon slds-button__icon slds-button__icon_left"></PrimitiveIcon>
                                                <span className="slds-truncate" title={ section.attributes.label }>{ section.attributes.label }</span>
                                            </button>
                                        </h3>
                                        { section.attributes.actions }
                                    </div>
                                    )
                                }
                                {
                                    variant === 'standard-right' && (
                                    <div className="slds-accordion__summary">
                                        <h3 className="slds-text-heading_small slds-accordion__summary-heading">
                                            <button aria-controls={ `accordion-section-${index}` } aria-expanded={ section.attributes.name === this.getActiveSectionName() } className="slds-button slds-button_reset slds-accordion__summary-action slds-grid" onClick={ e => this.onSelect(e, section) }>
                                                <span className="slds-truncate" title={ section.attributes.label }>{ section.attributes.label }</span>
                                                <PrimitiveIcon variant="bare" size="x-small" iconName="utility:switch" className="slds-accordion__summary-action-icon slds-button__icon slds-col_bump-left"></PrimitiveIcon>
                                            </button>
                                        </h3>
                                        { section.attributes.actions }
                                    </div>
                                    )
                                }
                                {
                                    variant === 'section' && (
                                    <h3 className="slds-section__title">
                                        <button aria-controls={ `accordion-section-${index}` } aria-expanded={ section.attributes.name === this.getActiveSectionName() } className="slds-button slds-section__title-action" onClick={ e => this.onSelect(e, section) }>
                                            <PrimitiveIcon variant="bare" size="x-small" iconName="utility:switch" className="slds-section__title-action-icon slds-button__icon slds-button__icon_left"></PrimitiveIcon>
                                            <span className="slds-truncate" title={ section.attributes.label }>{ section.attributes.label }</span>
                                        </button>
                                    </h3>
                                    )
                                }
                                <div aria-hidden={ section.attributes.name !== this.getActiveSectionName() } className={ window.$Utils.classnames(
                                    {
                                        'slds-accordion__content': variant === 'standard' || variant === 'standard-right',
                                        'slds-section__content': variant === 'section',
                                        'slds-p-around_medium': variant === 'section' && section.attributes.name === this.getActiveSectionName(),
                                    }
                                    ) } id={ `accordion-section-${index}` }>
                                    { section.children }
                                </div>
                            </section>
                        </li>
                        );
                    })
                }
            </ul>
        );
    }
}

Accordion.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'standard',
        'standard-right',
        'section',
    ]).defaultValue('standard').demoValue('standard'),
    activeSectionName: PropTypes.isString('activeSectionName').demoValue('one'),
    onSelect: PropTypes.isFunction('onSelect'),
    children: PropTypes.isChildren('children'),
};

Accordion.propTypesRest = true;
Accordion.displayName = "Accordion";
