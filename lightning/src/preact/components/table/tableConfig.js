const renderColumns = (name, columns) => {
    if(!name || !columns) {
        throw new Error('Both name and columns are required to render columns');
    }

    const config = window.$Table.getTableConfig(name);
    if(config && config.columns) {
        return _.chain(config.columns)
            .map(column => _.find(columns, ['name', column]))
            .compact()
            .value();
    }
    else {
        return columns;
    }
};

const getColumns = name => {
    const config = window.$Table.getTableConfig(name) || {};
    return config.columns || [];
};

const setColumns = (name, columns) => {
    const config = window.$Table.getTableConfig(name) || {};
    config.columns = columns;

    window.$Table.setTableConfig(name, config);
};

const getFilters = name => {
    const config = window.$Table.getTableConfig(name) || {};
    return config.filters;
};

const setFilters = (name, filters) => {
    const config = window.$Table.getTableConfig(name) || {};
    config.filters = filters;

    window.$Table.setTableConfig(name, config);
};

export default {
    renderColumns,
    getColumns,
    setColumns,
    getFilters,
    setFilters,
};
