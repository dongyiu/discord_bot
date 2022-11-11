const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const winrate = 35
const users = require('../../db/users')
const currency = require('../../utils/currency')
module.exports = {
	name: 'leaderboard',
	args: true,
    aliases: ['lb', 'top'],
    cooldown : 3000,
    disabled : true,
    run: async (client, message, args) => {
        const data = new currency()
        const lb = await data.getLb()
        const embed = new MessageEmbed().setAuthor(`Top 10 Leaderboard`, message.guild.iconURL()).setColor('#303336')
        .setURL('https://discord.gg/trades').setImage('https://media.discordapp.net/attachments/877557286560743454/940540463356731393/line-pink.png')
        message.reply({ embeds : [embed.setDescription(
            lb.map((a,x) => `\`${x+1}\`. **${a.coins.toLocaleString()}** — <@${a.userId}>`).join('\n')
        )] })
    }
};
