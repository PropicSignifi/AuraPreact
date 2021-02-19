import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Input from '../input/input';

export default class SetupAssistant extends BaseComponent {
    constructor() {
        super();

        this.state = {
            activeSectionName: null,
        };

        this.$sections = [];
    }

    getActiveSectionName() {
        return !_.isUndefined(this.prop("activeSectionName")) ? this.prop("activeSectionName") : this.state.activeSectionName;
    }

    onSelect(e, section) {
        if(section.attributes.skippable && section.attributes.disabled) {
            return;
        }

        if(_.isFunction(this.prop("onSelect"))) {
            if(this.prop("activeSectionName") === section.attributes.name){
                this.prop("onSelect")("");
            } else {
                this.prop("onSelect")(section.attributes.name);
            }

        }

        if(_.isUndefined(this.prop("activeSectionName"))) {
            this.setState({
                activeSectionName: section.attributes.name,
            });
        }
    }

    onToggle(e, section) {
        if(_.isFunction(this.prop("onToggle"))) {
            this.prop("onToggle")(section.attributes.name, !section.attributes.disabled);
        }
    }

    render(props, state) {
        const [{
            className,
            variant,
            activeSectionName,
            children,
        }, rest] = this.getPropValues();

        this.$sections = [];
        _.each(children, child => {
            if(child && child.attributes.name) {
                this.$sections.push(child);
            }
        });

        return (
            <ol
                className={ window.$Utils.classnames("slds-setup-assistant", className) }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                {
                    _.map(this.$sections, (section, index) => {
                        return (
                        <li
                            className="slds-setup-assistant__item"
                            data-type="SetupAssistantSection"
                            data-name={ section.attributes.name }
                        >
                            <article className="slds-setup-assistant__step">
                                <div className={ window.$Utils.classnames(
                                    "slds-summary-detail",
                                    {
                                        'slds-is-open': section.attributes.name === activeSectionName && !section.attributes.disabled,
                                    }
                                    ) }>
                                    <button className="slds-button slds-button_icon slds-m-right_x-small slds-m-top_x-small" title={ section.attributes.label  } aria-controls={ `${section.attributes.name}-summary-action` } aria-expanded={ section.attributes.name === activeSectionName } onClick={ e => this.onSelect(e, section) }>
                                        <PrimitiveIcon variant="bare" iconName="utility:switch" className="slds-button__icon slds-summary-detail__action-icon"></PrimitiveIcon>
                                    </button>
                                    <div className="slds-col">
                                        <div className="slds-summary-detail__title">
                                            <div className="slds-setup-assistant__step-summary">
                                                <div className="slds-media">
                                                    <div className="slds-media__figure">
                                                        <div className={ window.$Utils.classnames(
                                                            "slds-progress-ring slds-progress-ring_large",
                                                            {
                                                                'slds-progress-ring_complete': section.attributes.isCompleted,
                                                            }
                                                        ) }>
                                                            <div className="slds-progress-ring__progress" role="progressbar" aria-valuemin="0" aria-valuemax={ section.attributes.isCompleted ? '100' : '0' } aria-valuenow="100">
                                                                <svg viewBox="-1 -1 2 2">
                                                                    {
                                                                        section.attributes.isCompleted ?
                                                                            <path className="slds-progress-ring__path" d="M 1 0 A 1 1 0 1 1 1 -2.4492935982947064e-16 L 0 0"></path>
                                                                            :
                                                                            <path className="slds-progress-ring__path" d="M 1 0 A 1 1 0 0 0 1 -2.4492935982947064e-16 L 0 0"></path>
                                                                    }

                                                                </svg>
                                                            </div>
                                                            <div className="slds-progress-ring__content">
                                                                {
                                                                    section.attributes.isCompleted ?
                                                                        <span className="slds-icon_container slds-icon-utility-check" title="Complete">
                                                                            <PrimitiveIcon variant="bare" iconName="utility:check" className="slds-icon"></PrimitiveIcon>
                                                                            <span className="slds-assistive-text">Complete</span>
                                                                        </span>
                                                                        :
                                                                        <div>{index + 1}</div>
                                                                }

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="slds-media__body slds-m-top_x-small">
                                                        <div className="slds-media">
                                                            <div className="slds-setup-assistant__step-summary-content slds-media__body">
                                                                <h3 className="slds-setup-assistant__step-summary-title slds-text-heading_small">
                                                                    {
                                                                        section.attributes.disabled ?
                                                                        section.attributes.label :
                                                                        <button class="slds-button slds-button_reset" aria-controls={ `${section.attributes.name}-summary-action` } aria-expanded={ section.attributes.name === activeSectionName } onClick={ e => this.onSelect(e, section) }>{ section.attributes.label }</button>
                                                                    }
                                                                </h3>
                                                                <p>{ section.attributes.description }</p>
                                                            </div>
                                                            <div className="slds-media__figure slds-media__figure_reverse">
                                                                {
                                                                    section.attributes.skippable && (
                                                                    <Input name={ `${section.attributes.name}-toggle` }
                                                                           label={ section.attributes.toggleLabel ? section.attributes.toggleLabel : "toggleLabel" }
                                                                           variant={section.attributes.toggleLabel ? "standard" : "label-hidden"}
                                                                           value={ !section.attributes.disabled } type="toggle" onValueChange={ e => this.onToggle(e, section) }></Input>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div aria-hidden={ section.attributes.name !== activeSectionName } className="slds-summary-detail__content" id={ `${section.name}-summary-action` }>
                                            <div className="slds-setup-assistant__step-detail">
                                                { section.children }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </li>
                        );
                    })
                }
            </ol>
        );
    }
}

SetupAssistant.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'standard',
    ]).defaultValue('standard').demoValue('standard'),
    activeSectionName: PropTypes.isString('activeSectionName').demoValue('one'),
    onSelect: PropTypes.isFunction('onSelect'),
    onToggle: PropTypes.isFunction('onToggle'),
    children: PropTypes.isChildren('children'),
};

SetupAssistant.propTypesRest = true;
SetupAssistant.displayName = "SetupAssistant";
