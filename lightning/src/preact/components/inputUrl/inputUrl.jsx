import { h, render, Component } from 'preact';
import AbstractProxyField from '../field/proxyField';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';
import ButtonIcon from '../buttonIcon/buttonIcon';
import styles from './styles.less';
import Utils from '../utils/utils';

export default class InputUrl extends AbstractProxyField {
    constructor() {
        super();
    }

    createLinkButton(url, title, name) {
        if(url) {
            return (
                <ButtonIcon
                    iconName="utility:new_window"
                    className={ styles.webLink }
                    size="x-small"
                    title={ title }
                    variant="bare"
                    onClick={ () => Utils.openUrl(url, '_blank') }
                >
                </ButtonIcon>
            );
        }
    }

    render(props, state) {
        const {
            pattern,
            patternMessage,
            value,
            label,
            name,
            ...rest,
        } = props;

        const _pattern = pattern || '(^(http|https)://)|^$';
        const _patternMessage = patternMessage || 'URL must start with http:// or https://';

        return (
            <Input
                ref={ node => this.setField(node) }
                labelComponent={ this.createLinkButton(value, label, name) }
                pattern={ _pattern }
                patternMessage={ _patternMessage }
                name={ name }
                label={ label }
                value={ value }
                data-type={ this.getTypeName() }
                { ...rest }
            >
            </Input>
        );
    }
}

InputUrl.propTypes = PropTypes.extend(Input.propTypes, {
    value: PropTypes.isString('value'),
});

InputUrl.propTypes.name.demoValue('inputUrl');
InputUrl.propTypes.label.demoValue('Input URL');

InputUrl.propTypesRest = true;
InputUrl.displayName = "InputUrl";
