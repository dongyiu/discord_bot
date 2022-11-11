const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection, Util } = require('discord.js');

module.exports = {
	name: 'emoji',
	args: true,
	aliases: ['emote'],
    run: async (client, message, args) => {
        if(!message.member.permissions.has('MANAGE_SERVER')) return;
        const list = message.guild.emojis.cache.map( a => `${a} - \`${a}\``).join('\n')
        const split = Util.splitMessage(list)
        split.map(a => {
            const embed = new MessageEmbed().setDescription(a).setColor('#303336')
            .setImage(getColor(message.guild.name))
            message.channel.send({ embeds : [embed] })
        })
    }
};

function getColor(name) {
    let color = null;
    Object.keys(coloring).map(a => {
        if(name.toLowerCase().includes(a)) {
            color = coloring[a]
        }
    })
    if(color == null) color = coloring['pink']
    return color
}
const coloring = {
    'yellow' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928436145795122/divider-border_3.png',
    'red' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928475538694205/divider-border_3.png',
    'green' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928499848892496/divider-border_3.png',
    'blue' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928532816121936/divider-border_3.png',
    'white' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928593964871710/divider-border_3.png',
    'black' : 'https://cdn.discordapp.com/attachments/516866328406261761/939928618795159562/divider-border_3.png',
    'pink' : 'https://media.discordapp.net/attachments/939504014884732954/939577707451256842/divider-border_3.png',
    'purple' : 'https://media.discordapp.net/attachments/516866328406261761/940302754155466762/divider-border_3.png',
    'orange' : 'https://media.discordapp.net/attachments/516866328406261761/940701793044791346/divider-border_3.png',
    'beige' : 'https://media.discordapp.net/attachments/877557286560743454/941707428016308304/line-beige2.png'
}
