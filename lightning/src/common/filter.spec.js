describe("$Filter", function() {
    const $Filter = window.$Filter;

    it("should exist", function() {
        expect($Filter).not.toBeUndefined();
    });

    it("should manage filters", function() {
        try {
            $Filter.addFilter("test", function() {});
            fail();
        }
        catch(e) {
            expect(true).toBe(true);
        }

        const fn = name => name;
        $Filter.addFilter("test", fn);
        expect($Filter.getFilter("test")).toBe(fn);
        expect(!_.isEmpty($Filter.getFilters())).toBe(true);
        $Filter.removeFilter("test");
        expect($Filter.getFilter("test")).toBeUndefined();
    });

    it("should parse filters", function() {
        const str1 = "'abc'";
        const parsed1 = $Filter.parse(str1);
        expect(parsed1[0].type).toEqual("Script");

        const str2 = "{name}";
        const parsed2 = $Filter.parse(str2);
        expect(parsed2[0].type).toEqual("Interpolation");

        const str3 = "{name} | uppercase";
        const parsed3 = $Filter.parse(str3);
        expect(parsed3[1].type).toEqual("Filter");

        const str4 = "{name} | _.toUpper";
        const parsed4 = $Filter.parse(str4);
        expect(parsed4[1].type).toEqual("Filter");
    });

    it("should evaluate filters", function() {
        const context = {
            name: "Wilson",
        };

        const str1 = "'abc'";
        const parsed1 = $Filter.parse(str1);
        expect($Filter.evaluate(parsed1, context)).toEqual("abc");

        const str2 = "{name}";
        const parsed2 = $Filter.parse(str2);
        expect($Filter.evaluate(parsed2, context)).toEqual("Wilson");

        const str3 = "{name} | uppercase";
        const parsed3 = $Filter.parse(str3);
        expect($Filter.evaluate(parsed3, context)).toEqual("WILSON");

        const str4 = "{name} | _.toUpper";
        const parsed4 = $Filter.parse(str4);
        expect($Filter.evaluate(parsed4, context)).toEqual("WILSON");
    });
});
