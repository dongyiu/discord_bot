const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');
const winrate = require('../../settings/currency').winrate
const users = require('../../db/users')
module.exports = {
	name: 'slots',
	args: true,
    aliases: [],
    cooldown : 3000,
    disabled : true,
    run: async (client, message, args) => {
        const amount = Number(args[0])
        if(!amount || isNaN(amount) || amount > 1e9 || amount < 1 ) return message.reply(`${client.prefix}slots <amount> \nYou cannot slots more than 1 bil !`)

        const user = await findOrCreate(message.author.id)
        const one = randomEmote(emote)
        const two = randomEmote(emote)
        const three = randomEmote(emote)
        const success = roll(winrate)
        const desc = []
        if(success) {
            const multi = grabEmote(Math.floor(Math.random() * 100), emote2)
            user.coins = user.coins + calc(amount, multi.multi)
            desc.push( `‧₊ ${multi.emote} ${multi.emote} ${multi.emote} ࿔:･ﾟ`)
            desc.push('')
            desc.push(`You have won **${calc(amount, multi.multi).toLocaleString()}**`)
            desc.push(`Multi x${multi.multi}`)
            desc.push(`You now have **${user.coins.toLocaleString()}**`)
        }
        else {
            user.coins = user.coins - amount
            desc.push(`‧₊ ${one} ${two} ${three} ࿔:･ﾟ`)
            desc.push('')
            desc.push(`You have lost **${amount.toLocaleString()}**`)
            desc.push(`You now have **${user.coins.toLocaleString()}**`)
        }
        await user.save()
        const embed = new MessageEmbed().setAuthor(`${message.author.username}'s Slots Machine`, message.author.displayAvatarURL()).setColor('#303336')
        .setDescription(desc.join('\n')).setImage(getLink(success))
        return message.reply({ embeds : [embed] })
    }
};
async function findOrCreate(userId) {
    let foundUser = await users.findOne({ userId })
    if(!foundUser) {
        foundUser = new users({ userId })
        await foundUser.save()
    }
    return foundUser;
}
function randomEmote(emote){
    const emoji = Object.keys(emote)
    return emoji[Math.floor(Math.random() * emoji.length)]
}
function compare(one,two,three) {
    if(one === two && one === three) return true
    return false
}
let emote = {
    "🍅" : 15,
    "🥕" : 25,
    "🌶️" : 30,
    "🍆" : 40,
    "🫑" : 50,
    "🥒" : 60,
    "🥬" : 70,
    "🥦" : 80,
    "🧄" : 90,
    "🧅" : 100,
    "🍄" : 110,
    "🥗" : 120,
}
let emote2 = {
    "🍅" : { multi : 5, rate : 0 },
    "🥕" : { multi : 10, rate : 15 },
    "🌶️" : { multi : 15, rate : 35 },
    "🍆" : { multi : 20, rate : 45 },
    "🫑" :  { multi : 25, rate : 55 },
    "🥒" : { multi : 27, rate : 65 },
    "🥬" : { multi : 30, rate : 75 },
    "🥦" : { multi : 35, rate : 80 },
    "🧄" : { multi : 37, rate : 85 },
    "🧅" : { multi : 100, rate : 95 },
    "🍄" : { multi : 200, rate : 98 },
    "🥗" : { multi : 650, rate : 100 },
}
function getLink(success) {
    if(success) return 'https://media.discordapp.net/attachments/877557286560743454/940540462685630514/line-green.png'
    return 'https://media.discordapp.net/attachments/877557286560743454/940540461775462400/line-red.png'
}
function getMulti(emote, list) {
    return list[emote]
}
function calc(amount, multi) {
    return Number(amount) * Number(multi)
}
function roll(num) {
    return Math.floor(Math.random() * 100) <= num;
}
function grabEmote(num, emoteList) {
    let count = null;
    Object.keys(emoteList).map(a => emoteList[a].rate <= num ? count = { multi : emoteList[a].multi, emote : a, rate : emoteList[a].rate }  : null)
    return count
}
function random() {
    return Math.floor(Math.random() * 100)
}