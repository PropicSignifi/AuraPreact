$define('bootstrap', ['Utils', 'vQuery', 'Patch'], function(Utils, vQuery, Patch) {
    const preactlet = {
        view: (state, actions) => {
            return `
                <Button
                    className="{! props.className }"
                    label="{! 'Clicked: ' + state.count }"
                    variant="primary"
                    onClick="{! e => actions.onClick() }"
                >
                </Button>
            `;
        },
        props: {
            className: '',
        },
        state: {
            count: 0,
        },
        actions: (state, setState) => ({
            onClick: () => {
                setState({
                    count: state.count + 1,
                });

                Utils.toast({
                    variant: 'success',
                    content: 'A test toast',
                });
            },
        }),
    };

    const demos = {
        addClass: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.addClass('slds-hide');

            return root
                .debug()
                .getFirst();
        },

        hasClass: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.addClass('slds-hide');
            console.log('RadioGroup has class slds-hide? ', radioGroup.hasClass('slds-hide'));

            return root
                .debug()
                .getFirst();
        },

        removeClass: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.addClass('slds-hide');
            radioGroup.removeClass('slds-hide');

            return root
                .debug()
                .getFirst();
        },

        toggleClass: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.toggleClass('slds-hide');

            return root
                .debug()
                .getFirst();
        },

        parent: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            console.log('Parent: ', radioGroup.parent());

            return root
                .debug()
                .getFirst();
        },

        clone: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            console.log('Cloned: ', radioGroup.clone());

            return root
                .debug()
                .getFirst();
        },

        append: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.parent().append(preactlet);

            return root
                .debug()
                .getFirst();
        },

        append_markup: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.parent().append('<div>Test</div>');

            return root
                .debug()
                .getFirst();
        },

        forEach: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItems = root.find('MenuItem');
            menuItems.forEach(function() {
                const label = this.attr('label');
                this.attr('label', `Custom: ${label}`);
            });

            return root
                .debug()
                .getFirst();
        },

        empty: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const buttonMenu = root.find('ButtonMenu');
            buttonMenu.empty();

            return root
                .debug()
                .getFirst();
        },

        prepend: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.parent().prepend(preactlet);

            return root
                .debug()
                .getFirst();
        },

        markup: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const buttonMenu = root.find('ButtonMenu');
            buttonMenu.markup(`
                <MenuItem label="Test" value="test">
                </MenuItem>
            `);

            return root
                .debug()
                .getFirst();
        },

        before: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem[label="New"]');
            menuItem.before(`
                <MenuItem label="Test" value="test">
                </MenuItem>
            `);

            return root
                .debug()
                .getFirst();
        },

        after: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem[label="New"]');
            menuItem.after(`
                <MenuItem label="Test" value="test">
                </MenuItem>
            `);

            return root
                .debug()
                .getFirst();
        },

        wrap: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.wrap('<div className="slds-hide"></div>');

            return root
                .debug()
                .getFirst();
        },

        unwrap: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            radioGroup.wrap('<div className="slds-hide"></div>');
            radioGroup.unwrap();

            return root
                .debug()
                .getFirst();
        },

        remove: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem[label="New"]');
            menuItem.remove();

            return root
                .debug()
                .getFirst();
        },

        replace: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem[label="New"]');
            menuItem.replace(`
                <MenuItem label="Test" value="test">
                </MenuItem>
            `);

            return root
                .debug()
                .getFirst();
        },

        has: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const buttonMenu = root.find('ButtonMenu');
            buttonMenu
                .has('MenuItem[label="Import"]')
                .attr('label', 'Test');

            return root
                .debug()
                .getFirst();
        },

        is: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem');
            menuItem
                .is('[label="Import"]')
                .attr('label', 'Test');

            return root
                .debug()
                .getFirst();
        },

        not: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem');
            menuItem
                .not('[label="Import"]')
                .attr('label', 'Test');

            return root
                .debug()
                .getFirst();
        },

        slice: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem');
            menuItem
                .slice(1, 2)
                .attr('label', 'Test');

            return root
                .debug()
                .getFirst();
        },

        add: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const menuItem = root.find('MenuItem');
            // Only combines to faciliate further operations
            menuItem.add(`
                    <MenuItem label="Test" value="test">
                    </MenuItem>
                `);

            return root
                .debug()
                .getFirst();
        },

        parents: (simpleComp, childState) => {
            const root = vQuery(simpleComp).flatten();

            const radioGroup = root.find('FlatPanel RadioGroup');
            console.log('Parents: ', radioGroup.parents('div'));

            return root
                .debug()
                .getFirst();
        },
    };

    const processDemo = (simpleComp, childState) => {
        const search = (window.location.search && window.location.search.startsWith('?')) ? window.location.search.substring(1) : window.location.search;
        const params = _.chain(search).split('&').map(searchItem => _.split(searchItem, '=')).fromPairs().value();
        const prefix = Utils.getNamespacePrefix();
        const demoName = params[`${prefix ? prefix : 'c__'}demo`];
        const demo = demos[demoName];
        if(demo) {
            return demo(simpleComp, childState);
        }
        else {
            return simpleComp;
        }
    };

    const afterRender = function(simpleComp, childState) {
        return processDemo(simpleComp, childState);
    };

	return {
		init: () => {
            Patch.of('ConfigTree')
                .after('render', afterRender)
                .after('init', function() {
                    console.log('After Init');
                })
                .apply();

            Patch.of('Button')
                .after('onClick', function() {
                    console.log(`Clicked ${this.prop('label')}`);
                })
                .apply();

            Patch.of('Utils')
                .before('toast', function() {
                    console.log('Toasted');
                })
                .apply();
		},
	};
});
