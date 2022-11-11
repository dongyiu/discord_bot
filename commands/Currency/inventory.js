const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const winrate = 35
const users = require('../../db/users')
const currency = require('../../utils/currency')
const shop = require('../../settings/currency').shop
module.exports = {
	name: 'inventory',
	args: true,
    aliases: ['inv'],
    cooldown : 3000,
    disabled : true,
    run: async (client, message, args) => {
        console.log('here')
        const embed = new MessageEmbed().setAuthor(`Inventory`, message.author.avatarURL()).setColor('#303336')
        .setURL('https://discord.gg/trades').setImage('https://media.discordapp.net/attachments/877557286560743454/940540462861795358/line-blue.png')
        const user = new currency({ userId : message.author.id })
        const inv = await user.getInv()
        if(!inv.length) {
            return message.reply({ embeds : [embed.setDescription(
                'You have 0 items'
            )] })
        }
        else {
            return message.reply({ embeds : [embed.setDescription(
                inv.map(a => `୧ ⋅ ${a.name} ⇢ \`${Number(a.amount).toLocaleString()}\``).join('\n')
            )] })
        }
        
    }
};
