const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require("discord.js");
const config = require('../../settings/tradeConfig')
const auc = require('../../db/auc')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const idkWhatIsThis = require('../../settings/config').status
const tempDb = {}
//[ '12am-6am', '6am-12pm', '12pm-6pm', '6pm-12am' ]
module.exports = {
    name: "auc",
    description: "auctioneer schedule",
    options: [
        {
          name: 'claim',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Claim ur timezone',
          options: [
            {
              name: 'time',
              description: 'Pick a timezone.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              required: true,
              choices : [
                { name: '12am-6am', value: '12am-6am' },
                { name: '6am-12pm', value: '6am-12pm' },
                { name: '12pm-6pm', value: '12pm-6pm' },
                { name: '6pm-12am', value: '6pm-12am' },
                // { name: '12 pm-3 pm', value: '12 pm-3 pm' },
                // { name: '3 pm-6 pm', value: '3 pm-6 pm' },
                // { name: '6 pm-9 pm', value: '6 pm-9 pm' },
                // { name: '9 pm-12 am', value: '9 pm-12 am' }
              ]
            }
          ],
          
        },
        {
            name: 'view',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'View auctioneer schedule',
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
        await interaction.deferReply({})
        switch(options.getSubcommand()) {
            case 'claim' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, ['750117211087044679']))return;
                handleClaim(interaction, options, client)
                break;
            case 'view' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, ['750117211087044679']))return;
                handleView(interaction, options, client)
                break;

                function handlePerms(perms, roles, required) { 
                    if(perms.has('MANAGE_GUILD')) {
                        return true;
                    }
                    else {
                        const check = roles.filter(id => required.includes(id))
                        if(check.length) {
                            return true;
                        }
                        else {
                            return false
                        }
                    }
                    
                }
        }
        async function handleClaim(interaction, options, client) {
            const time = options.get('time').value
            let foundUser = await auc.findOne({ userId : interaction.user.id })
            if(!foundUser) foundUser = new auc({ userId : interaction.user.id })
            foundUser.time = time
            await interaction.deleteReply()
            if(await limit(time, 10)) {
                return interaction.followUp({ ephemeral : true, content : `${time} is full, please pick another time.` })
            }
            await foundUser.save()
            return interaction.followUp({ ephemeral : true, content : `You have picked ${time}` })
        }

        async function handleView(interaction, options, client) {
            const allTime = [ '12am-6am', '6am-12pm', '12pm-6pm', '6pm-12am' ]

            //  [
            //     '12 am-3 am',
            //     '3 am-6 am',
            //     '6 am-9 am',
            //     '9 am-12 pm',
            //     '12 pm-3 pm',
            //     '3 pm-6 pm',
            //     '6 pm-9 pm',
            //     '9 pm-12 am'
            //   ]
            const list = []
            list.push('All times displayed below are in **GMT+0** timezone')
            await Promise.all(allTime.map(async (a, x) => {
                await sleep(700 * x)
                let data = await auc.find({ time : a })

                list.push(`\n${a} (**${data.length}**)`)
                if(data.length) {
                    
                    list.push(data.map(a => prettyName(a.userId)).join('\n'))
                }
                else {
                    list.push(`No one has picked this time yet...`)
                }
            }))

            const a =  Util.splitMessage(`${interaction.user} \n${list.join(' \n')}`)
            await interaction.deleteReply()
            await Promise.all(a.map(async a => {
                await interaction.followUp({ ephemeral : true, content : `${a}`  ,allowedMentions : { parse : [] ,}})
            }))
            return 

            await interaction.editReply({ content : list.join('\n'), allowedMentions : { parse : [] } })
            return
        }

        function prettyName(id) {
            const user = interaction.guild.members.cache.get(id)
            if(!user) return `(\`${id}\`) - <@${id}>`
            return `(\`${id}\`):${user.user.tag} - <@${id}>`
        }

        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function limit(string, num) {
            let data = await auc.find({ time : string })
            if(!data.length) return false
            if(data.length >= num) return true
        }
    },
};
