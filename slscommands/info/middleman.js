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
    name: "mm",
    description: "Middleman",
    options: [
        {
          name: 'add',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Give access to middleman trade channel.',
          options: [
            {
              name: 'user-1',
              description: 'Mention a user.',
              type: Constants.ApplicationCommandOptionTypes.USER,
              required: true,
            },
            {
                name: 'user-2',
                description: 'Mention a user.',
                type: Constants.ApplicationCommandOptionTypes.USER,
                required: true,
              },
          ],
        },
        {
            name: 'remove',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Remove access from middleman trade channel.',
            options: [
              {
                name: 'user-1',
                description: 'Mention a user.',
                type: Constants.ApplicationCommandOptionTypes.USER,
                required: true,
              },
              {
                  name: 'user-2',
                  description: 'Mention a user.',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                },
            ],
        },
        {
          name: 'stat',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Middleman Stats.',
          options: [
            {
              name: 'type',
              description: 'Top or Low.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              choices: [
                {
                  name: 'top',
                  value: 'top',
                },
                {
                  name: 'low',
                  value: 'low',
                },
              ],
              required: true,
            }
          ],
        },
        {
            name: 'reset',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Reset middleman logs.',
        },
        {
            name: 'request',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Request for a middleman',
            options: [
                {
                  name: 'type',
                  description: 'Select one type',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  choices: [
                    {
                      name: 'prestige',
                      value: 'prestige',
                    },
                    {
                      name: 'fight',
                      value: 'fight',
                    },
                    {
                      name: 'omega',
                      value: 'omega',
                    },
                    {
                        name : 'trade',
                        value : 'trade'
                    }
                  ],
                  required: true,
                },
                {
                  name: 'user',
                  description: 'If you select fight mention the user you are fighting with',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: false,
                },
                {
                    name: 'details',
                    description: 'Items you are fighting / trading for',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
              ],
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
        switch(options.getSubcommand()) {
            case 'add' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, mm.staff))return;
                handleAdd(interaction, options, client)
                break;
            case 'remove' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, mm.staff))return;
                handleRemove(interaction, options, client)
                break;
            case 'stat' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleStat(interaction, options, client)
                break;
            case 'reset' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleReset(interaction, options, client)
                break;
            case 'request' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, 'none'))return;
                handleRequest(interaction, options, client)
                break;
            
            function handlePerms(perms, roles, required) { 
                if(required == 'none') return true
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
            async function handleRequest(interaction, options, client) {
                if(interaction.channel.id != mm.channel) {
                    await interaction.deferReply({ ephemeral : true })
                    return interaction.editReply({
                        ephemeral : true,
                        content : `This command can only be ran in <#${mm.channel}>`
                    })
                }
                else {
                    const choice = options.get('type').value
                    const user = options.get('user')?.user
                    const info = options.get('details')?.value

                    if(choice == 'prestige' || choice == 'omega') {
                        await interaction.deferReply({ ephemeral : true })
                        await interaction.editReply({ content : 'loading...' })
                        await interaction.channel.send({ content : `<@&${mm.staff[0]}>, \nUser Requesting : ${interaction.user}: ${interaction.user.tag} \nType : ${choice}`, allowedMentions: { users: [], roles: mm.staff } })
                        return interaction.editReply({ content : 'Done !' })
                    }
                    if(choice == 'trade' && (!user || !info )) {
                        await interaction.deferReply({ ephemeral : true })
                        return interaction.editReply({
                            ephemeral : true,
                            content : `Please mention the user you are trading with or the details!`
                        })
                    }
                    else if(user && info && choice == 'trade') {
                        await interaction.deferReply({ ephemeral : true })
                        await interaction.editReply({ content : 'loading...' })
                        await interaction.channel.send({ content : `<@&${mm.staff[0]}>, \nUser Requesting : ${interaction.user}: ${interaction.user.tag} \nType : ${choice} \nTrading with : ${user}: ${user.tag} \nTrade details : ${info}`, allowedMentions: { roles: mm.staff } })
                        return interaction.editReply({ content : 'Done !' })
                    }
                    if(choice == 'fight' && (!user || !info )) {
                        await interaction.deferReply({ ephemeral : true })
                        return interaction.editReply({
                            ephemeral : true,
                            content : `Please mention the user you are fighting with or the details!`
                        })
                    }
                    else if(user && info && choice == 'fight') {
                        await interaction.deferReply({ ephemeral : true })
                        await interaction.editReply({ content : 'loading...' })
                        await interaction.channel.send({ content : `<@&${mm.staff[0]}>, \nUser Requesting : ${interaction.user}: ${interaction.user.tag} \nType : ${choice} \nFighting with : ${user}: ${user.tag}  \nFight details : ${info}`, allowedMentions: { roles: mm.staff } })
                        return interaction.editReply({ content : 'Done !' })
                    }

                }
            }
            async function handleAdd(interaction, options, client) {
                const user = interaction.user
                let user1 = options.get('user-1').user;
                let user2 = options.get('user-2').user;
                
                let list = [];
                interaction.guild.members.cache.get(user1.id)?.roles.add(mm.middlemanAccess)
                interaction.guild.members.cache.get(user2.id)?.roles.add(mm.middlemanAccess)
                list.push(`Given access to ${user1}`)
                list.push(`Given access to ${user2}`)

                createOrAdd(interaction.user.id)
                await interaction.deferReply({ ephemeral : true })
                interaction.editReply({
                    ephemeral : true,
                    content : `${list.join('\n')}`
                })
            }
            async function handleRemove(interaction, options, client) {
                const user = interaction.user
                let user1 = options.get('user-1').user;
                let user2 = options.get('user-2').user;
                
                let list = [];
                interaction.guild.members.cache.get(user1.id)?.roles.remove(mm.middlemanAccess)
                interaction.guild.members.cache.get(user2.id)?.roles.remove(mm.middlemanAccess)
                list.push(`Removed access from ${user1}`)
                list.push(`Removed access from ${user2}`)
                await interaction.deferReply({ ephemeral : true })
                interaction.editReply({
                    ephemeral : true,
                    content : `${list.join('\n')}`
                })
            }
            async function handleStat(interaction, options, client) {
                const type = options.get('type').value;
                let data = null

                if(type == 'top') {
                    data = await mmS.find({ }).sort({ counter : -1 }).limit(10)
                    // data = data.sort((a, b) => a.counter < b.counter ? 1 : (a.counter > b.counter ? 1 : 0))
                }
                else {
                    data = await mmS.find({ }).sort({ counter : 1 }).limit(10)
                    data = data.sort((a, b) => a.counter < b.counter ? -1 : (a.counter > b.counter ? 1 : 0))
                }
                await interaction.deferReply({ ephemeral : false })
                interaction.editReply({
                    allowedMentions : { parse : [] },
                    content : `${type} mm logs (${data.length}). \n\n${data.map((a,x) => `\`${x+1}\`. <@${a.userId}> - (\`${a.userId}\`) : \`${a.counter}\``).join('\n')}`
                })
            }
            async function handleReset(interaction, options, client) {
                let data = await mmS.find({ })
                data.map(a => a.delete())
                await interaction.deferReply({ ephemeral : false })
                interaction.editReply({
                    content : 'Middleman Logs has been reset'
                })
            }
            async function createOrAdd(userId) {
                let data = await mmS.findOne({ userId })
                if(!data) {
                    data = new mmS({ userId })
                    await data.save()
                }
                data.counter = Number(data.counter + 1);
                await data.save()
            }
            
        }

    },
};
