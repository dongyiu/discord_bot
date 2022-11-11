const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const ee = require('../../settings/embed.json')
const pretty = require('humanize-duration')
const idkWhatIsThis = require('../../settings/config').status
const { ButtonPages } = require('../../utils/ButtonPages');
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const db = require('../../db/breaks')
const ms = require('ms')
const settingRole = require('../../settings/break').staff 
const channel = require('../../settings/break').channel 
module.exports = {
    name: "break",
    description: "staff break",
    options: [
        {
            name: 'start',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Take a break',
            options : [
                {
                  name: 'duration',
                  description: 'duration of break',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
                {
                  name: 'reason',
                  description: 'reason of break',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
            ]
        },
        {
            name: 'remove',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Remove break',
            options : [
                {
                  name: 'user',
                  description: 'provide a user id',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                }
            ]
        },
        {
            name: 'stats',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'View info of a user',
            options : [
                {
                  name: 'user',
                  description: 'provide a user id',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: false,
                },
                {
                  name: 'role',
                  description: 'provide a role id',
                  type: Constants.ApplicationCommandOptionTypes.ROLE,
                  required: false,
                },
            ]
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
        await interaction.deferReply({ ephemeral :  true })
        switch(options.getSubcommand()) {
            case 'start' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, settingRole)) return errorReply(interaction, 'You are not a staff lol');
                handleStart(interaction, options, client)
                break;
            case 'remove' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, [])) return errorReply(interaction, 'You are not a staff lol');
                handleRemove(interaction, options, client)
                break;
            case 'stats' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, [])) return errorReply(interaction, 'You are not a staff lol');
                handleStats(interaction, options, client)
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

        async function handleStart(interaction, options, client) {
            const user = interaction.user
            const duration = options.get('duration').value
            const reason = options.get('reason').value
            const roles = getRoles(interaction.member._roles, settingRole)

            if(!ms(duration)) return errorReply(interaction, 'Invalid duration')
            if(reason.length > 500) return errorReply(interaction, 'Reason should not be longer than 500 characters')
            if(await checkExist(user.id)) return errorReply(interaction, 'You are ald on break')
            if(ms(duration) > 2505600000) return errorReply(interaction, 'Please contact an admin if your break is longer than 29 days')

            await findOrCreateOne(user.id)
            await addBreak(user.id, ms(duration), reason, roles)
            await removeRoles(interaction, roles)
            sendLogs(interaction, user, ms(duration), reason, roles)
            return errorReply(interaction, `Enjoy your ${pretty(ms(duration))} break`)
        }
        async function handleRemove(interaction, options, client) {
            const user = options.get('user').user
            if(!await checkExist(user.id)) return errorReply(interaction, 'User not on break')

            const button = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('YES').setLabel('Yes').setStyle('SUCCESS'),
                new MessageButton().setCustomId('NO').setLabel('No').setStyle('DANGER'),
            )
            const msg = await interaction.editReply({ content : `Are you sure you would like to remove break from ${user.tag} - ${user}`, components : [button] })
            const result = await confirm(msg, {author : interaction.user.id})
            if(result) {
                const foundUser = await findOrCreateOne(user.id)
                await removeUser(user.id)
                await interaction.followUp({ content : `${interaction.user} has removed ${user.tag} - ${user} from break !` })
                await addRole(interaction, user.id, foundUser.roles)
                backLogs(interaction, user, foundUser.duration, foundUser.reason, foundUser.roles, foundUser.timestamp)
                return errorReply(interaction, `Done !`)
            }
            else {
                return errorReply(interaction, 'Cancelled')
            }
        }
        async function handleStats(interaction, options, client) {
            const user = options.get('user')?.user
            const role = options.get('role')?.role
            if(user) {
                if(!await checkExist(user.id)) return errorReply(interaction, 'User not on break')
                await errorReply(interaction, 'Loading...')
                const foundUser = await findOrCreateOne(user.id)
                const embed = new MessageEmbed()
                .setAuthor({ name : user.tag, iconURL : user.avatarURL({dynamic : true}) })
                .setDescription([
                    `**On Break Since** : <t:${Math.floor(foundUser.timestamp/1000)}:R>`,
                    `**Duration** : ${pretty(foundUser.duration)}`,
                    `**Reason** : ${foundUser.reason}`,
                    `**Roles** : ${foundUser.roles.map(a => `<@&${a}>`).join(', ')}`
                ].join('\n')).setColor('#FEFFE8')
                await errorReply(interaction, 'Done!')
                await interaction.followUp({ embeds : [embed] })
            }
            else {
                let onBreaks = null
                if(!role) onBreaks = await db.find({}).sort({ timestamp : 1 })
                if(role) onBreaks = await db.find({ roles : role.id })
                
                if(!onBreaks.length) return errorReply(interaction, 'No one on break')
                const list1 = niceList(onBreaks, 10);
                const list2 = []
                list1.map(a => {
                    const content = a.map(b => `<:flower_dot:936468478397911050> <@${b.userId}> - (\`${b.userId}\`) : **<t:${Math.floor(b.timestamp/1000)}:R>**`)
                    list2.push(new MessageEmbed().setThumbnail(interaction.guild.iconURL({ dynamic : true })).setTitle(`Users on break`).setColor('#FEFFE8').setDescription(content.join('\n')))
                })
                const embed = new ButtonEmbeds({
                    pages: list2.length ? list2 : [new MessageEmbed().setTitle('0 results').setColor('RED')],
                    timeout: 60000,
                    disableAtEnd: true,
                    userID: interaction.user.id,
                });
    
                return embed.reply(interaction, false, false);
            }
        } 
        function addRole(interaction, userId, roles) {
            return interaction.guild.members.cache.get(userId).roles.add(roles)
        }
        function removeRoles(interaction, roles) {
            return interaction.member.roles.remove(roles)
        }
        function getRoles(memberRole, settingRole) {
            return memberRole.filter(a => settingRole.includes(a))
        }
        async function confirm(msg, options) {
            return new Promise(async (resolve, reject) => {
                const button = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('YES').setLabel('Yes').setStyle('SUCCESS'),
                    new MessageButton().setCustomId('NO').setLabel('No').setStyle('DANGER'),
                )
                // const msg = await message.channel.send({ content : options.content , components : [button] });
                const collector = await msg.createMessageComponentCollector({ idle: 15 * 1000 });
                collector.on('collect', async i => {
                    i.deferUpdate();
                    if(i.user.id != options.author) {
                        return i.followUp({
                            ephemeral : true,
                            content : 'This is not for u!'
                        })
                    }
                    const command = i.customId
                    if(command == 'YES') {
                        resolve(true)
                    }
                    else if(command == 'NO') {
                        collector.stop();
                        resolve(false)
                    }
                });
        
                collector.on('end', async collected => {
                    if (collected.size == 0) {
                        resolve(false)
                    }
                });
            })
        }
        async function findOrCreateOne(userId) {
            let foundUser = await db.findOne({ userId })
            if(!foundUser) {
                foundUser = new db({ userId })
                await foundUser.save()
            }
            return foundUser
        }
        async function checkExist(userId) {
            let foundUser = await db.findOne({ userId })
            if(foundUser) return true
            return false
        }
        async function removeUser(userId) {
            let foundUser = await db.findOne({ userId })
            await foundUser.delete()
        }
        async function addBreak(userId, duration, reason, roles) {
            let foundUser = await db.findOne({ userId })
            foundUser.duration = duration
            foundUser.reason = reason
            foundUser.roles = roles
            await foundUser.save()
        }
        function errorReply(i, content) {
            i.editReply({ content, components : [] })
        }
        function niceList(list, perPage) {
            try {
                const list1 = [];
                const loop = Math.ceil(list.length / perPage);
                for(let i = 0 ; i < loop ; i++) {
                    const list2 = [];
                    for(let y = 0 ; y < perPage ; y++) {
                        const tempNum = list.shift();
                        if(tempNum) {
                            list2.push(tempNum);
                        }
                    }
                    list1.push(list2);
                }
                return list1;
            }
            catch (e) {
                console.log(e)
            }
            
        }
        function sendLogs(interaction, user, duration, reason, roles) {
            const embed = new MessageEmbed().setAuthor({ name : `${user.tag} is going on break`, iconURL : user.avatarURL({dynamic : true}) })
            .setDescription([
                `**ID** : ${user.id}`,
                `**Current Time** : <t:${Math.floor(Date.now()/1000)}:F>`,
                `**Duration** : ${pretty(duration)}`,
                `**Reason** : ${reason}`,
                `**Roles** : ${roles.map(a => `<@&${a}>`).join(', ')}`
            ].join('\n')).setColor('#FEFFE8')
            interaction.guild.channels.cache.get(channel).send({ embeds : [embed] })
        }
        function backLogs(interaction, user, duration, reason, roles, timestamp) {
            const embed = new MessageEmbed().setAuthor({ name : `${user.tag} is back from break`, iconURL : user.avatarURL({dynamic : true}) })
            .setDescription([
                `**ID** : ${user.id}`,
                `**Current Time** : <t:${Math.floor(Date.now()/1000)}:F>`,
                `**On Break Since** : <t:${Math.floor(timestamp/1000)}:R>`,
                `**Duration** : ${pretty(duration)}`,
                `**Reason** : ${reason}`,
                `**Roles** : ${roles.map(a => `<@&${a}>`).join(', ')}`
            ].join('\n')).setColor('#FEFFE8')
            interaction.guild.channels.cache.get(channel).send({ embeds : [embed] })
        }
    },

};
