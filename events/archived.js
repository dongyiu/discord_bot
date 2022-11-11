const client = require("../trade");
var config = require("../settings/config");
var ee = require("../settings/embed.json");
const { MessageEmbed } = require("discord.js");
const grinder = require('../db/grinds')
/// SETTINGS STARTS HERE ///
const bot = '270904126974590976'
const manager = require('../settings/grinders').manager
const sendChan = '921566411778850866'
/// SETTINGS ENDS HERE ///

client.on('messageCreate', async message => {
    if(message.channelId != sendChan) return
    if(message.author.id != bot) return
    const regex = /( You gave )+(Leon.|elli|Vipul|korpy)+( ..⏣ 1,000,000..)/g;
    const found = message.content?.match(regex);
    if(!found?.length) return
    const sender = message.mentions.users.first().id
    const receive = receiver(message.content)
    if(!receive || !sender ) return
    const lastTen = await message.channel.messages.fetch({ limit : 10 })
    const foundMsg = lastTen.filter(a => {
        return ((
            a.content?.trim().toLowerCase().startsWith("pls give") 
            || 
            a.content?.trim().toLowerCase().startsWith("pls share") 
        ) 
        && 
        a.mentions.users.first()?.id == receive 
        && 
        a.author.id == sender)
    })
    if(foundMsg.size) {
        const parent = await checkParent(sender)
        if(!parent) {
            foundMsg.first()?.reply(`<@${sender}> you dont have a parent, the coins you sent just now will not be counted !`)
        }
        else {
            const correctParent = matchParent(parent, receive)
            if(!correctParent) {
                foundMsg.first()?.reply(`You are sending to a wrong manager, the coins you sent just now will not be counted !`)
            }
            else {
                const donor = await addDono(sender)
                foundMsg.first().reply(`${duration(donor.nextdono)}`)
                message.reply(`<@${parent}> your child has sent u 1 mil.`)
            }
        }
    }
})
function duration(time) {
    if(time > Date.now()) {
        return `Next payment : **<t:${Math.floor(time/1000)}:R>**`
    }
    else {
        return `Next payment : **NOW** (Last sent : <t:${Math.floor(time/1000)}:R>)`
    }
}
async function addDono(userId) {
    const foundUser = await grinder.findOne({ userId })
    foundUser.donation = foundUser.donation + 1e6
    foundUser.nextdono = foundUser.nextdono + 24 * 60 * 60 * 1000
    await foundUser.save()
    return foundUser
}
function matchParent(parent, receive) {
    if(parent == receive) {
        return true
    } else { return false; }
}
async function checkParent(userId) {
    const foundUser = await grinder.findOne({ userId })
    if(!foundUser || !foundUser.manager.user) {
        return false
    }
    else {
        return foundUser.manager.user
    }
}
function receiver(string) {
    let a = {
        'leon.' : '603972402187206666',
        'elli' : '729643700455604266',
        'vipul' : '844178631547027478',
        'korpy' : '444265370577010696'
    }
    let abc = null
    Object.keys(a).map(b=> {
        if(string.toLowerCase().includes(b)) {
            abc = a[b];
        }
    })
    return abc
}

