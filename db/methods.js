const logger = require('./logger');
const { getCommand } = require('./api/commands');

async function getCommandsAndAliases() {
    try {
        const query = await getCommand();

        if (!query.success) return false;

        const commands = query.data;
        const output = [];

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];

            output.push(command.name);

            if (command.aliases && command.aliases.length) {
                command.aliases.forEach(alias => {
                    output.push(alias);
                });
            }
        }

        return output;
    }
    catch(err) {
        logger.error('methods => getCommandsAndAliases => error: ', err);
        return false;
    }
}

exports.getCommandsAndAliases = getCommandsAndAliases;
