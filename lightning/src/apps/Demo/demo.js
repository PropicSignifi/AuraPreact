(function(w) {
    const DATA_PRODUCER_PREFIX = "dataProducer:";

    const SUPPORTED_FIELD_TYPES = [
        "String",
        "Number",
        "Boolean",
        "Enum",
        "Icon",
    ];

    // isValidConfigurable :: Config -> Boolean
    const isValidConfigurable = config => {
        return _.isPlainObject(config) &&
            _.every(config, value => {
                return _.isArray(value) ||
                    value.startsWith(DATA_PRODUCER_PREFIX) ||
                    _.includes(SUPPORTED_FIELD_TYPES, value);
            });
    };

    // mapConfigField :: (Value, String, Component, Options, [String]) -> Comp
    const mapConfigField = (value, name, component, options = {}, mandatory = []) => {
        const paramsVarName = options.params || "params";
        const onConfigChangeName = options.onConfigChange || "onConfigChange";
        const wrap = comp => window.$Utils.fromXml(
            `<div class="slds-col slds-size_1-of-4 slds-p-around_small"/>`
        ).appendTo("body", comp);
        const required = _.includes(mandatory, name);

        if(value === "String") {
            return wrap(
                window.$Utils.fromXml(
                    `
                    <c:input
                        name="${name}"
                        type="text"
                        label="${name}"
                        required="${required}"
                        value="{! v.${paramsVarName}.${name} }"
                        onchange="{! c.${onConfigChangeName} }"
                    />
                    `,
                    component
                )
            );
        }
        else if(value === "Number") {
            return wrap(
                window.$Utils.fromXml(
                    `
                    <c:input
                        name="${name}"
                        type="number"
                        label="${name}"
                        required="${required}"
                        value="{! v.${paramsVarName}.${name} }"
                        onchange="{! c.${onConfigChangeName} }"
                    />
                    `,
                    component
                )
            );
        }
        else if(value === "Boolean") {
            return wrap(
                window.$Utils.fromXml(
                    `
                    <c:input
                        name="${name}"
                        type="toggle"
                        label="${name}"
                        required="${required}"
                        checked="{! v.${paramsVarName}.${name} }"
                        onchange="{! c.${onConfigChangeName} }"
                    />
                    `,
                    component
                )
            );
        }
        else if(_.isArray(value)) {
            const comp = window.$Utils.fromXml(
                `
                <c:select
                    name="${name}"
                    label="${name}"
                    required="${required}"
                    value="{! v.${paramsVarName}.${name} }"
                    onchange="{! c.${onConfigChangeName} }"
                />
                `,
                component
            );

            _.each(value, val => {
                comp.appendTo(
                    "body",
                    window.$Utils.fromXml(
                        `
                        <option value="${val}">${val}</option>
                        `
                    )
                );
            });

            return wrap(comp);
        }
        else if(value === "Icon") {
            return wrap(
                window.$Utils.fromXml(
                    `
                    <c:iconPicker
                        name="${name}"
                        label="${name}"
                        required="${required}"
                        category="ctc-utility"
                        value="{! v.${paramsVarName}.${name} }"
                        onchange="{! c.${onConfigChangeName} }"
                    />
                    `,
                    component
                )
            );
        }
        else if(value.startsWith(DATA_PRODUCER_PREFIX)) {
            const dataProducer = value.substring(DATA_PRODUCER_PREFIX.length);
            return wrap(
                window.$Utils.fromXml(
                    `
                    <c:select
                        name="${name}"
                        label="${name}"
                        dataProducer="${dataProducer}"
                        required="${required}"
                        value="{! v.${paramsVarName}.${name} }"
                        onchange="{! c.${onConfigChangeName} }"
                    />
                    `,
                    component
                )
            );
        }
        else {
            throw new Error(`Invalid config field found for ${value}`);
        }
    };

    // getDemoComponent :: (State, String) -> a
    const getDemoComponent = (state, name) => _.find(state.demoComponents, ["name", name]);

    // getDemoComponentStats :: State -> Stats
    const getDemoComponentStats = state => {
        return {
            numOfStandard: _.chain(state.demoComponents).
                filter(comp => _.startsWith(comp.componentName, "lightning:")).
                size().
                value(),
            numOfCustom: _.chain(state.demoComponents).
                filter(comp => _.startsWith(comp.componentName, "c:")).
                size().
                value(),
        };
    };

    // getNewlyAddedDemoComponents :: (State, Number) -> [Comp]
    const getNewlyAddedDemoComponents = (state, n) => {
        return _.chain(state.demoComponents).
            sortBy(comp => {
                return comp.created ? moment(comp.created, "DD/MM/YYYY").toDate().getTime() : 0;
            }).
            reverse().
            take(n).
            value();
    };

    // getNoCreatedDemoComponents :: State -> [Comp]
    const getNoCreatedDemoComponents = state => {
        return _.chain(state.demoComponents).
            filter(comp => !comp.created).
            value();
    };

    // getDemoComponentFromState :: State -> a
    const getDemoComponentFromState = state => {
        return getDemoComponent(state, state.current);
    };

    // setCurrent :: (String, State) -> Change
    const setCurrent = (name, state) => {
        const demoComponent = getDemoComponent(state, name);
        if(demoComponent) {
            return {
                current: name,
                currentParams: window.$Utils.newObject(state.currentParams, demoComponent.defaultParams),
            };
        }
        else {
            return {
                current: null,
                currentParams: window.$Utils.newObject(state.currentParams, null),
            };
        }
    };

    // setParams :: (String, State) -> Change
    const setParams = (paramsString, state) => {
        const params = window.$Utils.parseJSON(paramsString);
        return {
            currentParams: window.$Utils.newObject(state.currentParams, params),
        };
    };

    // loadDemoComponents :: () -> [DemoComp]
    const loadDemoComponents = () => {
        const comps = window.DEMO_COMPONENTS;
        _.each(comps, comp => {
            _.each(comp.configurable, (value, key) => {
                if(_.isArray(value)) {
                    comp.configurable[key] = value.sort();
                }
            });
        });
        return _.sortBy(comps, "name");
    };

    class $DemoStore extends $Store {
        constructor() {
            super();
        }

        getInitialState() {
            return {
                demoComponents: loadDemoComponents(),
                current: null,
                currentParams: null,
            };
        }

        getUpdateFunctions() {
            return {
                setCurrent,
                setParams,
            };
        }

        getComputeFunctions() {
            return {
                currentCompName: state => {
                    return _.get(getDemoComponentFromState(state), 'componentName');
                },
                currentDescription: state => {
                    return _.get(getDemoComponentFromState(state), 'description');
                },
                currentRequires: state => {
                    return _.get(getDemoComponentFromState(state), 'requires');
                },
            };
        }

        getDemoComponentByCompName(compName) {
            return _.find(this.getState().demoComponents, ["componentName", compName]);
        }

        getConfigFields(name, component) {
            const demoComp = getDemoComponent(this.getState(), name);
            if(demoComp && demoComp.configurable) {
                if(!isValidConfigurable(demoComp.configurable)) {
                    throw new Error(`Incorrect configurable for ${name}`);
                }

                return _.mapValues(demoComp.configurable, (value, key) => mapConfigField(value, key, component, {}, demoComp.mandatory));
            }

            return {};
        }

        getDemoComponent(name) {
            return getDemoComponent(this.getState(), name);
        }

        getDemoComponentStats() {
            return getDemoComponentStats(this.getState());
        }

        getNewlyAddedDemoComponents() {
            return getNewlyAddedDemoComponents(this.getState(), 5);
        }

        getNoCreatedDemoComponents() {
            return getNoCreatedDemoComponents(this.getState());
        }
    }

    window.$Expose.add("Demo", {
        getDemoComponent,
        setCurrent,
        setParams,
        getDemoComponentStats,
    });

    w.DemoStore = new $DemoStore();
})(window);
