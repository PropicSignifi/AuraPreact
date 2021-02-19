import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import Modal from '../modal/modal';
import KBI from '../utils/kbi';
import Actions from '../utils/actions';
import Button from '../button/button';
import InputShortcut from '../inputShortcut/inputShortcut';
import TableManager from '../table/TableManager';

const KEYBOARD_SHORTCUTS_KEY = '$KeyboardShortcuts';

const shortcutColumns = [
    {
        name: 'name',
        header: 'Name',
    },
    {
        name: 'description',
        header: 'Description',
    },
    {
        name: 'shortcut',
        header: 'Keyboard Shortcut',
        editor: (item, callbacks) => {
            return (
                <InputShortcut
                    label="Keyboard Shortcut"
                    name="shortcut_input"
                    value={ item.shortcut }
                    onValueChange={ newVal => callbacks.updateItem(callbacks.row.index, { shortcut: newVal }) }
                >
                </InputShortcut>
            );
        },
    },
];

export default class KeyboardShortCuts extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            keyboardShortcuts: [],
            showKeyboardShortcuts: false,
        });

        this.bind([
            'onKeyDown',
            'onCancelKeyboardShortcuts',
            'onSaveKeyboardShortcuts',
            'onKeyboardShortcutsChange',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        document.addEventListener('keydown', this.onKeyDown);

        Actions.registerAction('Keyboard Shortcut', () => {
            this.setState({
                showKeyboardShortcuts: true,
            });
        });

        const keyboardShortcuts = this.loadKeyboardShortcuts();
        this.setState({
            keyboardShortcuts,
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        document.removeEventListener('keydown', this.onKeyDown);
    }

    createKeyboardShortcutsFooter() {
        return (
            <div>
                <Button
                    label="Cancel"
                    variant="tertiary"
                    onClick={ this.onCancelKeyboardShortcuts }
                >
                </Button>
                <Button
                    label="Save"
                    variant="save"
                    onClick={ this.onSaveKeyboardShortcuts }
                >
                </Button>
            </div>
        );
    }

    onCancelKeyboardShortcuts() {
        this.setState({
            showKeyboardShortcuts: false,
        });
    }

    loadKeyboardShortcuts() {
        const actions = Actions.getActions();
        const keyboardShortcuts = window.$UserConfigStore.getConfig(KEYBOARD_SHORTCUTS_KEY) || {};
        const invertedShortcuts = _.invert(keyboardShortcuts);

        const result = [];

        _.chain(actions)
            .values()
            .sortBy('name')
            .forEach(action => {
                let shortcut = invertedShortcuts[action.name];
                if(shortcut === 'null' || shortcut === 'undefined') {
                    shortcut = null;
                }
                result.push({
                    name: action.name,
                    description: action.description,
                    shortcut,
                });
            })
            .value();

        return result;
    }

    onKeyboardShortcutsChange(newVal) {
        this.setState({
            keyboardShortcuts: newVal,
        });
    }

    onKeyDown(e) {
        const keyboardShortcuts = window.$UserConfigStore.getConfig(KEYBOARD_SHORTCUTS_KEY) || {};
        const keySeq = KBI.toKeySequence(e);
        const actionName = keyboardShortcuts[keySeq];
        if(actionName && !e.defaultPrevented) {
            e.preventDefault();

            Actions.invokeAction(actionName);
        }
    }

    extractKeyboardShortcuts() {
        const result = {};

        _.forEach(this.state.keyboardShortcuts, shortcut => {
            result[shortcut.shortcut] = shortcut.name;
        });

        return result;
    }

    onSaveKeyboardShortcuts() {
        this.setState({
            showKeyboardShortcuts: false,
        }, () => {
            window.$UserConfigStore.setConfig(KEYBOARD_SHORTCUTS_KEY, this.extractKeyboardShortcuts());
        });
    }

    render(props, state) {
        return (
            <div data-type={ this.getTypeName() }>
                <Modal
                    visible={ this.state.showKeyboardShortcuts }
                    onClose={ this.onCancelKeyboardShortcuts }
                    header="Keyboard Shortcuts"
                    footer={ this.createKeyboardShortcutsFooter() }
                >
                    <TableManager
                        name="system_shortcutsTable"
                        header="Keyboard Shortcuts"
                        data={ this.state.keyboardShortcuts }
                        columns={ shortcutColumns }
                        pageSize="10"
                        onValueChange={ this.onKeyboardShortcutsChange }
                    >
                    </TableManager>
                </Modal>
            </div>
        );
    }
}
