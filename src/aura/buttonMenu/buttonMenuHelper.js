({
    computeClassNames: function(cmp) {
        var visible = cmp.get("v.visible");
        var classnames = this.classnamesLibrary.classnames("slds-dropdown-trigger slds-dropdown-trigger--click", {
            "slds-is-open": visible
        }, cmp.get("v.class"));
        cmp.set("v.privateComputedClass", classnames);
    },

    computeDropdownClassNames: function(cmp) {
        var dropdownAlignment = cmp.get("v.menuAlignment");
        var classnames = this.classnamesLibrary.classnames("slds-dropdown", {
            "slds-dropdown--left": dropdownAlignment === "left",
            "slds-dropdown--center": dropdownAlignment === "center",
            "slds-dropdown--right": dropdownAlignment === "right",
            "slds-dropdown--bottom": dropdownAlignment === "bottom-center",
            "slds-dropdown--bottom slds-dropdown--right slds-dropdown--bottom-right": dropdownAlignment === "bottom-right",
            "slds-dropdown--bottom slds-dropdown--left slds-dropdown--bottom-left": dropdownAlignment === "bottom-left"
        });
        cmp.set("v.privateComputedDropdownClass", classnames);
    },

    computeButtonClassNames: function(cmp) {
        var variant = cmp.get("v.variant");
        var size = cmp.get("v.iconSize");
        var isDropdownIcon = this.isDropdownIconType(cmp.get("v.iconName"));

        var isBare = variant.split("-")[0] === "bare";
        var computedClassNames = this.classnamesLibrary.classnames("slds-button", {
            "slds-button--icon": !isDropdownIcon,
            "slds-button--icon-bare": isBare,
            "slds-button--icon-more": variant !== "container" && !isDropdownIcon,
            "slds-button--icon-container-more": variant === "container" && !isDropdownIcon,
            "slds-button--icon-container": variant === "container" && isDropdownIcon,
            "slds-button--icon-border": variant === "border" && isDropdownIcon,
            "slds-button--icon-border-filled": variant === "border-filled",
            "slds-button--icon-border-inverse": variant === "border-inverse",
            "slds-button--icon-inverse": variant === "bare-inverse",
            "slds-button--icon-xx-small": size === "xx-small" && !isBare,
            "slds-button--icon-x-small": size === "x-small" && !isBare,
            "slds-button--icon-small": size === "small" && !isBare
        });
        cmp.set("v.privateComputedButtonClass", computedClassNames);
    },

    computeDropdownIcon: function(cmp) {
        var iconName = cmp.get("v.iconName");
        cmp.set("v.privateShowDropdownIcon", !this.isDropdownIconType(iconName));
    },

    isDropdownIconType: function(iconName) {
        return iconName === "utility:down" || iconName === "utility:chevrondown" || iconName === "ctc-utility:a_down";
    },

    addListeners: function(cmp) {
        var helper = this;

        if (cmp && cmp.isValid() && !helper._addListeners) {
            try {
                var addEventListener = function(eventName, handler) {
                    var callback = $A.getCallback(function(event) {
                        event.stopPropagation();

                        var menuItem = event.detail.menuItem;
                        handler.call(helper, cmp, menuItem, event.detail);
                    });
                    helper.eventRegistrationLibrary.eventRegistration.addEventListener(cmp, cmp, eventName, callback);
                };

                addEventListener("MENUITEM_REGISTER", this.registerMenuItem);
                addEventListener("MENUITEM_DEREGISTER", this.deregisterMenuItem);
                addEventListener("MENUITEM_CLICK", this.handleClickOnMenuItem);
                addEventListener("MENUITEM_KEYDOWN", this.handleKeyDownOnMenuItem);
                addEventListener("MENUITEM_BLUR", this.handleBlurOnMenuItem);
                addEventListener("MENUITEM_FOCUS", this.allowBlur);
            } catch (e) {
                throw e;
            }

            helper._addListeners = true;
        }
    },

    cleanUp: function(cmp) {
        this.eventRegistrationLibrary.eventRegistration.removeAllEventListeners(cmp);

        cmp._menuItemsCreated = false;
        cmp._items = [];
    },

    findMenuItemIndex: function(cmp, menuItem) {
        var menuItemElement = menuItem.getElement();

        var listChildren = Array.prototype.slice.call(cmp.find("list").getElement().children);
        var selectOnlyMenuItems = function(child) {
            return child._lightningMenuItem;
        };
        return listChildren
            .filter(selectOnlyMenuItems)
            .indexOf(menuItemElement);
    },

    registerMenuItem: function(cmp, menuItem) {
        if (cmp && cmp.isValid()) {
            menuItem.getElement()._lightningMenuItem = true;

            var menuItemIndex = this.findMenuItemIndex(cmp, menuItem);
            if (menuItemIndex >= 0) {
                cmp._items.splice(menuItemIndex, 0, menuItem);

                this.eventRegistrationLibrary.eventRegistration.addEventListener(cmp, menuItem, "mouseover",
                    this.cancelBlurAndFocusOnMenuItem.bind(this, cmp, menuItem));
                this.eventRegistrationLibrary.eventRegistration.addEventListener(cmp, menuItem, "mouseout",
                    this.allowBlur.bind(this, cmp));
            } else {
                throw new Error("A menu item with label '" + menuItem.get("v.label") + "' should not be surrounded by other" +
                    " components or elements, please remove any such occurrences.");
            }
        }
    },

    deregisterMenuItem: function(cmp, menuItem) {
        if (cmp && cmp.isValid()) {
            var index = cmp._items.indexOf(menuItem);
            if (index >= 0) {
                cmp._items.splice(index, 1);
            }
            this.eventRegistrationLibrary.eventRegistration.removeAllEventListenersForTarget(cmp, menuItem);
        }
    },

    selectItem: function(cmp, menuItem) {
        if (menuItem.get("v.disabled")) {
            return;
        }

        cmp.set("v.visible", false);
        this.focusOnButton(cmp);

        var selectedMenuItemValue = menuItem.get("v.value");

        menuItem.getElement().dispatchEvent(new this.domLibrary.CustomEvent("MENUITEM_SELECT"));

        this.fireEvent(cmp, "onselect", {
            value: selectedMenuItemValue,
            menuItem: menuItem,
        });
    },

    cancelBlur: function(cmp) {
        cmp._cancelBlur = true;
    },

    allowBlur: function(cmp) {
        if (cmp && cmp.isValid()) {
            cmp._cancelBlur = false;
        }
    },

    handleBlur: function(cmp) {
        if (cmp._cancelBlur) {
            return;
        }

        if (cmp.get("v.visible")) {
            this.toggleMenuVisibility(cmp);
        }
    },

    handleBlurOnMenuItem: function(cmp, menuItem, eventData) {
        if (cmp && cmp.isValid()) {
            this.handleBlur(cmp, eventData.sourceEvent);
        }
    },

    handleClickOnButton: function(cmp) {
        this.allowBlur(cmp);
        this.toggleMenuVisibility(cmp);
        this.focusOnButton(cmp);
    },

    handleClickOnMenuItem: function(cmp, menuItem, eventData) {
        if (cmp && cmp.isValid()) {
            this.allowBlur(cmp);

            var event = eventData.sourceEvent;

            event.stopPropagation();
            event.preventDefault();

            this.selectItem(cmp, menuItem);
        }
    },

    maybeCreateMenuItems: function(cmp) {
        var isVisible = cmp.get("v.visible");
        var shouldCreateMenuItems = isVisible && !cmp._menuItemsCreated;
        if (shouldCreateMenuItems) {
            this.createMenuItems(cmp);
            cmp._menuItemsCreated = true;
        }
    },

    toggleMenuVisibility: function(cmp) {
        if (!cmp.get("v.disabled")) {
            cmp.set("v.visible", !cmp.get("v.visible"));
        }
    },

    createMenuItems: function(cmp) {
        cmp.set("v.privateBody", cmp.get("v.body"));
    },

    focusOnButton: function(cmp) {
        cmp.find("privateButton").getElement().focus();
    },

    handleKeyDownOnMenuItem: function(cmp, menuItem, eventData) {
        if (cmp && cmp.isValid()) {
            var event = eventData.sourceEvent;
            this.menuKeyboardLibrary.menuKeyboard.handleKeyDownOnMenuItem(event,
                cmp._items.indexOf(menuItem), this.menuKeyboardInterface(cmp));
        }
    },

    handleKeyDownOnButton: function(cmp, event) {
        this.menuKeyboardLibrary.menuKeyboard.handleKeyDownOnMenuTrigger(event, this.menuKeyboardInterface(cmp));
    },

    cancelBlurAndFocusOnMenuItem: function(cmp, menuItem) {
        this.cancelBlur(cmp);
        if (menuItem) {
            menuItem.focus();
        }
    },

    menuKeyboardInterface: function(cmp) {
        var helper = this;

        return {
            getTotalMenuItems: function() {
                return cmp._items.length;
            },

            focusOnIndex: function(index) {
                helper.cancelBlurAndFocusOnMenuItem(cmp, cmp._items[index]);
            },

            selectByIndex: function(menuItemIndex) {
                helper.selectItem(cmp, cmp._items[menuItemIndex]);
            },

            returnFocus: function() {
                helper.focusOnButton(cmp);
            },

            isMenuVisible: function() {
                return cmp.get("v.visible");
            },

            toggleMenuVisibility: function() {
                helper.toggleMenuVisibility(cmp);
            },

            focusMenuItemWithText: function(text) {
                var match = cmp._items.filter(function(menuItem) {
                    var label = menuItem.get("v.label");
                    return label && label.toLowerCase().indexOf(text) === 0;
                });
                if (match.length > 0) {
                    helper.cancelBlurAndFocusOnMenuItem(cmp, match[0]);
                }
            }
        };
    },
})
