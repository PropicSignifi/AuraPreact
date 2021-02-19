import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Spinner from '../spinner/spinner';
import Pill from '../pill/pill';
import Portal from 'preact-portal';
import KBI from '../utils/kbi';
import styles from './styles.less';
import { Observable, Subject, } from 'rxjs';
import Utils from '../utils/utils';

export default class TagsInput extends AbstractPopupField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            searchText: null,
            loading: false,
            async: false,
            tags: [],
            cachedTags: null,
            focusedIndex: -1,
            focused: false,
        });

        this.setLayeredEditorUI = this.setLayeredEditorUI.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject) {
            this.subject = new Subject();
            this.subject.debounceTime(this.prop('wait')).switchMap(data => {
                this.setState({
                    loading: true,
                });
                const result = this.prop('getTags')(this.state.searchText);
                return Observable.fromPromise(window.$Utils.isPromise(result) ? result : Promise.resolve(result))
                    .catch(error => {
                        Utils.catchError(error);

                        return Observable.of([]);
                    });
            }).subscribe(data => {
                if(this.prop('cache')) {
                    this.setState({
                        loading: false,
                        tags: this.getFilteredTags(data),
                        focusedIndex: -1,
                        cachedTags: data,
                    });
                }
                else {
                    this.setState({
                        loading: false,
                        tags: this.getFilteredTags(data),
                        focusedIndex: -1,
                    });
                }
            });
        }
    }

    validate(newVal) {
        if(this.prop('required') && _.isEmpty(newVal)) {
            return `'${this.prop('label')}' is required`;
        }

        return super.validate(newVal);
    }

    onRemoveTag(e, tag, isDisabled) {
        if(isDisabled) {
            return;
        }

        const newVal = _.without(this.prop("value"), tag);
        if(_.isFunction(this.prop("removeTag"))) {
            const p = this.prop("removeTag")(tag);
            if(window.$Utils.isPromise(p)) {
                this.setState({
                    async: true,
                });

                p.then(() => {
                    this.setValue(newVal);
                    this.setState({
                        async: false,
                    });
                });
            }
        }
        else {
            this.setValue(newVal);
        }
    }

    onClickTag(e, tag, isDisabled) {
        if(isDisabled) {
            return;
        }

        if(_.isFunction(this.prop("clickOnTag"))) {
            this.prop('clickOnTag')(tag);
        }
    }

    hasAsyncOperation() {
        return this.prop("addTag") || this.prop("removeTag");
    }

    getFormElementClass() {
        const classes = ['slds-combobox__form-element'];
        const hasIconLeft = !!this.prop("iconNameLeft");
        const hasIconRight = !!this.prop("iconNameRight") || this.hasAsyncOperation();
        const shouldHideIconLeft = this.prop("style") === 'inside' && !_.isEmpty(this.prop("value"));

        if(hasIconLeft && hasIconRight) {
            if(shouldHideIconLeft) {
                classes.push('slds-input-has-icon slds-input-has-icon_right');
            }
            else {
                classes.push('slds-input-has-icon slds-input-has-icon_left-right');
            }
        }
        else if(hasIconLeft) {
            if(!shouldHideIconLeft) {
                classes.push('slds-input-has-icon slds-input-has-icon_left');
            }
        }
        else if(hasIconRight) {
            classes.push('slds-input-has-icon slds-input-has-icon_right');
        }

        return classes.join(" ");
    }

    onFocus(e, minLetters) {
        this.setState({
            tags: [],
            focused: true,
        }, () => {
            this.onSearchText(this.state.searchText, minLetters);
        });
    }

    onMouseOver(e, index) {
        this.setState({
            focusedIndex: index,
        });
    }

    onClickItem(e, tag) {
        this.setState({
            prompted: false,
            searchText: null,
            focused: false,
        });

        if(_.find(this.prop("value"), ["label", tag.label])) {
            return;
        }
        if(_.isFunction(this.prop("addTag"))) {
            const p = this.prop("addTag")(tag);
            if(window.$Utils.isPromise(p)) {
                this.setState({
                    async: true,
                });

                p.then(tag => {
                    if(tag) {
                        const newVal = [...(this.prop("value") || []), tag];
                        this.setValue(newVal);
                    }
                    this.setState({
                        async: false,
                    });
                });
            }
            else {
                if(p) {
                    const newVal = [...(this.prop("value") || []), p];
                    this.setValue(newVal);
                }
            }
        }
        else {
            const newVal = [...(this.prop("value") || []), tag];
            this.setValue(newVal);
        }
    }

    createLayeredEditor() {
        return this.state.focused ? (
            <div>
                <div className={ this.getFormElementClass() } role="none">
                    <input type="text" className="slds-input slds-combobox__input" aria-autocomplete="list" role="textbox" value={ this.state.searchText } placeholder={ this.state.placeholder } onInput={ e => this.onSearchText(e.target.value, this.prop('minLetters')) } onKeyDown={ e => this.onKeyDown(e) } autofocus></input>
                    {
                        this.prop('iconNameLeft') ?
                        <PrimitiveIcon variant="bare" iconName={ this.prop('iconNameLeft') } className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                        : null
                    }
                    { this.getIconRight() }
                </div>
                <div role="listbox" className={ `slds-is-relative` }>
                    <ul className={ window.$Utils.classnames(
                        `slds-listbox slds-listbox_vertical`,
                        this.prop('popupClass')
                        ) } role="presentation">
                        { this.getOptions(this.id(), this.prop('messageWhenNoResultFound')) }
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

    onSearchText(searchText, minLetters) {
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

                if(!_.isFunction(this.prop('getTags'))) {
                    return;
                }
                if(this.prop('cache') && this.state.cachedTags) {
                    this.setState({
                        tags: this.getFilteredTags(this.state.cachedTags),
                        focusedIndex: -1,
                    });
                }
                else {
                    this.subject.next({});
                }
            });
        }
    }

    onKeyDown(e) {
        if(e.keyCode === KBI.KeyCodes.Enter) {
            if(this.state.focusedIndex >= 0) {
                this.onClickItem(e, this.state.tags[this.state.focusedIndex]);
            }
            else if(this.prop("allowInsert")) {
                const value = e.target.value;
                if(!value) {
                    return;
                }
                const selectedItem = _.find(this.state.tags, ['label', value]);
                if(selectedItem) {
                    this.onClickItem(e, selectedItem);
                }
                else {
                    Promise.resolve(_.isFunction(this.prop('validateOnInsert')) ? this.prop('validateOnInsert')(value) : null)
                        .then(msg => {
                            this.setErrorMessage(msg);

                            if(!msg) {
                                this.onClickItem(e, {
                                    label: value,
                                    value: null,
                                });
                            }
                        });
                }
            }
        }
        else if(e.keyCode === KBI.KeyCodes.Down) {
            this.setState({
                focusedIndex: this.nextFocusedIndex(this.state.focusedIndex, 1),
            });
        }
        else if(e.keyCode === KBI.KeyCodes.Up) {
            this.setState({
                focusedIndex: this.nextFocusedIndex(this.state.focusedIndex, -1),
            });
        }
        else if(e.keyCode === KBI.KeyCodes.Esc) {
            this.setState({
                prompted: false,
            });
        }
    }

    nextFocusedIndex(focusedIndex, delta) {
        let newFocusedIndex = focusedIndex;
        const length = _.size(this.state.tags);
        newFocusedIndex += delta;
        if(newFocusedIndex < -1) {
            newFocusedIndex += length + 1;
        }
        else if(newFocusedIndex >= length) {
            newFocusedIndex -= length + 1;
        }
        return newFocusedIndex;
    }

    getFilteredTags(tags) {
        if(this.prop('enableJsFilter')) {
            return _.filter(tags, item => !_.find(this.prop("value"), ["label", item.label]) && _.includes(_.toLower(item.label), _.toLower(this.state.searchText)));
        }
        else {
            return tags;
        }
    }

    getOptions(id, messageWhenNoResultFound) {
        if(this.state.loading) {
            return (
                <li role="presentation" className="slds-listbox__item" style="height: 3.5rem;">
                    <Spinner variant="brand" size="medium" alternativeText="loading"></Spinner>
                </li>
            );
        }
        else if(_.isEmpty(this.state.tags) && !_.isEmpty(this.state.searchText)) {
            return (
                <li role="presentation" className='slds-listbox__item'>
                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-noResultFound` }>
                        <h3 className="slds-text-title_caps" role="presentation">{ messageWhenNoResultFound }</h3>
                    </span>
                </li>
            );
        }
        else {
            return _.map(this.getFilteredTags(this.state.tags), (tag, index) => {
                return (
                    <li key={ `${tag.label}-${index}` } role="presentation" className={ window.$Utils.classnames(
                        'slds-listbox__item',
                        {
                            [styles.focused]: this.state.focusedIndex === index,
                        }
                        ) } onClick={ e => this.onClickItem(e, tag) } onMouseOver={ e => this.onMouseOver(e, index) }>
                        <span id={ `listbox-option-${id}-${index}` } className="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta" role="option">
                            {
                                tag.isHtml ?
                                <span className="slds-media__body" dangerouslySetInnerHTML={ { __html: tag.label } }>
                                </span>
                                :
                                <span className="slds-media__body">
                                    { tag.label }
                                </span>
                            }
                        </span>
                    </li>
                );
            });
        }
    }

    getIconRight() {
        const iconNameRight = this.prop("iconNameRight");

        if(iconNameRight && this.hasAsyncOperation()) {
            return (
                <div className="slds-input__icon-group slds-input__icon-group_right">
                    <Spinner variant="brand" size="x-small" className="slds-input__spinner" visible={ this.state.async }></Spinner>
                    <PrimitiveIcon variant="bare" iconName={ iconNameRight } className="slds-input__icon slds-input__icon--right slds-icon-text-default"></PrimitiveIcon>
                </div>
            );
        }
        else if(iconNameRight) {
            return (
                <PrimitiveIcon variant="bare" iconName={ iconNameRight } className="slds-input__icon slds-input__icon--right slds-icon-text-default"></PrimitiveIcon>
            );
        }
        else if(this.hasAsyncOperation()) {
            return (
                <div className="slds-input__icon-group slds-input__icon-group_right">
                    <Spinner variant="brand" size="x-small" className="slds-input__spinner" visible={ this.state.async }></Spinner>
                </div>
            );
        }
        else {
            return null;
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
            style,
            cache,
            wait = 200,
            minLetters = 3,
            limit = 5,
            iconNameLeft,
            iconNameRight,
            addonBefore,
            addonBeforeClassName,
            addonAfter,
            addonAfterClassName,
            messageWhenNoResultFound,
            onValueChange,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        this.setLayeredEditorUI();

        if(style !== 'inside') {
            return (
                <div className="slds-tagsInput">
                    <div className={ window.$Utils.classnames(
                        'slds-combobox_container slds-has-inline-listbox',
                        {
                            'slds-has-input-focus': this.isPrompted(),
                            'slds-input-has-fixed-addon': addonBefore || addonAfter,
                        }
                        ) }>
                        {
                            addonBefore ?
                            <span className={ window.$Utils.classnames(
                                'slds-form-element__addon addon-before',
                                addonBeforeClassName
                            ) }>{ addonBefore }</span>
                            : null
                        }
                        <div className={ window.$Utils.classnames(
                            'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-lookup',
                            {
                                'slds-is-open': this.isPrompted(),
                            }
                            ) } aria-expanded="false" aria-haspopup="listbox" role="combobox" data-popup-source={ id }>
                            <div ref={ node => this.setMainInput(node) } className={ this.getFormElementClass() } role="none">
                                <input type="text" className="slds-input slds-combobox__input" id={ id } aria-autocomplete="list" aria-controls={ `listbox-${id}` } role="textbox" value={ state.searchText } placeholder={ placeholder } disabled={ isDisabled } readonly={ isReadonly } onFocusIn={ e => this.onFocus(e, minLetters) } onInput={ e => this.onSearchText(e.target.value, minLetters) } onKeyDown={ e => this.onKeyDown(e) }></input>
                                {
                                    iconNameLeft ?
                                    <PrimitiveIcon variant="bare" iconName={ iconNameLeft } className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                                    : null
                                }
                                { this.getIconRight() }
                            </div>
                            <Portal into="body">
                                <div data-popup-source={ id } id={ `listbox-${id}` } role="listbox" className={ `slds-dropdown_append-to-body slds-tagsInput-dropdown ${popupClass}` } style={ state.popupStyle }>
                                    <ul className={ window.$Utils.classnames(
                                        `slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_length-${limit}`,
                                        {
                                            'slds-hide': !this.isPrompted(),
                                        },
                                        popupClass
                                        ) } role="presentation">
                                        { this.getOptions(id, messageWhenNoResultFound) }
                                    </ul>
                                </div>
                            </Portal>
                        </div>
                        {
                            addonAfter ?
                            <span className={ window.$Utils.classnames(
                                'slds-form-element__addon addon-after',
                                addonAfterClassName
                            ) }>{ addonAfter }</span>
                            : null
                        }
                    </div>
                    {
                        !_.isEmpty(value) ?
                        <div id={ `listbox-selected-${id}` } className="slds-scrollable_y" role="listbox" aria-orientation="horizontal">
                            <ul className="slds-listbox slds-listbox_horizontal slds-p-top_xxx-small" role="group" aria-label="Selected Tags:" style="max-width: 100%;">
                                {
                                    _.map(value, (tag, index) => {
                                        return (
                                            <li key={ `${tag.label}-${index}` } role="presentation" className="slds-listbox__item" style="max-width: 100%;">
                                                <Pill
                                                    name={ tag.value }
                                                    label={ tag.label }
                                                    isHtml={ tag.isHtml }
                                                    className={ `${styles.tagPill} ${tag.className}` }
                                                    disabled={ tag.disabled }
                                                    onRemove={ e => this.onRemoveTag(e, tag, isDisabled) }
                                                    onClick={ e => this.onClickTag(e, tag, isDisabled) }
                                                >
                                                </Pill>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                        : null
                    }
                </div>
            );
        }
        else {
            return (
                <div className="slds-tagsInput">
                    <div id={ `listbox-selected-${id}` } role="listbox" aria-orientation="horizontal" className={ window.$Utils.classnames(
                        'slds-pill_container',
                        {
                            'slds-has-input-focus': this.isPrompted(),
                            'slds-input-has-fixed-addon': addonBefore,
                        }
                        ) }>
                        {
                            addonBefore ?
                            <span className={ window.$Utils.classnames(
                                'slds-form-element__addon addon-before',
                                addonBeforeClassName
                            ) }>{ addonBefore }</span>
                            : null
                        }
                        <ul className="slds-listbox slds-listbox_horizontal" role="group" aria-label="Selected Tags:">
                            {
                                _.map(value, (tag, index) => {
                                    return (
                                        <li key={ `${tag.label}-${index}` } role="presentation" className="slds-listbox__item">
                                            <Pill
                                                name={ tag.value }
                                                label={ tag.label }
                                                isHtml={ tag.isHtml }
                                                className={ `${styles.tagPill} ${tag.className}` }
                                                onRemove={ e => this.onRemoveTag(e, tag, isDisabled) }
                                            >
                                            </Pill>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        <div className="slds-combobox_container slds-has-inline-listbox slds-border_none slds-grow">
                            <div className={ window.$Utils.classnames(
                                'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-lookup',
                                {
                                    'slds-is-open': this.isPrompted(),
                                }
                                ) } aria-expanded="false" aria-haspopup="listbox" role="combobox" data-popup-source={ id }>
                                <div ref={ node => this.setMainInput(node) } className={ this.getFormElementClass() } role="none">
                                    <input type="text" className="slds-input slds-combobox__input slds-input_inside" id={ id } aria-autocomplete="list" aria-controls={ `listbox-${id}` } role="textbox" value={ state.searchText } placeholder={ placeholder } disabled={ isDisabled } readonly={ isReadonly } onFocusIn={ e => this.onFocus(e, minLetters) } onInput={ e => this.onSearchText(e.target.value, minLetters) } onKeyDown={ e => this.onKeyDown(e) }></input>
                                    {
                                        iconNameLeft && _.isEmpty(value) ?
                                        <PrimitiveIcon variant="bare" iconName={ iconNameLeft } className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                                        : null
                                    }
                                    { this.getIconRight() }
                                </div>
                                <Portal into="body">
                                    <div data-popup-source={ id } id={ `listbox-${id}` } role="listbox" className={ `slds-dropdown_append-to-body slds-tagsInput-dropdown ${popupClass}` } style={ state.popupStyle }>
                                        <ul className={ window.$Utils.classnames(
                                            `slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_length-${limit}`,
                                            {
                                                'slds-hide': !this.isPrompted(),
                                            }
                                            ) } role="presentation">
                                            { this.getOptions(id, messageWhenNoResultFound) }
                                        </ul>
                                    </div>
                                </Portal>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

TagsInput.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    getTags: PropTypes.isFunction('getTags').required(),
    style: PropTypes.isString('style').values([
        'below',
        'inside',
    ]).defaultValue('below').demoValue('below'),
    cache: PropTypes.isBoolean('cache').demoValue(false),
    wait: PropTypes.isNumber('wait').defaultValue(200).demoValue(200),
    minLetters: PropTypes.isNumber('minLetters').defaultValue(3).demoValue(3),
    limit: PropTypes.isNumber('limit').defaultValue(5).demoValue(5),
    iconNameLeft: PropTypes.isIcon('iconNameLeft').demoValue(''),
    iconNameRight: PropTypes.isIcon('iconNameRight').demoValue(''),
    addonBefore: PropTypes.isObject('addonBefore').demoValue(''),
    addonBeforeClassName: PropTypes.isString('addonBeforeClassName').demoValue(''),
    addonAfter: PropTypes.isObject('addonAfter').demoValue(''),
    addonAfterClassName: PropTypes.isString('addonAfterClassName').demoValue(''),
    allowInsert: PropTypes.isBoolean('allowInsert').defaultValue(true).demoValue(true).description("allow to insert tags on the fly"),
    validateOnInsert: PropTypes.isFunction('validateOnInsert'),
    messageWhenNoResultFound: PropTypes.isString('messageWhenNoResultFound').defaultValue('No result found'),
    addTag: PropTypes.isFunction('addTag'),
    removeTag: PropTypes.isFunction('removeTag'),
    clickOnTag: PropTypes.isFunction('clickOnTag'),
    enableJsFilter: PropTypes.isBoolean('enableJsFilter').defaultValue(true).demoValue(true),
});

TagsInput.propTypes.name.demoValue('tagsInput');
TagsInput.propTypes.label.demoValue('Tags Input');

TagsInput.propTypesRest = true;
TagsInput.displayName = "TagsInput";
