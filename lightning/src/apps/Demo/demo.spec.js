// tests for demo functions
describe("Demo app", function() {
    const DemoStore = window.DemoStore;
    const Expose = window.$Expose.get("Demo");

    it("should get all demo components", function() {
        const demoComponents = DemoStore.getState().demoComponents;
        const comp = _.sample(demoComponents);
        expect(comp).not.toBe(null);
        expect(comp.name).not.toBeUndefined();
        expect(comp.componentName).not.toBeUndefined();
        expect(comp.description).not.toBeUndefined();
        expect(comp.defaultParams).not.toBeUndefined();
    });

    it("should get demo component", function() {
        const demoComponents = DemoStore.getState().demoComponents;
        const comp = demoComponents[0];
        expect(Expose.getDemoComponent(DemoStore.getState(), comp.name)).toBe(comp);
    });

    it("should set current demo comp", function() {
        const demoComponents = DemoStore.getState().demoComponents;
        const comp = _.sample(demoComponents);
        const change = Expose.setCurrent(comp.name, DemoStore.getState());
        expect(change.current).toEqual(comp.name);
        expect(change.currentParams).toEqual(comp.defaultParams);
    });

    it("should set params", function() {
        const change = Expose.setParams("{}", DemoStore.getState());
        expect(change.currentParams).toEqual({});
    });

    it("should get demo comp by comp name", function() {
        const comp = DemoStore.getDemoComponentByCompName("lightning:button");
        expect(comp).not.toBeUndefined();
    });

    it("should get stats data", function() {
        const state = {
            demoComponents: [
                {
                    name: "test1",
                    componentName: "lightning:button",
                },
                {
                    name: "test2",
                    componentName: "c:button",
                },
            ],
        };
        const stats = Expose.getDemoComponentStats(state);
        expect(stats.numOfStandard).toEqual(1);
        expect(stats.numOfCustom).toEqual(1);
    });
});
