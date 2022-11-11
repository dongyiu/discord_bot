const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');

module.exports = {
	name: 'steal',
	args: true,
	aliases: [],
    run: async (client, message, args) => {
        if(!message.member.permissions.has('MANAGE_EMOJIS_AND_STICKERS')) return;
        try {
            const name = args[0]
            let link = args[1]
            if(!name || !link) return message.reply({ content : `${client.prefix}steal <name> <link / emote>` })
            if(!link.startsWith('https://')) {
                if(link.startsWith('<a:') && link.endsWith('>')) {
                    link = `https://cdn.discordapp.com/emojis/${link.split(/:|>/)[2]}.gif?size=96&quality=lossless`
                }
                else if(link.startsWith('<:') && link.endsWith('>')) {
                    link = `https://cdn.discordapp.com/emojis/${link.split(/:|>/)[2]}.webp?size=96&quality=lossless`
                }
                else {
                    return message.reply({ content : `${client.prefix}steal <name> <link / emote>` })
                }
            }
            const emote = await message.guild.emojis.create(link, name)
            return message.reply({ content : `${emote} has been added as \`${emote.name}\`` })
        }
        catch(e) {
            console.log(e)
            message.reply({ content : e.message })
        }
    }
};


