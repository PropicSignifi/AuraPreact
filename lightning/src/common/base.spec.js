describe("$Expose", function() {
    it("should add and get exposed objects", function() {
        const expose = {};
        window.$Expose.add("Test", expose);
        expect(window.$Expose.get("Test")).toBe(expose);
    });
});
