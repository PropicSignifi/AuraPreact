import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Spinner from '../spinner/spinner';
import Portal from 'preact-portal';
import styles from './styles.css';
import { Observable, Subject, } from 'rxjs';
import Utils from '../utils/utils';

export default class SuggestionBox extends AbstractPopupField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            searchText: null,
            loading: false,
            suggestions: [],
            cachedSuggestions: null,
            focused: false,
        });

        this.setLayeredEditorUI = this.setLayeredEditorUI.bind(this);
    }

    createLayeredEditor() {
        const id = this.id();
        const iconName = this.prop('iconName');
        const value = this.prop('value');
        const placeholder = this.prop('placeholder');
        const minLetters = this.prop('minLetters');

        return this.state.focused ? (
            <div className={ window.$Utils.classnames(
                'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-lookup'
                ) } role="combobox">
                <div className={ window.$Utils.classnames(
                    'slds-combobox__form-element slds-input-has-icon',
                    {
                        'slds-input-has-icon_left-right': iconName,
                        'slds-input-has-icon_right': !iconName,
                    }
                    ) } role="none">
                    <input type="text" className={ window.$Utils.classnames(
                        'slds-input slds-combobox__input',
                        {
                            [styles.inputStyle]: iconName,
                        }
                        ) } aria-autocomplete="list" role="textbox" value={ this.getCurrentLabel() } placeholder={ placeholder } onInput={ e => this.onSearchText(e.target.value, minLetters) } autofocus></input>
                    {
                        iconName ?
                        <PrimitiveIcon variant="bare" iconName={ iconName } className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                        : null
                    }
                    {
                        !value ?
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
                            <PrimitiveIcon variant="bare" iconName="ctc-utility:a_search" className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default"></PrimitiveIcon>
                        </span>
                        :
                        <button className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" title="Remove selected option" onClick={ e => this.onClearItem(e) }>
                            <PrimitiveIcon variant="bare" iconName="ctc-utility:a_clear" className="slds-button__icon"></PrimitiveIcon>
                            <span className="slds-assistive-text">Remove selected option</span>
                        </button>
                    }
                </div>
                <div role="listbox" className={ `slds-is-relative` }>
                    <ul className={ window.$Utils.classnames(
                        `slds-listbox slds-listbox_vertical`,
                        'slds-dropdown_custom-suggestion-box',
                        this.prop('popupClass')
                        ) } role="presentation">
                        { this.getOptions(id) }
                    </ul>
                </div>
            </div>
        ) : null;
    }

    setLayeredEditorUI() {
        if(window.$Utils.isNonDesktopBrowser()) {
            if(_.isFunction(this.context.setLayeredEditorUI)) {
                const ui = this.createLayeredEditor();
                this.context.setLayeredEditorUI(ui, () => {
                    this.setState({
                        focused: false,
                    });
                }, this.id());
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject) {
            this.subject = new Subject();
            this.subject.debounceTime(this.prop('wait')).switchMap(data => {
                this.setState({
                    loading: true,
                });
                const result = this.prop('getSuggestions')(this.state.searchText);
                return Observable.fromPromise(window.$Utils.isPromise(result) ? result : Promise.resolve(result))
                    .catch(error => {
                        Utils.catchError(error);

                        return Observable.of([]);
                    });
            }).subscribe(data => {
                if(this.prop('cache')) {
                    this.setState({
                        loading: false,
                        suggestions: this.getFilteredSuggestions(data),
                        focusedIndex: -1,
                        cachedSuggestions: data,
                    });
                }
                else {
                    this.setState({
                        loading: false,
                        suggestions: this.getFilteredSuggestions(data),
                        focusedIndex: -1,
                    })
                }
            });
        }
    }

    onFocus(e, minLetters) {
        this.setState({
            suggestions: [],
            focused: true,
        }, () => {
            this.onSearchText(this.state.searchText, minLetters);
        });
    }

    onClearItem(e, isDisabled) {
        if (isDisabled) {
            return;
        } else {
            this.setValue(null);
        }
    }

    getCurrentLabel() {
        return this.prop("value") ? this.prop("value").label : this.state.searchText;
    }

    onClickItem(e, suggestion) {
        this.setState({
            prompted: false,
            searchText: null,
            focused: false,
        });
        this.setValue(suggestion);
    }

    onSearchText(searchText, minLetters) {
        if(_.isFunction(this.prop('onInput'))) {
            this.prop('onInput')(searchText);
        }

        if(_.size(searchText) < _.parseInt(minLetters)) {
            this.setState({
                searchText,
                prompted: false,
            });
        }
        else {
            this.setState({
                searchText,
            }, () => {
                super.onFocus(null);

                if(!_.isFunction(this.prop('getSuggestions'))) {
                    return;
                }
                if(this.prop('cache') && this.state.cachedSuggestions) {
                    this.setState({
                        suggestions: this.getFilteredSuggestions(this.state.cachedSuggestions),
                        focusedIndex: -1,
                    });
                }
                else {
                    this.subject.next({});
                }
            });
        }
    }

    getFilteredSuggestions(suggestions) {
        if(this.prop('enableJsFilter')){
            return _.filter(suggestions, item => _.includes(_.toLower(item.label), _.toLower(this.state.searchText)));
        } else return suggestions;
    }

    createBottomComponent() {
        if(_.isFunction(this.prop('bottomComp'))) {
            return (
                <li key="bottomComp" role="presentation" className="slds-listbox__item">
                    { this.prop('bottomComp')((e, suggestion) => this.onClickItem(e, suggestion)) }
                </li>
            );
        }
        else {
            return (
                <li key="bottomComp" role="presentation" className="slds-listbox__item" onClick={ e => this.onClickItem(e, null) }>
                    { this.prop('bottomComp') }
                </li>
            );
        }
    }

    getOptions(id) {
        if(this.state.loading) {
            return (
                <li role="presentation" className='slds-listbox__item' style="height: 3.5rem;">
                    <Spinner variant="brand" size="medium" alternativeText="loading"></Spinner>
                </li>
            );
        }
        else if(_.isEmpty(this.state.suggestions) && !_.isEmpty(this.state.searchText)) {
            const items = [
                <li role="presentation" className='slds-listbox__item' >
                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-noResultFound` }>
                        <h3 className="slds-text-title_caps" role="presentation">No result found</h3>
                    </span>
                </li>
            ];
            if(this.prop('bottomComp')) {
                return [
                    ...items,
                    this.createBottomComponent(),
                ];
            }
            else {
                return items;
            }
        }
        else {
            const items = _.map(this.state.suggestions, (suggestion, index) => {
                return (
                    <li key={ `${suggestion.value}-${index}` } role="presentation" className="slds-listbox__item" onClick={ e => this.onClickItem(e, suggestion) }>
                        <span id={ `listbox-option-${id}-${index}` } className="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                            {
                                suggestion.iconName ?
                                <span className="slds-media__figure">
                                    <span className={ window.$Utils.classnames(
                                        'slds-icon_container',
                                        {
                                            'slds-icon_container-default': !suggestion.iconContainer,
                                            [`slds-icon_container-${suggestion.iconContainer}`]: suggestion.iconContainer,
                                        }
                                        ) } title={ suggestion.iconName }>
                                        <PrimitiveIcon variant="bare" iconName={ suggestion.iconName } className="slds-icon slds-icon_small"></PrimitiveIcon>
                                        <span className="slds-assistive-text"></span>
                                    </span>
                                </span>
                                : null
                            }
                            <span className="slds-media__body">
                                <span className="slds-listbox__option-text slds-listbox__option-text_entity">{ suggestion.label }</span>
                                {
                                    suggestion.iconName && suggestion.description ?
                                    <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">{ suggestion.description }</span>
                                    : null
                                }
                            </span>
                        </span>
                    </li>
                );
            });

            if(this.prop('bottomComp')) {
                return [
                    ...items,
                    this.createBottomComponent(),
                ];
            }
            else {
                return items;
            }
        }
    }

    renderField(props, state, variables) {
        const [{
            className,
            popupClass,
            tooltip,
            name,
            label,
            value,
            variant,
            disabled,
            readonly,
            required,
            placeholder,
            cache,
            wait,
            minLetters,
            limit,
            iconName,
            addonBefore,
            addonBeforeClassName,
            onValueChange,
            renderSelectedLabel,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        this.setLayeredEditorUI();

        return (
            <div className={ window.$Utils.classnames(
                'slds-combobox_container slds-has-inline-listbox',
                {
                    'slds-has-input-focus': this.isPrompted(),
                }
                ) }>
                <div ref={ node => this.setMainInput(node) } className={ window.$Utils.classnames(
                    'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-lookup',
                    {
                        'slds-is-open': this.isPrompted(),
                    }
                    ) } aria-expanded="false" aria-haspopup="listbox" role="combobox" data-popup-source={ id }>
                    <div className={ window.$Utils.classnames(
                        'slds-combobox__form-element slds-input-has-icon',
                        {
                            'slds-input-has-icon_left-right': iconName,
                            'slds-input-has-icon_right': !iconName,
                            'slds-input-has-fixed-addon': addonBefore,
                        }
                        ) } role="none">
                        {
                            addonBefore ?
                            <span className={ window.$Utils.classnames(
                                'slds-form-element__addon addon-before',
                                addonBeforeClassName
                            ) }>{ addonBefore }</span>
                            : null
                        }
                        {
                            this.prop("value") && renderSelectedLabel ?
                            renderSelectedLabel({ id, label: this.getCurrentLabel(), value: this.prop("value"), placeholder, })
                            :
                            <input type="text" className={ window.$Utils.classnames(
                                'slds-input slds-combobox__input',
                                {
                                    [styles.inputStyle]: iconName,
                                }
                                ) } id={ id } aria-autocomplete="list" aria-controls={ `listbox-${id}` } role="textbox" value={ this.getCurrentLabel() } placeholder={ placeholder } disabled={ isDisabled } readonly={ this.prop("value") } onFocusIn={ e => this.onFocus(e, minLetters) } onInput={ e => this.onSearchText(e.target.value, minLetters) }></input>
                        }
                        {
                            iconName ?
                            <PrimitiveIcon variant="bare" iconName={ iconName } className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                            : null
                        }
                        {
                            !value ?
                            <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
                                <PrimitiveIcon variant="bare" iconName="ctc-utility:a_search" className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default"></PrimitiveIcon>
                            </span>
                            :
                            <button className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" title="Remove selected option" onClick={ e => this.onClearItem(e, isDisabled) }>
                                <PrimitiveIcon variant="bare" iconName="ctc-utility:a_clear" className="slds-button__icon"></PrimitiveIcon>
                                <span className="slds-assistive-text">Remove selected option</span>
                            </button>
                        }
                    </div>
                    <Portal into="body">
                        <div data-popup-source={ id } id={ `listbox-${id}` } role="listbox" className={ `slds-dropdown_append-to-body ${popupClass}` } style={ state.popupStyle }>
                            <ul className={ window.$Utils.classnames(
                                `slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_length-${limit}`,
                                {
                                    'slds-hide': !this.isPrompted(),
                                },
                                'slds-dropdown_custom-suggestion-box'
                                ) } role="presentation">
                                { this.getOptions(id) }
                            </ul>
                        </div>
                    </Portal>
                </div>
            </div>
        );
    }
}

SuggestionBox.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    getSuggestions: PropTypes.isFunction('getSuggestions').required(),
    cache: PropTypes.isBoolean('cache').demoValue(false),
    wait: PropTypes.isNumber('wait').defaultValue(200).demoValue(200),
    minLetters: PropTypes.isNumber('minLetters').defaultValue(3).demoValue(3),
    limit: PropTypes.isNumber('limit').defaultValue(5).demoValue(5),
    iconName: PropTypes.isIcon('iconName').demoValue(''),
    addonBefore: PropTypes.isObject('addonBefore').demoValue(''),
    addonBeforeClassName: PropTypes.isString('addonBeforeClassName').demoValue(''),
    onInput: PropTypes.isFunction('onInput'),
    bottomComp: PropTypes.isObject('bottomComp'),
    enableJsFilter: PropTypes.isBoolean('enableJsFilter').defaultValue(true).demoValue(true),
    renderSelectedLabel: PropTypes.isFunction('renderSelectedLabel'),
});

SuggestionBox.propTypes.name.demoValue('suggestionBox');
SuggestionBox.propTypes.label.demoValue('Suggestion Box');

SuggestionBox.propTypesRest = true;
SuggestionBox.displayName = "SuggestionBox";
