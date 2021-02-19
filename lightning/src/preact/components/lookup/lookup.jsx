import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Button from '../button/button';

export default class Lookup extends AbstractField {
    constructor() {
        super();
    }

    onLookup(e) {
        if(this.prop("disabled") || this.prop("readonly")) {
            return;
        } else{
            if(this.prop("value")) {
                this.setValue(null);
            }
            else {
                if(_.isFunction(this.prop("onLookup"))) {
                    this.prop("onLookup")(data => {
                        this.setValue(data);
                    });
                }
            }
        }
    }

    renderField(props, state, variables) {
        const [{
            className,
            tooltip,
            name,
            label,
            value,
            variant,
            disabled,
            readonly,
            required,
            onLookup,
            onValueChange,
            style,
            searchLabel,
        }, rest] = this.getPropValues();

        if(!value) {
            if(style === 'traditional') {
                return (
                    <div className="slds-input-group slds-lookup" data-type={ this.getTypeName() }>
                        <input className="slds-input" readonly="true" type="text" id={ variables.id } name={ name } value={ '' } disabled={ variables.isDisabled } { ...rest }/>
                        <span className="input-group-addon" onClick={ e => this.onLookup(e) }>
                            <PrimitiveIcon variant="bare" iconName="ctc-utility:a_search" size="x-small"></PrimitiveIcon>
                        </span>
                    </div>
                );
            }
            else {
                return (
                    <div className="slds-grid" data-type={ this.getTypeName() }>
                        <Button
                            className="slds-size_1-of-1"
                            label={ searchLabel || 'Search' }
                            variant="tertiary"
                            iconPosition="left"
                            iconName="ctc-utility:a_search"
                            onClick={ e => this.onLookup(e) }
                        >
                        </Button>
                    </div>
                );
            }
        }
        else {
            return (
                <div className="slds-input-group slds-lookup" data-type={ this.getTypeName() }>
                    <input className="slds-input" readonly="true" type="text" id={ variables.id } name={ name } value={ value.label } disabled={ variables.isDisabled } { ...rest }/>
                    <span className="input-group-addon" onClick={ e => this.onLookup(e) }>
                        <PrimitiveIcon variant="bare" iconName="ctc-utility:a_clear" size="x-small"></PrimitiveIcon>
                    </span>
                </div>
            );
        }
    }
}

Lookup.propTypes = PropTypes.extend(AbstractField.propTypes, {
    onLookup: PropTypes.isFunction('onLookup').required(),
    style: PropTypes.isString('style').values([
        'latest',
        'traditional',
    ]).defaultValue('latest').demoValue('latest'),
    searchLabel: PropTypes.isString('searchLabel'),
});

Lookup.propTypes.name.demoValue('lookup');
Lookup.propTypes.label.demoValue('Lookup');

Lookup.propTypesRest = true;
Lookup.displayName = "Lookup";
