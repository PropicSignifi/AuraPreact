import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.less';

export default class FormGroup extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showAdvanced: false,
        });

        this.bind([
            'onToggleExpand',
        ]);
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            showAdvanced: !this.prop('enableAdvanced') || this.state.showAdvanced,
        });
    }

    onToggleExpand() {
        this.setState({
            showAdvanced: !this.state.showAdvanced,
        });
    }

    renderAdvancedLine() {
        if(this.prop('enableAdvanced')) {
            return (
                <div className={ styles.advancedLine }>
                    <PrimitiveIcon
                        iconName={ this.state.showAdvanced ? 'utility:chevronup' : 'utility:chevrondown' }
                        size="small"
                        onClick={ this.onToggleExpand }
                    >
                    </PrimitiveIcon>
                </div>
            );
        }
    }

    render(props, state) {
        const [{
            className,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ `slds-grid slds-gutters slds-wrap ${className}` } { ...rest }>
                { children }
                { this.renderAdvancedLine() }
            </div>
        );
    }
}

FormGroup.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    enableAdvanced: PropTypes.isBoolean('enableAdvanced').demoValue(false),
    children: PropTypes.isChildren('children'),
};

FormGroup.propTypesRest = true;
FormGroup.displayName = "FormGroup";
