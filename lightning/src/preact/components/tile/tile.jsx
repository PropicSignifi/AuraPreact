import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Tile extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            label,
            href,
            media,
            children,
        }, rest] = this.getPropValues();
        if(media) {
            return (
                <div className={ window.$Utils.classnames('slds-tile slds-media', className) } data-type={ this.getTypeName() } { ...rest }>
                    <div className="slds-media__figure">
                        { media }
                    </div>
                    <div className="slds-media__body">
                        <h3 className="slds-truncate" title={ label }>
                            <a href={ href }>
                                { label }
                            </a>
                        </h3>
                        <div className="slds-tile__detail slds-text-body--small">
                            { children }
                        </div>
                    </div>
                </div>
            );
        }
        else {
            <div className={ window.$Utils.classnames('slds-tile', className) } data-type={ this.getTypeName() } { ...rest }>
                <h3 className="slds-truncate" title={ label }>
                    <a href={ href }>
                        { label }
                    </a>
                </h3>
                <div className="slds-tile__detail slds-text-body--small">
                    { children }
                </div>
            </div>
        }
    }
}

Tile.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').demoValue('Tile'),
    href: PropTypes.isString('href').demoValue(''),
    media: PropTypes.isObject('media'),
    children: PropTypes.isChildren('children'),
};

Tile.propTypesRest = true;
Tile.displayName = "Tile";
