import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class IFrame extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            url,
            width,
            height,
        }, rest] = this.getPropValues();

        return (
            <iframe
                className={ className }
                src={ url }
                width={ width }
                height={ height }
                data-type={ this.getTypeName() }
                { ...rest }
            >
            </iframe>
        );
    }
}

IFrame.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    url: PropTypes.isString('url').demoValue('https://www.wikipedia.org/'),
    width: PropTypes.isString('width').defaultValue('400px').demoValue('400px'),
    height: PropTypes.isString('height').defaultValue('300px').demoValue('300px'),
};

IFrame.propTypesRest = true;
IFrame.displayName = "IFrame";
