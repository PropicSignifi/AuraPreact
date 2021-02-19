const definitions = {};

const addDefinition = def => {
    if(def && def.name) {
        definitions[def.name] = def;
    }
};

const addDefinitions = defs => {
    _.forEach(defs, addDefinition);
};

const getDefinition = name => definitions[name];

const getDefinitions = () => definitions;

const ProcessManager = {
    addDefinition,
    addDefinitions,
    getDefinition,
    getDefinitions,
};

export default ProcessManager;
