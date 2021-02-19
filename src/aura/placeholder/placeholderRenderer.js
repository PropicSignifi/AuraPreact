({
    render: function(cmp, helper) {
        var dom = cmp.superRender();

        var node = dom.find(function(item) {
            return item.tagName !== '#comment';
        });
        node.appendChild(helper.generatePlaceholder(cmp));
        return dom;
    },
})
