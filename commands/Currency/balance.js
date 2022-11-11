const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const winrate = 35
const users = require('../../db/users')
const currency = require('../../utils/currency')
module.exports = {
	name: 'balance',
	args: true,
    aliases: ['bal'],
    cooldown : 3000,
    disabled : true,
    run: async (client, message, args) => {
        let user = args[0]
        user = message.guild.members.cache.filter(a => a.user.username == user || a.user.tag == user || a.user.id == user?.replace(/[^\d.-]/g, '')).first()?.user
        if(!user) user = message.author
        const foundUser = new currency({ userId : user.id })
        const bal = await foundUser.getBalance()
        const embed = new MessageEmbed().setAuthor(`${user.username}`, user.avatarURL()).setColor('#303336')
        .setURL('https://discord.gg/trades').setImage('https://media.discordapp.net/attachments/877557286560743454/940540463356731393/line-pink.png')
        message.reply({ embeds : [embed.setDescription(`⚘ Wallet ⇢ **${bal.toLocaleString()}** ･ﾟ`)] })
    }
};
