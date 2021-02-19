({
    unrender: function( component, helper) {
        this.superUnrender();
        if(helper._postmate) {
            helper._postmate.destroy();
            helper._postmate = null;
        }
    },
})
