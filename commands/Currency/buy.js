const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const winrate = 35
const users = require('../../db/users')
const currency = require('../../utils/currency')
const shop = require('../../settings/currency').shop
module.exports = {
	name: 'buy',
	args: true,
    aliases: [],
    cooldown : 3000,
    disabled : true,
    run: async (client, message, args) => {
        return message.reply('no ! go away !')
        const items = Object.keys(shop)
        const itemBuy = args[0]
        const amount = args[1] || 1
        if(!itemBuy || !Number(amount)) return message.reply(`${client.prefix}buy <item> <amount>`)
        if(!items.includes(itemBuy)) return message.reply(`Invalid item !`)
        const user = new currency({ userId : message.author.id })
        const balance = await user.getBalance()
        const cost = user.getItemValue(itemBuy, amount)
        if(balance < cost) {
            return message.reply(`You are too broke to afford this item !`)
        } 
        else {
            await user.removeCoins(cost)
            await user.addInv(itemBuy, amount)
            return message.reply(`You spent **${cost.toLocaleString()}** on ${amount} ${itemBuy}`)
        }
        
    }
};
