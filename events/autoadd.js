const client = require("../trade");
var config = require("../settings/config");
var ee = require("../settings/embed.json");
const { MessageEmbed } = require("discord.js");
const grinder = require('../db/grinds')
const editJsonFile = require("edit-json-file");

/// SETTINGS STARTS HERE ///
const bot = '270904126974590976'
const manager = require('../settings/grinders').manager
const sendChan = '921566411778850866'
/// SETTINGS ENDS HERE ///

client.on('messageCreate', async message => {
    if(message.channelId != sendChan) return
    if(!message.embeds.length) return;
    if(message.author.id != '270904126974590976') return;
    if(message.embeds[0].fields[0]?.name != 'Shared' && message.embeds[0].fields[0]?.name != 'Gifted') return;

    const isCoins = sentCoins(message.embeds[0]?.fields[0]?.value);

    const sender = message.mentions.repliedUser;
    const receiver = await searchReceiver(message, message.reference.messageId);
    const userMessage = await getRepliedMessage(message.reference.messageId, message);

    if(userMessage.content.split('<@').length > 2) return;
    if(isCoins != null) {
        const senderMention = sender;
        const senderUserid = sender.id;
        const receiverName = searchMember(receiver, message.guild.members.cache);
        const amount = Number(isCoins.replace(/[^\d.-]/g, ''));
        let errorMsg = null;
        const parent = await checkParent(sender.id)
        const donor = await addDono(sender.id, amount)

        // if(!parent) {
        //     errorMsg = 'You do not have a parent. Please ping a manager to adopt you!';
        // }
        if(!matchParent(getStorage().id, receiverName?.id)) {
            errorMsg = `You can only send coins to <@${getStorage().id}>: ${getStorage().tag}, your donation will not be added, please resend!`;
        }
        if(!receiverName) {
            errorMsg = 'Failed to add your donation, due to the user receiving coins is not cached. Mention the user and try again.';
        }
        if(amount % 1e6 != 0 || amount > dailyAmount()) {
            errorMsg = `Amount sent must be a **multiple of 1 million**! You cannot send more than **${dailyAmount().toLocaleString()}**! Contact your parents for further explaination!`
        }
        if(errorMsg) return sendError(userMessage, errorMsg);
        
        const respond = await userMessage?.reply({ embeds : [
            new MessageEmbed().setTitle('**<a:heartskribble:875880659015598111> Coins Sent:**').setColor('GREEN')
            .setDescription([
                `╭───╯`,
                `┃${senderMention} - \`${senderUserid}\``,
                `┃Gave **${amount.toLocaleString()}** to:`,
                `╰┈┈➤ ${receiverName} - \`${receiverName.id}\``,
                ``,
                `**New donation amount:**`,
                `${donor.donation}`,
                `${duration(donor.nextdono)}`
            ].join('\n')),
        ],
        allowedMentions : { repliedUser : true },
    });
    // respond?.reply({ content : `<@${parent}> your child has sent u **${amount.toLocaleString()}**.` })

    }

})

function dailyAmount(amt) {
    let file = editJsonFile(`${__dirname}/../settings/grinders.json`);
    let a = file.get('amount') || Number(1e6)
    return Number(a)
}

function duration(time) {
    if(time > Date.now()) {
        return `Next payment : **<t:${Math.floor(time/1000)}:R>**`
    }
    else {
        return `Next payment : **NOW** (Last sent : <t:${Math.floor(time/1000)}:R>)`
    }
}
async function addDono(userId, amount) {
    const foundUser = await grinder.findOne({ userId })
    foundUser.donation = foundUser.donation + Number(amount)
    foundUser.nextdono = foundUser.nextdono + ((24 * 60 * 60 * 1000) * (Number(amount) / 1e6))
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
function giveCoins(string) {
    const a = new RegExp(/([\w]*) (give|share) ((?:<@!?)?\d{18,21}(?:>)?|.{3,32}#[0-9]{4}) ([\d,ekmbtal]+)/gmi);
    const b = new RegExp(/([\w]*) (give|share) (.*?) ((?:<@!?)?\d{18,21}(?:>)?|.{3,32}#[0-9]{4})/gmi);

    const aa = a.exec(string);
    const bb = b.exec(string);

    if(!aa && !bb) return null;
    if(aa) {
    aa.shift();
    const prefix = aa.shift();
    aa.shift();
    const user = aa.shift();
    const amount = aa.shift();
    return { prefix, user, amount };
    }
    if(bb) {
    bb.shift();
    const prefix = bb.shift();
    bb.shift();
    const amount = bb.shift();
    const user = bb.shift();
    return { prefix, user, amount };
    }
}
function sentCoins(string) {
    const a = new RegExp(/⏣ ([\d,ek.mbt]+)`/gm);
    const coins = a.exec(string);
    if(coins == null) return null;
    return coins.pop();
}
async function searchReceiver(message, id) {
    try {
        const target = await message.channel.messages.fetch(id);
        if(!target) return null;
        if(giveCoins(target.content)?.user) return giveCoins(target.content).user;
        return null;
    }
    catch(e) { console.log(e); }
}
function searchMember(string, guildMembers) {
    let final = null;
    if((/.{3,32}#[0-9]{4}$/gmi).test(string)) {
        final = string;
    }
    else {
        final = string?.replace(/[^\d.-]/g, '');
    }
    const foundMember = guildMembers.filter(a => {
        return (
            a.user.tag == final
            ||
            a.user.id == final
        );
    });
    if(foundMember.size == 0) {
        return null;
    }
    else {
        return foundMember.first().user;
    }
}
function sendError(message, content) {
    message?.reply({ embeds : [
        new MessageEmbed().setTitle('Error').setColor("RED")
        .setDescription(content),
    ],
    allowedMentions : { repliedUser : true },
});
}
async function getRepliedMessage(id, message) {
    const target = await message.channel.messages.fetch(id);
    return target;
}
function getStorage() {
    let file = editJsonFile(`${__dirname}/../settings/grinders.json`);
    let a = file.get('storage') || null
    return a
}