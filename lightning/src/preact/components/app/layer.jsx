import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import Button from '../button/button';

export default class Layer extends BaseComponent {
    constructor() {
        super();
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.context.registerLayer)) {
            this.context.registerLayer(this);
        }
    }

    render(props, state) {
        const {
            className,
            onCancel,
            onCreate,
        } = props;

        return (
            <div className={ className } data-type={ this.getTypeName() }>
                <div className="slds-p-around_medium slds-border_bottom slds-grid">
                    <Button variant="tertiary" label="Back" onClick={ onCancel }></Button>
                </div>
                <div className="slds-p-around_medium">
                    { onCreate && onCreate() }
                </div>
            </div>
        );
    }
}
