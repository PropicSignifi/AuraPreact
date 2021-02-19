/*
 * Disclaimer:
 * The code below is purely imported from Salesforce internal javascript libraries.
 */
/* jshint maxdepth:false, ignore:line, expr:true, maxstatements:false */
var keyCodes = {
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

var preventDefaultAndStopPropagation = function(event) {
    event.preventDefault();
    event.stopPropagation();
};

var moveFocusToTypedCharacters = function(event, menuInterface) {
    if (window._clearBufferId) {
        clearTimeout(window._clearBufferId);
    }
    var letter = String.fromCharCode(event.keyCode);
    window._keyBuffer = window._keyBuffer || [];
    window._keyBuffer.push(letter);
    var matchText = window._keyBuffer.join("").toLowerCase();
    menuInterface.focusMenuItemWithText(matchText);
    var that = window;
    window._clearBufferId = setTimeout(function() {
        that._keyBuffer = [];
    }, 700);
};

export const menuKeyboard = {
    handleKeyDownOnMenuItem: function(event, menuItemIndex, menuInterface, horizontal) {
        var advance = keyCodes.down;
        var retreat = keyCodes.up;
        if (horizontal) {
            advance = keyCodes.right;
            retreat = keyCodes.left;
        }
        switch (event.keyCode) {
            case keyCodes.enter:
            case keyCodes.space:
                preventDefaultAndStopPropagation(event);
                menuInterface.selectByIndex(menuItemIndex);
                break;
            case advance:
            case retreat:
                preventDefaultAndStopPropagation(event);
                var nextIndex = event.keyCode === retreat ? menuItemIndex - 1 : menuItemIndex + 1;
                if (nextIndex >= menuInterface.getTotalMenuItems()) {
                    nextIndex = 0;
                } else {
                    if (nextIndex < 0) {
                        nextIndex = menuInterface.getTotalMenuItems() - 1;
                    }
                }
                menuInterface.focusOnIndex(nextIndex);
                break;
            case keyCodes.home:
                preventDefaultAndStopPropagation(event);
                menuInterface.focusOnIndex(0);
                break;
            case keyCodes.end:
                preventDefaultAndStopPropagation(event);
                menuInterface.focusOnIndex(menuInterface.getTotalMenuItems() - 1);
                break;
            case keyCodes.escape:
            case keyCodes.tab:
                if (menuInterface.isMenuVisible()) {
                    menuInterface.toggleMenuVisibility();
                }
                menuInterface.returnFocus();
                break;
            default:
                moveFocusToTypedCharacters(event, menuInterface);
        }
    },

    handleKeyDownOnMenuTrigger: function(event, menuInterface) {
        var isVisible = menuInterface.isMenuVisible();
        switch (event.keyCode) {
            case keyCodes.enter:
            case keyCodes.space:
                preventDefaultAndStopPropagation(event);
                menuInterface.toggleMenuVisibility();
                break;
            case keyCodes.down:
            case keyCodes.up:
                preventDefaultAndStopPropagation(event);
                if (!isVisible) {
                    menuInterface.toggleMenuVisibility();
                }
                window.requestAnimationFrame($A.getCallback(function() {
                    var focusOnIndex = 0;
                    if (event.keyCode === keyCodes.up) {
                        focusOnIndex = menuInterface.getTotalMenuItems() - 1;
                    }
                    if (focusOnIndex >= 0) {
                        menuInterface.focusOnIndex(focusOnIndex);
                    }
                }));
                break;
            case keyCodes.home:
                preventDefaultAndStopPropagation(event);
                menuInterface.focusOnIndex(0);
                break;
            case keyCodes.end:
                preventDefaultAndStopPropagation(event);
                menuInterface.focusOnIndex(menuInterface.getTotalMenuItems() - 1);
                break;
            case keyCodes.escape:
            case keyCodes.tab:
                if (isVisible) {
                    menuInterface.toggleMenuVisibility();
                }
                break;
            default:
                if (isVisible) {
                    moveFocusToTypedCharacters(event, menuInterface);
                }
        }
    }
};
