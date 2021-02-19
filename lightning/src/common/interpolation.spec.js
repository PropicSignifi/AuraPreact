describe("$Interpolation", function() {
    const $Interpolation = window.$Interpolation;

    it("should exist", function() {
        expect($Interpolation).not.toBeUndefined();
    });

    it("should parse templates", function() {
        const template = "{name} is {age} years old";
        const result = $Interpolation.parse(template);
        expect(result.template).toEqual(template);
        expect(result.params).toEqual(["name", "age"]);
    });

    it("should evaluate the parsed", function() {
        const template = "{name} is {age} years old";
        const parsed = $Interpolation.parse(template);
        const result = $Interpolation.evaluate(parsed, {
            name: "Wilson",
            age: 30,
        });
        expect(result).toEqual("Wilson is 30 years old");
    });

    it("should detect interpolation", function() {
        expect($Interpolation.isInterpolation("{name}")).toBe(true);
        expect($Interpolation.isInterpolation("{name")).toBe(false);
    });
});
