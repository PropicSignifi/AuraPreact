describe("$Formatter", function() {
    const $Formatter = window.$Formatter;

    const formatter = {
        format: function(str) {
            return _.toUpper(str);
        },
        parse: function(str) {
            return _.toLower(str);
        },
    };

    it("should manage formatters", function() {
        $Formatter.addFormatter("uppercase", formatter);
        expect($Formatter.getFormatter("uppercase")).not.toBeUndefined();
        expect(_.size($Formatter.getFormatters()) >= 1).toBe(true);
        $Formatter.removeFormatter("uppercase");
        expect($Formatter.getFormatter("uppercase")).toBeUndefined();
    });

    it("should format values", function() {
        $Formatter.addFormatter("uppercase", formatter);
        try {
            $Formatter.format("abc");
            fail();
        }
        catch(e) {
            expect(true).toBe(true);
        }
        expect($Formatter.format("uppercase", "abc")).toEqual("ABC");
    });

    it("should format BSB", function() {
        expect($Formatter.format("BSB", "123456")).toEqual("123-456");
    });

    it("should parse values", function() {
        $Formatter.addFormatter("uppercase", formatter);
        try {
            $Formatter.parse("abc");
            fail();
        }
        catch(e) {
            expect(true).toBe(true);
        }
        expect($Formatter.parse("uppercase", "ABC")).toEqual("abc");
    });

    it("should parse BSB", function() {
        expect($Formatter.parse("BSB", "123-456")).toEqual("123456");
    });
});
