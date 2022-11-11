const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, MessageAttachment } = require("discord.js");
const client = require("../trade");
var config = require('../settings/tradeConfig')
var ee = require("../settings/embed.json");
const buySchema = require('../db/buys')
const sellSchema = require('../db/sells')
const pretty = require('humanize-duration')
const ButtonEmbeds = require('../utils/ButtonEmbeds')
const editJsonFile = require("edit-json-file");

client.on('interactionCreate', async interaction => {
    // Slash Command Handling
    try {
        if (interaction.isCommand()) {
            // await interaction.deferReply({ ephemeral: true }).catch(() => { });
    
            const cmd = client.slashCommands.get(interaction.commandName);
            if (!cmd)
                return 
    
            const args = [];
    
            for (let option of interaction.options.data) {
                if (option.type === "SUB_COMMAND") {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            }
            interaction.member = interaction.guild.members.cache.get(interaction.user.id);
            if(cmd.name == 'shop') {
                if(interaction.member._roles.includes('721982346148184127')) {
                    await interaction.deferReply({ ephemeral : true })
                    await interaction.editReply({ content : 'You have been blacklisted! If you believe this is an error, appeal at <#902934558226399262>'})
                    return
                }
            }
 
            if (cmd) {
                // checking user perms
                if (!interaction.member.permissions.has(cmd.permissions || [])) {
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor(ee.embed_color)
                                .setDescription(`You don't Have ${cmd.permissions} To Run Command..`)
                                .setFooter(ee.embed_footertext, ee.embed_footericon)
                        ]
                    })
                }
                // if(cmd.disabled) {
                //     await interaction.deferReply({ ephemeral : true })
                //     await interaction.editReply({ ephemeral : true, content : `${interaction.commandName} has been disabled` })
                //     return
                // }
                cmd.run(client, interaction, interaction.options);
            }
        }
        // Context Menu Handling
        if (interaction.isContextMenu()) {
            await interaction.deferReply({ ephemeral: false });
            const command = client.slashCommands.get(interaction.commandName);
            if (command) command.run(client, interaction);
        }        
        
        function abc() {
            if(client.post.get(interaction.message.id) != interaction.user.id) {
                return false
            }else { return true; }
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
            if(cd >= length) {
                return { status : false, length : cd }
            }
            else {
                return { status : true, length : cd }
            }
        }
        function pingCheck(role, length) {
            let cd = null
            const perksRoles = Object.keys(config.ping.perks)
            role.map(id => {
                if(perksRoles.includes(id)){
                    config.ping.perks[id] > cd || cd == null ? cd = config.ping.perks[id] : null
                }
            })
            if(cd == null) {
                cd = config.ping.default
            }
            if(cd >= length) {
                return { status : false, length : cd }
            }
            else {
                return { status : true, length : cd }
            }
        }
        async function getPremiumAds(type, interaction) {
            let data = null;
            const newAds = 24  * 60 * 60 * 1000;
            if(type.toLowerCase() == 'buying') {
                data = await buySchema.find({ lastPosted : { $gt: Date.now() - newAds } }).sort({ lastPosted : -1 })
            }
            else {
                data = await sellSchema.find({ lastPosted : { $gt: Date.now() - newAds } }).sort({ lastPosted : -1 })
            }
            const list = []
            await Promise.all(data?.map(async a => {
                try {
                    const foundUser = await interaction.guild.members.fetch(a.userId).catch(e => e)
                    if(foundUser) {
                        const role = foundUser._roles?.filter(b => config.premium.roles.includes(b))
                        if(role.length) {
                            list.push(a)
                        }else if(config.premium.bypass.includes(a.userId)) {
                            list.push(a)
                        }
                    }
                }catch(e) { console.log(e); };
            }))
            const list1 = []
            await Promise.all(list.map(async a => {
                if(a.shops.length) {
                    const foundUser = await interaction.guild.members.fetch(a.userId)
                    const embed = new MessageEmbed().setColor(ee.embed_color).setTitle(`${foundUser.user.tag}'s Trading Shop`).setThumbnail(foundUser.avatarURL({ dynamic : true }))
                    .setDescription(`Contact ${foundUser} - (\`${foundUser.id}\`), if you are interested in trading with them. \n*Ads posted at : <t:${Math.floor(a.lastPosted/1000)}:F> (<t:${Math.floor(a.lastPosted/1000)}:R>)*`)
                    embed.addField(
                        `${type} Shop`,
                        `${a.shops.map((a,x) => (`\`${x+1}.\` ${a}`)).join(' \n')}`
                        )
                    list1.push(embed)
                }
            }));

            const embed = new ButtonEmbeds({
                pages: list1.length ? list1 : [new MessageEmbed().setTitle('Error !').setDescription(`No premium user posted any ${type.toLowerCase()} ads in the last 24 hours :<`).setColor(ee.embed_color)],
                timeout: 60000,
                disableAtEnd: true,
                userID: interaction.user.id,
            });
            // await interaction.deleteReply();
            return embed.reply(interaction, true);
            
        }
        if(interaction.customId == 'DELETE_ADS') {
            const url = interaction.message.components[0].components[0].url.split('/');

            await interaction.deferReply({ ephemeral : true })
            const sentMsg = await interaction.followUp({
                content: `Searching for the message : ${interaction.message.components[0].components[0].url}`,
                ephemeral: true
            });
            
            const msgId = url.pop();
            const channelId = url.pop();
            const msg = await client.channels.cache.get(channelId)?.messages.fetch(msgId)
            if(msg) {
                await msg.delete();
                await sentMsg.edit({ content: 'Deleted.' })
            }
            else {
                await sentMsg.edit({ content: 'Unable to find this message.' })
            }

        }
        if(interaction.customId == 'SELL') {
            if(abc() == false) {
                await interaction.deferReply({ ephemeral : true })
                await interaction.editReply({
                ephemeral : true,
                content : 'This is not for you !'
            })
            return
            }
            const list = []
            interaction.values.map(id => {
                const role = interaction.guild.roles.cache.get(id);
                list.push(role)
            })
            const checkPing = pingCheck(interaction.member._roles, list.length)
            if(checkPing.status) {
                await interaction.deferReply({ ephemeral : true })
                await interaction.editReply({
                    ephemeral : true,
                    content : `You can only select ${checkPing.length} trading ping`
                })
                return;
            }
            interaction.message.edit({
                content : `${interaction.user}, ${list.join(', ')}`,
                // allowedMentions : { roles : config.buyRoles },
            });
        }
        if(interaction.customId == 'BUY') {
            if(abc() == false) {
                await interaction.deferReply({ ephemeral : true })
                await interaction.editReply({
                ephemeral : true,
                content : 'This is not for you !'
            })
            return
            }
            const list = []
            interaction.values.map(id => {
                const role = interaction.guild.roles.cache.get(id);
                list.push(role)
            })
            const checkPing = pingCheck(interaction.member._roles, list.length)
            if(checkPing.status) {
                await interaction.deferReply({ ephemeral : true })
                await interaction.editReply({
                    ephemeral : true,
                    content : `You can only select ${checkPing.length} trading ping`
                })
                return;
            }
            interaction.message.edit({
                content : `${interaction.user}, ${list.join(', ')}`,
                // allowedMentions : { roles : config.sellRoles },
            });
        }
        if(interaction.customId == 'CANCEL') {
            if(abc() == false) {
                await interaction.deferReply({ ephemeral : true })
                await interaction.editReply({
                ephemeral : true,
                content : 'This is not for you !'
            })
            return
            }
            interaction.message.edit({
                content : 'Cancelled !',
                components : [],
                embeds : []
            });
        }
        if(interaction.customId == 'POST') {
            if(abc() == false) {
                await interaction.deferReply({ ephemeral : true })
                await interaction.editReply({
                ephemeral : true,
                content : 'This is not for you !'
            })
            return
            }
            const roles = interaction.message.content.trim().split(' ').map(a => a.replace(/[^\d.-]/g, ''))
    
            if(interaction.message.embeds[0].fields[0].name.toLowerCase().includes('sell')) {
                const foundUser = await sellSchema.findOne({ userId : interaction.user.id })
                const sCd = cooldownConfig(interaction.member._roles, foundUser.lastPosted);
                if(sCd.post == false) {
                    await interaction.deferReply({ ephemeral : true })
                    await interaction.editReply({
                        ephemeral : true,
                        content : `You can post your selling ads again  **<t:${sCd.postTime}:R>**.`
                    })
                    return
                }
                else {
                    const checkLine = lineCheck(interaction.member._roles, foundUser.shops.length)
                    if(checkLine.status) {
                        await interaction.deferReply({ ephemeral : true })
                        return interaction.editReply({
                            ephemeral : true,
                            content : `You can only have ${checkLine.length} lines of ads. Please remove the extra lines of ads and try posting it again.`
                        });
                        return
                    }
                    const channel = client.channels.cache.get(config.sellChan)
                    const wl = config.buyRoles
                    const pong = []
                    roles.map(id => {
                        if(wl.includes(id)) {
                            pong.push(interaction.guild.roles.cache.get(id))
                        }
                    })
                    const menu1 = new MessageActionRow().addComponents(
                        new MessageButton().setLabel('Premium Ads').setCustomId('P_SELL').setStyle('SECONDARY'),
                        new MessageButton().setLabel('Command Help').setCustomId('HELP').setStyle('SECONDARY')
                        )
                    channel.send({
                        content : `${interaction.user}, ${pong.join(', ')}`,
                        embeds : interaction.message.embeds,
                        components : [menu1]
                    })
                    
                    foundUser.lastPosted = Date.now()
                    await foundUser.save()
                }
                
            }
            else {
                const foundUser = await buySchema.findOne({ userId : interaction.user.id })
                const bCd = cooldownConfig(interaction.member._roles, foundUser.lastPosted);
                if(bCd.post == false) {
                    await interaction.deferReply({ ephemeral : true })
                    await interaction.editReply({
                        ephemeral : true,
                        content : `You can post your buying ads again **<t:${bCd.postTime}:R>** .`
                    })
                    return
                }
                else {
                    const checkLine = lineCheck(interaction.member._roles, foundUser.shops.length)
                    if(checkLine.status) {
                        await interaction.deferReply({ ephemeral : true })
                        await interaction.editReply({
                            ephemeral : true,
                            content : `You can only have ${checkLine.length} lines of ads. Please remove the extra lines of ads and try posting it again.`
                        });
                        return
                    }
                    const channel = client.channels.cache.get(config.buyChan)
                    const wl = config.sellRoles
                    const pong = []
                    roles.map(id => {
                        if(wl.includes(id)) {
                            pong.push(interaction.guild.roles.cache.get(id))
                        }
                    })
                    const menu1 = new MessageActionRow().addComponents(
                        new MessageButton().setLabel('Premium Ads').setCustomId('P_BUY').setStyle('SECONDARY'),
                        new MessageButton().setLabel('Command Help').setCustomId('HELP').setStyle('SECONDARY')
                        )
                    channel.send({
                        content : `${interaction.user}, ${pong.join(', ')}`,
                        embeds : interaction.message.embeds,
                        components : [menu1]
                    })
                    
                    foundUser.lastPosted = Date.now()
                    await foundUser.save()
                }
                
            }
            const menuA = new MessageActionRow().addComponents(
                new MessageSelectMenu().setPlaceholder('Select the trading pings').setDisabled(true).setCustomId('ab')
                .setOptions({ label : 'a', value : 'c' }).setMinValues(0).setMaxValues(1)
            )
            const menuB = new MessageActionRow().addComponents(
                new MessageButton().setStyle('SUCCESS').setLabel('Post ads').setDisabled(true).setCustomId('aab'),
                new MessageButton().setStyle('DANGER').setLabel('Cancel').setDisabled(true).setCustomId('abs')
            )
            
            interaction.message.edit({
                components : [
                    menuA,
                    menuB
                ]
            })
            return;
        }
        if(interaction.customId == 'HELP') {
            await interaction.deferReply({ ephemeral : true })
            const abc = new MessageAttachment().setFile(`https://images-ext-2.discordapp.net/external/UV-v-_aCVj22UJaNnsJOOwnf-U5ZlJVnhd3kQJH5swQ/https/media.discordapp.net/attachments/912723716159442954/913667050034065449/Screen_Shot_2021-11-26_at_1.46.24_PM.png`)
            await interaction.editReply({
                ephemeral : true,
                content : 'You can run these slash command in the following channels below : \n> <#831648667483635763> <#726008784492953652> <#783068791957487657> <#755696507738521721> \nRefer to <#817431513183551488> for more information.',
                files : [abc]
            });
            return
        }
        if(interaction.customId == 'P_SELL') {
            getPremiumAds('Selling', interaction)
        }
        if(interaction.customId == 'P_BUY') {
            getPremiumAds('Buying', interaction)
        }
        if(interaction.customId == 'list1'){
            await interaction.deferReply({ ephemeral : true })
            if(!interaction.member._roles.includes('767062919162626078')) {
                return interaction.editReply({ content : `You are not a trial mod...`})
            }
            function getTime() {
                return `GMT +${Number(interaction.values.toString()).toFixed(2).toString().replace('.', ':')}`
            }
            
            const file = editJsonFile(`${__dirname}/../settings/tmod.json`);
            const tmod = file.set(interaction.user.id, `${getTime()}`)
            file.save()
            interaction.message.edit({ content : genCon() })
            return interaction.editReply({ content : `You have selected ${getTime()}`})
        }
        if(interaction.customId == 'list2'){
            await interaction.deferReply({ ephemeral : true })
            if(!interaction.member._roles.includes('767062919162626078')) {
                return interaction.editReply({ content : `You are not a trial mod...`})
            }
            function getTime() {
                return `GMT ${Number(interaction.values.toString()).toFixed(2).toString().replace('.', ':')}`
            }

            
            const file = editJsonFile(`${__dirname}/../settings/tmod.json`);
            const tmod = file.set(`${Number(interaction.user.id)}`, `${getTime()}`)
            console.log(file.data)
            file.save()
            interaction.message.edit({ content : genCon() })
            return interaction.editReply({ content : `You have selected ${getTime()}`})
        }
        function genCon() {
            const file = editJsonFile(`${__dirname}/../settings/tmod.json`);
            Object.keys(file.data).filter(a => a.toLowerCase().startsWith('g')).map(a => file.set(a, null))
            file.save()
            const userList = Object.keys(file.data).filter(a => !a.toLowerCase().startsWith('g'))
            userList.map(a => {
                const abc = file.get(`${file.data[a]}`)
                if(abc) {
                    abc.push(a)
                    file.set(`${file.data[a]}`, abc)
                }
                else {
                    file.set(`${file.data[a]}`, [a])
                }
            })
            file.save()
            const timezoneList = Object.keys(file.data).filter(a => a.toLowerCase().startsWith('g') && file.data[a]!= null)
            return timezoneList.map(a => `**${a}** (\`${file.data[a].length}\`)\n${file.data[a].map(a => correctId(a, interaction) || a).join(' ')}\n\n`).toString().replace(/,/g, '')
        }
        function correctId(target, message) {
            return message.guild.members.cache.filter(a => a.user.id.slice(0,15) == target.slice(0,15) ).first()?.user.id
        }

    }
    catch(e) {
        console.log(e)
        return interaction.editReply({
            content : 'an error occured'
        })
    }
})