const { CommandInteraction, Client, Constants, MessageEmbed } = require("discord.js");
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "ping",
    description: "pong",
    permissions : [""],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    disabled : idkWhatIsThis,
    run: async (client, interaction, args) => {
        interaction.reply({ content: `${client.ws.ping} ws ping` })
    },
};
