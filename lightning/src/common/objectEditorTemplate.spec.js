describe("$ObjectEditorTemplateManager", function() {
    const $ObjectEditorTemplateManager = window.$ObjectEditorTemplateManager;

    beforeEach(function() {
        $ObjectEditorTemplateManager.getTemplates().testTemplate = {
            render: function(comps, providers) {
                return _.size(comps);
            },
        };
    });

    it("should get all templates", function() {
        expect(_.size($ObjectEditorTemplateManager.getTemplates()) > 0).toBe(true);
    });

    it("should get correct template", function() {
        expect($ObjectEditorTemplateManager.getTemplate("testTemplate")).not.toBeUndefined();
    });

    xit("should render correctly", function() {
        const editorConfig = [
            {
                name: "prop1",
                template: "<c:test/>",
            },
            {
                name: "prop2",
                template: function(params, providers) {
                    return "<c:test2/>";
                },
            },
        ];

        expect($ObjectEditorTemplateManager.render("testTemplate", editorConfig)).toEqual(2);
    });
});
