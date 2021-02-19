import { h, render, Component } from 'preact';
import systemCommands from './cmd.data.jsx';

const CMD_PATTERN = '^:([a-zA-Z0-9]+)(.*)$';

const commands = _.assign({}, systemCommands);

const registerCommand = (name, handler) => {
    if(_.isString(name)) {
        const command = _.isPlainObject(handler) ? handler : {
            exec: handler,
        };
        command.name = name;

        commands[name] = command;
    }
};

const unregisterCommand = name => {
    delete commands[name];
};

const registerCommands = cmds => {
    _.forEach(cmds, (handler, name) => {
        registerCommand(name, handler);
    });
};

const getCommands = () => commands;

const getCommand = cmdName => commands[cmdName];

const outputSuccess = data => {
    return Promise.resolve({
        success: true,
        data,
    });
};

const outputError = error => {
    return Promise.resolve({
        success: false,
        data: _.isString(error) ? error : error.toString(),
    });
};

const execCommand = (command, bot) => {
    const p = new RegExp(CMD_PATTERN, 'm');
    const result = p.exec(command);
    if(result) {
        const [,cmdName,cmdInput] = result;

        const cmds = _.chain(commands).values().filter(cmd => _.startsWith(_.toLower(cmd.name), _.toLower(cmdName))).value();
        let cmd = commands[cmdName];
        if(_.size(cmds) > 1 && !cmd) {
            const hint = (
                <div>
                    Did you mean
                    {
                        _.map(cmds, (cmd, index) => {
                            let prefix = null;
                            switch(index) {
                                case 0:
                                    prefix = ' ';
                                    break;
                                case (_.size(cmds) - 1):
                                    prefix = ' or ';
                                    break;
                                default:
                                    prefix = ', ';
                                    break;
                            }

                            return (
                                <span>
                                    { prefix }
                                    <a onclick={ () => bot.setInputText(':' + cmd.name) }>{ cmd.name }</a>
                                </span>
                            );
                        })
                    }
                    ?
                </div>
            );

            return outputSuccess(hint);
        }
        else if(_.size(cmds) === 1) {
            try {
                cmd = cmds[0];
                const ret = cmd.exec(cmdInput, bot);
                return _.isFunction(ret.then) ? ret.then(outputSuccess, outputError) : outputSuccess(ret);
            }
            catch(error) {
                return outputError(error);
            }
        }
        else {
            return outputError(`Invalid command name [${cmdName}]`);
        }
    }
    else {
        return outputSuccess('?');
    }
};

const CommandManager = {
    registerCommand,
    registerCommands,
    unregisterCommand,
    execCommand,
    getCommands,
    getCommand,
};

export default CommandManager;
