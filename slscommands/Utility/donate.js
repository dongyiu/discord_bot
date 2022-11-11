const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const ee = require('../../settings/embed.json')
const pretty = require('humanize-duration')
const idkWhatIsThis = require('../../settings/config').status
const gaw = require('../../settings/donate')

module.exports = {
    name: "donate",
    description: "donate a giveaway",
    options: [
        {
            name: 'duration',
            description: 'duration of the giveaway',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'winners',
            description: 'amount of winners for this giveaway',
            type: Constants.ApplicationCommandOptionTypes.NUMBER,
            required: true,
        },
        {
            name: 'prize',
            description: 'the prize of this giveaway',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'requirement',
            description: 'the requirement to win this giveaway',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: false,
        },
        {
            name: 'message',
            description: 'a short message from yourself',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: false,
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
        const msg = options.get('message')?.value || '-'
        const req = options.get('requirement')?.value || '-'
        const prize = options.get('prize').value
        const winners = options.get('winners').value
        const duration = options.get('duration').value

        await interaction.deferReply({ content : `Loading...`, ephemeral : true })

        if(msg.length > 50) {
            return interaction.editReply({ content : 'Your giveaway message should not be longer than 50 characters' })
        }else if(!gaw.gawChannel.includes(interaction.channel.id)) {
            return interaction.editReply({ content : 'This command can only be use in giveaway donation channel !' })
        }
        await interaction.channel.send({
            content : `<@&${gaw.gaw}>, ${interaction.user} would like to donate`,
            embeds : [
                new MessageEmbed().setTitle(`${interaction.user.username} wants to make a donation!`).setColor('#fad5d2')
                .setDescription([
                    `Donor : ${interaction.user} `,
                    `Duration : ${duration} `,
                    `Amount of winners : ${winners} `,
                    `Prize : ${prize} `,
                    `Req : ${req}`,
                    `Message : ${msg}`,
                ].join('\n'))
            ]
        })
        return interaction.editReply({ content : 'Done!' })

    },
};
