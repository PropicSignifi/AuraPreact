import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { Observable, Subject, } from 'rxjs';
import Modal from '../modal/modal';
import Input from '../input/input';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Utils from '../utils/utils';
import Config from '../utils/config';
import Illustration from '../illustration/illustration';

export default class QuickText extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            searchText: null,
            quickTexts: [],
            loading: false,
            quickTextPreview: '',
        });

        this.bind([
            'onClose',
            'setQuickTextSearch',
            'onSearchTextChange',
            'onSearchBarKeyDown',
            'onAddQuickText',
        ]);

        this.quickTextSearch = null;
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject) {
            this.subject = new Subject();
            this.subject.debounceTime(200).switchMap(data => {
                this.setState({
                    loading: true,
                });

                return Observable.fromPromise(window.$ActionService.DataLightningExtension.invoke('searchQuickText', {
                        searchText: this.state.searchText,
                        categories: _.join(this.prop('categories'), ','),
                        channel: this.prop('channel'),
                    })).catch(error => {
                        Utils.catchError(error);

                        return Observable.of([]);
                    });
            }).subscribe(data => {
                this.setState({
                    loading: false,
                    quickTextPreview: '',
                    quickTexts: _.map(data, item => {
                        return {
                            id: item.Id,
                            label: item.Name,
                            content: item.Message,
                        };
                    }),
                });
            });
        }
    }

    onAddQuickText() {
        Utils.openUrl('/lightning/o/QuickText/new');
    }

    onSearchBarKeyDown(e) {
        if(e.key === 'Escape') {
            this.closeQuickTextModal(null);
        }
        else if(e.key === 'Enter') {
            const option = _.find(this.state.quickTexts, quickText => _.includes(_.toLower(quickText.label), _.toLower(this.state.searchText)));
            if(option) {
                this.handleOptionClick(option);
            }
        }
    }

    handleOptionClick(option) {
        const text = option.content;

        this.setState({
            loading: true,
        });

        const context = this.getMergeFieldContext();
        Utils.evaluateMergeFields(text, context).then(output => {
            this.closeQuickTextModal(output);
        });
    }

    getMergeFieldContext() {
        const context = {
            User: Config.getValue('/System/UserInfo[Readonly]/Id'),
        };

        return _.assign({}, context, this.prop('mergeFieldContext'));
    }

    closeQuickTextModal(quickText) {
        this.setState({
            loading: false,
            searchText: null,
            quickTextPreview: '',
            quickTexts: [],
        }, () => {
            if(_.isFunction(this.prop('onClose'))) {
                this.prop('onClose')(quickText);
            }
        });
    }

    setQuickTextSearch(node) {
        this.quickTextSearch = node;
    }

    focus() {
        this.quickTextSearch.focus();
    }

    onSearchTextChange(newVal) {
        this.setState({
            searchText: newVal,
        }, () => {
            if(_.size(newVal) >= 2) {
                this.subject.next({});
            }
        });
    }

    onClose() {
        this.closeQuickTextModal(null);
    }

    onQuickTextHover(option) {
        this.setState({
            quickTextPreview: option.content,
        });
    }

    getCategoryListAsString() {
        const categories = this.prop('categories');
        if(_.isEmpty(categories)) {
            return 'All';
        }
        else {
            return _.join(categories, ', ');
        }
    }

    getChannelAsString() {
        const channel = this.prop('channel');
        return _.isEmpty(channel) ? 'All' : channel;
    }

    render(props, state) {
        const [{
            className,
            visible,
        }, rest] = this.getPropValues();

        return (
            <Modal
                visible={ visible }
                onClose={ this.onClose }
                loading={ this.state.loading }
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <div className="slds-grid slds-p-bottom_small slds-m-bottom_small slds-border_bottom">
                    <Input
                        ref={ this.setQuickTextSearch }
                        className="slds-col"
                        name="searchText"
                        label="Search Text"
                        variant="label-removed"
                        placeholder="Search quick text..."
                        iconNameLeft="ctc-utility:a_search"
                        value={ this.state.searchText }
                        onValueChange={ this.onSearchTextChange }
                        changeOnInput="true"
                        onKeyDown={ this.onSearchBarKeyDown }
                        autocomplete="off"
                    >
                    </Input>
                    <ButtonIcon
                        className="slds-m-left_small"
                        iconName="utility:add"
                        variant="border-filled"
                        size="medium"
                        onClick={ this.onAddQuickText }
                    >
                    </ButtonIcon>
                </div>
                {
                    _.isEmpty(this.state.quickTexts) ?
                    <div className="slds-grid slds-grid_align-center">
                        <Illustration className="slds-size_3-of-5" type="desert" message={ `Type two or more characters and we’ll suggest some quick text from category: ${this.getCategoryListAsString()} and channel: ${this.getChannelAsString()}.` }>
                        </Illustration>
                    </div>
                    :
                    <div className="slds-grid">
                        <div className="slds-col slds-size_1-of-2">
                            <ul className="slds-listbox slds-listbox_vertical" role="listbox">
                                {
                                    this.state.quickTexts.map((option, index) => {
                                        return (
                                            <li className="slds-listbox__item" role="presentation" onMouseOver={ () => this.onQuickTextHover(option) }>
                                                <div className={ window.$Utils.classnames(
                                                    'slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline'
                                                    ) } role="option" tabindex="-1" onClick={ e => this.handleOptionClick(option) }>
                                                    <span className="slds-media__body">
                                                        <span className="slds-truncate" title={ option.label }>
                                                            { option.label }
                                                        </span>
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                        <div className="slds-col slds-size_1-of-2 slds-p-around_small slds-border_left">
                            { this.state.quickTextPreview }
                        </div>
                    </div>
                }
            </Modal>
        );
    }
}

QuickText.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    visible: PropTypes.isBoolean('visible').defaultValue(true).demoValue(true),
    onClose: PropTypes.isFunction('onClose'),
    categories: PropTypes.isArray('categories'),
    channel: PropTypes.isString('channel').demoValue(''),
    mergeFieldContext: PropTypes.isObject('mergeFieldContext'),
};

QuickText.propTypesRest = true;
QuickText.displayName = "QuickText";
