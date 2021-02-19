(function(window) {
    // getTemplates :: () -> ObjectEditorTemplates
    const getTemplates = () => window.OBJECT_EDITOR_TEMPLATES;

    // getTemplate :: String -> ObjectEditorTemplate
    const getTemplate = name => getTemplates()[name];

    // getConfigTemplate :: (Config, Params, Providers) -> String
    const getConfigTemplate = (config, params, providers) => {
        var fieldTemplate = null;
        if(_.isFunction(config.template)) {
            fieldTemplate = config.template(params, providers);
        }
        else if(_.isString(config.template)) {
            fieldTemplate = config.template;
        }
        else if(_.isString(config.type)) {
            fieldTemplate = window.$Table.createDefaultTableCell(config, config.type, config.mode || "readonly");
            if(!fieldTemplate) {
                throw new Error(`Failed to create field template from type ${config.type} and mode ${config.mode}`);
            }
        }
        else {
            throw new Error("Invalid template");
        }

        return fieldTemplate;
    };

    // render :: (String, [Config], Providers, Params) -> Promise Component
    const render = (name, editorConfig, providers, params) => {
        const template = getTemplate(name);

        var comps = _.chain(editorConfig).
            map(function(config) {
                var fieldTemplate = getConfigTemplate(config, _.assign({}, template.params || {}, params), providers);
                const comp = window.$Utils.fromXml(fieldTemplate, providers);
                if(_.isArray(comp)) {
                    throw new Error("Field template should create a single-rooted component");
                }
                return comp;
            }).
            value();

        if(template && _.isFunction(template.render)) {
            return template.render(comps, providers);
        }
    };

    const $ObjectEditorTemplateManager = {
        getTemplates,
        getTemplate,
        render,
        getConfigTemplate,
    };

    window.$ObjectEditorTemplateManager = $ObjectEditorTemplateManager;
})(window);
