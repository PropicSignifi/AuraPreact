({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('', classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    computePreviewText: function(cmp) {
        var texts = cmp.get("v.texts");
        var text = cmp.get("v.text");
        var privatePreviewText = null;
        var privatePreviewTexts = null;
        if(!_.isEmpty(texts)) {
            privatePreviewTexts = texts;
            privatePreviewText = texts[0];
        }
        else {
            privatePreviewTexts = [text];
            privatePreviewText = text;
        }
        cmp.set("v.privatePreviewTexts", privatePreviewTexts);
        cmp.set("v.privatePreviewText", privatePreviewText);
    },
})
