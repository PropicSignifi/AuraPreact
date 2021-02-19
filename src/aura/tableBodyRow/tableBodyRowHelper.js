({
    initializeValues: function(cmp) {
        var rowConfig = cmp.get("v.rowConfig");
        var checkable = cmp.get("v.checkable");
        var privateColumns = _.size(rowConfig) + (checkable ? 1 : 0);
        cmp.set("v.privateColumns", privateColumns);
    },

    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('', classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    handleSelected: function(cmp) {
        this.fireEvent(cmp, "onselect", {
            index: cmp.get("v.index"),
        });
    },

    computeRenderedTemplates: function(cmp) {
        var row = cmp.get("v.row");
        var rowConfig = cmp.get("v.rowConfig");
        var providers = cmp.get("v.providers");
        var templates = _.chain(rowConfig).
            map(function(config) {
                var fieldTemplate = window.$ObjectEditorTemplateManager.getConfigTemplate(config, {
                    object: row,
                }, providers);
                return fieldTemplate;
            }).
            value();
        return templates;
    },

    renderRow: function(cmp) {
        var templates = this.computeRenderedTemplates(cmp);
        var lastTemplates = cmp._lastTemplates;
        if(!cmp._rowRendered || !_.isEqual(lastTemplates, templates)) {
            var editor = cmp.find("private");
            cmp._rowRendered = true;
            cmp._lastTemplates = templates;
            return editor.renderEditor();
        }
    },

    handleOnEvent: function(cmp, event) {
        event.stopPropagation();

        this.fireEvent(cmp, "onRowEvent", {
            event: event,
            source: event.getSource(),
            selection: {
                getClickedRow: function() {
                    return cmp.get("v.row");
                },
            },
        });
    },
})
