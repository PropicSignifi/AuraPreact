describe("$Utils", function() {
    const $Utils = window.$Utils;
    const Expose = window.$Expose.get("common");
    const $Mock = window.$Mock;

    it("should create a Comp successfully", function() {
        const comp = $Utils.comp("c:Test", { name: "name" }, { body: ["body"] });
        expect(comp).not.toBe(null);
        expect(comp.name).toEqual("c:Test");
        expect(comp.attrs.name).toEqual("name");
        expect(comp.children.body[0].name).toEqual("aura:text");
    });

    it("should create a Text Comp successfully", function() {
        const comp = $Utils.compText("abc");
        expect(comp).toEqual($Utils.comp("aura:text", { value: "abc" }));
    });

    it("should create an Html Comp successfully", function() {
        const comp = $Utils.compHtml("div", { 'class': "red" }, { body: "text" });
        expect(comp).toEqual($Utils.comp(
            "aura:html",
            {
                tag: "div",
                HTMLAttributes: {
                    'class': "red",
                },
            },
            {
                body: "text",
            }
        ));
    });

    it("should get a flat list of Comp successfully", function() {
        const comp = $Utils.comp("c:Test", {}, { body: "text" });
        const flatList = Expose.getFlatCompList(comp);
        expect(_.size(flatList)).toEqual(2);
        expect(flatList[1].attrs.value).toEqual("text");
    });

    it("should rebuild the Component according to the Comp", function() {
        const comp = $Utils.comp("c:Test", {}, { body: "text" });
        const Comp1 = $Mock.newComponent({ name: "c:Test" });
        const Comp2 = $Mock.newComponent({
            name: "aura:text",
            data: {
                "body": "text",
            }
        });
        comp.index = 0;
        comp.children.body[0].index = 1;
        const Comp = Expose.rebuildComp(comp, [Comp1, Comp2]);
        expect(Comp).toBe(Comp1);
        expect(Comp.get("v.body").length).toEqual(1);
        expect(Comp.get("v.body")[0]).toBe(Comp2);
    });

    it("should generate xml successfully", function() {
        const comp1 = $Utils.comp("c:Test", { name: "name" }, {});
        expect($Utils.toXML(comp1)).toEqual(
            `<c:Test name="name"/>`);


        const comp2 = $Utils.comp("c:Test", { name: "name", age: 30 }, {});
        expect($Utils.toXML(comp2)).toContain(`name="name"`);
        expect($Utils.toXML(comp2)).toContain(`age="30"`);

        const comp3 = $Utils.comp("c:Test", { params: { name: "name" } }, {});
        expect($Utils.toXML(comp3)).toEqual(
            `<c:Test params="{! v.params }"/>`);

        const comp4 = $Utils.comp("c:Test", {}, { body: [ $Utils.comp("c:Child", {}, {}) ] });
        expect($Utils.toXML(comp4)).toEqual(
            `<c:Test >\n    <c:Child />\n</c:Test>`
        );

        const comp5 = $Utils.comp("c:Test", {}, { other: [ $Utils.comp("c:Child", {}, {}) ] });
        expect($Utils.toXML(comp5)).toContain('aura:set attribute="other"');

        const comp6 = $Utils.compHtml("div", { 'class': 'red' }, {});
        expect($Utils.toXML(comp6)).toEqual(`<div class="red"/>`);

        const comp7 = $Utils.compText("text");
        expect($Utils.toXML(comp7)).toEqual(`text`);

        const comp8 = $Utils.comp("c:Test", {
            onClick: {
                toString: () => 'SecurePropertyReferenceValue: {!c.onEvent} { key: {"namespace":"c"} }',
            },
        }, {});
        expect($Utils.toXML(comp8)).toEqual(
            `<c:Test onClick="{! c.onClick }"/>`);
    });

    it("should create components successfully", function() {
        const comp1 = $Utils.comp("c:Test", {}, {});
        $Utils.createComponent(comp1, function(newComp) {
            expect(newComp).not.toBe(null);
        });
        $Utils.createComponent(comp1).then(newComp => {
            expect(newComp).not.toBe(null);
        });
    });

    xit("should create components from xml", function() {
        $Utils.create(`<c:Test/>`).then(newComp => {
            expect(newComp).not.toBe(null);
        });
    });

    it("should fire the event", function() {
        const Comp = $Mock.newComponent({
            name: "c:Test",
            events: {
                "testEvent": $Mock.newEvent(),
            },
        });

        $Utils.fireEvent(Comp, "testEvent");
        expect(Comp.getEvent("testEvent").fired).toBe(true);
    });

    it("should handle error", function() {
        try {
            $Utils.onError("fake error");
            fail("Error should be thrown here");
        }
        catch(e) {
            expect(true).toBe(true);
        }
    });

    it("should parse and format json", function() {
        const json = {
            name: "test",
        };
        const newJson = $Utils.parseJSON($Utils.formatJSON(json));
        expect(newJson).toEqual(json);
    });

    it("should be able to start and stop loading in component", function() {
        const Comp = $Mock.newComponent({
            name: "c:Test",
            data: {
                "loading": false,
            },
        });

        $Utils.startLoading(Comp);
        expect(Comp.get("v.loading")).toBe(true);

        $Utils.stopLoading(Comp);
        expect(Comp.get("v.loading")).toBe(false);
    });

    it("should support busy loading", function() {
        const Comp = $Mock.newComponent({
            name: "c:Test",
            data: {
                "loading": false,
            },
        });

        $Utils.busyloading(
            Comp,
            new Promise((resolve, reject) => resolve(5))
            .then(data => {
                expect(Comp.get("v.loading")).toBe(true);
            })
        ).then(data => {
            expect(Comp.get("v.loading")).toBe(false);
        });
    });

    it("should create a new object from the old and the change", function() {
        const oldObject = {
            name: "old",
            age: 100,
        };
        const changeObject = {
            name: "new",
        };
        const newObject = $Utils.newObject(oldObject, changeObject);
        expect(newObject).toEqual({
            name: "new",
            age: undefined,
        });
    });

    it("should invoke action", function() {
        const Comp = $Mock.newComponent({
            name: "c:Test",
            actions: {
                "getData": $Mock.newAction(
                    "getData",
                    $Mock.newActionResponse(null, "TestResponse")
                ),
            },
        });

        $Utils.invokeAction(Comp, "getData", {}, data => {
            expect(data).toEqual("TestResponse");
        });

        $Utils.invokeAction(Comp, "getData", {})
            .then(data => {
                expect(data).toEqual("TestResponse");
            });
    });

    it("should convert a component def ref", function() {
        const comp = $Utils.comp("c:Test", {}, {}, true);
        const ref = Expose.toDefRef(comp);
        expect(_.get(ref, "componentDef.descriptor")).toEqual("markup://c:Test");
    });

    it("should rebuild nested component def ref", function() {
        const comp = $Utils.comp("c:Test", {}, {
            body: [
                $Utils.comp("c:Child", {}, {}, true),
            ]
        }, true);
        const ret = Expose.rebuildComp(comp, []);
        expect(_.get(ret, "attributes.values.body[0].componentDef.descriptor")).toEqual("markup://c:Child");
    });

    xit("should parse comps from xml", function() {
        const xml1 = `<c:Test/>`;
        const comp1 = $Utils.fromXml(xml1);
        expect(comp1.name).toEqual("c:Test");

        const xml2 = `abc`;
        const comp2 = $Utils.fromXml(xml2);
        expect(comp2.name).toEqual("aura:text");

        const xml3 = `<div>abc</div>`;
        const comp3 = $Utils.fromXml(xml3);
        expect(comp3.name).toEqual("aura:html");

        const xml4 = `<c:Test name="test"/>`;
        const comp4 = $Utils.fromXml(xml4);
        expect(comp4.attrs.name).toEqual("test");

        const xml5 = `
            <c:Test>
                <div>abc</div>
            </c:Test>
            `;
        const comp5 = $Utils.fromXml(xml5);
        expect(comp5.children.body[0].name).toEqual("aura:html");

        const xml6 = `
            <c:Test>
            </c:Test>
            <div>abc</div>
            `;
        const comps6 = $Utils.fromXml(xml6);
        expect(comps6.length).toEqual(2);

        const xml7 = `
            <c:Test>
                <aura:set attribute="name">
                    <div>abc</div>
                </aura:set>
            </c:Test>
            `;
        const comp7 = $Utils.fromXml(xml7);
        expect(comp7.children.name[0].name).toEqual("aura:html");

        const xml8 = `<c:Test user:ref="true"/>`;
        const comp8 = $Utils.fromXml(xml8);
        expect(comp8.isDefRef).toBe(true);
    });

    xit("should parse xml with reference", function() {
        const Comp = $Mock.newComponent({
            name: "c:Test",
            data: {
                name: "test",
            },
        });
        const xml = `
        <c:Child name="{! v.name }"/>
        `;
        const comp = $Utils.fromXml(xml, Comp);
        expect(_.isObject(comp.attrs.name)).toBe(true);
    });

    it("should have methods for Comp", function() {
        const comp = $Utils.comp("c:Test");
        comp.set("name", "test");
        expect(comp.attrs.name).toEqual("test");

        comp.assign({ age: 30 });
        expect(comp.attrs.age).toEqual(30);

        const child1 = $Utils.comp("c:Child");
        comp.appendTo("body", child1);
        expect(comp.children.body[0]).toEqual(child1);

        const child2 = $Utils.comp("c:Child");
        comp.prependTo("body", child2);
        expect(comp.children.body[0]).toEqual(child2);
    });

    xit("should convert values when parsing from xml", function() {
        const comp = $Utils.fromXml(
            `
            <c:Test passed="true" failed="false"/>
            `
        );
        expect(comp.attrs.passed).toBe(true);
        expect(comp.attrs.failed).toBe(false);
    });

    it("should pretty print list binding", function() {
        const comp = $Utils.comp("c:Test", {
            options: ["a", "b"],
        });
        expect($Utils.toXML(comp)).toContain("v.options");
    });

    it("should make first letter uppercase", function() {
        expect($Utils.toUpperCaseFirst("abcDef")).toEqual("AbcDef");
    });

    it("should make first letter lowercase", function() {
        expect($Utils.toLowerCaseFirst("AbcDef")).toEqual("abcDef");
    });

    it("should support multiple components when hydrating expression", function() {
        const Comp1 = $Mock.newComponent({
            name: "c:Test",
            data: {
                "name": "Comp1",
            }
        });
        const Comp2 = $Mock.newComponent({
            name: "c:Test",
            data: {
                "name": "Comp2",
            }
        });
        expect(Expose.hydrateExpression(`{! comp.v.name }`, {
            _: Comp1,
            comp: Comp2,
        }).toString()).toEqual("Comp2");
    });

    xit("should support text node when converting from xml", function() {
        const Comp = $Mock.newComponent({
            name: "c:Test",
            data: {
                content: "Test Content",
            },
        });
        const comp = $Utils.fromXml(`<span>{! v.content }</span>`, Comp);
        expect(comp.children.body[0].attrs.value.toString()).toEqual("Test Content");
    });

    it("should evaluate expressions", function() {
        const context = {
            box: {
                getSize: function() {
                    return 5;
                },
            },
        };
        expect($Utils.evaluate("1 + 2 - 3")).toEqual(0);
        expect($Utils.evaluate("box.getSize() + 1", context)).toEqual(6);
    });

    it("should extract hints", function() {
        const msg1 = "abc";
        const ret1 = $Utils.extractHint(msg1);
        expect(ret1[0]).toBe(null);
        expect(ret1[1]).toEqual("abc");

        const msg2 = "#test#abc";
        const ret2 = $Utils.extractHint(msg2);
        expect(ret2[0]).toEqual(["test"]);
        expect(ret2[1]).toEqual("abc");
    });

    it("should check promise", function() {
        const promise = new Promise((resolve, reject) => { resolve(null); });
        expect($Utils.isPromise(promise)).toBe(true);
    });
});
