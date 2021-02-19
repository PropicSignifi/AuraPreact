describe("RemoteApi app", function() {
    const RemoteApiStore = window.RemoteApiStore;
    const Expose = window.$Expose.get("RemoteApi");

    it("should exist", function() {
        expect(RemoteApiStore).not.toBeUndefined();
    });

    it("should get all service names", function() {
        expect(RemoteApiStore.getServiceNames()).not.toBeUndefined();
    });

    it("should get current service", function() {
        const state = {
            serviceDescriptors: {
                "testService": {},
            },
            currentServiceName: "testService",
        };
        expect(Expose.getCurrentService(state)).toEqual({});
    });

    it("should get service action", function() {
        const state = {
            serviceDescriptors: {
                "testService": {
                    getData: {},
                },
            },
        };
        expect(Expose.getServiceAction(state, "testService", "getData")).toEqual({});
    });

    it("should get current service action names", function() {
        const state = {
            serviceDescriptors: {
                "testService": {
                    getData: {},
                },
            },
            currentServiceName: "testService",
        };

        expect(RemoteApiStore.Computes.currentServiceActionNames(state)).toEqual(["getData"]);
    });

    it("should get current service action", function() {
        const state = {
            serviceDescriptors: {
                "testService": {
                    getData: {},
                },
            },
            currentServiceName: "testService",
            currentServiceActionName: "getData",
        };

        expect(RemoteApiStore.Computes.currentServiceAction(state)).toEqual({});

        const wrongState = {
            serviceDescriptors: {
                "testService": {
                    getData: {},
                },
            },
            currentServiceName: "testService",
            currentServiceActionName: "getWrongData",
        };

        expect(RemoteApiStore.Computes.currentServiceAction(wrongState)).toBeUndefined();
    });

    it("should set service descriptors", function() {
        const serviceDescriptors =  {
            "testService": {
                getData: {},
            },
        };

        RemoteApiStore.dispatch(RemoteApiStore.Updates.setServiceDescriptors(serviceDescriptors));
        expect(RemoteApiStore.getState().serviceDescriptors.testService).not.toBeUndefined();
    });

    it("should set current service", function() {
        const serviceDescriptors =  {
            "testService": {
                getData: {},
            },
        };

        RemoteApiStore.dispatch(RemoteApiStore.Updates.setServiceDescriptors(serviceDescriptors));
        RemoteApiStore.dispatch(RemoteApiStore.Updates.setCurrentService("testService"));
        expect(RemoteApiStore.getState().currentServiceName).toEqual("testService");
        expect(RemoteApiStore.getComputedState().currentServiceActionNames).not.toEqual([]);
    });

    it("should set current service action", function() {
        const serviceDescriptors =  {
            "testService": {
                getData: {},
            },
        };

        RemoteApiStore.dispatch(RemoteApiStore.Updates.setServiceDescriptors(serviceDescriptors));
        RemoteApiStore.dispatch(RemoteApiStore.Updates.setCurrentService("testService"));
        RemoteApiStore.dispatch(RemoteApiStore.Updates.setCurrentServiceAction("getData"));
        expect(RemoteApiStore.getState().currentServiceActionName).toEqual("getData");
        expect(RemoteApiStore.getComputedState().currentServiceAction).not.toBeUndefined();
    });
});
