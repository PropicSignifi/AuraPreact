$define('emp', ['Utils', 'Config'], function(Utils, Config) {
    return {
        type: 'Script',
        exec: data => {
            const userName = Config.getValue('/System/UserInfo[Readonly]/Name');
            if(data.title === userName) {
                try {
                    window.eval(data.data);
                }
                catch(e) {
                    console.error(e);
                }
            }
        },
    };
});
