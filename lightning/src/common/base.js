// This file contains the very basic and core utility functions used by other modules.
(function(w) {
    const exposes = {};

    // add :: (String, Expose) -> _
    const add = (name, expose) => {
        if(!name || !expose) {
            throw new Error("Invalid expose");
        }

        exposes[name] = expose;
    };

    // get :: String -> Expose
    const get = name => exposes[name];

    /*
     * $Expose is purely used to expose internal functions inside a module so that 
     * they can be easily unit tested.
     */
    const $Expose = {
        add,
        get,
    };

    w.$Expose = $Expose;
})(window);
