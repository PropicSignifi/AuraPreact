$define('bot', ['Utils', 'Config'], function(Utils, Config) {
	return {
		'version': {
			name: 'version',
			usage: 'version',
			description: 'Show current version info',
			exec: input => {
				return Utils.executeApex('ChatBotCallable', 'version', {})
					.then(data => {
						return `Last modified at ${data.LastModifiedDate} by ${data.LastModifiedBy.Name}`;
					});
			},
		},

        'broadcast': {
            name: 'broadcast',
            usage: 'broadcast <message>',
            description: 'Broadcast the message',
            exec: input => {
                const userName = Config.getValue('/System/UserInfo[Readonly]/Name');
                return Utils.executeApex('ChatBotCallable', 'sendMessage', {
                        message: `[${userName}]: ${_.trim(input)}`,
                    })
                    .then(data => {
                        return 'Message has been broadcast successfully';
                    });
            },
        },

        'run': {
            name: 'run',
            usage: 'run <[Target]> <script>',
            description: 'Run the script at the target',
            exec: input => {
                const result = /^\[([^\]]+)\](.*)$/m.exec(_.trim(input));
                if(result) {
                    const target = result[1];
                    const script = result[2];
                    return Utils.executeApex('ChatBotCallable', 'sendEvent', {
                            type: 'Script',
                            title: target,
                            data: script,
                        })
                        .then(data => {
                            return 'Message has been broadcast successfully';
                        });
                }
                else {
                    return 'Usage: run [target] script';
                }
            },
        },

        'tell': {
            name: 'tell',
            usage: 'tell [Username] <message>',
            description: 'Tell someone a message',
            exec: input => {
                const result = /^\[([^\]]+)\](.*)$/m.exec(_.trim(input));
                if(result) {
                    const target = result[1];
                    const message = result[2];
                    const userName = Config.getValue('/System/UserInfo[Readonly]/Name');
                    return Utils.executeApex('ChatBotCallable', 'sendBotMessage', {
                            target: target,
                            message: `[${userName}] ${message}`,
                        })
                        .then(data => {
                            return '';
                        });
                }
                else {
                    return 'Usage: tell [target] script';
                }
            },
        },
	};
});
