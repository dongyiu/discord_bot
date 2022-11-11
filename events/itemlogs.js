
const client = require("..");
const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Util, WebhookClient } = require('discord.js');

client.on('messageCreate', async message => {
    if(message.author.id == '270904126974590976' && message.embeds.length && message.embeds[0]?.title == 'Successful Trade!') {
        client.trade.queue({ 
            content : `${message.channel} [Jump to message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`,
            embeds : message.embeds, 
            components : [ new MessageActionRow().addComponents( new MessageButton().setStyle("LINK").setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`).setLabel('Jump') )]
        })
    }

})
