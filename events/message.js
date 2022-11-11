const client = require("..");
var config = require("../settings/config");
var ee = require("../settings/embed.json");
const { MessageEmbed } = require("discord.js");

client.on('messageCreate', async message => {
    if(message.author.bot) return
    if(message.mentions.users.has('422967413295022080') || message.mentions.repliedUser?.id == '422967413295022080'){
        if(message.channel.id == '834342642569314364' )return
        message.member.timeout(60* 1000, 'pinging abc').catch(console.error)
    }
})


