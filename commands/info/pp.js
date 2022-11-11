const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');

module.exports = {
	name: 'pp',
	args: true,
	aliases: [],
    run: async (client, message, args) => {
        let user = args[0] || message.author.id
        message.guild.members.cache.filter(a => a.user.username.toLowerCase() == user.toLowerCase() || a.user.tag == user || a.user.id == user?.replace(/[^\d.-]/g, '')).size >= 1 ? user = message.guild.members.cache.filter(a => a.user.username.toLowerCase() == user.toLowerCase() || a.user.tag == user || a.user.id == user?.replace(/[^\d.-]/g, '')).first() : null
        let pp = ['8=D','8==D','8===D','8====D','8=====D','8======D','8==================D','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found','Error 404 not found']
        pp = pp[Math.floor(Math.random() * pp.length)];

        if(user?.user?.id == '422967413295022080') {
            pp = `DiscordAPIError: Must be 4000 or fewer in length.`
        }
        const embed = new MessageEmbed().setAuthor(`${user?.user?.username || user}'s Peepee size`, user.user?.displayAvatarURL() || message?.author.displayAvatarURL()).setColor('#303336')
        .setDescription(pp).setImage('https://media.discordapp.net/attachments/877557286560743454/940540463105081385/line-purple.png')
        return message.reply({ embeds : [embed] })
    }
};

