(function(w) {
    const sprites = {};

    const $Icons = {
        addSprite: function(category, sprite) {
            sprites[category] = sprite;
        },

        removeSprite: function(category) {
            delete sprites[category];
        },

        getSprite: function(category) {
            return sprites[category];
        },

        getSvg: function(category, name) {
            return sprites[category] ? sprites[category][name] : null;
        },
    };

    w.$Icons = $Icons;
})(window);
