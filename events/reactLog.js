const client = require("..");
var config = require("../settings/config");

const { MessageEmbed } = require('discord.js')
client.on('messageReactionRemove', async ( reaction, user ) => {

    if(user.bot)return;
    if(reaction.message.guildId != config.guild) return;
    const count = reaction.count
    const messageLink = `https://discord.com/channels/${reaction.message.guildId}/${reaction.message.channelId}/${reaction.message.id}`
    const emote = reaction._emoji

    try {
        client.reaction.queue({
            content : `<#${reaction.message.channelId}> [Jump](${messageLink})`,
            embeds : [
                new MessageEmbed().setAuthor(reaction.message.guild.name, reaction.message.guild.iconURL())
                .setDescription([
                    `Emote : ${emote}`,
                    `User : ${user} - (\`${user.id}\`)`,
                    `Time : <t:${Math.floor(Date.now()/1000)}:F>`,
                    `Count : ${count || 0}`,
                ].join('\n'))
                .setFooter(`${user.tag}`)
                .setColor('#fac2e7').setTimestamp()
            ],
            username : user.username,
            avatarURL : user.avatarURL()
        })
    }
    catch(e) { console.log(e); }
})