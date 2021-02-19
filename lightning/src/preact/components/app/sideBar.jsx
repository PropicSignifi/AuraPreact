import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Utils from '../utils/utils';

export default class SideBar extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.bind([
        ]);
    }

    onActionClicked(action) {
        return action.execute();
    }

    render(props, state) {
        const [{
            className,
            standalone,
        }, rest] = this.getPropValues();

        const actions = Utils.getGlobalActions({
            mobile: false,
        });

        return (
            <div className={ window.$Utils.classnames(
                className,
                {
                    'slds-custom-sidebar': standalone,
                }
                ) }>
                {
                    _.map(actions, action => {
                        return (
                        <span className="slds-custom-sidebar-button" data-type={ action.name } onclick={ () => this.onActionClicked(action) }>
                            <span className="slds-custom-sidebar-buttonIcon">
                                <PrimitiveIcon className="slds-icon--x-small" iconName={ action.iconName }></PrimitiveIcon>
                            </span>
                            <span className="slds-custom-sidebar-buttonLabel">{ action.label }</span>
                        </span>
                        );
                    })
                }
            </div>
        );
    }
}

SideBar.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    standalone: PropTypes.isBoolean('standalone').demoValue(true).defaultValue(true),
};

SideBar.propTypesRest = true;
SideBar.displayName = "SideBar";
