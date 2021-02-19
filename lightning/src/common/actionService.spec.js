describe("$ActionService", function() {
    $ActionService = window.$ActionService;
    $Mock = window.$Mock;

    const Comp = $Mock.newComponent({
        name: "c:Test",
        actions: {
            "getData": $Mock.newAction(
                "getData",
                $Mock.newActionResponse(null, "TestResponse")
            )
        },
    });

    it("should install and uninstall services", function() {
        $ActionService.install("TestService", Comp);
        expect($ActionService.TestService).not.toBeUndefined();

        $ActionService.uninstall("TestService");
        expect($ActionService.TestService).toBeUndefined();
    });

    it("should have invocable service", function() {
        $ActionService.install("TestService", Comp);
        $ActionService.TestService.invokePlain("getData", {}).
            then(data => {
                expect(data).toEqual("TestResponse");
            });

        $ActionService.uninstall("TestService");
    });

    it("should allow mocking service", function() {
        $ActionService.mock("TestService").
            mock(function getData() {
                return "newData";
            });
        $ActionService.install("TestService", Comp);
        expect($ActionService.TestService).not.toBeUndefined();
        $ActionService.TestService.invokePlain("getData").
            then(data => {
                expect(data).toEqual("newData");
            });

        $ActionService.mock("HolyService").
            mock(function roll(a, b) {
                return a + b;
            });
        $ActionService.HolyService.invokePlain("roll", {
            a: 2,
            b: 3,
        }).then(data => {
                expect(data).toEqual(5);
            });
    });
});
