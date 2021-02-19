import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import Combobox from '../combobox/combobox';
import Modal from '../modal/modal';
import Actions from '../utils/actions';
import Utils from '../utils/utils';

export default class SearchBar extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showSearchBar: false,
            searchText: null,
        });

        this.bind([
            'onKeyDown',
            'hideSearchBar',
            'setCombobox',
            'onSearchTextChange',
        ]);

        this.combobox = null;
    }

    componentDidMount() {
        super.componentDidMount();

        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        document.removeEventListener('keydown', this.onKeyDown);
    }

    onSearchTextChange(newVal) {
        this.setState({
            searchText: newVal,
        });
    }

    setCombobox(node) {
        this.combobox = node;
    }

    showSearchBar() {
        if(!window.$ShowSearchBar) {
            this.setState({
                showSearchBar: true,
                searchText: null,
            }, () => {
                Utils.delay(() => {
                    if(this.combobox) {
                        this.combobox.focus();
                    }
                }, 50);
            });

            window.$ShowSearchBar = true;
            window.$ActionTriggered = false;
        }
    }

    hideSearchBar() {
        if(window.$ShowSearchBar) {
            this.setState({
                showSearchBar: false,
            }, () => {
                Utils.delay(() => {
                    if(this.combobox) {
                        this.combobox.hide();
                    }
                }, 20);
            });

            window.$ShowSearchBar = false;
            window.$ActionTriggered = true;
        }
    }

    getActionNames() {
        return _.chain(Actions.getActions())
            .keys()
            .sortBy(_.identity)
            .value();
    }

    doSearch() {
        if(window.$ActionTriggered === false) {
            const [text, input] = _.split(this.combobox.getValue(), '?');
            const availableActionNames = _.filter(this.getActionNames(), name => _.includes(_.toLower(name), _.toLower(text)));
            const actionName = _.includes(availableActionNames, text) ? text : _.first(availableActionNames);

            window.$ActionTriggered = true;
            this.hideSearchBar();

            Utils.delay(() => {
                if(actionName) {
                    Actions.invokeAction(actionName, input);
                }
                else {
                    Utils.toast({
                        variant: 'error',
                        content: `Invalid action: ${text}`,
                    });
                }
            }, 50);
        }
    }

    onKeyDown(e) {
        if(e.keyCode === 222) {
            if(e.metaKey || e.ctrlKey) {
                // Ctrl/Meta + '
                this.showSearchBar();
            }
        }
        else if(e.keyCode === 27) {
            // Esc
            this.hideSearchBar();
        }
        else if(e.keyCode === 13) {
            // Enter
            this.doSearch();
        }
    }

    render(props, state) {
        return (
            <div data-type={ this.getTypeName() }>
                <Modal
                    visible={ this.state.showSearchBar }
                    onClose={ this.hideSearchBar }
                >
                    <Combobox
                        ref={ this.setCombobox }
                        label="Quick Action"
                        name="quickAction"
                        placeholder="Type action name here"
                        minLetters="1"
                        values={ this.getActionNames() }
                        value={ this.state.searchText }
                        onValueChange={ this.onSearchTextChange }
                    >
                    </Combobox>
                </Modal>
            </div>
        );
    }
}
