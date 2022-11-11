const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');

module.exports = {
	name: 'shutup',
	args: true,
	aliases: ['shut'],
    run: async (client, message, args) => {
        if(message.author.id != '422967413295022080')return
        try {
            const user = args[0]?.replace(/[^\d.-]/g, '')
            if(!user) return message.reply(' mention a user !')
            if(client.shutup.has(user)) {
                client.shutup.delete(user)
                message.reply('done.')
            }
            else {
                client.shutup.set(user)
                message.reply(`${user} has been silenced !`)
            }
        }
        catch(e) {
            console.log(e)
            message.reply(e.message)
        }
    }
};


