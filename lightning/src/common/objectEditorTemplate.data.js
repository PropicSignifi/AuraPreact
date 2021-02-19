(function(window) {
    window.OBJECT_EDITOR_TEMPLATES = {
        "one-column": {
            render: function(comps, providers) {
                const parent = window.$Utils.fromXml(`<div class="slds-grid slds-wrap"/>`, providers);
                const divs = comps.map(comp => window.$Utils.fromXml(`<div class="slds-size_1-of-1 slds-m-top_medium slds-p-horizontal_small"/>`, providers));
                return window.$Utils.newPromise((resolve, reject) => {
                    window.$Utils.createComponents([
                        parent,
                        ...divs,
                        ...comps,
                    ]).then(newComps => {
                        const parentComp = newComps[0];
                        const body = parentComp.get("v.body");
                        const size = _.size(comps);
                        for(let i = 1; i < 1 + size; i++) {
                            newComps[i].set("v.body", [ newComps[i + size] ]);
                            body.push(newComps[i]);
                        }
                        parentComp.set("v.body", body);

                        resolve(parentComp);
                    }, reject);
                });
            },
        },

        "two-column": {
            render: function(comps, providers) {
                const parent = window.$Utils.fromXml(`<div class="slds-grid slds-wrap"/>`, providers);
                const divs = comps.map(comp => window.$Utils.fromXml(`<div class="slds-size_1-of-2 slds-m-top_medium slds-p-horizontal_small"/>`, providers));
                return window.$Utils.newPromise((resolve, reject) => {
                    window.$Utils.createComponents([
                        parent,
                        ...divs,
                        ...comps,
                    ]).then(newComps => {
                        const parentComp = newComps[0];
                        const body = parentComp.get("v.body");
                        const size = _.size(comps);
                        for(let i = 1; i < 1 + size; i++) {
                            newComps[i].set("v.body", [ newComps[i + size] ]);
                            body.push(newComps[i]);
                        }
                        parentComp.set("v.body", body);

                        resolve(parentComp);
                    }, reject);
                });
            },
        },

        "table-body-row": {
            render: function(comps, providers) {
                const tds = comps.map((comp, index) => window.$Utils.fromXml(`<td data-col="${index}"/>`, providers));
                return window.$Utils.newPromise((resolve, reject) => {
                    window.$Utils.createComponents([
                        ...tds,
                        ...comps,
                    ]).then(newComps => {
                        const ret = [];
                        const size = _.size(comps);
                        for(let i = 0; i < size; i++) {
                            newComps[i].set("v.body", [ newComps[i + size] ]);
                            ret.push(newComps[i]);
                        }

                        resolve(ret);
                    }, reject);
                });
            },
        },

        "table-header-row": {
            render: function(comps, providers) {
                const ths = comps.map((comp, index) => window.$Utils.fromXml(`<th data-col="${index}"/>`, providers));
                return window.$Utils.newPromise((resolve, reject) => {
                    window.$Utils.createComponents([
                        ...ths,
                        ...comps,
                    ]).then(newComps => {
                        const ret = [];
                        const size = _.size(comps);
                        for(let i = 0; i < size; i++) {
                            newComps[i].set("v.body", [ newComps[i + size] ]);
                            ret.push(newComps[i]);
                        }

                        resolve(ret);
                    }, reject);
                });
            },
        },
    };
})(window);
