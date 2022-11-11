const client = require("..");
var config = require("../settings/config");
var ee = require("../settings/embed.json");
const { MessageEmbed } = require("discord.js");

client.on('messageCreate', async message => {
    if(client.shutup.has(message.author.id)) return message.delete().catch(e => e)
})


