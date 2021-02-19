describe("$Parser", function() {
    const $Parser = window.$Parser;
    const parser = $Parser.getParser('default');

    class Cmp {
        constructor() {
            this.values = {};
        }

        get(path) {
            return this.values[path];
        }

        set(path, value) {
            this.values[path] = value;
        }
    }

    const fn = {
        add: function(a, b) {
            return a + b;
        },

        eq: function(a, b) {
            return a === b;
        },

        ne: function(a, b) {
            return a !== b;
        },
    };

    it("should manage parsers", function() {
        const syntax = `start = ('a' / 'b')+`;
        $Parser.addParser('test', syntax);
        expect($Parser.getParser('test')).not.toBeUndefined();
        expect(_.size($Parser.getParsers()) >= 1).toBe(true);
        $Parser.removeParser('test');
        expect($Parser.getParser('test')).toBeUndefined();
    });

    it("should parse null", function() {
        const result = parser.parse('null')[0];
        expect(result()).toBe(null);
    });

    it("should parse numbers", function() {
        const result1 = parser.parse('123')[0];
        expect(result1()).toEqual(123);

        const result2 = parser.parse('20.5')[0];
        expect(result2()).toEqual(20.5);
    });

    it("should parse strings", function() {
        const result = parser.parse("'abc'")[0];
        expect(result()).toEqual('abc');
    });

    it("should parse booleans", function() {
        const result1 = parser.parse("true")[0];
        expect(result1()).toEqual(true);

        const result2 = parser.parse("false")[0];
        expect(result2()).toEqual(false);
    });

    it("should parse values", function() {
        const cmp = new Cmp();
        cmp.set("name", "Wilson");

        const result1 = parser.parse("name")[0];
        expect(result1(cmp)).toEqual("Wilson");

        cmp.set("v.name", "Test");
        const result2 = parser.parse("v.name")[0];
        expect(result2(cmp)).toEqual("Test");
    });

    it("should parse negative expression", function() {
        const result = parser.parse("-1")[0];
        expect(result()).toEqual(-1);
    });

    it("should parse not expression", function() {
        const result = parser.parse("!true")[0];
        expect(result()).toEqual(false);
    });

    it("should parse binary expression", function() {
        const result1 = parser.parse("1 + 2")[0];
        expect(result1(null, fn)).toEqual(3);

        const result2 = parser.parse("1 + 2 + 3")[0];
        expect(result2(null, fn)).toEqual(6);

        const result3 = parser.parse("1 - 2")[0];
        expect(result3()).toEqual(-1);

        const result4 = parser.parse("1 * 2")[0];
        expect(result4()).toEqual(2);

        const result5 = parser.parse("1 / 2")[0];
        expect(result5()).toEqual(0.5);

        const result6 = parser.parse("1 % 2")[0];
        expect(result6()).toEqual(1);

        const result7 = parser.parse("1 == 2")[0];
        expect(result7(null, fn)).toEqual(false);

        const result8 = parser.parse("1 eq 2")[0];
        expect(result8(null, fn)).toEqual(false);

        const result9 = parser.parse("1 != 2")[0];
        expect(result9(null, fn)).toEqual(true);

        const result10 = parser.parse("1 ne 2")[0];
        expect(result10(null, fn)).toEqual(true);

        const result11 = parser.parse("1 < 2")[0];
        expect(result11()).toEqual(true);

        const result12 = parser.parse("1 lt 2")[0];
        expect(result12()).toEqual(true);

        const result13 = parser.parse("1 > 2")[0];
        expect(result13()).toEqual(false);

        const result14 = parser.parse("1 gt 2")[0];
        expect(result14()).toEqual(false);

        const result15 = parser.parse("1 <= 2")[0];
        expect(result15()).toEqual(true);

        const result16 = parser.parse("1 le 2")[0];
        expect(result16()).toEqual(true);

        const result17 = parser.parse("1 >= 2")[0];
        expect(result17()).toEqual(false);

        const result18 = parser.parse("1 ge 2")[0];
        expect(result18()).toEqual(false);

        const result19 = parser.parse("true && false")[0];
        expect(result19()).toEqual(false);

        const result20 = parser.parse("true || false")[0];
        expect(result20()).toEqual(true);
    });

    it("should parse conditional expression", function() {
        const result = parser.parse("1 < 2 ? 3 : 4")[0];
        expect(result()).toEqual(3);
    });

    it("should parse grouped expression", function() {
        const result = parser.parse("2 * (1 + 2)")[0];
        expect(result(null, fn)).toEqual(6);
    });

    it("should parse function expression", function() {
        const result = parser.parse("add(1, 2)")[0];
        expect(result(null, fn)).toEqual(3);
    });

    it("should collect args", function() {
        const cmp = new Cmp();
        cmp.set("v.name", "Wilson");
        const result = parser.parse("v.name + ' hello'");
        expect(result[1]).toEqual("v.name");
    });
});
