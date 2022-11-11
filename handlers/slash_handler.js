const { Client } = require('discord.js');
const fs = require('fs');
const config = require('../settings/config')
/**
   *
   * @param {Client} client
   */

module.exports = (client) => {
    try {
        let command = 0;
        const arrayOfSlashCommands = [];
        const arrayOfSlashCommands2 = []
        fs.readdirSync("./slscommands").forEach(cmd => {
            let commands = fs.readdirSync(`./slscommands/${cmd}/`).filter((file) => file.endsWith(".js"));
            for (cmds of commands) {
                try {
                    let pull = require(`../slscommands/${cmd}/${cmds}`);
                    client.slashCommands.set(pull.name, pull);
                    if (pull.disabled == true) {
                        arrayOfSlashCommands.push(pull)
                        command++
                    } else {
                        arrayOfSlashCommands2.push(pull)
                        console.log(`${cmds} Command is not Ready`);
                        continue;
                    }
                    if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
                }
                catch(e) {
                    console.log(e)
                }

            }
            client.on("ready", async () => {
                client.guilds.cache.forEach(async (g) => {
                    // console.log(await client.application.commands.fetch(0).then(a => {
                    // }))
                    try {
                        // await client.guilds.cache.get(config.guild2).commands.set(arrayOfSlashCommands2);
                        // await client.guilds.cache.get(config.guild).commands.set(arrayOfSlashCommands);

                        await client.guilds.cache.get('912717372274638868').commands.set(arrayOfSlashCommands);

                    }
                    catch(e) {
                        console.log(e)
                    }
                    // await client.guilds.cache.get("873524431736160256").commands.set(arrayOfSlashCommands);
                });

//873524431736160256
            });
            

        })
        
        console.log(`${command} sls lOADED`);
    } catch (e) {
        console.log(e)
        console.log(e.message);
    }
}