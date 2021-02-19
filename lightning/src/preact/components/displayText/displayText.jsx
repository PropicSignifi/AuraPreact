import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import styles from './displayText.less';

export default class DisplayText extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });
    }

    render(props, state) {
        const [{
            className,
            content,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ `${styles.text} ${className}` }>
                { content || children }
            </div>
        );
    }
}

DisplayText.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    content: PropTypes.isString('content'),
    children: PropTypes.isChildren('children'),
};

DisplayText.propTypesRest = true;
