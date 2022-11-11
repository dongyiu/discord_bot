const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const ee = require('../../settings/embed.json')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const idkWhatIsThis = require('../../settings/config').status
const db = require('../../db/embed')
const { create, url, short, get } = require("sourcebin");
module.exports = {
    name: "embed",
    description: "create an embed",
    options: [
        {
            name: 'create',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Create an embed',
            options : [
                {
                  name: 'embed',
                  description: 'send the embed in JSON format',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
                {
                  name: 'name',
                  description: 'name of this embed',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
                {
                    name: 'channel',
                    description: 'list of channel ids this embed should be limited to',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
                {
                    name: 'roles',
                    description: 'list of role ids this embed should be limited to',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
                {
                    name: 'error-message',
                    description: 'display error message',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
            ]
        },
        {
            name: 'raw',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'get the raw embed',
            options : [
                {
                  name: 'link',
                  description: 'message link of the message',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: false,
                },
                {
                    name: 'name',
                    description: 'name of created embed',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                }
            ]
        },
        {
            name: 'list',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'view all created embeds',
            options : [
                {
                    name: 'name',
                    description: 'name of the embed you search for',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                }
            ]
        },
        {
            name: 'delete',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Delete an embed',
            options : [
                {
                  name: 'name',
                  description: 'name of this embed',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                }
            ]
        },
        {
            name: 'edit',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Edit an embed',
            options : [
                {
                  name: 'name',
                  description: 'name of this embed',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
                {
                  name: 'embed',
                  description: 'send the embed in JSON format',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: false,
                },
                {
                    name: 'channel',
                    description: 'list of channel ids this embed should be limited to',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
                {
                    name: 'roles',
                    description: 'list of role ids this embed should be limited to',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
                {
                    name: 'error-message',
                    description: 'display error message',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                },
                {
                    name: 'new-name',
                    description: 'new name of this embed',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                  },
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
        await interaction.deferReply();
        switch(options.getSubcommand()) {
            case 'create' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleCreate(interaction, options, client)
                break;
            case 'edit' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleEdit(interaction, options, client)
                break;
            case 'raw' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleRaw(interaction, options, client)
                break;
            case 'list' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleList(interaction, options, client)
                break;
            case 'delete' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleDelete(interaction, options, client)
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

        async function handleDelete(interaction, options, client) {
            const name = options.get('name').value;
            if(!await checkCreated(name, interaction.guild.id)) {
                return err(interaction, 'this embed does not exist')
            }
            else {
                deleteEmbed(name, interaction.guild.id)
                return interaction.editReply({ content : `Deleted the embed \`${name}\`.`})
            }
        }
        async function handleRaw(interaction, options, client) {
            let channel = null
            const link = options.get('link')?.value.split('/').slice(-2)
            let msg = null
            const name = options.get('name')?.value

            
            if(!name && !link ) {
                return err(interaction, 'Please select an option')
            }
            else if(link && link.length == 2) {
                try {
                    channel = link.shift()
                    msg = link.shift()
                    const yes = await client.channels.cache.get(channel).messages.fetch(msg) 
                    const result = JSON.stringify(yes.embeds)

                    if(result.length > 1){
                        let source = await create([
                            {
                                name : `${interaction.user.username} embed`,
                                content : result,
                                language : "javascript",
                            },
                        ])
                        return interaction.editReply({ content : `${source.url}` })
                    }
                    else {
                        return interaction.editReply({ content : "```js\n" + result + "```" })
                    }
                }
                catch(e) {
                    console.log(e)
                    return interaction.editReply({ content : e.message })
                }
            }
            else if(name) {
                if(!await checkCreated(name, interaction.guild.id)) {
                    return interaction.editReply({ content : 'Invalid embed name !' })
                }
                else {
                    const guildId = interaction.guild.id
                    const data = await db.findOne({ name, guildId })
                    let source = await create([
                        {
                            name : `${interaction.user.username} embed`,
                            content : data.embed,
                            language : "javascript",
                        },
                    ])
                    return interaction.editReply({ content : `${source.url}` })
                }
            }
            else {
                return interaction.editReply({ content : 'An error occured' })
            }
        }
        async function handleList(interaction, options, client) {
            const data = await db.find({ guildId : interaction.guild.id })
            const name = options.get('name')?.value
            let page = 0

            if(!data.length) {
                return err(interaction, '0')
            }
            else {
                const embed = []
                data.map((a,x)=> {
                    if(name && name == a.name) page = x
                    const b = new MessageEmbed().setTitle(`${interaction.guild.name}'s embed`)
                    b.addField('Name', a.name);
                    b.addField('Channel', a.channel.length ? `${a.channel.map(c => `<#${c}>`)}` : 'none');
                    b.addField('Roles', a.role.length ? `${a.role.map(c => `<@&${c}>`)}` : 'none');
                    b.addField('Error Message', a.errMessage ? `${a.errMessage}` : 'none');
                    b.addField('Raw Embed', a.embed.length > 1000 ? `\`\`\`js\n${a.embed.slice(0,1000)}\`\`\`` : `\`\`\`js\n${a.embed}\`\`\``);
                    embed.push(b)
                })
                return genEm(embed, (page + 1), false)
            }
        }
        async function handleCreate(interaction, options, client) {
            try {
                let embed = options.get('embed').value;
                const name = options.get('name').value;
                const channel = options.get('channel')?.value;
                const roles = options.get('roles')?.value;
                const errMsg = options.get('error-message')?.value;

                if(embed.startsWith('https://sourceb.in/')) {
                    const file = await get(embed)
                    embed = file.files[0].content
                }
                const abc = JSON.parse(embed)

                if(await checkCreated(name, interaction.guild.id)) {
                    return err(interaction, 'this embed already exist')
                }
                else {
                    if(channel && !checkChannel(interaction.guild.channels.cache, channel)) {
                        return err(interaction, 'contain invalid channel id')
                    }
                    else if(roles && !checkRole(interaction.guild.roles.cache, roles)) {
                        return err(interaction, 'contain invalid role id')
                    }
                    else {
                        await interaction.editReply({ content : 'Saved !' })
                        await interaction.followUp({ ephemeral : true, embeds : abc })
                        await createEmbed(name, interaction.guild.id, embed, channel, roles, errMsg) 
                    }
                    
                }
                
            }
            catch(e) {
                interaction.editReply({ content : e.message })
                console.log(e)
            }
            
        }
        async function handleEdit(interaction, options, client) {
            try {
                let embed = options.get('embed')?.value;
                const name = options.get('name').value;
                const channel = options.get('channel')?.value;
                const roles = options.get('roles')?.value;
                const errMsg = options.get('error-message')?.value;
                const newName = options.get('new-name')?.value;

                if(!embed && !channel && !roles && !errMsg && !newName) {
                    return err(interaction, 'please select an option')
                }
                if(!await checkCreated(name, interaction.guild.id)) {
                    return err(interaction, 'this embed does not exist')
                }

                if(embed) {
                    if(embed.startsWith('https://sourceb.in/')) {
                        const file = await get(embed)
                        embed = file.files[0].content
                    }
                    JSON.parse(embed)
                }
                await editEmbed(name, interaction.guild.id, embed, channel, roles, errMsg , newName)
                return interaction.editReply({ content : 'edited !' })

            }
            catch(e) {
                interaction.editReply({ content : e.message })
                console.log(e)
            }
            
            
        }
        function checkChannel(guildChannel, channelIds) {
            const channels = channelIds.split(/ +/g).filter(id => !guildChannel.has(id))
            if(channels.length) return false
            return true
        }
        function checkRole(guildRole, roleIds) {
            const roles = roleIds.split(/ +/g).filter(id => !guildRole.has(id))
            if(roles.length) return false
            return true
        }
        async function checkCreated(name, guildId) {
            const data = await db.findOne({ name, guildId })
            if(data) return true
            return false
        }
        async function createEmbed(name, guildId, embed, channel = [], role = [], errMessage = null) {
            channel.length ? channel = channel.split(/ +/g) : null
            role.length ? role = role.split(/ +/g) : null
            const data = new db({ name : name.toLowerCase() , guildId, embed, channel, role, errMessage })
            await data.save()
            await client.embedCommand.set((`${name}_${guildId}`), { guildId, embed, channel, role, errMessage })
            return data
        }
        async function editEmbed(name, guildId, embed, channel = [], role = [], errMessage = null, newName) {
            const data = await db.findOne({ name, guildId })
            channel == 'null' ? data.channel = [] : null;
            role == 'null' ? data.role = [] : null;
            errMessage == 'null' ? data.errMessage = null : null;
            channel.length ? channel = channel.split(/ +/g).filter(a => Number(a)) : null
            role.length ? role = role.split(/ +/g).filter(a => Number(a)) : null
            
            if(newName) {
                data.name = newName
            }
            if(embed) {
                data.embed = embed
            }
            if(channel.length) {
                data.channel = channel
            }
            if(role.length) {
                data.role = role
            }
            if(errMessage && errMessage != 'null') {
                data.errMessage = errMessage
            }
            await data.save()
            await client.embedCommand.delete(`${name}_${guildId}`)
            await client.embedCommand.set((`${data.name}_${data.guildId}`), { guildId: data.guildId, embed: data.embed, channel: data.channel, role: data.role, errMessage: data.errMessage })
            return data;
        }
        async function deleteEmbed(name, guildId) {
            const data = await db.findOne({ name, guildId })
            await client.embedCommand.delete(`${name}_${guildId}`)
            data.delete()
        }
        async function err(interaction, msg) {
            await interaction.deleteReply()
            await interaction.followUp({ ephemeral : true, content : msg })
        }
        function genEm(list, page = 0, replied = true) {
            const embed = new ButtonEmbeds({
                pages: list,
                timeout: 60000,
                disableAtEnd: true,
                userID: interaction.user.id,
                currentPage : (page) > list.length || page <= 0  ? 0 : (page - 1),
            });
            return embed.reply(interaction, false, replied);
        }
    },
};
