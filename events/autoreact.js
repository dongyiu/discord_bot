const client = require("..");
var config = require("../settings/config");
var ee = require("../settings/embed.json");
const { MessageEmbed } = require("discord.js");

client.on('messageCreate', async message => {
    if(message.author.bot) return
    const target = message.mentions.users.first()
    if(target) {
        const user = client.autoreact(target.id)
        if(!user.checkCached()) await user.cache()
        if(!user.getAr().length) return
        if(!user.checkPerks(message.guild.members.cache.get(target.id)._roles)) return
        user.getAr().map(async a => {
            await message.react(a).catch(e => e)
        })
    }
})


