const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const ee = require('../../settings/embed.json')
const pretty = require('humanize-duration')
const idkWhatIsThis = require('../../settings/config').status
const db = require('../../db/blacklist')
const { ButtonPages } = require('../../utils/ButtonPages');
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const bled = require('../../settings/blacklist.json')
module.exports = {
    name: "blacklist",
    description: "blacklist some one",
    options: [
        {
            name: 'add',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Blacklist a user',
            options : [
                {
                  name: 'user',
                  description: 'provide a user id',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                },
                {
                  name: 'reason',
                  description: 'reason of blacklist',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
            ]
        },
        {
            name: 'remove',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Unblacklist a user',
            options : [
                {
                  name: 'user',
                  description: 'provide a user id',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                },
                {
                  name: 'reason',
                  description: 'reason of unblacklist',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
            ]
        },
        {
            name: 'info',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'View info of a blacklisted user',
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
            name: 'edit',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Edit a blacklist reason',
            options : [
                {
                  name: 'user',
                  description: 'provide a user id',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                },
                {
                  name: 'index',
                  description: 'provide index number',
                  type: Constants.ApplicationCommandOptionTypes.NUMBER,
                  required: true,
                },
                {
                  name: 'reason',
                  description: 'reason of blacklist or unblacklist',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
            ]
        },
        {
            name: 'delete',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Delete log',
            options : [
                {
                  name: 'user',
                  description: 'provide a user id',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                },
                {
                  name: 'index',
                  description: 'provide index number',
                  type: Constants.ApplicationCommandOptionTypes.NUMBER,
                  required: true,
                },
            ]
        },
        {
            name: 'view',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'View all user blacklisted',
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
        await interaction.deferReply({ ephemeral :  true })
        switch(options.getSubcommand()) {
            case 'add' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, bled.staff))return;
                handleAdd(interaction, options, client)
                break;

            case 'remove' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, bled.staff))return;
                handleRemove(interaction, options, client)
                break;

            case 'info' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, bled.staff))return;
                handleInfo(interaction, options, client)
                break;

            case 'edit' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, bled.staff))return;
                handleEdit(interaction, options, client)
                break;
            
            case 'delete' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleDelete(interaction, options, client)
                break;
            
            case 'view' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, bled.staff))return;
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
        async function handleAdd(interaction, options, client) {
            const user = options.get('user').user
            const reason = options.get('reason').value

            await interaction.editReply({ content : 'Blacklisting..' })
            await addLog(user.id, interaction.guild.id, reason, 'BLACKLIST', `${interaction.user.tag} (\`${interaction.user.id}\`)`) 
            await interaction.editReply({ content : 'Done!' })
            const embed = new MessageEmbed().setTitle('Successful Blacklist')
            .setDescription(`Reason : ${reason}`)
            .addField('User Blacklisted', `${user} - ${user.tag}`)
            .addField('Acting Moderator', `${interaction.user.tag} (\`${interaction.user.id}\`)`)
            .setColor('GREEN').setTimestamp()
            
            await interaction.followUp({ embeds : [embed], ephemeral : false })
            const foundUser = getMember(interaction.guild, user.id)
            if(foundUser) await addRole(foundUser)
            sendLogs(client, {
                embeds : [embed],
                avatarURL : interaction.user.avatarURL({ dynamic : true }),
                username : interaction.user.username
            })
        }
        async function handleRemove(interaction, options, client) {
            const user = options.get('user').user
            const reason = options.get('reason').value

            await interaction.editReply({ content : 'Unblacklisting..' })
            await addLog(user.id, interaction.guild.id, reason, 'UNBLACKLIST', `${interaction.user.tag} (\`${interaction.user.id}\`)`) 
            await interaction.editReply({ content : 'Done!' })
            const embed = new MessageEmbed().setTitle('Successful Unblacklist')
            .setDescription(`Reason : ${reason}`)
            .addField('User Unblacklisted', `${user} - ${user.tag}`)
            .addField('Acting Moderator', `${interaction.user.tag} (\`${interaction.user.id}\`)`)
            .setColor('GREEN').setTimestamp()
            await interaction.followUp({ embeds : [embed] })
            const foundUser = getMember(interaction.guild, user.id)
            if(foundUser) await removeRole(foundUser)
            sendLogs(client, {
                embeds : [embed],
                avatarURL : interaction.user.avatarURL({ dynamic : true }),
                username : interaction.user.username
            })
        }
        async function handleInfo(interaction, options, client) {
            const user = options.get('user').user
            await interaction.editReply('Fetching logs...')
            
            const logs = await getLog(user.id, interaction.guild.id)
            if(!logs || !logs.length) return interaction.editReply({ content : 'User has not been blacklisted before.' })
            
            const list = []
            logs.map(a => {
                list.push({name : `${a.action == 'BLACKLIST' ? '**Blacklist**' : '**Unblacklist**'} (Index : ${a.index})`, value : `**Reason** : ${a.reason} \n**Moderator** : ${a.modId}\n${a.time ? `**Blacklisted At** : ${`<t:${Math.floor( a.time / 1000)}:F> (<t:${Math.floor( a.time / 1000)}:R>)`}` : ''} \n${a.edited ? `*Last edited by ${a.newModId} at <t:${Math.floor( a.edited / 1000)}:R>*` : ''}`})
            })
            const embed = new ButtonPages({
                colours: ['#FEFFE8'],
                descriptions: [`use \`/blacklist edit\` to edit the reason`],
                fields: list,
                duration: 60 * 1000,
                itemsPerPage: 8,
                paginationType: 'both',
                currentPage: Number(1),
                userID: interaction.user.id,
                includeHome: true,
                includeLast: true,
            })
            .setThumbnail(user.avatarURL({ dynamic : true }))
                .setTitle(`Blacklist log for ${user.id} - ${user.tag}`);

            return embed.send(interaction.channel);
            await interaction.editReply('Done !')
            return
        }
        async function handleEdit(interaction, options, client) {
            const user = options.get('user').user
            const index = options.get('index').value
            const reason = options.get('reason').value

            const logs = await getLog(user.id, interaction.guild.id) 
            if(!logs || !logs.length) {
                return interaction.editReply({ content : 'User is not blacklisted' })
            }
            const foundLog = await editLog(user.id, interaction.guild.id, index, reason, `${interaction.user.tag} (\`${interaction.user.id}\`)`)
            if(!foundLog) {
                return interaction.editReply({ content : 'Invalid index number' })
            }
            else {
                const embed = new MessageEmbed().setTitle('Successful Edit')
                .setDescription(`Reason : ${reason}`)
                .addField('User', `${user} - ${user.tag}`)
                .addField('Acting Moderator', `${interaction.user.tag} (\`${interaction.user.id}\`)`)
                .setColor('GREEN').setTimestamp()

                await interaction.followUp({ embeds : [embed] })
                sendLogs(client, {
                    embeds : [embed],
                    avatarURL : interaction.user.avatarURL({ dynamic : true }),
                    username : interaction.user.username
                })
                // return interaction.editReply({ content : 'Successfully edited !' })
            }

        }
        async function handleDelete(interaction, options, client) {
            const user = options.get('user').user
            const index = options.get('index').value

            const log = await removeLog(user.id, interaction.guild.id, index)
            if(!log) return interaction.editReply('Invalid index number')
            return interaction.editReply('Deleted !')
        }
        async function handleView(interaction, options, client) {
            const blacklisted = await getBlacklisted(interaction.guild.id)
            if(!blacklisted.length) return interaction.editReply('This server have 0 user blacklisted')
            const list1 = niceList(blacklisted, 10);
            const list2 = []
            list1.map(a => {
                const content = a.map(b => `<:flower_dot:936468478397911050> <@${b}> - (\`${b}\`)`)
                list2.push(new MessageEmbed().setThumbnail(interaction.guild.iconURL({ dynamic : true })).setTitle(`Blacklisted Users`).setColor('#FEFFE8').setDescription(content.join('\n')))
            })
            const embed = new ButtonEmbeds({
                pages: list2.length ? list2 : [new MessageEmbed().setTitle('0 results').setColor('RED')],
                timeout: 60000,
                disableAtEnd: true,
                userID: interaction.user.id,
            });

            return embed.reply(interaction, false, false);
        }
        function getMember(guildData, userId) {
            return guildData.members.cache.get(userId)
        }
        function addRole(user) {
            user.roles.add(bled.roles)
        }
        function removeRole(user) {
            user.roles.remove(bled.roles)
        }
        async function isBlacklisted(userId, guildId) {
            const user = await db.findOne({ userId, guildId })
            if(!user) return false
            return true
        }
        async function addLog(userId, guildId, reason, action, modId) {
            try {
                const user = await findUserOrCreate(userId, guildId) 
                const logs = user.logs.sort((a, b) => (a.index > b.index) ? 1 : -1) || []
                
                user.logs.push({
                    reason,
                    modId,
                    time : Date.now(),
                    index : logs.length ? Number(logs.slice(-1)[0].index + 1) : 1,
                    action
                })
                await user.save()
                return user
            }
            catch(e) { console.log(e); }
        }
        async function findUserOrCreate(userId, guildId) {
            let foundUser = await db.findOne({ userId, guildId })
            if(!foundUser) {
                foundUser = new db({ userId, guildId })
                await foundUser.save()
            }
            return foundUser
        }
        async function removeLog(userId, guildId, index) {
            const user = await findUserOrCreate(userId, guildId) 
            const foundLog = user.logs.find(a => a.index == index)
            if(foundLog) {
                user.logs.pull(foundLog)
                await user.save()
                return true
            } else { return false }
        }
        async function editLog(userId, guildId, index, reason, modId) {
            const user = await findUserOrCreate(userId, guildId) 
            const foundLog = user.logs.find(a => a.index == index)
            if(foundLog) {
                user.logs.pull(foundLog)
                user.logs.push({
                    reason : reason,
                    modId : foundLog.modId,
                    time : foundLog.time,
                    index : foundLog.index,
                    action : foundLog.action,
                    edited : Date.now(),
                    newModId : modId
                })
                await user.save()
                return true
            } else { return false }
        }
        async function getLog(userId, guildId) {
            const user = await db.findOne({ userId, guildId })
            if(!user) return false
            return user.logs.sort((a, b) => (a.index < b.index) ? 1 : -1) || []
        }
        async function getBlacklisted(guildId) {
            const data = await db.find({ guildId })
            if(!data) return []
            const bled = data.filter(a => {
                const log = a.logs.sort((a, b) => (a.index < b.index) ? 1 : -1) || []
                if(log.length && log[0].action == 'BLACKLIST') {
                    return a
                }
            })
            return bled.map(a => a.userId)
        }
        function genEmbed(length, perPage, content) {
            const embedList = [];
            const loop = Math.ceil(length / perPage);
            for(let i = 0 ; i < length ; i++) {
                const randomEmbed = new MessageEmbed();
                if(content[i].title) {
                    randomEmbed.setTitle(content[i].title);
                }
                if(content[i].description) {
                    randomEmbed.setDescription(content[i].description);
                }
                if(content[i].color) {
                    randomEmbed.setColor(content[i].color);
                }
                if(content[i].footer) {
                    randomEmbed.setFooter(content[i].footer);
                }
                if(content[i].author) {
                    randomEmbed.setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL({ dynamic : true }));
                }
                embedList.push(randomEmbed);
            }
            return embedList;
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
        function sendLogs(client, content) {
            client.blacklist.queue(content)
        }
    },
};
