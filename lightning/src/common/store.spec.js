describe("$Store", function() {
    class $TestStore extends $Store {
        getInitialState() {
            return {
                name: "test",
            };
        }

        getUpdateFunctions() {
            return {
                changeName: function(name, state) {
                    return {
                        name,
                    };
                },
            };
        }

        getComputeFunctions() {
            return {
                newName: state => "---" + state.name,
            };
        }
    }

    const Expose = window.$Expose.get("$Store");
    let TestStore = null;

    beforeEach(function() {
        TestStore = new $TestStore();
    });

    it("should check valid update function", function() {
        expect(Expose.isValidUpdateFn(state => state)).toBe(true);
    });

    it("should find changes", function() {
        const obj1 = {
            name: "one",
            age: 20,
            nest1: {
                name: "nest",
            },
            nest2: null,
            nest3: {
                name: "nest",
                time: 1,
                list: [1, 2, 3],
            },
        };
        const obj2 = {
            name: "two",
            age: 20,
            nest1: null,
            nest2: {
                name: "nest",
            },
            nest3: {
                name: "new",
                time: 1,
                list: [1, 2],
            },
        };
        expect(Expose.findChanges(obj1, obj2)).toEqual({
            name: true,
            age: false,
            nest1: true,
            nest2: {
                name: true,
            },
            nest3: {
                name: true,
                time: false,
                list: true,
            },
        });
    });

    it("should construct a state change object", function() {
        const change = new Expose.$StateChanges({
            name: true,
            age: false,
            nest1: true,
            nest2: {
                name: true,
            },
            nest3: {
                name: true,
                time: false,
            },
        });
        expect(change.contains("name")).toBe(true);
        expect(change.contains("age")).toBe(false);
        expect(change.contains("unknown")).toBe(false);
        expect(change.contains("nest2")).toBe(true);
        expect(change.contains("nest3")).toBe(true);
        expect(change.contains("nest3.name")).toBe(true);
        expect(change.contains("nest3.time")).toBe(false);
        expect(change.contains("x.y")).toBe(false);
    });

    it("should get state from store", function() {
        expect(TestStore.getState()).toEqual({
            name: "test",
        });
    });

    it("should perform update functions", function() {
        TestStore.dispatch(TestStore.Updates.changeName("new"));
        expect(TestStore.getState()).toEqual({
            name: "new",
        });
    });

    it("should remove state attributes with undefined", function() {
        TestStore.dispatch(TestStore.Updates.changeName(undefined));
        expect(TestStore.getState()).toEqual({
        });
    });

    it("should fire change event to listeners", function() {
        TestStore.addListener("TestListener", changes => {
            expect(changes.contains("name"));
            expect(TestStore.getState().name).toEqual("new");
        });
        TestStore.dispatch(TestStore.Updates.changeName("new"));
        TestStore.removeListener("TestListener");
    });

    it("should check the valid update", function() {
        try {
            TestStore.dispatch(state => _.noop);
            fail("Should check the valid update");
        }
        catch(e) {
            expect(true).toBe(true);
        }
    });

    it("should check the valid compute", function() {
        try {
            Expose.compute(
                {
                    newName: state => _.noop,
                },
                TestStore.getState()
            );
            fail("Should check the valid compute");
        }
        catch(e) {
            expect(true).toBe(true);
        }
    });

    it("should have computed properties", function() {
        expect(TestStore.getComputedState().newName).toEqual("---test");
    });

    it("should have changed computed properties", function() {
        TestStore.addListener("TestListener", (changes, computedChanges) => {
            expect(computedChanges.contains("newName")).toBe(true);
            expect(TestStore.getComputedState().newName).toEqual("---new");
        });
        TestStore.dispatch(TestStore.Updates.changeName("new"));
        TestStore.removeListener("TestListener");
    });

    it("should have deep frozen", function() {
        TestStore.dispatch(state => ({
            container: {
                name: "box",
            },
        }));

        try {
            const container = TestStore.getState().container;
            container.name = "shelf";
            expect(container.name).toEqual("box");
        }
        catch(e) {
            expect(true).toBe(true);
        }
    });
});
