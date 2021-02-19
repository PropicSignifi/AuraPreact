/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
export function classListMutation(classList, config) {
    Object.keys(config).forEach(key => {
        if (typeof key === 'string' && key.length) {
            if (config[key]) {
                classList.add(key);
            } else {
                classList.remove(key);
            }
        }
    });
}

const proto = {
    add(className) {
        if (typeof className === 'string') {
            this[className] = true;
        } else {
            Object.assign(this, className);
        }
        return this;
    },
    invert() {
        Object.keys(this).forEach(key => {
            this[key] = !this[key];
        });
        return this;
    },
    toString() {
        return Object.keys(this).filter(key => this[key]).join(' ');
    }
};

export function classSet(config) {
    if (typeof config === 'string') {
        const key = config;
        config = {};
        config[key] = true;
    }
    return Object.assign(Object.create(proto), config);
}

/**
A string normalization utility for attributes.
@param {String} value - The value to normalize.
@param {Object} config - The optional configuration object.
@param {String} [config.fallbackValue] - The optional fallback value to use if the given value is not provided or invalid. Defaults to an empty string.
@param {Array} [config.validValues] - An optional array of valid values. Assumes all input is valid if not provided.
@return {String} - The normalized value.
**/
export function normalizeString(value, config = {}) {
    const {
        fallbackValue = '', validValues
    } = config;
    let normalized = typeof value === 'string' && value.trim() || '';
    normalized = normalized.toLowerCase();
    if (validValues && validValues.indexOf(normalized) === -1) {
        normalized = fallbackValue;
    }
    return normalized;
}

/**
A boolean normalization utility for attributes.
@param {Any} value - The value to normalize.
@return {Boolean} - The normalized value.
**/
export function normalizeBoolean(value) {
    return typeof value === 'string' || !!value;
}

export const keyCodes = {
    tab: 9,
    backspace: 8,
    enter: 13,
    escape: 27,
    space: 32,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    delete: 46
};

const buffer = {};

/**
 * Runs an action and passes the string of buffered keys typed within a short time period.
 * Use for type-ahead like functionality in menus, lists, comboboxes, and similar components.
 *
 * @param {CustomEvent} event A keyboard event
 * @param {Function} action function to run, it's passed the buffered text
 */
export function runActionOnBufferedTypedCharacters(event, action) {
    // If we were going to clear what keys were typed, don't yet.
    if (buffer._clearBufferId) {
        clearTimeout(buffer._clearBufferId);
    }

    // Store the letter.
    const letter = String.fromCharCode(event.keyCode);
    buffer._keyBuffer = buffer._keyBuffer || [];
    buffer._keyBuffer.push(letter);

    const matchText = buffer._keyBuffer.join('').toLowerCase();

    action(matchText);

    // eslint-disable-next-line raptor/no-set-timeout
    buffer._clearBufferId = setTimeout(() => {
        buffer._keyBuffer = [];
    }, 700);
}

export function scrollIntoViewIfNeeded(element, scrollingParent) {
    const parentRect = scrollingParent.getBoundingClientRect();
    const findMeRect = element.getBoundingClientRect();
    if (findMeRect.top < parentRect.top || findMeRect.bottom > parentRect.bottom) {
        element.scrollIntoView(false);
    }
}
