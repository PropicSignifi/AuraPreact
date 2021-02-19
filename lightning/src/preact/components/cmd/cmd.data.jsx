import { h, render, Component } from 'preact';
import CommandManager from './cmd';
import TableManager from '../table/TableManager';
import styles from './cmd.less';

const cmdColumns = [
    {
        name: 'name',
        header: 'Name',
    },
    {
        name: 'usage',
        header: 'Usage',
    },
    {
        name: 'description',
        header: 'Description',
    },
];

const commands = {
    'echo': {
        name: 'echo',
        usage: 'echo <something>',
        description: 'Repeat whatever is entered',
        exec: input => _.trim(input),
    },

    'eval': {
        name: 'eval',
        usage: 'eval <javascript>',
        description: 'Evaluate the javascript in current component context',
        exec: input => {
            try {
                const result = window.eval(_.trim(input));
                console.log(result);
            }
            catch(error) {
                console.error(error);
            }

            return 'Done. Check the console for details.';
        },
    },

    'help': {
        name: 'help',
        usage: 'help [command name]',
        description: 'Show help information for commands',
        exec: input => {
            const cmdName = _.trim(input);
            const cmds = [];
            if(cmdName) {
                const cmd = CommandManager.getCommand(cmdName);
                if(!cmd) {
                    throw new Error(`Invalid command name [${cmdName}]`);
                }
                cmds.push(cmd);
            }
            else {
                cmds.push(...(_.chain(CommandManager.getCommands()).values().sortBy('name').value()));
            }

            return (
                <TableManager
                    tableClassName={ styles.noScroll }
                    name="chat_helpCommandsTable"
                    columns={ cmdColumns }
                    data={ cmds }
                    pageSize="10"
                >
                </TableManager>
            );
        },
    },

    'inspect': {
        name: 'inspect',
        usage: 'inspect <data-locator-id>',
        description: 'Show inspection information for the component',
        exec: input => {
            const locatorId = _.trim(input);

            let base = document.querySelectorAll(`[data-locator="${locatorId}"]`)[0];

            if(base) {
                console.log(base._component);
                return 'Please check developer console.';
            }
            else {
                return 'No valid component could be found.';
            }
        },
    },
};

export default commands;
