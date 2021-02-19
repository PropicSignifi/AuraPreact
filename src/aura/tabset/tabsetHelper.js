({
    computeTabsetClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var isScoped = variant === 'scoped';
        var isVertical = variant === 'vertical';
        var classnames = this.classnamesLibrary.classnames({
            'slds-tabs--scoped': isScoped,
            'slds-vertical-tabs': isVertical,
            'slds-tabs--default': !isScoped && !isVertical
        }, classes);
        cmp.set('v.privateTabsetClassNames', classnames);
    },

    computeTabClassNames: function(cmp) {
        var hasOverflow = cmp.get('v.privateHasTabOverflow');
        var classnames = this.classnamesLibrary.classnames('slds-tabs__nav-scroller', {
            'slds-has-overflow': hasOverflow
        });
        cmp.set('v.privateTabClassNames', classnames);
    },

    computeTabNavClassnames: function(cmp) {
        var variant = cmp.get('v.variant');
        var isScoped = variant === 'scoped';
        var isVertical = variant === 'vertical';
        var classnames = this.classnamesLibrary.classnames({
            'slds-tabs--scoped__nav': isScoped,
            'slds-vertical-tabs__nav': isVertical,
            'slds-tabs--default__nav': !isScoped && !isVertical
        });
        cmp.set('v.privateTabNavClassNames', classnames);
    },

    buildTabsHeader: function(cmp) {
        var body = cmp.get('v.body');
        cmp.find('privateTabHeaders').set('v.body', body);
    },

    doesRequireScrolling: function(cmp) {
        if (cmp.get('v.variant') !== 'vertical') {
            var el = cmp.find('privateNavScroller').getElement();
            var hasOverflow = cmp.get('v.variant') === 'vertical' ? (el.scrollHeight > el.clientHeight) : (el.scrollWidth > el.clientWidth);
            cmp.set("v.privateHasTabOverflow", hasOverflow);
            this.updateScrollArrows(cmp);
        }
    },

    updateScrollArrows: function(cmp) {
        var el = cmp.find('privateNavScroller').getElement();
        var isVertical = cmp.get('v.variant') === 'vertical';
        var scrollPos = isVertical ? el.scrollTop : el.scrollLeft;
        var maxPosition = isVertical ? (el.scrollHeight - el.clientHeight) : (el.scrollWidth - el.clientWidth);

        cmp.find("sBack").set("v.disabled", scrollPos === 0);
        cmp.find("sForward").set("v.disabled", scrollPos === maxPosition);
    },

    scrollTabs: function(cmp, direction) {
        var el = cmp.find('privateNavScroller').getElement();
        var isVertical = cmp.get('v.variant') === 'vertical';
        var scrollPos = isVertical ? el.scrollTop : el.scrollLeft;
        var clientSize = isVertical ? el.clientHeight : el.clientWidth;
        var maxPosition = isVertical ? (el.scrollHeifght - clientSize) : (el.scrollWidth - clientSize);
        var distance = clientSize * 0.9;
        var newValue;

        if (direction === "back") {
            if (scrollPos <= distance) {
                newValue = 0;
            } else {
                newValue = scrollPos - distance;
            }
        } else if (direction === "forward") {
            if ((maxPosition - scrollPos) <= distance) {
                newValue = maxPosition;
            } else {
                newValue = scrollPos + distance;
            }
        }

        if (newValue >= 0) {
            if (isVertical) {
                el.scrollTop = newValue;
            } else {
                el.scrollLeft = newValue;
            }
        }

        this.updateScrollArrows(cmp);
    },

    registerEventHandler: function(cmp, event) {
        var tab = event.detail.target;
        var variant = cmp.get('v.variant');

        event.stopPropagation();
        this.registerTab(cmp, tab);
        this.setTabVariant(tab, variant);

        if (!cmp.get('v.selectedTabId')) {
            cmp.set('v.selectedTabId', tab.get('v.id'));
        }

        this.buildTabContentContainer(tab, cmp, this.isSelectedTab(tab, cmp));
    },

    buildTabContentContainer: function(tab, cmp, isSelectedTab) {
        var contentFacet = cmp.get('v.privateContent');
        var variant = cmp.get('v.variant');
        var tabId = tab.getGlobalId();

        if(isSelectedTab) {
            window.$Utils.startLoading(cmp);
        }
        $A.createComponent('c:privateTabContent', {
            variant: variant,
            tabId: tabId
        }, function(contentContainerComponent, status, error) {
            if (status === "SUCCESS") {
                contentFacet.push(contentContainerComponent);
                cmp.set('v.privateContent', contentFacet);

                if(isSelectedTab) {
                    tab.select();
                    window.$Utils.stopLoading(cmp);
                }
            } else {
                throw new Error(error);
            }
        });
    },

    isSelectedTab: function(tab, cmp) {
        return tab.get('v.id') === cmp.get('v.selectedTabId');
    },

    selectEventHandler: function(cmp, event) {
        var tab = event.detail.target;
        var lastSelectedTab = cmp.get('v.privateLastSelectedTab');

        event.stopPropagation();
        if (tab !== lastSelectedTab) {
            this.deselectLastSelectedTab(cmp);
            this.updateLastSelectedTab(cmp, tab);
            this.updateCurrentContent(cmp, tab);
            this.updateSelectedTabId(cmp);
            this.runOnSelectAction(cmp, tab);
        }
    },

    deselectLastSelectedTab: function(cmp) {
        var lastSelectedTab = cmp.get('v.privateLastSelectedTab');

        if (lastSelectedTab) {
            lastSelectedTab.deselect();
            this.hideTabContent(lastSelectedTab, cmp);
        }
    },

    updateLastSelectedTab: function(cmp, tab) {
        cmp.set('v.privateLastSelectedTab', tab);
    },

    updateSelectedTabId: function(cmp) {
        var lastSelectedTab = cmp.get('v.privateLastSelectedTab');

        if (this.isDiffSelectedTabIdAndCurrentSelectTabId(cmp)) {
            cmp.set('v.selectedTabId', lastSelectedTab.get('v.id'));
        }
    },

    isDiffSelectedTabIdAndCurrentSelectTabId: function(cmp) {
        var selectedTabId = cmp.get('v.selectedTabId');
        var lastSelectedTab = cmp.get('v.privateLastSelectedTab');

        return lastSelectedTab && lastSelectedTab.get('v.id') !== selectedTabId;
    },

    runOnSelectAction: function(cmp, tab) {
        tab.getElement().dispatchEvent(new this.domLibrary.CustomEvent('TAB_ACTIVE'));

        this.fireEvent(cmp, "onselect", {
            id: tab.get('v.id'),
            selectedTab: tab,
        });
    },

    unRegisterEventHandler: function(cmp, event) {
        event.stopPropagation();

        var tab = event.detail.target;
        var isTabSelected = this.isSelectedTab(tab, cmp);

        if (isTabSelected) {
            this.selectFirstTab(cmp);
        }

        this.removeTabRef(tab, cmp);
        this.removeTabContent(tab, cmp);
    },

    removeTabRef: function(tab, cmp) {
        var tabs = cmp.get('v.privateTabRefs');
        var tabIndex = this.getTabIndex(tab, cmp);

        tabs = tabs.slice(0, tabIndex).concat(tabs.slice(tabIndex + 1, tabs.length));
        cmp.set('v.privateTabRefs', tabs);
    },

    removeTabContent: function(tab, cmp) {
        var tabContents = cmp.get('v.privateContent');
        var contentIndex = tabContents.indexOf(tabContents.filter(function(item) {
            return item.get('v.tabId') === tab.getGlobalId();
        })[0]);
        tabContents = tabContents.slice(0, contentIndex).concat(tabContents.slice(contentIndex + 1, tabContents.length));
        cmp.set('v.privateContent', tabContents);
    },

    getTabIndex: function(tab, cmp) {
        var tabs = cmp.get('v.privateTabRefs');

        return tabs.indexOf(tabs.filter(function(item) {
            return item.ref.getGlobalId() === tab.getGlobalId();
        })[0]);
    },

    getTabById: function(tabId, cmp) {
        var tabs = cmp.get('v.privateTabRefs');

        return tabs.filter(function(item) {
            return item.ref.get('v.id') === tabId;
        })[0];
    },

    freshBodyEventHandler: function(cmp, event) {
        event.stopPropagation();

        var tab = event.detail.target;
        var lastSelectedTab = cmp.get('v.privateLastSelectedTab');
        var isTabSelected = tab.getGlobalId() === lastSelectedTab.getGlobalId();

        if (isTabSelected) {
            this.markTabAsFreshContent(tab, cmp);
            this.updateCurrentContent(cmp, tab);
        }
    },

    markTabAsFreshContent: function(tab, cmp) {
        var tabIndex = this.getTabIndex(tab, cmp);
        var tabs = cmp.get('v.privateTabRefs');
        tabs[tabIndex].hasFreshContent = true;
    },

    selectFirstTab: function(cmp) {
        var tabs = cmp.get('v.privateTabRefs');
        var firstTab = tabs[0];
        if (firstTab) {
            firstTab.ref.select();
        }
    },

    registerTab: function(cmp, tab) {
        var tabs = cmp.get('v.privateTabRefs') || [];
        tabs.push({
            ref: tab,
            hasFreshContent: true
        });

        tabs = this.sortTabs(tabs, cmp);

        cmp.set('v.privateTabRefs', tabs);
    },

    sortTabs: function(tabs, cmp) {
        var root = cmp.find('privateTabHeaders').getElement();

        return tabs.sort(function(tabA, tabB) {
            var domNodeA = this.traverseUntilRootParent(root, tabA.ref.getElement());
            var domNodeB = this.traverseUntilRootParent(root, tabB.ref.getElement());
            var indexA = Array.prototype.indexOf.call(root.childNodes, domNodeA);
            var indexB = Array.prototype.indexOf.call(root.childNodes, domNodeB);

            if (indexA < indexB) {
                return -1;
            }

            if (indexA > indexB) {
                return 1;
            }

            return 0;
        }
        .bind(this));
    },

    traverseUntilRootParent: function(root, domNode) {
        var topDomNode = domNode;
        while (topDomNode.parentNode && topDomNode.parentNode !== root) {
            topDomNode = topDomNode.parentNode;
        }
        return topDomNode;
    },

    setTabVariant: function(tab, variant) {
        tab.setVariant(variant);
    },

    hideTabContent: function(tab, cmp) {
        var tabContents = cmp.get('v.privateContent');

        var target = tabContents.filter(function(tabContent) {
            return tabContent.get('v.tabId') === tab.getGlobalId();
        })[0];

        if (target) {
            target.set('v.visible', false);
        }
    },

    updateCurrentContent: function(cmp, currentTab) {
        var tab = cmp.get('v.privateLastSelectedTab');
        var tabContents = cmp.get('v.privateContent');

        var target = tabContents.filter(function(tabContent) {
            return tabContent.get('v.tabId') === currentTab.getGlobalId();
        })[0];

        if (target) {
            target.set('v.visible', true);
            if (this.hasTabFreshContent(currentTab, cmp)) {
                this.injectTabContent(currentTab, target);
            }
        }
    },

    hasTabFreshContent: function(tab, cmp) {
        var tabs = cmp.get('v.privateTabRefs');
        var index = this.getTabIndex(tab, cmp);
        return tabs[index].hasFreshContent ? (function() {
            tabs[index].hasFreshContent = false;
            return true;
        }
        )() : false;

    },

    injectTabContent: function(tab, tabContentTarget) {
        var tabBody = tab.get('v.body');

        tabContentTarget.set('v.body', tabBody);
    },

    destroyFacet: function(facet) {
        facet.forEach(function(component) {
            if (component.isValid && component.isValid()) {
                component.destroy();
            }
        });
    },

    addRegisterListener: function(cmp) {
        var el = cmp.getElement();
        el.addEventListener('TAB_REGISTER', $A.getCallback(this.registerEventHandler.bind(this, cmp)));
    },

    addSelectListener: function(cmp) {
        var el = cmp.getElement();
        el.addEventListener('TAB_SELECT', $A.getCallback(this.selectEventHandler.bind(this, cmp)));
    },

    addUnRegisterListener: function(cmp) {
        var el = cmp.getElement();
        el.addEventListener('TAB_UNREGISTER', $A.getCallback(this.unRegisterEventHandler.bind(this, cmp)));
    },

    addTabBodyChangeListener: function(cmp) {
        var el = cmp.getElement();
        el.addEventListener('TAB_FRESHBODY', $A.getCallback(this.freshBodyEventHandler.bind(this, cmp)));
    },

    isArrowRight: function(code) {
        return code === 39;
    },

    isArrowLeft: function(code) {
        return code === 37;
    },

    isArrowUp: function(code) {
        return code === 38;
    },

    isArrowDown: function(code) {
        return code === 40;
    },

    isArrowKey: function(keyEvent) {
        var keyCode = keyEvent.keyCode;
        return this.isArrowRight(keyCode) || this.isArrowLeft(keyCode) || this.isArrowUp(keyCode) || this.isArrowDown(keyCode);
    },

    switchTabs: function(cmp, keyEvent) {
        var keyCode = keyEvent.keyCode;
        var selectedTab = cmp.get('v.privateLastSelectedTab');
        var selectedTabIndex = this.getTabIndex(selectedTab, cmp);
        var nextTabRef = this.isArrowRight(keyCode) || this.isArrowDown(keyCode) ? this.getNextSiblingTab(cmp, selectedTabIndex) : this.getPreviousSiblingTab(cmp, selectedTabIndex);

        nextTabRef.ref.select();
        nextTabRef.ref.focus();
    },

    getNextSiblingTab: function(cmp, index) {
        var tabs = cmp.get('v.privateTabRefs');
        return index + 1 < tabs.length ? tabs[index + 1] : tabs[0];
    },

    getPreviousSiblingTab: function(cmp, index) {
        var tabs = cmp.get('v.privateTabRefs');
        return index > 0 ? tabs[index - 1] : tabs[tabs.length - 1];
    },

    setTabOrientation: function(cmp) {
        if (cmp.get('v.variant') === 'vertical') {
            var tabs = cmp.find('privateTabHeaders').getElement();
            tabs.setAttribute('aria-orientation', 'vertical');
        }
    },
})
