$define('test', ['Utils', 'vQuery'], function(Utils, vQuery) {
	return {
		init: (cmpRenderer, args) => {
			Utils.toast({
		    	variant: 'success',
		    	content: 'Hooks loaded successfully',
		    });

		    cmpRenderer(...args);
		},

		actions: boundActions => store => ({
			onLoadSystemConfigs: state => {
		        Utils.toast({
		        	variant: 'error',
		        	content: 'Emm, corrupted',
		        });
		    },
		}),

		postRender: (simpleComp, state) => {
			console.log('Post render');

			const rendered = simpleComp.nodeName(state);
			vQuery(rendered, 'FlatPanel').attr('header', 'Hacked Header');

			return rendered;
		},

        componentDidMount: () => {
            console.log('Did mount');
        },

        componentDidUpdate: () => {
            console.log('Did update');
            $('[data-type="configTree"] .header div').text('JQuery refreshed text');
        },
	};
});
