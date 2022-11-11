const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require("discord.js");
const config = require('../../settings/tradeConfig')
const apps = require('../../db/apps')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const applicationsName = ['Trial Mod', 'Gaw Manager', 'Auctioneer', 'Karuta Staff', 'Trades Grinders', 'Trades Traders', 'Stage Mod' ]
const abcEmbed = require('../../utils/abc')
const idkWhatIsThis = require('../../settings/config').status
module.exports = {
    name: "app",
    description: "applications",
    options: [
        {
          name: 'list',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'List of all applications',
        },
        {
            name: 'view',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'View an apps.',
            options: [
              {
                name: 'name',
                description: 'Name of the app.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: false,
              },
              {
                name: 'page',
                description: 'Page number of the apps.',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: false,
              },
              {
                name: 'user-id',
                description: 'Provide a user id.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: false,
              },
              {
                name: 'app-id',
                description: 'Id of the app.',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: false,
              },
              {
                name: 'status',
                description: 'Status of the app.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: false,
                choices : [
                    {
                        name : 'pending',
                        value : 'pending',
                    },
                    {
                        name : 'accepted',
                        value : 'accepted',
                    },
                    {
                        name : 'denied',
                        value : 'denied',
                    }
                ]
              },
            ],
        },
        {
          name: 'accept',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Accept an application.',
          options: [
            {
                name: 'app-id',
                description: 'Id of the app.',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: true,
            },
            {
                name: 'comment',
                description: 'Reason of accepting this apps.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: false,
            }
          ],
        },
        {
            name: 'deny',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Deny an application.',
            options: [
                {
                    name: 'app-id',
                    description: 'Id of the app.',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: true,
                },
                {
                    name: 'comment',
                    description: 'Reason of denying this apps.',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false,
                }
              ],
        },
        {
            name: 'delete',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Delete an application from a user.',
            options: [
                {
                    name: 'app-id',
                    description: 'Id of the app.',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: true,
                }
              ],
        },
        {
            name: 'list-ids',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'List down user ids.',
            options: [
                {
                    name: 'name',
                    description: 'Name of the app.',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                },
                {
                    name: 'status',
                    description: 'Status of the app.',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    choices : [
                        {
                            name : 'pending',
                            value : 'pending',
                        },
                        {
                            name : 'accepted',
                            value : 'accepted',
                        },
                        {
                            name : 'denied',
                            value : 'denied',
                        }
                    ]
                }
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
            case 'list' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleList(interaction, options, client)
                break;
            case 'view' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleView(interaction, options, client)
                break;
            case 'accept' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleAccept(interaction, options, client)
                break;
            case 'deny' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleDeny(interaction, options, client)
                break;
            case 'delete' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleDelete(interaction, options, client)
                break;
            case 'list-ids' :
                if(!handlePerms(interaction.memberPermissions, interaction.member._roles, []))return;
                handleIDS(interaction, options, client)
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
        async function handleIDS(interaction, options, client) {
            let name = options.get('name').value
            const status = options.get('status').value
            await interaction.deferReply({ }) 
            const close = similar.findBestMatch(name, applicationsName).bestMatch
            close.rating > 0.10 ? name = close.target : null
            
            const foundApp = await apps.find({ status, appName : name })
            if(!foundApp.length) {
                return interaction.editReply({ content : 'Invalid apps name or no one with this status' })
            }
            else {
                const a =  Util.splitMessage(`${interaction.user} \n${foundApp.map(a => a.userId).join(' ')}`, { char : ' '})
                a.map(a => {
                    interaction.channel.send({ content : `${a}`  })
                })
                return interaction.deleteReply()

                
            }
        }
        async function handleView(interaction, options, client) {
            
            const appId = options.get('app-id')?.value;
            let name = options.get('name')?.value
            const page = options.get('page')?.value
            const userId = options.get('user-id')?.value
            const stats = options.get('status')?.value
            await interaction.deferReply({ }) 

            function simpleEm(title, id, db, guildMembers) {
                const timestamp = guildMembers.get(id)?.joinedTimestamp || '163906098069600000'
                const embed = new MessageEmbed().setTitle(`${title} (\`ID: ${db.appId}\`)`)
                .setColor(ee.embed_color)
                .setDescription(
                    [
                        '**User :**',
                        `<@${id}>:${guildMembers.get(id)?.user.tag || ''} - (\`${id}\`)\n`,
                        '**Joined at :**', 
                        `<t:${Math.floor(timestamp/1000)}:F> (<t:${Math.floor(timestamp/1000)}:R>)\n`,
                        '**Status :**', 
                        `${db.status}`,
                        '||Questions and answers starting below this line||'
                    ].join('\n')
                )
                if(db.appsInfo.length) {
                    db.appsInfo.map(x => {
                        embed.addField(`${x.q}`, `${x.a}`)
                    })
                    
                }

                if(db.comments.length) {
                    embed.addField('Comments :', `${db.comments.map(a => `${a.content} ~<@${a.id}>:${guildMembers.get(a.id)?.user.tag || ''} (\`${a.id}\`)`)}`)
                }

                return embed
            }
            const pages = new Collection()
            
            await Promise.all(applicationsName.map(async name => {
                const data = await apps.find({ appName : name })
                const embed = []
                data.map(a => {
                    embed.push([simpleEm(a.appName, a.userId, a, interaction.guild.members.cache)])
                })
                pages.set(name , { embeds : embed, name })
            }))

            if(!appId && !name && !page && !userId && !stats) {
                return interaction.followUp({
                    embeds : [errEm({desc : 'You must select at least one option !'})]
                })
            }
            else if(appId) {
                const foundApp = await apps.findOne({ appId })
                if(!foundApp) {
                    return interaction.editReply({ embeds : [errEm({desc : 'Invalid app id.'})] })
                 }
                 else {
                    const starts = pages.get(foundApp.appName)
                    const currentPage = pages.get(foundApp.appName).embeds.map((a,x) => {
                        if(a[0]?.title.includes(foundApp.appId)) {
                            return x
                        }
                    }).filter(a => a != undefined)[0]

                    const setting = { user : interaction.user.id, pages, starts, currentPage }
                    const embed = new abcEmbed(setting)
                    return embed.send(interaction.channel)
                 }
            }
            else if(name) {
                const close = similar.findBestMatch(name, applicationsName).bestMatch
                close.rating > 0.10 ? name = close.target : null
                const foundApp = await apps.find({ appName : name })
                if(!foundApp.length) {
                    return interaction.editReply({ embeds : [errEm({desc : 'Invalid application name or no one has applied for this position yet.'})] })
                }
                else {
                    const starts = pages.get(name)
                    const currentPage = (page) > starts.embeds.length || page <= 0  ? 0 : (page - 1)
                    const setting = { user : interaction.user.id, pages, starts, currentPage }
                    const embed = new abcEmbed(setting)
                    return embed.send(interaction.channel)
                }
            }
            else if(userId) {
                const foundApp = await apps.find({ userId })
                if(!foundApp.length) {
                    return interaction.editReply({ embeds : [errEm({desc : '0 apps from this user'})] })
                }
                else {
                    const embed = []
                    foundApp.map(a => {
                        embed.push(simpleEm(a.appName, a.userId, a, interaction.guild.members.cache))
                    })
                    return genEm(embed, page, false)
                }
            }
            else if(stats) {
                const foundApp = await apps.find({ status : stats })
                if(!foundApp.length) {
                    return interaction.editReply({ embeds : [errEm({desc : '0 apps with this status.'})] })
                 }
                 else {
                    const pages = new Collection()
            
                    await Promise.all(applicationsName.map(async name => {
                        const data = await apps.find({ appName : name, status : stats })
                        const embed = []
                        data.map(a => {
                            embed.push([simpleEm(a.appName, a.userId, a, interaction.guild.members.cache)])
                        })
                        pages.set(name , { embeds : embed, name })
                    }))

                    const starts = pages.first()

                    const setting = { user : interaction.user.id, pages, starts }
                    const embed = new abcEmbed(setting)
                    return embed.send(interaction.channel)
                 }
            }
            else if(page && !name) {
                return interaction.editReply({
                    embeds : [errEm({desc : 'Be sure to input the apps name when selecting a page !'})]
                })
            }


        }
        async function handleList(interaction, options, client) {
            await interaction.deferReply({ })
            const embed = new MessageEmbed().setTitle('Application Status').setColor(ee.embed_color)
            await Promise.all(applicationsName.map(async name => {
                const data = await apps.find({ appName : name })
                embed.addField(`${name}`, `Number of users applied : ${data.length}`)
            }))
            interaction.editReply({ embeds : [embed] })
        }
        // async function handleView(interaction, options, client) {
            
        //     const appId = options.get('app-id')?.value;
        //     let name = options.get('name')?.value
        //     const page = options.get('page')?.value
        //     const userId = options.get('user-id')?.value

        //     function simpleEm(title, id, db, guildMembers) {
        //         const timestamp = guildMembers.get(id)?.joinedTimestamp || '163906098069600000'
        //         const embed = new MessageEmbed().setTitle(`${title} (\`ID: ${db.appId}\`)`)
        //         .setColor(ee.embed_color)
        //         .setDescription(
        //             [
        //                 '**User :**',
        //                 `<@${id}>:${guildMembers.get(id)?.user.tag || ''} - (\`${id}\`)\n`,
        //                 '**Joined at :**', 
        //                 `<t:${Math.floor(timestamp/1000)}:F> (<t:${Math.floor(timestamp/1000)}:R>)\n`,
        //                 '**Status :**', 
        //                 `${db.status}`,
        //                 '||Questions and answers starting below this line||'
        //             ].join('\n')
        //         )
        //         if(db.appsInfo.length) {
        //             db.appsInfo.map(x => {
        //                 embed.addField(`${x.q}`, `${x.a}`)
        //             })
                    
        //         }

        //         if(db.comments.length) {
        //             embed.addField('Comments :', `${db.comments.map(a => `${a.content} ~<@${a.id}>:${guildMembers.get(a.id)?.user.tag || ''} (\`${a.id}\`)`)}`)
        //         }

        //         return embed
        //     }

        //     const pages = new Collection()
        //     const setting = { user : interaction.author.id, pages, starts }

        //     if(!appId && !name && !page && !userId) {
        //         await interaction.deferReply({ ephemeral : true }) 
        //         return interaction.editReply({
        //             embeds : [errEm({desc : 'You must select at least one option !'})]
        //         })
        //     }
        //     else if(appId) {
        //         const foundApp = await apps.findOne({ appId })
        //         if(!foundApp) {
        //             await interaction.deferReply({ ephemeral : true }) 
        //             return interaction.editReply({ embeds : [errEm({desc : 'Invalid app id.'})] })
        //         }
        //         else {
        //             const embed = [ simpleEm(foundApp.appName, foundApp.userId, foundApp, interaction.guild.members.cache) ]
        //             return genEm(embed)
        //         }
        //     }
        //     else if(userId) {
        //         const foundApp = await apps.find({ userId })
        //         if(!foundApp.length) {
        //             await interaction.deferReply({ ephemeral : true }) 
        //             return interaction.editReply({ embeds : [errEm({desc : '0 apps from this user'})] })
        //         }
        //         else {
        //             const embed = []
        //             foundApp.map(a => {
        //                 embed.push(simpleEm(a.appName, a.userId, a, interaction.guild.members.cache))
        //             })
        //             return genEm(embed, page)
        //         }
        //     }
        //     else if(name) {
        //         const close = similar.findBestMatch(name, applicationsName).bestMatch
        //         close.rating > 0.35 ? name = close.target : null
        //         const foundApp = await apps.find({ appName : name })
        //         if(!foundApp.length) {
        //             await interaction.deferReply({ ephemeral : true }) 
        //             return interaction.editReply({ embeds : [errEm({desc : 'Invalid application name or no one has applied for this position yet.'})] })
        //         }
        //         else {
        //             const embed = []
        //             foundApp.map(a => {
        //                 embed.push(simpleEm(a.appName, a.userId, a, interaction.guild.members.cache))
        //             })
        //             return genEm(embed, page)
        //         }
        //     }
        //     else if(page && !name) {
        //         await interaction.deferReply({ ephemeral : true }) 
        //         return interaction.editReply({
        //             embeds : [errEm({desc : 'Be sure to input the apps name when selecting a page !'})]
        //         })
        //     }


        // }
        async function handleAccept(interaction, options, client) {
            await interaction.deferReply({ }) 
            const appId = options.get('app-id').value;
            const appComment = options.get('comment')?.value

            const foundApp = await apps.findOne({ appId })
            if(!foundApp) {
                return interaction.editReply({ embeds : [errEm({desc : 'Invalid app id.'})] })
            }
            else if(appComment?.length > 200) {
                return interaction.editReply({ embeds : [errEm({desc : 'Comments should not be longer than 200 characters.'})] })
            }
            else {
                foundApp.status = 'accepted'
                const embed = new MessageEmbed().setTitle(`${foundApp.appName} apps`).setColor(ee.embed_color)
                .addField('User :', `<@${foundApp.userId}> - (\`${foundApp.userId}\`)`)
                .addField('Status :', 'accepted')

                if(appComment) {
                    const exist = foundApp.comments.length ? foundApp.comments.find(a => a.id == interaction.user.id) : null
                    if(exist) {
                        foundApp.comments.pull(exist)
                        foundApp.comments.push({ id : interaction.user.id, content : appComment })
                    }
                    else {
                        foundApp.comments.push({ id : interaction.user.id, content : appComment })
                    }
                    embed.addField('Comments :', `${appComment} ~${interaction.user.tag}-(\`${interaction.user.id}\`)`)
                }
                await foundApp.save()
                return interaction.editReply({  
                    content : `${foundApp.userId}`,
                    embeds : [embed]
                })
            }
        }
        async function handleDeny(interaction, options, client) {
            await interaction.deferReply({ }) 
            const appId = options.get('app-id').value;
            const appComment = options.get('comment')?.value

            const foundApp = await apps.findOne({ appId })
            if(!foundApp) {
                return interaction.editReply({ embeds : [errEm({desc : 'Invalid app id.'})] })
            }
            else if(appComment?.length > 200) {
                return interaction.editReply({ embeds : [errEm({desc : 'Comments should not be longer than 200 characters.'})] })
            }
            else {
                foundApp.status = 'denied'
                const embed = new MessageEmbed().setTitle(`${foundApp.appName} apps`).setColor(ee.embed_color)
                .addField('User :', `<@${foundApp.userId}> - (\`${foundApp.userId}\`)`)
                .addField('Status :', 'denied')

                if(appComment) {
                    const exist = foundApp.comments.length ? foundApp.comments.find(a => a.id == interaction.user.id) : null
                    if(exist) {
                        foundApp.comments.pull(exist)
                        foundApp.comments.push({ id : interaction.user.id, content : appComment })
                    }
                    else {
                        foundApp.comments.push({ id : interaction.user.id, content : appComment })
                    }
                    embed.addField('Comments :', `${appComment} ~${interaction.user.tag}-(\`${interaction.user.id}\`)`)
                }
                await foundApp.save()
                return interaction.editReply({  
                    content : `${foundApp.userId}`,
                    embeds : [embed]
                })
            }
        }
        async function handleDelete(interaction, options, client) {
            await interaction.deferReply({ }) 
            const appId = options.get('app-id').value;

            const foundApp = await apps.findOne({ appId })
            const a = foundApp
            if(!foundApp) {
                return interaction.editReply({ embeds : [errEm({desc : 'Invalid app id.'})] })
            }
            else {
                await foundApp.delete()
                return interaction.editReply({
                    content : `${a.appName} application from user (\`${a.userId}\`) has been deleted`
                })
            }
        }
        //////////// functions ////////////
        function errEm(things) {
            const embed = new MessageEmbed()
            if(things.title) {
                embed.setTitle(things.title)
            }
            else {
                embed.setTitle('Error !')
            }
            if(things.desc) {
                embed.setDescription(`${things.desc}`)
            }
            embed.setColor(ee.embed_wrongcolor)
            return embed
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
