const layouts = {};

const registerLayout = (name, layout) => {
    if(_.isString(name) && _.isPlainObject(layout)) {
        layouts[name] = layout;

        return () => {
            delete layouts[name];
        };
    }
};

const getLayout = name => layouts[name];

const RecordFormLayoutManager = {
    registerLayout,
    getLayout,
};

export default RecordFormLayoutManager;
