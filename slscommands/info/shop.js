const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const buySchema = require('../../db/buys')
const sellSchema = require('../../db/sells')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const ms = require('ms')
const configA = require('../../settings/config')
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "shop",
    description: "Customise your trading ads!",
    options: [
        {
          name: 'add',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Create an advertisement addition.',
          options: [
            {
              name: 'type',
              description: 'The type of trade to access.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              choices: [
                {
                  name: 'buying',
                  value: 'buying',
                },
                {
                  name: 'selling',
                  value: 'selling',
                },
              ],
              required: true,
            },
            {
              name: 'advertisement',
              description: 'The adverisement to add.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'remove',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'Remove an advertisement.',
          options: [
            {
              name: 'type',
              description: 'The type to access.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              choices: [
                {
                  name: 'buying',
                  value: 'buying',
                },
                {
                  name: 'selling',
                  value: 'selling',
                },
              ],
              required: true,
            },
            {
              name: 'line',
              type: Constants.ApplicationCommandOptionTypes.NUMBER,
              description: 'The line to delete.',
              required: true,
            },
          ],
        },
        {
          name: 'view',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'View your advertisements.',
          options: [
            {
              name: 'type',
              description: 'The type of trade to access.',
              type: Constants.ApplicationCommandOptionTypes.STRING,
              choices: [
                {
                  name: 'buying',
                  value: 'buying',
                },
                {
                  name: 'selling',
                  value: 'selling',
                },
              ],
              required: false,
            },
            {
                name: 'mention',
                description: 'Mention a user.',
                type: Constants.ApplicationCommandOptionTypes.USER,
                required: false,
              },
          ],
        },
        {
            name: 'post',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Post your advertisements.',
            options: [
              {
                name: 'type',
                description: 'The type of trade to access.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                choices: [
                  {
                    name: 'buying',
                    value: 'buying',
                  },
                  {
                    name: 'selling',
                    value: 'selling',
                  },
                ],
                required: true,
              },
            ],
        },
        {
            name: 'search',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Search for others advertisements.',
            options: [
              {
                name: 'type',
                description: 'The type of trade to access.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                choices: [
                  {
                    name: 'buying',
                    value: 'buying',
                  },
                  {
                    name: 'selling',
                    value: 'selling',
                  },
                ],
                required: true,
              },
              {
                name: 'ads',
                description: 'The trading ads you searching for.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
              },
              {
                name: 'messages',
                description: 'How many messages you would like to search through from the buying/selling channel.',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: false,
              },
              {
                name: 'accuracy',
                description: 'The accuracy of the search result. You are advise to use a number between 15-30 for a better result.',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: false,
              },
            ],
        },
        {
            name: 'reset-cooldown',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Reset a user post cooldown.',
            options: [
              {
                name: 'type',
                description: 'The type of trade to access.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                choices: [
                  {
                    name: 'buying',
                    value: 'buying',
                  },
                  {
                    name: 'selling',
                    value: 'selling',
                  },
                ],
                required: true,
              },
              {
                name: 'mention',
                description: 'Mention a user.',
                type: Constants.ApplicationCommandOptionTypes.USER,
                required: true,
              }
            ],
        },
        {
            name : 'autopost',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'Turn on and off for auto posting ads.',
            options: [
              {
                name: 'type',
                description: 'The type of trade to access.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                choices: [
                  {
                    name: 'buying',
                    value: 'buying',
                  },
                  {
                    name: 'selling',
                    value: 'selling',
                  },
                ],
                required: true,
              },
              {
                name: 'status',
                description: 'Turn it on or off',
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: true,
              },
              {
                name: 'interval',
                description: 'The interval between ads being posted. For 5 hour, enter \'5h\' ',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: false,
              }
            ],
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
        switch(options.getSubcommand()) {
            case 'add' :
                handleAdd(interaction, options, client)
                break;
            case 'remove' :
                handleDelete(interaction, options, client)
                break;
            case 'view' :
                handleView(interaction, options, client)
                break;
            case 'post' :
                handlePost(interaction, options, client)
                break;
            case 'search' :
                handleSearch(interaction, options, client)
                break;
            case 'reset-cooldown':
                handleReset(interaction, options, client)
                break;
            case 'autopost':
                handleAuto(interaction, options, client)
                break;
        }

        async function handleAuto(interaction, options, client) {
            const type = options.get('type').value
            const stat = options.get('status').value
            const interval = options.get('interval')?.value
            const user = interaction.member.user
            await interaction.deferReply({ ephemeral : true })
            if(interval) { if(!ms(interval)) { return interaction.editReply({ ephemeral : true, content : 'Invalid time!' }) }}

            let buyLine = await buySchema.findOne({ userId : user.id })
            let sellLine = await sellSchema.findOne({ userId : user.id })

            if(!buyLine) {
                buyLine = new buySchema({ userId : user.id })
                await buyLine.save()
            }
            if(!sellLine) {
                sellLine = new sellSchema({ userId : user.id })
                await sellLine.save()
            }

            function perks(role, db, interval) {
                let inter = null
                let least = null
                const perksRoles = Object.keys(config.autoPost.perks)
                role.map(id => {
                    if(perksRoles.includes(id)){
                        config.autoPost.perks[id] < inter || inter == null ? inter = config.autoPost.perks[id] : null
                    }
                })
                if(inter == null) { return { required : false } }
                else {
                    least = inter
                    if(interval) {
                        interval = ms(interval)
                        if(interval < inter) { return { required : true, over : true, least } }
                        else { inter = interval }
                    }
                    else {
                        if(db.auto.interval) {
                            if(db.auto.interval < inter) { return { required : true, over : true, least } }
                            else { inter = db.auto.interval }
                        } else { inter = inter + 1 * 60 * 60 * 1000 }
                    }
                }
                return { required : true, over : false, interval : inter, least }
            }

            if(stat == true) {
                let inter = perks(interaction.member._roles, buyLine, interval)
                if(!inter.required) return interaction.editReply({ ephemeral : true, content : 'You do not have the required role to use this command!' })
                if(inter.over) {
                    return interaction.editReply({
                        ephemeral : true,
                        content : `Your interval cannot be less than ${pretty(inter.least)}`
                    })
                }
                if(type == 'buying') {
                    if(!buyLine.shops.length) {
                        return interaction.editReply({
                            ephemeral : true,
                            content : 'You have not set up your buying shop yet'
                        })
                    }
                    else {
                        const runningAds = client.auto.get(`${interaction.user.id}_${type}`)
                        if(runningAds) return interaction.editReply({ ephemeral : true, content : `Autopost for ${type} ads are already turned on. If you have make any changes to your ads please turn it off first before turning it on again.`})
                        buyLine.auto.lastRan = Date.now()
                        buyLine.auto.status = true
                        buyLine.auto.interval = inter.interval
                        await buyLine.save()
                        client.startAuto(inter.interval, config.buyChan, buyLine, interaction.member, 'Buying shop', Date.now())
                        return interaction.editReply({
                            ephemeral : true,
                            content : `Turned on autopost for ${type} ads!`
                        })
                    }
                }
                else {
                    let inter = perks(interaction.member._roles, sellLine, interval)
                    if(!inter.required) return interaction.editReply({ ephemeral : true, content : 'You do not have the required role to use this command!' })
                    if(inter.over) {
                        return interaction.editReply({
                            ephemeral : true,
                            content : `Your interval cannot be less than ${pretty(inter.least)}`
                        })
                    }
                    if(!sellLine.shops.length) {
                        return interaction.editReply({
                            ephemeral : true,
                            content : 'You have not set up your selling shop yet'
                        })
                    }
                    else {
                        const runningAds = client.auto.get(`${interaction.user.id}_${type}`)
                        if(runningAds) return interaction.editReply({ ephemeral : true, content : `Autopost for ${type} ads are already turned on. If you have make any changes to your ads please turn it off first before turning it on again.`})
                        sellLine.auto.lastRan = Date.now()
                        sellLine.auto.status = true
                        sellLine.auto.interval = inter.interval
                        await sellLine.save()
                        client.startAuto(inter.interval, config.sellChan, sellLine, interaction.member, 'Selling shop', Date.now())
                        return interaction.editReply({
                            ephemeral : true,
                            content : 'Turned on !'
                        })
                    }
                }
            }
            else {
                const runningAds = client.auto.get(`${interaction.user.id}_${type}`)
                const runningTimer = client.timer.get(`${interaction.user.id}_${type}`)
                if(!runningAds) return interaction.editReply({ ephemeral : true, content : `Autopost for ${type} ads are not turned on.`})
                
                if(type == 'selling') {
                    sellLine.auto.status = false;
                    sellLine.auto.lastRan = Date.now()
                    await sellLine.save()
                }
                else {
                    buyLine.auto.status = false;
                    buyLine.auto.lastRan = Date.now()
                    await buyLine.save()
                }
                clearTimeout(runningTimer)
                clearInterval(runningAds)
                client.timer.delete(`${interaction.user.id}_${type}`)
                client.auto.delete(`${interaction.user.id}_${type}`)
                return interaction.editReply({
                    ephemeral : true,
                    content : `Turned off autoposting for ${type} ads`
                })

            }
        }
        async function handleReset(interaction, options, client) {
            await interaction.deferReply({ ephemeral : true })
            if(interaction.user.id != '422967413295022080') {
                return interaction.editReply({
                    ephemeral : true,
                    content : 'Only abC can use it!'
                })
            }
            const type = options.get('type').value
            const user = options.get('mention').user

            let buyLine = await buySchema.findOne({ userId : user.id })
            let sellLine = await sellSchema.findOne({ userId : user.id })
            
            if(!buyLine) {
                buyLine = new buySchema({ userId : user.id })
                await buyLine.save()
            }
            if(!sellLine) {
                sellLine = new sellSchema({ userId : user.id })
                await sellLine.save()
            }

            if(type == 'buying') {
                buyLine.lastPosted = 0
                await buyLine.save()
            }
            else {
                sellLine.lastPosted = 0
                await sellLine.save()
            }

            return interaction.editReply({
                ephemeral : true,
                content : `Cooldown for ${user} - (\`${user.id}\`) has been reset.`
            })
        }
        async function handleSearch(interaction, options, client) {
            // 24  * 60 * 60 * 1000;
            const newAds = 24  * 60 * 60 * 1000;
            const type = options.get('type').value
            const targetString = options.get('ads').value
            const searchMessages = options.get('messages')?.value || 1000
            let searchAccuracy = options.get('accuracy')?.value || 15
            let targetAds = [];
            let channelAds = []
            await interaction.deferReply({ ephemeral : true })
            if(searchMessages < 1 || searchMessages > 5000) {
                return interaction.editReply({ content : 'Messages can only be a number between 1 - 5000' })
            }
            if(searchAccuracy < 1 || searchAccuracy > 100) {
                return interaction.editReply({ content : 'Accuracy can only be a number between 1 - 100' })
            }
            searchAccuracy = searchAccuracy / 100
            const guild = client.guilds.cache.get(configA.guild)?.members.cache
            if(type == 'buying') {
                const buyAds = await buySchema.find({ lastPosted : { $gt: Date.now() - newAds } }).sort({ lastPosted : -1 })
                if(buyAds.length) {
                    buyAds.filter(a => {
                        if(a.shops.length) {
                            const found = similar.findBestMatch(targetString, a.shops).bestMatch
                            if(found.rating > searchAccuracy) {
                                const tag = guild.get(a.userId)?.user.tag || null
                                targetAds.push({ item : found.target, user : a.userId, tag, time : a.lastPosted })
                            }
                        }
                        
                    })
                }
                await interaction.editReply({ content : 'This might take a while to search...' })
                const abc = await client.fetchMore(client.channels.cache.get(config.buyChan), searchMessages)
                await interaction.editReply({ content : '\u200B' })
                abc.map(a => {
                    if(a.content) {
                        const rating = similar.compareTwoStrings(a.content, targetString)
                        if(rating > searchAccuracy) {
                            channelAds.push({ item : a.content, link : getLink(a), user : a.author.id, tag : a.author.tag, time : a.createdTimestamp })
                        }
                    }
                })
            }
            else {
                const sellAds = await sellSchema.find({ lastPosted : { $gt: Date.now() - newAds } }).sort({ lastPosted : -1 })
                if(!sellAds.length) {
                    sellAds.filter(a => {
                        if(a.shops.length) {
                            const found = similar.findBestMatch(targetString, a.shops).bestMatch
                            if(found.rating > searchAccuracy) {
                                const tag = guild.get(a.userId)?.user.tag || null
                                targetAds.push({ item : found.target, user : a.userId, tag, time : a.lastPosted })
                            }
                        }
                        
                    })
                }
                await interaction.editReply({ content : 'This might take a while to search...' })
                const abc = await client.fetchMore(client.channels.cache.get(config.sellChan), searchMessages)
                await interaction.editReply({ content : '\u200B' })
                abc.map(a => {
                    if(a.content) {
                        const rating = similar.compareTwoStrings(a.content, targetString)
                        if(rating > searchAccuracy) {
                            channelAds.push({ item : a.content, link : getLink(a), user : a.author.id, tag : a.author.tag, time : a.createdTimestamp })
                        }
                    }
                })
                
            }
            if(!targetAds.length && !channelAds.length) {
                await interaction.editReply({
                    ephemeral : true,
                    content : `Found ${targetAds.length} matches`
                })
                return
            }

            const embeds = []

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
                const list1 = [];
                const loop = Math.ceil(list.length / perPage);
                for(let i = 0 ; i < loop ; i++) {
                    const list2 = [];
                    for(let y = 0 ; y < perPage ; y++) {
                        const tempNum = list.shift();
                        list2.push(tempNum);
                    }
                    list1.push(list2);
                }
                return list1;
            }
            function getLink(a) {
                return `https://discordapp.com/channels/${a.guildId}/${a.channelId}/${a.id}`
            }

            //title : `Found ${targetAds.length} matches`
            let list1 = []
            targetAds.map((a, x)=> list1.push(`\`${x + 1}\`. Ads : ${a.item} \n> User : <@${a.user}>${a.tag ? `:${a.tag}` : ''} - (\`${a.user}\`) \n> Posted at : <t:${Math.floor(a.time/1000)}:F> (<t:${Math.floor(a.time/1000)}:R>)\n`))
            const list2 = niceList(list1, 5);
            const list3 = [];
			list2.map(a => {
				list3.push({ description : a.join('\n'), color : ee.embed_color, title : `Found ${targetAds.length} matches from user's shops (type \`/shop view mention : @user\` to view a user shop)`, footer : 'type `/shop view mention : @user` to view a user shop' });
            });
            const list4 = genEmbed(list3.length, list3.length, list3)
            let list5 =[]
            channelAds.map((a, x)=> list5.push(`\`${x + 1}\`. Ads : ${a.item} \n> User : <@${a.user}>:${a.tag} - (\`${a.user}\`) [**Jump To Message**](${a.link}) \n> Posted at : <t:${Math.floor(a.time/1000)}:F> (<t:${Math.floor(a.time/1000)}:R>)\n`))
            const list6 = niceList(list5, 5);
            const list7 = []
            list6.map(a => {
				list7.push({ description : a.join('\n'), color : ee.embed_color, title : `Found ${channelAds.length} matches from ${type} channel (Click on the link to view ads)` });
            });
            const list8 = genEmbed(list7.length, list7.length, list7)
            const list9 = [...list4, ...list8]

            const embed = new ButtonEmbeds({
                pages: list9,
                timeout: 60000,
                disableAtEnd: true,
                userID: interaction.user.id,
            });
            // await interaction.deleteReply();
            return embed.reply(interaction, true, false);

        }
        async function handlePost(interaction, options, client) {
            const user = interaction.user.id;
            const type = options.get('type').value
            
            let buyLine = await buySchema.findOne({ userId : user })
            let sellLine = await sellSchema.findOne({ userId : user })

            if(!buyLine) {
                buyLine = new buySchema({ userId : user })
                await buyLine.save()
            }
            if(!sellLine) {
                sellLine = new sellSchema({ userId : user })
                await sellLine.save()
            }
            function addAbc(msg) {
                client.post.set(msg, interaction.user.id)
            }
            const embed = new MessageEmbed().setColor(ee.embed_color).setTitle(`${interaction.user.tag}'s Trading Shop`).setThumbnail(interaction.user.avatarURL({ dynamic : true }))
            .setDescription(`Contact ${interaction.user} - (\`${interaction.user.id}\`), if you are interested in trading with them`)

            if(type == 'buying') {
                if(!buyLine.shops.length) {
                    await interaction.deferReply({ ephemeral : true })
                    return interaction.editReply({ ephemeral : true, content : `you have not set up your ${type} shop yet!`})
                }
                else {
                    await interaction.deferReply({ ephemeral : false })
                    embed.addField(
                        'Buying Shop',
                        `${buyLine.shops.map((a,x) => (`\`${x+1}.\` ${a}`)).join(' \n')}`
                        )
                    await interaction.deleteReply()
                    const msg = await interaction.channel.send({
                        components : createMenu(type, interaction, client),
                        embeds : [embed]
                    })
                    addAbc(msg.id)
                    setTimeout(() => {
                        !msg.deleted ? msg.edit({
                            components : createMenu(type, interaction, client, true),
                            embeds : [embed]
                        }) : null
                    }, 60 * 1000);
                    return
                    const channel = client.channels.cache.get(config.buyChan);
                    return channel.send({
                        content : `${interaction.user}`,
                        embeds : [embed],
                    })
                }
            }
            else {
                if(!sellLine.shops.length) {
                    await interaction.deferReply({ ephemeral : true })
                    return interaction.editReply({ ephemeral : true, content : `you have not set up your ${type} shop yet!`})
                }
                else {
                    await interaction.deferReply({ ephemeral : false })
                    embed.addField(
                        'Selling Shop',
                        `${sellLine.shops.map((a,x) => (`\`${x+1}.\` ${a}`)).join(' \n')}`
                        )
                    await interaction.deleteReply()
                    const msg = await interaction.channel.send({
                        components : createMenu(type, interaction, client),
                        embeds : [embed]
                    })
                    addAbc(msg.id)
                    setTimeout(() => {
                        !msg.deleted ? msg.edit({
                            components : createMenu(type, interaction, client, true),
                            embeds : [embed]
                        }) : null
                    }, 60 * 1000);
                    return
                    const channel = client.channels.cache.get(config.sellChan);
                    return channel.send({
                        content : `${interaction.user}`,
                        embeds : [embed],
                    })
                }
            }

        }
        async function handleDelete(interaction, options, client) {
            const user = interaction.user.id;
            const type = options.get('type').value
            const line = options.get('line').value
            await interaction.deferReply({ ephemeral : true })
            let buyLine = await buySchema.findOne({ userId : user })
            let sellLine = await sellSchema.findOne({ userId : user })

            if(!buyLine) {
                buyLine = new buySchema({ userId : user })
                await buyLine.save()
            }
            if(!sellLine) {
                sellLine = new sellSchema({ userId : user })
                await sellLine.save()
            }

            if(type == 'buying') {
                if(buyLine.shops.length < line || line <= 0) {
                    return interaction.editReply({ ephemeral : true, content : `Your buying shop only have ${buyLine.shops.length} lines` })
                }
                else {
                    const removed = buyLine.shops[line - 1]
                    buyLine.shops.pull(buyLine.shops[line - 1])
                    await buyLine.save()
                    return interaction.editReply({
                        ephemeral : true,
                        content : `Removed "${removed}" from ${type} ads`
                    })
                }
            }
            else {
                if(sellLine.shops.length < line || line <= 0) {
                    return interaction.editReply({ ephemeral : true, content : `Your selling shop only have ${sellLine.shops.length} lines` })
                }
                else {
                    const removed = sellLine.shops[line - 1]
                    sellLine.shops.pull(sellLine.shops[line - 1])
                    await sellLine.save()
                    return interaction.editReply({
                        ephemeral : true,
                        content : `Removed "${removed}" from ${type} ads`
                    })
                }
            }

        }
        async function handleAdd(interaction, options, client) {
            const user = interaction.user.id;
            const type = options.get('type').value
            const ads =  options.get('advertisement').value
            await interaction.deferReply({ ephemeral : true })
            if(ads.length > 50) {
                return interaction.editReply({ ephemeral : true, content : 'Each line of ads cannot be longer than 50 characters!' })
            }
            if(config.blacklistWord.filter(a => ads.includes(a)).length) {
                return await interaction.editReply({ ephemeral : true, content : 'Your ads included a blacklisted word!' })
            }
            let buyLine = await buySchema.findOne({ userId : user })
            let sellLine = await sellSchema.findOne({ userId : user })

            if(!buyLine) {
                buyLine = new buySchema({ userId : user })
                await buyLine.save()
            }
            if(!sellLine) {
                sellLine = new sellSchema({ userId : user })
                await sellLine.save()
            }

            if(type == 'buying') {
                if(ads.includes('sell')) { return interaction.editReply({ ephemeral : true, content : 'Your buying ads cannot include the word sell!'})} 
                if(lineCheck(interaction.member._roles, buyLine.shops.length).status) {
                    return interaction.editReply({
                        ephemeral : true,
                        content : `You are not allowed to add more than ${buyLine.shops.length} lines in your buying ads.`
                    })
                }
                buyLine.shops.push(ads)
                await buyLine.save()
            }
            else {
                if(ads.includes('buy')) { return interaction.editReply({ ephemeral : true, content : 'Your selling ads cannot include the word buy!'})} 
                if(lineCheck(interaction.member._roles, sellLine.shops.length).status) {
                    return interaction.editReply({
                        ephemeral : true,
                        content : `You are not allowed to add more than ${sellLine.shops.length} lines in your selling ads.`
                    })
                }
                sellLine.shops.push(ads)
                await sellLine.save()
            }

            return interaction.editReply({
                ephemeral : true,
                content : `"${ads}" has been saved to ${type} ads`
            })

        }
        async function handleView(interaction, options, client) {
            let user = options.get('mention')?.user  || interaction.user;
            let buyLine = await buySchema.findOne({ userId : user.id })
            let sellLine = await sellSchema.findOne({ userId : user.id })
            await interaction.deferReply({ ephemeral : true })
            const type = options.get('type')?.value
            if(!buyLine) {
                buyLine = new buySchema({ userId : user.id })
                await buyLine.save()
            }
            if(!sellLine) {
                sellLine = new sellSchema({ userId : user.id })
                await sellLine.save()
            }
            const bCd = cooldownConfig(interaction.member._roles, buyLine.lastPosted)
            const sCd = cooldownConfig(interaction.member._roles, sellLine.lastPosted)

            const embed = new MessageEmbed().setColor(ee.embed_color).setTitle('Trading Shop').setThumbnail(user.avatarURL({ dynamic : true }))
            if(type == 'buying' || !type ) {
                embed.addField(
                    `Buying Shop *(${bCd.cdLeft})*`,
                `${buyLine.shops.length ? buyLine.shops.map((a,x) => (`\`${x+1}.\` ${a}`)).join(' \n') : '*Has not set up buying shop yet*'}`
                )
            }
            if(type == 'selling' || !type) {
                embed.addField(
                    `Selling Shop *(${sCd.cdLeft})*`,
                    `${sellLine.shops.length ? sellLine.shops.map((a,x) => (`\`${x+1}.\` ${a}`)).join(' \n') : '*Has not set up selling shop yet*'}`
                )
            }
            return interaction.editReply({
                ephemeral : true,
                embeds : [embed]
            });
            
            
        }
        function createMenu(type, interaction, client, status = false) {
            const menu = []
            let a = new MessageActionRow()
            let b = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('POST').setLabel('Post ads').setStyle('SUCCESS').setDisabled(status)
                )

                b.addComponents(
                    new MessageButton().setCustomId('CANCEL').setLabel('Cancel').setStyle('DANGER').setDisabled(status)
                )

            if(type == 'buying') {
                const option = []
                config.sellRoles.map(a => {
                    const role = interaction.guild.roles.cache.get(a)
                    if(role) {
                        option.push({ label : `${role.name}` , value : `${role.id}`})
                    }
                })
                a.addComponents(
                    new MessageSelectMenu().setCustomId('BUY').setMinValues(0).setMaxValues(config.sellRoles.length).setDisabled(status)
                    .setPlaceholder('Select the trading pings').setOptions([
                        option
                    ])
                )
            }
            else {
                const option = []
                config.buyRoles.map(a => {
                    const role = interaction.guild.roles.cache.get(a)
                    if(role) {
                        option.push({ label : `${role.name}` , value : `${role.id}`})
                    }
                })
                a.addComponents(
                    new MessageSelectMenu().setCustomId('SELL').setMinValues(0).setMaxValues(config.buyRoles.length)
                    .setPlaceholder('Select the trading pings').setOptions([
                        option
                    ])
                )
            }

            menu.push(a)
            menu.push(b)
            return menu
            
        }
        function cooldownConfig(role, lastPosted) {
            let cd = null
            const perksRoles = Object.keys(config.cooldown.perks)
            role.map(id => {
                if(perksRoles.includes(id)){
                    config.cooldown.perks[id] < cd || cd == null ? cd = config.cooldown.perks[id] : null
                }
            })
            if(cd == null) {
                cd = config.cooldown.default
            }

            let cdLeft = Date.now() - (lastPosted + cd);
            let post = null
            lastPosted == 0 ? cdLeft = 0 : cdLeft > 0 ? cdLeft = 0 : null
            cdLeft == 0 ? post = true : post = false
            cdLeft = pretty(cdLeft)
            return { cdLeft, post, cd, postTime : post == false ? (Math.floor(lastPosted / 1000)+ cd /1000) : Math.floor(Date.now() / 1000) }

        }
        function lineCheck(role, length) {
            let cd = null
            const perksRoles = Object.keys(config.line.perks)
            role.map(id => {
                if(perksRoles.includes(id)){
                    config.line.perks[id] > cd || cd == null ? cd = config.line.perks[id] : null
                }
            })
            if(cd == null) {
                cd = config.line.default
            }
            if(cd > length) {
                return { status : false, length : cd }
            }
            else {
                return { status : true, length : cd }
            }
        }
    },
};
