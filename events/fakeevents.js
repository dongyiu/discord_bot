const client = require("..");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const buyChan = require('../settings/tradeConfig').buyChan
const sellChan = require('../settings/tradeConfig').sellChan
const modLog = '800602465560821760'

client.on('messageCreate', async message => {

    if(message.author.bot) return
    const channel = message.guild.channels.cache.get(modLog)
    if(message.channel.id == buyChan && message.content.toLowerCase().includes('sell')) {
        channel.send({
            content : `\`-warn ${message.author.id} posting selling ads in <#${buyChan}>, those ads belong to <#${sellChan}>\``,
            embeds : [
                new MessageEmbed().setTitle('⚠️ Alert ⚠️')
                .setDescription([
                    `Our system has detected a user posting a trade ads in the wrong channel <#${buyChan}>`,
                    ``,
                    `User : ${message.author} - (\`${message.author.id}\`)`,
                    ``,
                    `Word Detected : **Sell**`,
                    `Full Message : ${message.content.length < 150 ? message.content : message.content.slice(0,150)}`,
                ].join('\n'))
                .setThumbnail(message.author.displayAvatarURL())
                .setColor('#eea990')
            ],
            components : [ new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`).setEmoji('<a:9g_flame:804471647339937822>'),
                new MessageButton().setStyle("DANGER").setCustomId("DELETE_ADS").setEmoji('<:IconDeleteTrashcan:750152850310561853>')
            )]
        })
    }

    if(message.channel.id == sellChan && message.content.toLowerCase().includes('buy')) {
        channel.send({
            content : `\`-warn ${message.author.id} posting buying ads in <#${sellChan}>, those ads belong to <#${buyChan}>\``,
            embeds : [
                new MessageEmbed().setTitle('⚠️ Alert ⚠️')
                .setDescription([
                    `Our system has detected a user posting a trade ads in the wrong channel <#${sellChan}>`,
                    ``,
                    `User : ${message.author} - (\`${message.author.id}\`)`,
                    ``,
                    `Word Detected : **Buy**`,
                    `Full Message : ${message.content.length < 150 ? message.content : message.content.slice(0,150)}`,
                ].join('\n'))
                .setThumbnail(message.author.displayAvatarURL())
                .setColor('#eea990')
            ],
            components : [ new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`).setEmoji('<a:9g_flame:804471647339937822>'),
                new MessageButton().setStyle("DANGER").setCustomId("DELETE_ADS").setEmoji('<:IconDeleteTrashcan:750152850310561853>')
            )]
        })
    }
})
