({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('slds-text-title_caps', classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    handleSelected: function(cmp) {
        this.fireEvent(cmp, "onselectAll");
    },

    renderRow: function(cmp) {
        if(!cmp._rowRendered) {
            var rowConfig = cmp.get("v.rowConfig");
            cmp.set("v.privateRowConfig", _.map(rowConfig, function(config, index) {
                var newConfig = _.cloneDeep(config);
                var resizable = cmp.get("v.resizable") && index < _.size(rowConfig) - 1;

                if(newConfig.sortable && resizable) {
                    newConfig.template = function(params, providers) {
                        providers.headerRow = cmp;
                        var template = window.$ObjectEditorTemplateManager.getConfigTemplate(config, params, providers);
                        return '<div class=""><c:sortingIndicator name="' + config.name + '" ' +
                            'direction="' + (config.sortDirection || "desc") + '" ' +
                            'active="' + (config.sortActive || false) + '" ' +
                            'sortable="true" ' +
                            'variant="' + (config.mode === "editable" ? "control" : "default") + '">' +
                            template +
                            '</c:sortingIndicator>' +
                            '<div class="slds-resizable" onmousedown="{! headerRow.c.onResizeStart }" onmouseover="{! headerRow.c.onResizeHover }" data-index="' + index + '">' +
                            '<input type="range" min="20" max="1000" class="slds-resizable__input slds-assistive-text" tabindex="-1" />' +
                            '<span class="slds-resizable__handle">' +
                            '<span class="slds-resizable__divider"></span>' +
                            '</span>' +
                            '</div>' +
                            '</div>';
                    };
                }
                else if(newConfig.sortable) {
                    newConfig.template = function(params, providers) {
                        var template = window.$ObjectEditorTemplateManager.getConfigTemplate(config, params, providers);
                        return '<c:sortingIndicator name="' + config.name + '" ' +
                            'direction="' + (config.sortDirection || "desc") + '" ' +
                            'active="' + (config.sortActive || false) + '" ' +
                            'sortable="true" ' +
                            'variant="' + (config.mode === "editable" ? "control" : "default") + '">' +
                            template +
                            '</c:sortingIndicator>';
                    };
                }
                else if(resizable) {
                    newConfig.template = function(params, providers) {
                        providers.headerRow = cmp;
                        var template = window.$ObjectEditorTemplateManager.getConfigTemplate(config, params, providers);
                        return '<div class="">' +
                            template +
                            '<div class="slds-resizable" onmousedown="{! headerRow.c.onResizeStart }" onmouseover="{! headerRow.c.onResizeHover }" data-index="' + index + '">' +
                            '<input type="range" min="20" max="1000" class="slds-resizable__input slds-assistive-text" tabindex="-1" />' +
                            '<span class="slds-resizable__handle">' +
                            '<span class="slds-resizable__divider"></span>' +
                            '</span>' +
                            '</div>' +
                            '</div>';
                    };
                }

                return newConfig;
            }));

            var editor = cmp.find("private");
            cmp._rowRendered = true;
            return editor.renderEditor();
        }
    },

    initializeThWidths: function(thElems) {
        _.each(thElems, function(thElem) {
            if(!thElem.style.width) {
                thElem.style.width = thElem.offsetWidth + "px";
            }
        });
    },

    onResizeStart: function(cmp, event) {
        var target = event.currentTarget;
        var index = _.parseInt(target.getAttribute("data-index"));
        if(index >= 0) {
            var root = cmp.getElement();
            var thElems = root.querySelectorAll("th");
            this.initializeThWidths(thElems);
            var selectedIndex = cmp.get("v.checkable") ? index + 1 : index;
            cmp._pageX = event.pageX;
            cmp._thElem = thElems[selectedIndex];
            cmp._thElemNext = thElems[selectedIndex + 1];
            cmp._startOffset = cmp._thElem.offsetWidth;
            cmp._startOffsetNext = cmp._thElemNext.offsetWidth;
        }
    },

    onResizeHover: function(cmp, event) {
        var target = event.currentTarget;
        var index = _.parseInt(target.getAttribute("data-index"));
        if(index >= 0) {
            var root = cmp.getElement();
            var dividers = root.querySelectorAll(".slds-resizable__divider");
            var table = cmp.get("v.privateTable");
            var tableElem = table && table.getElement();
            if(tableElem) {
                var bodyHeight = tableElem.offsetHeight;
                _.each(dividers, function(divider) {
                    divider.style.height = bodyHeight + "px";
                });
            }
        }
    },

    addEventListeners: function(cmp) {
        document.addEventListener('mousemove', function (e) {
            if(cmp._thElem && cmp._thElemNext) {
                var width = cmp._startOffset + (e.pageX - cmp._pageX);
                var widthNext = cmp._startOffsetNext - (e.pageX - cmp._pageX);
                if(width < 50 || widthNext < 50) {
                    return e.preventDefault();
                }
                cmp._thElem.style.width = width + 'px';
                cmp._thElemNext.style.width = widthNext + 'px';
            }
        });

        document.addEventListener('mouseup', function () {
            cmp._thElem = undefined;
            cmp._thElemNext = undefined;
        });
    },

    handleOnEvent: function(cmp, event) {
        event.stopPropagation();

        this.fireEvent(cmp, "onHeaderEvent", {
            source: event.getSource(),
            event: event,
        });
    },
})
