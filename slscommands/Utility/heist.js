const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const ee = require('../../settings/embed.json')
const pretty = require('humanize-duration')
const idkWhatIsThis = require('../../settings/config').status
const gaw = require('../../settings/donate')

module.exports = {
    name: "heist",
    description: "sponsor a heist",
    options: [
        {
            name: 'amount',
            description: 'the amount you are sponsoring',
            type: Constants.ApplicationCommandOptionTypes.NUMBER,
            required: true,
        },
        {
            name: 'requirement',
            description: 'the requirement to join this heist',
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
        const amount = options.get('amount').value
       

        await interaction.deferReply({ content : `Loading...`, ephemeral : true })

        if(msg.length > 50) {
            return interaction.editReply({ content : 'Your giveaway message should not be longer than 50 characters' })
        }else if(!gaw.heistChannel.includes(interaction.channel.id)) {
            return interaction.editReply({ content : 'This command can only be use in heist donation channel !' })
        }
        else if(amount < 20e6) {
            return interaction.editReply({ content : 'Minimum donation for heist is 20 million.' })
        }
        await interaction.channel.send({
            content : `<@&${gaw.heist}>, ${interaction.user} would like to donate`,
            embeds : [
                new MessageEmbed().setTitle(`${interaction.user.username} wants to make a donation!`).setColor('#fad5d2')
                .setDescription([
                    `Donor : ${interaction.user} `,
                    `Amount : ${amount.toLocaleString()} `,
                    `Req : ${req}`,
                    `Message : ${msg}`,
                ].join('\n'))
            ]
        })
        return interaction.editReply({ content : 'Done!' })

    },
};
