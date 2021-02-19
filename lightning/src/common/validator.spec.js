describe("$Validator", function() {
    const $Validator = window.$Validator;

    it("should validate required", function() {
        const validator = $Validator.of("test", "Test").require("require").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate([""])).toEqual("require");
        expect(validator.validate(["abc"])).toBeUndefined();
    });

    it("should validate min", function() {
        const validator = $Validator.of("test", "Test").min(3, "min").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate([1])).toEqual("min");
        expect(validator.validate([3])).toBeUndefined();
    });

    it("should validate max", function() {
        const validator = $Validator.of("test", "Test").max(3, "max").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate([4])).toEqual("max");
        expect(validator.validate([3])).toBeUndefined();
    });

    it("should validate minlength", function() {
        const validator = $Validator.of("test", "Test").minlength(3, "minlength").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate(["a"])).toEqual("minlength");
        expect(validator.validate(["abc"])).toBeUndefined();
    });

    it("should validate maxlength", function() {
        const validator = $Validator.of("test", "Test").maxlength(3, "maxlength").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate(["abcd"])).toEqual("maxlength");
        expect(validator.validate(["abc"])).toBeUndefined();
    });

    it("should validate pattern", function() {
        const validator = $Validator.of("test", "Test").pattern(/^abc$/, "pattern").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate(["abcd"])).toEqual("pattern");
        expect(validator.validate(["abc"])).toBeUndefined();
    });

    it("should validate custom", function() {
        const validator = $Validator.of("test", "Test").add(function(value) {
            if(value !== "abc") {
                return "custom";
            }
        }).toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate(["abcd"])).toEqual("custom");
        expect(validator.validate(["abc"])).toBeUndefined();
    });

    it("should validate chained", function() {
        const validator = $Validator.of("test", "Test").require("require").minlength(3, "minlength").toValidator();
        expect(validator.fieldNames).toEqual(["test"]);
        expect(validator.validate([""])).toEqual("require");
        expect(validator.validate(["ab"])).toEqual("minlength");
        expect(validator.validate(["abc"])).toBeUndefined();
    });
});
