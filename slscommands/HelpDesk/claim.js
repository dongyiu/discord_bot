const { CommandInteraction, Client, Constants, MessageEmbed } = require("discord.js");
var ee = require('../../settings/embed.json')
const channel = '844392728674697216'
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "claim",
    description: "Claim perk",
    permissions : [""],
    options: [
        {
            name: 'perks',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Claim a perk',
            options: [
                {
                    name: 'perks',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    description: 'Please choose from the following options to claim a perk',
                    required: true,
                    choices : [
                        {
                            name : 'Booster Perks',
                            value : 'Booster Perks'
                        },
                        {
                            name : 'Investor Perks(Nitro/IRL $ Donation)',
                            value : 'Investor Perks(Nitro/IRL $ Donation)'
                        },
                        {
                            name : 'Donator Perks(Custom AR)',
                            value : 'Donator Perks(Custom AR)'
                        }
                    ]
                }
            ]
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
        const req = options.get('perks').value

        client.channels.cache.get(channel).send({
            embeds : [
                new MessageEmbed().setTitle('Claim Perks').setColor(ee.embed_color)
                .addField('Requested User', `${interaction.user} - (\`${interaction.user.id}\`)`)
                .addField('Requested Perks', req)
                .setAuthor(interaction.user.username, interaction.user.avatarURL())
                .setThumbnail(interaction.user.avatarURL())
            ],
            content : `${interaction.user.id}`
        })
        return interaction.reply(
            {
                ephemeral : true,
                embeds : [
                    new MessageEmbed().setTitle('Success !').setColor(ee.embed_color)
                    .setAuthor(interaction.user.username, interaction.user.avatarURL())
                    .setDescription('Your request for perks has been received. A staff member will be DMing you shortly to assist with the perks.')
                ]
            }
        )
    },
};
