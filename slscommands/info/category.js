const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Util } = require("discord.js");
const config = require('../../settings/tradeConfig')
const buySchema = require('../../db/buys')
const sellSchema = require('../../db/sells')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const cat = require('../../settings/category')
const catS = require('../../db/category')
const configA = require('../../settings/config')
const categoryOption = []
Object.keys(cat.category).map(a => categoryOption.push({ name : `${a}`, value : `${a}` }))
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "category",
    description: "Pick a category.",
    options: [
        {
          name: 'claim',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Pick a category.',
          options: [
            {
              name: 'category',
              description: 'Pick a category.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              required: true,
              choices : categoryOption
            }
          ],
        },
        {
            name: 'view',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'View category.',
        },
        {
          name: 'force-add',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Add a user to a category.',
          options: [
            {
              name: 'user',
              description: 'Mention a user.',
              type: Constants.ApplicationCommandOptionTypes.USER,
              required: true,
            },
            {
                name: 'category',
                description: 'Pick a category.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                choices : categoryOption
              }
          ],
        },
        {
            name: 'force-remove',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Remove a user from category.',
            options: [
              {
                name: 'user',
                description: 'Mention a user.',
                type: Constants.ApplicationCommandOptionTypes.USER,
                required: true,
              }
            ],
          },
        {
            name: 'reset',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Reset all category.',
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
            case 'claim' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, [...cat.staff, ...cat.senior]))return;
                handleClaim(interaction, options, client)
                break;
            case 'view' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, [...cat.staff, ...cat.senior]))return;
                handleView(interaction, options, client)
                break;
            case 'reset' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleReset(interaction, options, client)
                break;
            case 'force-add' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleAdd(interaction, options, client)
                break;
            case 'force-remove' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleRemove(interaction, options, client)
                break;
            
            
        }
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
        async function handleClaim(interaction, options, client) { 
            const user = interaction.user;
            const type = options.get('category').value;
            let data = await catS.findOne({ userId : user.id })
            await interaction.deferReply({ ephemeral : true })
            // return interaction.editReply({
            //     ephemeral : true,
            //     content : `Command has been disabled, ask an admin to assign u to a category!`
            // })
            if(!data) {
                data = new catS({ userId : user.id })
                await data.save()
            }

            data.category = type;
            if(!checkFull(interaction.member._roles, type, await catS.find({ category : type }))) {
                return interaction.editReply({
                    ephemeral : true,
                    content : `**${type}** is full, please select a different category!`
                })
            }
            await data.save()

            return interaction.editReply({
                ephemeral : true,
                content : `${user} claimed ${type}`
            })
        }
        async function handleView(interaction, options, client) { 
            const data = await catS.find({ })
            const categories = Object.keys(cat.category)
            let list = []
            await Promise.all(categories.map(async a => {
                list.push(`~ __**${a}**__`)
                await Promise.all(data.filter(b => b.category == a).map(async b => {
                    const user = client.guilds.cache.get(configA.guild).members.cache.get(b.userId)
                    const senior = isSenior(user?._roles || [])
                    list.push(`> <@${b.userId}>${user ? `:${user.user.username}` : ''} - (\`${b.userId}\`) ${senior ? '[Senior]' : ''}`)
                }))
            }))
            await interaction.deferReply({ ephemeral : false })
            const a =  Util.splitMessage(`${interaction.user} \n${list.join(' \n')}`)
            a.map(a => {
                interaction.channel.send({ content : `${a}`  ,allowedMentions : { parse : [] }})
            })
            return interaction.deleteReply()
            return interaction.editReply({
                content : `${list.join(' \n')}`,
                allowedMentions : { parse : [] }
            })
        }
        async function handleReset(interaction, options, client) { 
            const data = await catS.find({ })
            data.map(a => a.delete())
            await interaction.deferReply({ ephemeral : false })
            interaction.editReply({
                content : 'Category has been reset!'
            })
        }
        async function handleAdd(interaction, options, client) { 
            const user = options.get('user').user;
            const type = options.get('category').value;
            let data = await catS.findOne({ userId : user.id })

            if(!data) {
                data = new catS({ userId : user.id })
                await data.save()
            }

            data.category = type;
            await data.save()
            await interaction.deferReply({ ephemeral : false })
            return interaction.editReply({
                content : `${user} added to ${type}`
            })
        }
        async function handleRemove(interaction, options, client) { 
            const user = options.get('user').user;
            let data = await catS.findOne({ userId : user.id })

            if(data) {
                await data.delete()
            }
            await interaction.deferReply({ ephemeral : true })
            return interaction.editReply({
                content : `${user} removed from all category`
            })
        }
        function checkFull(roles, type, db) {
            let whois = true;
            let currentRole = cat.senior.filter(id => roles.includes(id))
            if(!currentRole.length) {
                currentRole = cat.staff.filter(id => roles.includes(id))
                if(!currentRole.length) {
                    return false;
                }
                else { whois = 'staff' }
            } else { whois = 'senior' }
            const maxLength = cat.category[type][whois]
            if(db.length >= maxLength) {
                return false
            }
            else {
                return true
            }
        }
        function isSenior(roles) {
            let currentRole = cat.senior.filter(id => roles.includes(id))
            if(!currentRole.length) {
                return false
            } else { return true }
        }
    },
};
