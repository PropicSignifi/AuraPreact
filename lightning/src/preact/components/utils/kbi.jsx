// Keyboard Interaction
const KeyCodes = {
    Enter: 13,
    Tab: 9,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    Cmd: 91,
    Esc: 27,
    Backspace: 8,
    Delete: 8,
    Up: 38,
    Down: 40,
    Left: 37,
    Right: 39,
    Space: 32,
};

const modifiers = [
    'Control',
    'Shift',
    'Alt',
    'Meta',
];

const toKeySequence = e => {
    const items = [];

    if(e.ctrlKey) {
        items.push('Control');
    }

    if(e.shiftKey) {
        items.push('Shift');
    }

    if(e.altKey) {
        items.push('Alt');
    }

    if(e.metaKey) {
        items.push('Meta');
    }

    let key = e.key;
    if(key === ' ') {
        key = 'Space';
    }

    if(!_.includes(modifiers, key)) {
        items.push(key);
    }

    return _.join(items, '+');
};

export default {
    KeyCodes,

    toKeySequence,
};
