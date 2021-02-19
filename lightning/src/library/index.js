import { classnames } from './classnamesLibrary.js';
import { eventRegistration } from './eventRegistrationLibrary.js';
import { menuKeyboard } from './menuKeyboardLibrary.js';
import { dom, CustomEvent, polyfillDefaultPrevented } from './domLibrary.js';
import { propValues, normalize } from './propValuesLibrary.js';
import { validity } from './validityLibrary.js';
import { dateTimeFormat } from './IntlLibrary.dateTimeFormat.js';
import { numberFormat } from './IntlLibrary.numberFormat.js';
import { numberUtils } from './IntlLibrary.numberUtils.js';
import { relativeNumber } from './IntlLibrary.relativeNumber.js';
import { utils } from './IntlLibrary.utils.js';
import { debounce } from './rateLimitLibrary.js';
import { EventEmitter } from './eventEmitterLibrary.js';
import { InteractingState } from './interactingStateLibrary.js';
import * as utilsLibrary from './utilsLibrary.js';
import { parseISODateTimeString } from './dateTimeUtils.js';

_.assign(window, {
    '$classnamesLibrary': {
        classnames,
    },

    '$eventRegistrationLibrary': {
        eventRegistration,
    },

    '$menuKeyboardLibrary': {
        menuKeyboard,
    },

    '$domLibrary': {
        dom,
        CustomEvent,
        polyfillDefaultPrevented,
    },

    '$propValuesLibrary': {
        propValues,
        normalize,
    },

    '$validityLibrary': {
        validity,
    },

    '$IntlLibrary': {
        dateTimeFormat,
        numberFormat,
        numberUtils,
        relativeNumber,
        utils,
    },

    '$rateLimitLibrary': {
        debounce,
    },

    '$eventEmitterLibrary': {
        EventEmitter,
    },

    '$interactingStateLibrary': {
        InteractingState,
    },

    '$utilsLibrary': utilsLibrary,

    '$dateTimeUtils': {
        parseISODateTimeString,
    },
});

const addLibrary = (target, name) => {
    _.set(target, name, _.get(window, "$" + name));
};

window.$System = {
    addLibrary,
};
