const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const emote = [
    '939436893903421440',
    '939504014884732948',
    '939471196095914016',
    '939506200041627668',
    '939529011560869908',
    '939537902944272444',
    '939537933596237916',
    '939915520977805372',
    '940191531212628009',
    '941581714369675294',
    '719180744311701505'
  ]
// const emote = ['939436893903421440', '939471196095914016']
module.exports = {
	name: 'autoreact',
	args: true,
	aliases: ['ar'],
    run: async (client, message, args) => {
        // if(!message.member.permissions.has('MANAGE_EMOJIS_AND_STICKERS')) return;
        const emojis = new Collection()
        emote.map(a => {
            const allEmote = client.guilds.cache.get(a)?.emojis.cache
            const split = niceList(allEmote.map(a => a.id), 10)
            const guild = client.guilds.cache.get(a)
            emojis.set(a, { emojis : allEmote, list : split, name : guild.name, icon : guild.iconURL({ dynamic : true }), max : split.length })
        })
        let current = null || emojis.first()
        let page = 0
        const selectedAr = new Set()
        const ar = client.autoreact(message.author.id)
        if(!ar.checkCached()) await ar.cache()
        if(ar.getAr().length) await Promise.all(ar.getAr().map(a => selectedAr.add(a)))
        const firstRowButtons = new MessageActionRow().addComponents(
            button('first', null, 4, false, 'doubleleft:875443385308151831'),
            button('previous', null, 4, false, 'left:875443450080817172'),
            button('view', 'view autoreact', 3, false ),
            button('next', null, 4, false, 'right:875443466644095036'),
            button('last', null, 4, false, 'doubleright:875443494259421184')
        )
        const goBack = new MessageActionRow().addComponents(
            button('return', null, 4, false, 'left:875443450080817172')
        )
        const msg = await message.channel.send({ embeds : [
            new MessageEmbed().setAuthor(`${emojis.first().name}'s emotes`, emojis.first().icon).setColor('#303336')
            .setDescription(genEmote(emojis.first().emojis, emojis.first().list, 0).join('\n')).setImage(getColor(emojis.first().name)).setFooter(footerText(current, page))
        ],
        components : [
            firstRowButtons,
            new MessageActionRow().addComponents(generateEmoteMenu(emojis.first().emojis, emojis.first().list, 0)),
            new MessageActionRow().addComponents(generateMenu(client, emote, emojis))
        ]
    })

        const collector = msg.createMessageComponentCollector({
			// filter: (interaction) => interaction.user.id === message.author.id,
			idle: 120 * 1000,
			errors: ['idle'],
		});
        
        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();
            if(interaction.user.id !== message.author.id) return interaction.followUp({ ephemeral : true, content : 'This is not for you !' })
            if(interaction.customId == 'MENU') {
                page = 0
                const selectedGuild = interaction.values.toString()
                current = emojis.get(selectedGuild)
                return interaction.message.edit({ embeds : [
                    new MessageEmbed().setAuthor(`${current.name}'s emotes`, current.icon).setColor('#303336')
                    .setDescription(genEmote(current.emojis, current.list, 0).join('\n')).setImage(getColor(current.name)).setFooter(footerText(current, page))
                ],
                components : [
                    firstRowButtons,
                    new MessageActionRow().addComponents(generateEmoteMenu(current.emojis, current.list, 0)),
                    new MessageActionRow().addComponents(generateMenu(client, emote, emojis))
                ]
            })
            }
            if(interaction.customId == 'EMOTEMENU') {
                if(Array.from(selectedAr).length + 1 > ar.getArAmount(interaction.member._roles)) return interaction.followUp({ ephemeral : true, content : `You cannot add more than ${ar.getArAmount(interaction.member._roles) || '0'} ar !` })
                await selectedAr.add(interaction.values.toString())
                await ar.setAr(Array.from(selectedAr))
                return interaction.followUp({ ephemeral : true, content : `You have added ${interaction.values.toString()} to your autoreact` })
            }
            if(interaction.customId == 'view') {
                if(selectedAr.size == 0) return interaction.followUp({ ephemeral : true, content : `You have not selected any autoreact` })
                return interaction.message.edit({ 
                    embeds : [],
                    ephemeral : true, content : `${Array.from(selectedAr).map((a,x) => `\`${x+1}\`. ${a}`).join('\n')}`,
                    components : [ new MessageActionRow().addComponents(generateRemoveMenu(selectedAr)), goBack ]
                })
            }
            if(interaction.customId == 'REMOVEMENU') {
                const target = interaction.values.toString()
                await selectedAr.delete(target)
                await ar.setAr(Array.from(selectedAr))
                if(selectedAr.size == 0) return interaction.message.edit({ content : `You have not selected any autoreact`, components : [goBack] })
                return interaction.message.edit({ 
                        content : `${Array.from(selectedAr).map((a,x) => `\`${x+1}\`. ${a}`).join('\n')}`,
                        components : [ new MessageActionRow().addComponents(generateRemoveMenu(selectedAr)), goBack ]
                })
            }
            
            if(interaction.customId == 'next' && ((page + 1) < current.max)) page = page + 1
            if(interaction.customId == 'previous' && page != 0) page = page - 1
            if(interaction.customId == 'first') page = 0
            if(interaction.customId == 'last') page = (current.max - 1)
            return interaction.message.edit({ embeds : [
                    new MessageEmbed().setAuthor(`${current.name}'s emotes`, current.icon).setColor('#303336')
                    .setDescription(genEmote(current.emojis, current.list, page).join('\n')).setImage(getColor(current.name)).setFooter(footerText(current, page))
                ],
                components : [
                    firstRowButtons,
                    new MessageActionRow().addComponents(generateEmoteMenu(current.emojis, current.list, page)),
                    new MessageActionRow().addComponents(generateMenu(client, emote, emojis))
                ],
                content : '\u200b',
            })
        })
			
        collector.on('end', (collected, reason) => {
			if (reason === 'idle') {
				return msg.edit({
					components : []
				});
			}
		});

    }
};
function generateRemoveMenu(yourEmote) {
    const list = []
    Array.from(yourEmote).map(a => {
        const emote = a.split(':')
        list.push({
            label : emote[1],
            value : a,
            // emoji : a
        })
    })
    const menu = new MessageSelectMenu()
    .setCustomId('REMOVEMENU').setMaxValues(1).setMinValues(1).setPlaceholder('Remove your autoreact!')
    .setOptions(list)
    return menu
}
function footerText(current, page) {
    return `Page ${page+1}/${current.max}`
}
function generateEmoteMenu(guildEmote, emoteIds, page) {
    const list = []
    emoteIds[page].map(a => {
        const emote = guildEmote.get(a)
        list.push({
            label : emote.name,
            value : `${emote}`,
            emoji : `${emote}`
        })
    })
    const menu = new MessageSelectMenu()
    .setCustomId('EMOTEMENU').setMaxValues(1).setMinValues(1).setPlaceholder('Select your autoreact!')
    .setOptions(list)
    return menu
}
function generateMenu(client, guild, emojis) {
    const list = []
    guild.map(a => {
        const guild = client.guilds.cache.get(a)
        list.push({ label : guild.name, value : guild.id, emoji : getIconEmote(guild.id, emojis) })
    })
    const menu = new MessageSelectMenu()
    .setCustomId('MENU').setMaxValues(1).setMinValues(1).setPlaceholder('Select another emote server')
    .setOptions(list)
    return menu
}
function genEmote(guildEmote, emoteIds, page) {
    const list = []
    emoteIds[page].map(a => {
        list.push(`${guildEmote.get(a)} - \`${guildEmote.get(a).name}\``)
    })
    return list
}
function button(id, label, style, disable = false, emote) {
    try {
        style = Number(style) || 1
        if(style > 5 || style < 0) style = 1
        style = style.toString().replace(1, 'SUCCESS').replace(2, 'DANGER').replace(3, 'PRIMARY').replace(4, 'SECONDARY').replace(5, 'LINK')
        const buttons = new MessageButton().setCustomId(id).setStyle(style).setDisabled(disable)
        if(label) buttons.setLabel(label)
        if(emote) buttons.setEmoji(emote)
        return buttons
    }
    catch(e) {
        return e
    }
}
function getColor(name) {
    let color = null;
    Object.keys(coloring).map(a => {
        if(name.toLowerCase().includes(a)) {
            color = coloring[a]
        }
    })
    if(color == null) color = coloring['pink']
    return color
}
const coloring = {
    'yellow' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928436145795122/divider-border_3.png',
    'red' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928475538694205/divider-border_3.png',
    'green' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928499848892496/divider-border_3.png',
    'blue' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928532816121936/divider-border_3.png',
    'white' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928593964871710/divider-border_3.png',
    'black' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928618795159562/divider-border_3.png',
    'pink' : 'https://media.discordapp.net/attachments/939504014884732954/939577707451256842/divider-border_3.png',
    'purple' : 'https://media.discordapp.net/attachments/516866328406261761/940302754155466762/divider-border_3.png',
    'orange' : 'https://media.discordapp.net/attachments/516866328406261761/940701793044791346/divider-border_3.png',
    'beige' : 'https://media.discordapp.net/attachments/877557286560743454/941707428016308304/line-beige2.png'
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
function getIconEmote(name, emojis) {
    return emojis.get(name).emojis.first()
}

// let final = null
//     const obj = {
//         green : '<a:greenMacaroon:940223632062414888>',
//         blue : '<a:blueMoon:939727064259518495>',
//     }
//     Object.keys(obj).map(a => {
//         if(name.toLowerCase().includes(a)) {
//             final = obj[a]
//         }
//     })
//     if(final == null) final = obj['blue']
//     return final