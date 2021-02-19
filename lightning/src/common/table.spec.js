describe("$Table", function() {
    const $Table = window.$Table;

    beforeEach(function() {
        _.set($Table.getDefaultTableCellEditors(), "test.editable", function(config) {
            return config.name;
        });
    });

    it("should get all default table cell editors", function() {
        expect(_.size($Table.getDefaultTableCellEditors())).toBeGreaterThan(0);
    });

    it("should get the current table cell editor", function() {
        expect($Table.getDefaultTableCellEditor("test", "editable")).not.toBeUndefined();
    });

    it("should create the correct table cell", function() {
        expect($Table.createDefaultTableCell({ name: "Editor" }, "test", "editable")).toEqual("Editor");
    });
});
