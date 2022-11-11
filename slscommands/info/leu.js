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
    name: "leu",
    description: "leu portal",
    options: [
        {
            name: 'create',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Create a channel',
            options : [
                {
                  name: 'category',
                  description: 'select the correct category',
                  type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                  required: true,
                },
                {
                  name: 'name',
                  description: 'Name of the channel',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: true,
                },
                {
                  name: 'user',
                  description: 'User who will be able to access the channel',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: true,
                },
            ]
        },
        {
            name: 'edit',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Create a channel',
            options : [
                {
                  name: 'channel',
                  description: 'select the channel to edit',
                  type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                  required: true,
                },
                {
                  name: 'category',
                  description: 'select the correct category',
                  type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                  required: false,
                },
                {
                  name: 'name',
                  description: 'Name of the channel',
                  type: Constants.ApplicationCommandOptionTypes.STRING,
                  required: false,
                },
                {
                  name: 'user',
                  description: 'User who will be able to access the channel',
                  type: Constants.ApplicationCommandOptionTypes.USER,
                  required: false,
                },
            ]
        },
        {
            name: 'members',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Set members for a channel',
            options : [
                {
                  name: 'channel',
                  description: 'select a channel',
                  type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                  required: true,
                },
                {
                  name: 'membercount',
                  description: 'their server membercount',
                  type: Constants.ApplicationCommandOptionTypes.NUMBER,
                  required: true,
                }
            ]
        },
        {
            name: 'arrange',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '.',
            options : [
                {
                  name: 'category',
                  description: 'select a category',
                  type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                  required: true,
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
    disabled : false,
    run: async (client, interaction, options) => {
        await interaction.deferReply();
        switch(options.getSubcommand()) {
            case 'create' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, ['928351606716645376']))return;
                handleCreate(interaction, options, client)
                break;
            case 'edit' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, ['928351606716645376']))return;
                handleEdit(interaction, options, client)
                break;
            case 'members' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, ['928351606716645376']))return;
                handleMembers(interaction, options, client)
                break;
            case 'arrange' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleArrange(interaction, options, client)
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
        async function handleCreate(interaction, options, client) {
            const category = options.get('category').channel;
            const name = options.get('name').value;
            const user = options.get('user').user;

            // need to add something here later
            if(category.type != 'GUILD_CATEGORY' || !category.name.includes('(')) {
                await interaction.deleteReply();
                return interaction.followUp({ ephemeral : true, content : 'Please mention a valid category !' })
            }
            else {
                const created = await interaction.guild.channels.create(name, {
                    parent : category.id
                })
                await created.permissionOverwrites.edit(user, {
                    SEND_MESSAGES: true, VIEW_CHANNEL : true
                })

                return interaction.editReply({ content : `${created} has been created !` })
            }
        }
        async function handleEdit(interaction, options, client) {
            const channel = options.get('channel').channel;
            const category = options.get('category')?.channel;
            const name = options.get('name')?.value;
            const user = options.get('user')?.user;

            // need to add something here later
            if(channel.type != 'GUILD_TEXT') {
                await interaction.deleteReply();
                return interaction.followUp({ ephemeral : true, content : 'Please mention a valid channel to edit !' })
            }
            else if(!category && !name && !user) {
                await interaction.deleteReply();
                return interaction.followUp({ ephemeral : true, content : 'Please select an option to edit !' })
            }
            else {
                const list = []
                if(name) {
                    await channel.setName(name)
                    list.push(`${channel} name has been edited to ${name}`)
                }
                if(category) {
                    if(category.type != 'GUILD_CATEGORY' || !category.name.includes('(')) {
                        await interaction.deleteReply();
                        return interaction.followUp({ ephemeral : true, content : 'Please mention a valid category !' })
                    }
                    await channel.setParent(category.id)
                    list.push(`${channel} category has been moved to ${category}`)
                }
                if(user) {
                    await channel.permissionOverwrites.cache.filter(a => a.type == 'member').map(a => a.delete())
                    await channel.permissionOverwrites.edit(user, {
                        SEND_MESSAGES: true, VIEW_CHANNEL : true
                    })
                    list.push(`${channel} added ${user}`)
                }

                return interaction.editReply({ content : list.join('\n') })
            }
        }
        async function handleMembers(interaction, options, client) {
            const channel = options.get('channel').channel;
            const number = options.get('membercount').value;
            if(channel.type == 'GUILD_CATEGORY' ) {
                await interaction.deleteReply();
                return interaction.followUp({ ephemeral : true, content : 'Please mention a valid channel to edit !' })
            }
            await channel.setTopic(number)
            return interaction.editReply({ content : 'done...' })
        }
        async function handleArrange(interaction, options, client) {
            const category = options.get('category').channel;
            if(category.type != 'GUILD_CATEGORY' || !category.name.includes('(')) {
                await interaction.deleteReply();
                return interaction.followUp({ ephemeral : true, content : 'Please mention a valid category !' })
            }
            const chan = await interaction.guild.channels.cache.filter(a => a.parentId == category.id).sort((a, b) => (Number(a.topic) < Number(b.topic)) ? 1 : -1).toJSON()
            
            const list = chan.map(a => `${a} -> ${a.topic}`)

            const button = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('YES').setLabel('Yes').setStyle('SUCCESS'),
                new MessageButton().setCustomId('NO').setLabel('No').setStyle('DANGER'),
            )
            const msg = await interaction.editReply({ content : `${list.join('\n')} \n\n**ARE YOU SURE YOU WOULD LIKE TO ARRANGE THIS CATEGORY ?**`, components : [button] })
            const result = await confirm(msg, {author : interaction.user.id})
            await interaction.editReply({ content : list.join('\n'), components : [] })
            const timeLeft = (chan.length * 3000)
            function abc() {
                const length = interaction.guild.channels.cache.filter(a => a.parentId == category.id).size
                return `${interaction.guild.channels.cache.get(category.id).name.split('(')[0]} (${length})`
            }
            if(result) {
                const list = []
                await Promise.all(chan.map(async (a, x) => {
                    await sleep(3000 * x)
                    await interaction.guild.channels.cache.get(a.id).setPosition((chan.length - 1))
                    list.push(`moving channel -> ${interaction.guild.channels.cache.get(a.id)}`)
                    await msg.edit({ content : `${list.join('\n')} \nTime Left : *${pretty(timeLeft - (3000 * x))}* (*${chan.length - (x + 1)} channel left*)`,  })
                }))
                await category.setName(abc())
                return msg.edit({ content : 'Done !' })
            }
            else {
                return msg.edit({ content : 'cancelled...' })
            }
        }
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
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
        
    },
};
