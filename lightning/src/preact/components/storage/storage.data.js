const storageProviders = [
    {
        name: 'Cache',
        getKey: key => `$CTC_Cache.${key}`,
        type: 'JSON',
    },
    {
        name: 'StaticResource',
        getKey: key => `CTC_STATIC_RESOURCE_${key}`,
        type: 'JSON',
    },
    {
        name: 'ActivityStreamFilterOptions',
        getKey: key => `${key}_filterOptions`,
        type: 'JSON',
    },
    {
        name: 'ConfigItems',
        getKey: key => `CTC_CONFIG_ITEMS`,
        type: 'JSON',
    },
    {
        name: 'TableConfigs',
        getKey: key => `$TableConfigs`,
        type: 'JSON',
    },
    {
        name: 'G.apex',
        getKey: key => `$G.apex_${key}`,
        type: 'JSON',
    },
    {
        name: 'Kanban',
        getKey: key => `Kanban_${key}_filters`,
        type: 'JSON',
    },
];

export default storageProviders;
