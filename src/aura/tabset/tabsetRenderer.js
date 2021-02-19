({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.addRegisterListener(cmp);
            helper.addSelectListener(cmp);
            helper.addUnRegisterListener(cmp);
            helper.addTabBodyChangeListener(cmp);
            helper.setTabOrientation(cmp);

            helper.buildTabsHeader(cmp);
        });
    },

    rerender: function(cmp, helper) {
        cmp.superRerender();
        helper.doesRequireScrolling(cmp);
    },

    unrender: function(cmp, helper) {
        var privateTabHeaders = cmp.find('privateTabHeaders').get('v.body');
        var privateContent = cmp.get('v.privateContent');

        helper.destroyFacet(privateTabHeaders);
        helper.destroyFacet(privateContent);

        cmp.superUnrender();
    },
})
