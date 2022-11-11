const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const winrate = 35
const users = require('../../db/users')
const currency = require('../../utils/currency')
const shop = require('../../settings/currency').shop
module.exports = {
	name: 'store',
	args: true,
    aliases: ['shop'],
    cooldown : 3000,
    disabled : true,
    run: async (client, message, args) => {
        const items = Object.keys(shop)
        const embed = new MessageEmbed().setAuthor(`Shop`, message.author.avatarURL()).setColor('#303336')
        .setURL('https://discord.gg/trades').setImage('https://media.discordapp.net/attachments/877557286560743454/940540462861795358/line-blue.png')
        message.reply({ embeds : [embed.setDescription(
            items.map(a => `୧ ⋅ ${a} ⇢ \`${shop[a].toLocaleString()}\``).join('\n')
        )] })
    }
};
