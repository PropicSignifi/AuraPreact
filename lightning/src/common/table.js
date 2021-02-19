(function(window) {
    // getDefaultTableCellEditors :: () -> Editors
    const getDefaultTableCellEditors = () => window.DEFAULT_TABLE_CELL_EDITORS;

    // getDefaultTableCellEditor :: (String, String) -> Function
    const getDefaultTableCellEditor = (type, mode) => _.get(getDefaultTableCellEditors(), `${type}.${mode}`);

    /*
     *  Create default table cell without accessing to other providers.
     */
    // createDefaultTableCell :: (Config, String, String) -> String
    const createDefaultTableCell = (config, type, mode) => {
        const editor = getDefaultTableCellEditor(type, mode);
        if(_.isFunction(editor)) {
            return editor(config);
        }
    };

    let tableConfigs = {};

    const loadTableConfigs = () => {
        tableConfigs = window.$Storage.load('TableConfigs', null, {});
    };

    const p = window.setInterval(() => {
        if(window.$Storage) {
            loadTableConfigs();
            window.clearInterval(p);
        }
    }, 50);

    const getTableConfig = name => {
        return tableConfigs[name];
    };

    const setTableConfig = (name, config) => {
        tableConfigs[name] = config;

        if(window.$Storage) {
            window.$Storage.save('TableConfigs', null, tableConfigs);
        }
    };

    const $Table = {
        getDefaultTableCellEditors,
        getDefaultTableCellEditor,
        createDefaultTableCell,
        getTableConfig,
        setTableConfig,
    };

    window.$Table = $Table;

    window.$UserConfigStore = {
        getConfig: getTableConfig,
        setConfig: setTableConfig,
    };
})(window);
