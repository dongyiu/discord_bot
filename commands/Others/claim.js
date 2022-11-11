const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection } = require('discord.js');
const {create} = require("sourcebin");
const editJsonFile = require("edit-json-file");
const pretty = require('humanize-duration')
const db = require('../../db/breaks')
const channel = require('../../settings/break').channel
module.exports = {
	name: 'claim',
	args: true,
	aliases: [],
    run: async (client, message, args) => {
        if(!await checkExist(message.author.id)) return message.react('❎')
        const foundUser = await findOrCreateOne(message.author.id)
        backLogs(message, message.author, foundUser.duration, foundUser.reason, foundUser.roles, foundUser.timestamp)
        await removeUser(message.author.id)
        await addRole(message, message.author.id, foundUser.roles)
        return message.react('✅')
    }

};
async function findOrCreateOne(userId) {
    let foundUser = await db.findOne({ userId })
    if(!foundUser) {
        foundUser = new db({ userId })
        await foundUser.save()
    }
    return foundUser
}
async function checkExist(userId) {
    let foundUser = await db.findOne({ userId })
    if(foundUser) return true
    return false
}
function backLogs(interaction, user, duration, reason, roles, timestamp) {
    const embed = new MessageEmbed().setAuthor({ name : `${user.tag} is back from break`, iconURL : user.avatarURL({dynamic : true}) })
    .setDescription([
        `**ID** : ${user.id}`,
        `**Current Time** : <t:${Math.floor(Date.now()/1000)}:F>`,
        `**On Break Since** : <t:${Math.floor(timestamp/1000)}:R>`,
        `**Duration** : ${pretty(duration)}`,
        `**Reason** : ${reason}`,
        `**Roles** : ${roles.map(a => `<@&${a}>`).join(', ')}`
    ].join('\n')).setColor('#FEFFE8')
    interaction.guild.channels.cache.get(channel).send({ embeds : [embed] })
}
async function removeUser(userId) {
    let foundUser = await db.findOne({ userId })
    await foundUser.delete()
}
function addRole(interaction, userId, roles) {
    return interaction.guild.members.cache.get(userId).roles.add(roles)
}