const { CommandInteraction, Client, Constants, MessageEmbed } = require("discord.js");
var ee = require('../../settings/embed.json')
const channel = '854492291191013416'
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "report",
    description: "Report Minor Trade Violations/Atlas Bypass",
    permissions : [""],
    options : [
        {
            name : 'user',
            type: Constants.ApplicationCommandOptionTypes.USER ,
			description: 'Mention the offender you are trying to report',
            required : true
        },
        {
            name : 'proof',
            type: Constants.ApplicationCommandOptionTypes.STRING ,
			description: 'Enter the Proof of trade violation/Atlas Bypass',
            required : true
        }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
     disabled : idkWhatIsThis,
     run: async (client, interaction, options) => {
        const reportedUser = options.get('user');
        const proof = options.get('proof');

        const embed = new MessageEmbed().setTitle("Reporting User")
        .setAuthor(interaction.user.username, interaction.user.avatarURL())
        .addField('Offender :', `${reportedUser.user}`)
        .addField('Reported by :', `${interaction.user} - (\`${interaction.user.id}\`)`)
        .addField('Proof :', `${proof.value.trim().split(" ").join('\n')}`)
        .setThumbnail(reportedUser.user.avatarURL())

        client.channels.cache.get(channel).send(
            {
                embeds : [embed.setColor(ee.embed_color)]
            }
        );

        return interaction.reply(
            {
                ephemeral : true,
                embeds : [embed.setColor(ee.embed_color)],
                content : 'Your report has been submitted'
            }
        )
    },
};
