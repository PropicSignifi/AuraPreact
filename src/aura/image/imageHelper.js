({
    onLoad: function(cmp, event) {
        cmp.set("v.privateLoading", false);
        cmp.set("v.privateImageSuccess", true);
    },

    onError: function(cmp, event) {
        cmp.set("v.privateLoading", false);
        cmp.set("v.privateImageSuccess", false);
    },
})
