describe("$Computed", function() {
    const $Computed = window.$Computed;

    class TestComp {
        constructor() {
            this.data = {};
        }

        get(key) {
            return this.data[key];
        }

        set(key, value) {
            this.data[key] = value;
        }
    }

    it("should compute properties", function() {
        const cmp = new TestComp();
        cmp.set('v.param1', 'Wilson');
        cmp.set('v.param2', 'Test');
        const handlers = $Computed.getComputedChangeHandlers(cmp, 'computed', {
            name: function(param1, param2) {
                return param1 + ' ' + param2;
            },
            age: function(param1) {
                return _.size(param1);
            },
        });

        expect(_.size(handlers)).toEqual(2);
        _.each(handlers, handler => {
            handler();
        });

        expect(cmp.get('v.computed.name')).toEqual('Wilson Test');
        expect(cmp.get('v.computed.age')).toEqual(6);
    });
});
