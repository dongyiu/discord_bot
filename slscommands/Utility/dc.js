const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const buySchema = require('../../db/buys')
const sellSchema = require('../../db/sells')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const mm = require('../../settings/middleman')
const mmS = require('../../db/middlemans')
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "vc",
    description: "move a user to your current vc",
    options: [
        {
          name: 'user',
          type: Constants.ApplicationCommandOptionTypes.USER,
          description: 'mention a user',
          required : true,
        },
        
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    disabled : idkWhatIsThis,
    run: async (client, interaction, options) => {
       if(!interaction.memberPermissions.has('MANAGE_GUILD') && !interaction.channel.id == '945581219800838144') return
        const user = options.get('user').user
        if(!interaction.member.voice.channel) {
            await interaction.deferReply({ ephemeral : true })
            return interaction.editReply('You must join a vc to use this command')
        }
        await interaction.deferReply({ ephemeral : false })
        try {
            const channel = interaction.member.voice.channel
            await interaction.guild.members.cache.get(user.id).voice.setChannel(channel.id)
            await interaction.editReply(`You have moved ${user} to ${channel}`)
        }
        catch(e) { 
            console.log(e)
            await interaction.editReply(`An error occured. \n${e.message}`)
        }
    },
};
