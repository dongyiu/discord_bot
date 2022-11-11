const client = require("../trade");
const config = require('../settings/config')
const bled = require('../settings/blacklist.json')
const blacklist = require('../db/blacklist')
const { MessageEmbed } = require("discord.js");

client.on('guildMemberAdd', async (member) => {
    if(member.guild.id != config.guild) return
    const blacklisted = await getBlacklisted(member.guild.id)
    console.log(blacklisted)
    if(blacklisted.includes(member.user.id)) {
        try {
            await sleep(3000)
            await member.roles.add(bled.roles)
            const log = await getLog(member.user.id, member.guild.id)
            client.blacklist.queue({ 
                embeds : [
                    new MessageEmbed().setTitle('A blacklisted user has joined the server !').setDescription([
                        `User : ${member.user} - ${member.user.tag}`,
                        `Reason : ${log[0]?.reason}`,
                        `Responsible Moderator : ${log[0]?.modId}`,
                        `${log[0].time ? `Blacklisted At : <t:${Math.floor( log[0]?.time / 1000)}:F> (<t:${Math.floor( log[0]?.time / 1000)}:R>)` : ''}`,
                    ].join('\n')).setColor("#e0aca6").setThumbnail(member.user.avatarURL({ dynamic : true })).setTimestamp()
                ],
                avatarURL : member.user.avatarURL({ dynamic : true }),
                username : member.user.username
            })
        }
        catch(e) {
            console.log(e)
        }
    }
    
})
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getBlacklisted(guildId) {
    const data = await blacklist.find({ guildId })
    if(!data) return []
    const bled = data.filter(a => {
        const log = a.logs.sort((a, b) => (a.index < b.index) ? 1 : -1) || []
        if(log.length && log[0].action == 'BLACKLIST') {
            return a
        }
    })
    return bled.map(a => a.userId)
}
async function getLog(userId, guildId) {
    const user = await blacklist.findOne({ userId, guildId })
    if(!user) return false
    return user.logs.sort((a, b) => (a.index < b.index) ? 1 : -1) || []
}
