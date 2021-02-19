describe("$Script", function() {
    const $Script = window.$Script;

    it("should exist", function() {
        expect($Script).not.toBeUndefined();
    });

    it("shoud parse an expression", function() {
        expect($Script.parse(null)).toBe(null);
        const tree = $Script.parse("1 + 1");
        expect(tree.type).toBe("BinaryExpression");
        expect($Script.parse("1 + 1")).toBe(tree);

        try {
            $Script.parse("1 +");
            fail();
        }
        catch(e) {
            expect(true).toBe(true);
        }
    });

    it("should evaluate literals", function() {
        const tree = $Script.parse("1");
        expect($Script.evaluate(tree)).toEqual(1);
    });

    it("should evaluate this", function() {
        const context = {};
        const tree = $Script.parse("this");
        expect($Script.evaluate(tree, context)).toEqual(context);
    });

    it("should evaluate identifiers", function() {
        const context = {
            name: "Wilson",
        };
        const tree = $Script.parse("name");
        expect($Script.evaluate(tree, context)).toEqual("Wilson");
    });

    it("should evaluate member expressions", function() {
        const context = {
            person: {
                name: "Wilson",
            },
        };
        const tree1 = $Script.parse("person.name");
        expect($Script.evaluate(tree1, context)).toEqual("Wilson");
        const tree2 = $Script.parse("person['name']");
        expect($Script.evaluate(tree2, context)).toEqual("Wilson");
    });

    it("should evaluate call expressions", function() {
        const context = {
            person: {
                name: "Wilson",
                getName: function() {
                    return this.name;
                },
            },

            getName: function(name) {
                return name;
            },
        };
        const tree1 = $Script.parse("person.getName()");
        expect($Script.evaluate(tree1, context)).toEqual("Wilson");

        const tree2 = $Script.parse("getName('test')");
        expect($Script.evaluate(tree2, context)).toEqual("test");
    });

    it("should evaluate logical expressions", function() {
        const context = {
            a: true,
            b: false,
        };
        const tree1 = $Script.parse("a && b");
        expect($Script.evaluate(tree1, context)).toEqual(false);
        const tree2 = $Script.parse("a || b");
        expect($Script.evaluate(tree2, context)).toEqual(true);
    });

    it("should evaluate unary expressions", function() {
        const context = {};
        const tree1 = $Script.parse("!1");
        expect($Script.evaluate(tree1, context)).toEqual(false);
        const tree2 = $Script.parse("-1");
        expect($Script.evaluate(tree2, context)).toEqual(-1);
    });

    it("should evaluate binary expressions", function() {
        const context = {};
        const tree1 = $Script.parse("1 + 2");
        expect($Script.evaluate(tree1, context)).toEqual(3);
        const tree2 = $Script.parse("1 - 2");
        expect($Script.evaluate(tree2, context)).toEqual(-1);
        const tree3 = $Script.parse("1 * 2");
        expect($Script.evaluate(tree3, context)).toEqual(2);
        const tree4 = $Script.parse("1 / 2");
        expect($Script.evaluate(tree4, context)).toEqual(0.5);
        const tree5 = $Script.parse("1 % 2");
        expect($Script.evaluate(tree5, context)).toEqual(1);
    });

    it("should evaluate conditional expressions", function() {
        const context = {
            exists: true,
        };
        const tree1 = $Script.parse("exists ? 1 : 2");
        expect($Script.evaluate(tree1, context)).toEqual(1);
    });

    it("should evaluate array expressions", function() {
        const tree = $Script.parse("[1, 2]");
        expect($Script.evaluate(tree)).toEqual([1, 2]);
    });

    it("should evaluate compound expressions", function() {
        const tree = $Script.parse("1 2");
        expect($Script.evaluate(tree)).toEqual([1, 2]);
    });
});
