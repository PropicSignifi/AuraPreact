/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
function createElement(a, b) {
    if (b) {
        var c = b + ":" + a;
        a = elementCache[c] || (elementCache[c] = document.createElementNS(b, a));
    } else {
        a = elementCache[a] || (elementCache[a] = "!" === a ? document.createComment("") : document.createElement(a));
    }
    return a.cloneNode();
}

function dasherize(a) {
    return (a + "").replace(DASHERIZE_RE, "$1-$2").toLowerCase();
}

function escapeAttributeValue(a) {
    return (a + "").replace(/&/g, "\x26amp;").replace(/"/g, "\x26quot;");
}

function getDomNodeId(a) {
    return a.id;
}

function getOrGenerateDomNodeId(a) {
    if(!a.id) {
        throw new Error("Id does not exist for dom " + a);
    }
    return a.id;
}

function setAttr(a, b, c) {
    (null === c || undefined === c) ? a.removeAttribute(ATTR_NAMES[b] || b) : a.setAttribute(ATTR_NAMES[b] || b, "" + c);
}

function setBooleanAttr(a, b, c) {
    c ? setAttr(a, b, c) : removeAttr(a, b);
}

function setPropValue(a, b, c) {
    a[b] = null !== c ? c : null;
}

function setPropObj(a, b, c) {
    var d = typeof c;
    if ("object" !== d) {
        throw Error('"' + a.tagName + '" expects attribute "' + b + '" to be an object, not a ' + d);
    }
    a = a[b];
    for (var e in c) {
        a[e] = null === c[e] ? "" : c[e];
    }
}

function setValuePropValue(a, b, c) {
    "SELECT" === a.tagName ? setSelectValue(a, c) : a[b] !== "" + c && setPropValue(a, b, c);
}

function removeAttr(a, b) {
    a.removeAttribute(ATTR_NAMES[b] || b);
}

function removeProp(a, b) {
    if ("style" === b) {
        a[b].cssText = "";
    } else {
        if ("value" === b && "SELECT" === a.tagName) {
            removeSelectValue(a);
        } else {
            var c = a.tagName;
            c = elementCache$$0[c] || (elementCache$$0[c] = document.createElement(c));
            a[b] = c[b];
        }
    }
}

function setSelectValue(a, b) {
    var c = Array.isArray(b);
    a = a.options;
    var d = a.length;
    var e = 0;
    for (var f; e < d; ) {
        f = a[e++],
        f.selected = null !== b && (c ? b.includes(f.value) : f.value === b);
    }
}

function setPositiveNumericPropValue(a, b, c) {
    a[b] = isFinite(c) || 0 < c ? c : null;
}

function setNumericPropValue(a, b, c) {
    a[b] = isFinite(c) ? c : null;
}

function setOverloadedBooleanAttrValue(a, b, c) {
    true === c ? a.setAttribute(b, "") : a.removeAttribute(b);
}

function setTypeValue(a, b, c) {
    if ("INPUT" === a.tagName) {
        if (c && !supportedInputTypes[c]) {
            throw Error('Invalid value "' + c + '" for attribute "type" in an \x3cinput\x3e element.');
        }
        var d = a.value;
        a.setAttribute(b, "" + (c || "text"));
        a.value !== d && setPropValue(a, b, d);
    }
}

function removeSelectValue(a) {
    a = a.options;
    var b = a.length;
    for (var c = 0; c < b; ) {
        a[c++].selected = !1;
    }
}

function attrToString(a, b) {
    return (ATTR_NAMES[a] || a) + '\x3d"' + module$utils.escapeAttributeValue(b) + '"';
}

function booleanAttrToString(a, b) {
    return b ? a : "";
}

function stylePropToString(a, b) {
    var c = "";
    for (var d in b) {
        null !== b[d] && (c += module$utils.dasherize(d) + ":" + b[d] + ";");
    }
    return c ? a + '\x3d"' + c + '"' : c;
}

function getAttributeConfig(a) {
    if (attrsCfg[a]) {
        return attrsCfg[a];
    }
    if (isValidAttributeName(a)) {
        attrsCfg[a] = (isCustomAttribute(a),
        DEFAULT_ATTR_CFG);
    } else {
        throw Error('Invalid HTML Attribute "' + a + '".');
    }
    return attrsCfg[a];
}

function createSyntheticEvent(a, b) {
    var c = eventsPool[a];
    return c && !c._isPersisted ? (c.target = b.target,
    c.nativeEvent = b,
    c._isPropagationStopped = !1,
    c._isDefaultPrevented = !1,
    c) : eventsPool[a] = new module$synthetic_event.default(a,b);
}

function runSyntheticEvent(a, b, c) {
    listenersStorage[c][b](createSyntheticEvent(b, a));
}

function eventListener(a) {
    a.currentTarget && runSyntheticEvent(a, a.type, module$utils.getDomNodeId(a.currentTarget));
}

function focusInEventListener(a) {
    a.currentTarget && runSyntheticEvent(a, "focusin", module$utils.getDomNodeId(a.currentTarget));
}

function focusOutEventListener(a) {
    a.currentTarget && runSyntheticEvent(a, "focusout", module$utils.getDomNodeId(a.currentTarget));
}

function addListener(a, b, c) {
    var d = module$utils.getOrGenerateDomNodeId(a);
    d = listenersStorage[d] || (listenersStorage[d] = {});
    d[b] || a.addEventListener(remappedEvent[b] || b, remappedListener[b] || eventListener, useCaptureEvent[b] || !1);
    d[b] = c;
}

function removeListener(a, b) {
    var c = module$utils.getDomNodeId(a);
    c && (c = listenersStorage[c]) && c[b] && (c[b] = null,
    a.removeEventListener(remappedEvent[b] || b, remappedListener[b] || eventListener, useCaptureEvent[b] || !1));
}

function removeListeners(a) {
    var b = module$utils.getDomNodeId(a);
    if (b) {
        var c = listenersStorage[b];
        if (c) {
            delete listenersStorage[b];
            for (var d in c) {
                a.removeEventListener(remappedEvent[d] || d, remappedListener[d] || eventListener, useCaptureEvent[d] || !1);
            }
        }
    }
}

function isEventSupported(a) {
    var b = "on" + a;
    if (b in document) {
        return "input" !== a || !("documentMode"in document) || 9 < document.documentMode;
    }
    var c = document.createElement("div");
    c.setAttribute(b, "return;");
    return "function" === typeof c[b] ? true : !!("wheel" === a && document.implementation && document.implementation.hasFeature && true !== document.implementation.hasFeature("", "") && document.implementation.hasFeature("Events.wheel", "3.0"));
}

function updateAttr(a, b, c) {
    var d = module$event.ATTR_TO_EVENT[b];
    if (d) {
        if ("function" !== typeof c) {
            if (c) {
                throw Error("Attribute " + b + " is an event, and can only be set to a function.");
            }
            module$event.removeListener(a, d);
        } else {
            module$event.addListener(a, d, c);
        }
    } else {
        module$attr.getAttributeConfig(b).set(a, b, c);
    }
}

function removeAttr$$0(a, b) {
    var c = module$event.ATTR_TO_EVENT[b];
    c ? module$event.removeListener(a, c) : module$attr.getAttributeConfig(b).remove(a, b);
}

function updateText(a, b, c) {
    c ? (c = a.firstChild) ? c.nodeValue = b : a.textContent = b : a.innerHTML = b;
}

function removeText(a) {
    a.innerHTML = "";
}

function releaseNode(a) {
    module$event.removeListeners(a);
}

function shouldUseChangeEvent(a) {
    var b = a && a.tagName;
    return "SELECT" === b || "INPUT" === b && "file" === a.type;
}

function shouldUseClickEvent(a) {
    return "INPUT" === (a && a.tagName) && ("checkbox" === a.type || "radio" === a.type);
}

function isTextInputElement(a) {
    a = a && a.tagName;
    return "INPUT" === a || "TEXTAREA" === a;
}

function addChangeEvent(a, b) {
    var c = "onChange";
    shouldUseChangeEvent(a) || (shouldUseClickEvent(a) ? c = "onClick" : isTextInputElement(a) && isInputEventSupported && (c = "onInput"));
    if ("onChange" === c) {
        module$ops.updateAttr(a, c, b);
    } else {
        var d = !1;
        var e = !1;
        module$ops.updateAttr(a, c, function() {
            e ? e = !1 : (d = !0,
            b.apply(this, Array.prototype.slice.call(arguments)));
        });
        module$ops.updateAttr(a, "onChange", function() {
            d ? d = !1 : (e = !0,
            b.apply(this, Array.prototype.slice.call(arguments)));
        });
    }
}

var module$element = {};
var elementCache = {};
module$element.createElement = createElement;
var module$utils = {};
var DASHERIZE_RE = /([^A-Z]+)([A-Z])/g;
var ID_PROP = "__dom__id__";
var counter = 1;
module$utils.dasherize = dasherize;
module$utils.escapeAttributeValue = escapeAttributeValue;
module$utils.getDomNodeId = getDomNodeId;
module$utils.getOrGenerateDomNodeId = getOrGenerateDomNodeId;
var module$attr = {};
var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var isValidAttributeName = RegExp.prototype.test.bind(new RegExp("[" + ATTRIBUTE_NAME_CHAR + "]{0,}$"));
var isCustomAttribute = RegExp.prototype.test.bind(new RegExp("^(data|aria)-[" + ATTRIBUTE_NAME_CHAR + "]{0,}$"));
var supportedInputTypes = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
};
var elementCache$$0 = {};
var ATTR_NAMES = {
    acceptCharset: "accept-charset",
    className: "class",
    htmlFor: "for",
    httpEquiv: "http-equiv",
    autoCapitalize: "autocapitalize",
    autoComplete: "autocomplete",
    autoCorrect: "autocorrect",
    autoFocus: "autofocus",
    autoPlay: "autoplay",
    encType: "encoding",
    hrefLang: "hreflang",
    radioGroup: "radiogroup",
    spellCheck: "spellcheck",
    srcDoc: "srcdoc",
    srcSet: "srcset",
    tabIndex: "tabindex"
};
var DEFAULT_ATTR_CFG = {
    set: setAttr,
    remove: removeAttr,
    toString: attrToString
};
var BOOLEAN_ATTR_CFG = {
    set: setBooleanAttr,
    remove: removeAttr,
    toString: booleanAttrToString
};
var DEFAULT_PROP_CFG = {
    set: setPropValue,
    remove: removeProp,
    toString: attrToString
};
var BOOLEAN_PROP_CFG = {
    set: setPropValue,
    remove: removeProp,
    toString: booleanAttrToString
};
var POSITIVE_NUMERIC_PROP_CFG = {
    set: setPositiveNumericPropValue,
    remove: removeProp,
    toString: attrToString
};
var NUMERIC_PROP_CFG = {
    set: setNumericPropValue,
    remove: removeProp,
    toString: attrToString
};
var OVERLOADED_BOOLEAN_ATTR_CFG = {
    set: setOverloadedBooleanAttrValue,
    remove: removeAttr,
    toString: attrToString
};
var attrsCfg = {
    checked: BOOLEAN_PROP_CFG,
    controls: BOOLEAN_PROP_CFG,
    disabled: BOOLEAN_ATTR_CFG,
    id: DEFAULT_PROP_CFG,
    ismap: BOOLEAN_ATTR_CFG,
    loop: BOOLEAN_PROP_CFG,
    multiple: BOOLEAN_PROP_CFG,
    muted: BOOLEAN_PROP_CFG,
    open: BOOLEAN_ATTR_CFG,
    readOnly: BOOLEAN_PROP_CFG,
    selected: BOOLEAN_PROP_CFG,
    srcDoc: DEFAULT_PROP_CFG,
    style: {
        set: setPropObj,
        remove: removeProp,
        toString: stylePropToString
    },
    value: {
        set: setValuePropValue,
        remove: removeProp,
        toString: attrToString
    },
    type: {
        set: setTypeValue,
        remove: removeProp,
        toString: stylePropToString
    },
    allowFullScreen: BOOLEAN_PROP_CFG,
    async: BOOLEAN_PROP_CFG,
    autoPlay: BOOLEAN_PROP_CFG,
    capture: BOOLEAN_PROP_CFG,
    cols: POSITIVE_NUMERIC_PROP_CFG,
    "default": BOOLEAN_PROP_CFG,
    defer: BOOLEAN_PROP_CFG,
    download: OVERLOADED_BOOLEAN_ATTR_CFG,
    formNoValidate: BOOLEAN_PROP_CFG,
    hidden: BOOLEAN_PROP_CFG,
    noValidate: BOOLEAN_PROP_CFG,
    required: BOOLEAN_PROP_CFG,
    reversed: BOOLEAN_PROP_CFG,
    rows: POSITIVE_NUMERIC_PROP_CFG,
    rowSpan: NUMERIC_PROP_CFG,
    scoped: BOOLEAN_PROP_CFG,
    seamless: BOOLEAN_PROP_CFG,
    size: POSITIVE_NUMERIC_PROP_CFG,
    span: POSITIVE_NUMERIC_PROP_CFG,
    start: NUMERIC_PROP_CFG,
    itemScope: BOOLEAN_PROP_CFG
};
module$attr.getAttributeConfig = getAttributeConfig;
var module$synthetic_event = {};
var SyntheticEvent = function(a, b) {
    this.type = a;
    this.target = b.target;
    this.nativeEvent = b;
    this._isPersisted = this._isDefaultPrevented = this._isPropagationStopped = !1;
};
SyntheticEvent.prototype.stopPropagation = function() {
    this._isPropagationStopped = !0;
    var a = this.nativeEvent;
    a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0;
}
;
SyntheticEvent.prototype.isPropagationStopped = function() {
    return this._isPropagationStopped;
}
;
SyntheticEvent.prototype.preventDefault = function() {
    this._isDefaultPrevented = !0;
    var a = this.nativeEvent;
    a.preventDefault ? a.preventDefault() : a.returnValue = !1;
}
;
SyntheticEvent.prototype.isDefaultPrevented = function() {
    return this._isDefaultPrevented;
}
;
SyntheticEvent.prototype.persist = function() {
    this._isPersisted = !0;
}
;
module$synthetic_event.default = SyntheticEvent;
var module$event = {};
var ATTR_TO_EVENT = {
    onBlur: "blur",
    onCanPlay: "canplay",
    onCanPlayThrough: "canplaythrough",
    onChange: "change",
    onClick: "click",
    onComplete: "complete",
    onContextMenu: "contextmenu",
    onCopy: "copy",
    onCut: "cut",
    onDblClick: "dblclick",
    onDrag: "drag",
    onDragEnd: "dragend",
    onDragEnter: "dragenter",
    onDragLeave: "dragleave",
    onDragOver: "dragover",
    onDragStart: "dragstart",
    onDrop: "drop",
    onDurationChange: "durationchange",
    onEmptied: "emptied",
    onEnded: "ended",
    onError: "error",
    onFocus: "focus",
    onFocusIn: "focusin",
    onFocusOut: "focusout",
    onInput: "input",
    onKeyDown: "keydown",
    onKeyPress: "keypress",
    onKeyUp: "keyup",
    onLoad: "load",
    onLoadedData: "loadeddata",
    onLoadedMetadata: "loadedmetadata",
    onLoadStart: "loadstart",
    onMouseDown: "mousedown",
    onMouseEnter: "mouseenter",
    onMouseLeave: "mouseleave",
    onMouseMove: "mousemove",
    onMouseOut: "mouseout",
    onMouseOver: "mouseover",
    onMouseUp: "mouseup",
    onPaste: "paste",
    onPause: "pause",
    onPlay: "play",
    onPlaying: "playing",
    onProgress: "progress",
    onRateChange: "ratechange",
    onScroll: "scroll",
    onSeeked: "seeked",
    onSeeking: "seeking",
    onStalled: "stalled",
    onSubmit: "submit",
    onSuspend: "suspend",
    onTimeUpdate: "timeupdate",
    onTouchCancel: "touchcancel",
    onTouchEnd: "touchend",
    onTouchMove: "touchmove",
    onTouchStart: "touchstart",
    onVolumeChange: "volumechange",
    onWaiting: "waiting",
    onWheel: "wheel"
};
var eventsPool = {};
var listenersStorage = {};
var remappedEvent = {};
var remappedListener = {};
var useCaptureEvent = {};
isEventSupported("focusin") || (remappedEvent.focusin = "focus",
remappedEvent.focusout = "blur",
remappedListener.focusin = focusInEventListener,
remappedListener.focusout = focusOutEventListener,
useCaptureEvent.focusin = !0,
useCaptureEvent.focusout = !0);
module$event.addListener = addListener;
module$event.removeListener = removeListener;
module$event.removeListeners = removeListeners;
module$event.isEventSupported = isEventSupported;
module$event.ATTR_TO_EVENT = ATTR_TO_EVENT;
var module$ops = {};
module$ops.releaseNode = releaseNode;
module$ops.updateAttr = updateAttr;
module$ops.removeAttr = removeAttr$$0;
module$ops.updateText = updateText;
module$ops.removeText = removeText;
var module$input = {};
var isInputEventSupported = module$event.isEventSupported("input");
module$input.addChangeEvent = addChangeEvent;
var module$main = {};
module$main.createElement = module$element.createElement;
module$main.releaseNode = module$ops.releaseNode;
module$main.updateAttr = module$ops.updateAttr;
module$main.removeAttr = module$ops.removeAttr;
module$main.updateText = module$ops.updateText;
module$main.removeText = module$ops.removeText;
module$main.addChangeEvent = module$input.addChangeEvent;

export const dom = module$main;

export function CustomEvent(name, config) {
    if (typeof window.CustomEvent === "function") {
        return new window.CustomEvent(name,config);
    } else {
        var customEvent = document.createEvent("CustomEvent");
        customEvent.initCustomEvent(name, config && config.bubbles || false, config && config.cancelable || false, config && config.detail || null);
        return customEvent;
    }
}

var isDefaultPreventedSupported;
export function polyfillDefaultPrevented(event) {
    if (typeof isDefaultPreventedSupported === "undefined") {
        var testEvent = new CustomEvent("test",{
            cancelable: true
        });
        testEvent.preventDefault();
        isDefaultPreventedSupported = testEvent.defaultPrevented;
    }
    if (!isDefaultPreventedSupported) {
        return Object.assign({}, event, {
            preventDefault: function() {
                this.defaultPrevented = true;
            }
        });
    }
    return event;
}
