const client = require("..");
var config = require("../settings/config");
var ee = require("../settings/embed.json");
const { MessageEmbed, Collection } = require("discord.js");
const trading = require('../utils/trading')
client.on('messageCreate', async message => {
    let prefix = config.prefix
    if (!message.guild) return;
    if (message.author.bot) return;
    let trig = {
        k : '<@444265370577010696>',
        c : '<@444265370577010696>',
        v : '<@844178631547027478>',
        l : '<@603972402187206666>',
        e : '<@729643700455604266>',
        g : '<@444265370577010696> <@729643700455604266> <@603972402187206666> <@844178631547027478>'
    }
    Object.keys(trig).map(a => {
        if(message.content.toLowerCase() == a) {
            if(message.author.id == '422967413295022080') {
                return message.channel.send({ content : trig[a] })
            }
        }
    })

    if (message.channel.partial) await message.channel.fetch();
    if (message.partial) await message.fetch();
    if(!message.content.toLowerCase().startsWith(prefix))return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    // getting prefix when bot mention
    if (cmd.length === 0) {
        // if (message.mentions.has(client.user)) {
        //     message.channel.send({
        //         embeds: [new MessageEmbed()
        //             .setColor(ee.embed_color)
        //             .setAuthor(`Hey, You Pinged me.. 😉`)
        //             .setDescription(`My Developer is <@882481863661342770> \n\n My Name is **${client.user.username}** \n My prefix is \`${prefix}\` \n You can see my all commands by type \`${prefix}help\` \n [My Support Server](${config.server}) `)
        //             .setFooter(ee.embed_footertext, ee.embed_footericon)
        //         ]
        //     });

        // }
    }
    
    

    const command = client.commands.get(cmd.toLowerCase()) ||  client.commands.find((cmds) => cmds.aliases && cmds.aliases.includes(cmd));
    if(command?.disabled) return
    const embed = client.embedCommand.get(`${cmd.toLowerCase()}_${message.guild.id}`);
    if (!command && !embed) return;
    if (command) {
        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Collection());
        }
        const now = Date.now();
		const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = command.cooldown || 0 ;
		if (timestamps?.has(message.author.id)) {
			const expirationTime =
				timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				const timeLeft = timer(expirationTime);
				message
					.reply({
                        embeds: [ 
                            new MessageEmbed().setAuthor('Cooldown', 'https://cdn.discordapp.com/emojis/939741490865930300.webp?size=96&quality=lossless')
                            .setDescription(`This command is in cooldown for **${timeLeft}**`)
                            .setURL('https://discord.gg/trades').setColor('#363333')
                            .setImage('https://media.discordapp.net/attachments/877557286560743454/940540461775462400/line-red.png')
                        ],
					})
					.catch(() => {
						// something
					});
				return false;
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        // checking user perms
        if (!message.member.permissions.has(command.permissions || [])) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(ee.embed_color)
                        .setDescription(`** ❌ You don't Have ${command.permissions} To Run Command.. **`)
                ]
            })
        }

        command.run(client, message, args, prefix)
    }
    else if(embed) {
        sendEmbed((`${cmd.toLowerCase()}_${message.guild.id}`), message)
    }
})

async function sendEmbed(name, message) {
    const foundEmbed = client.embedCommand.get(name);
    if(foundEmbed.guildId != message.guild.id) return
    if(foundEmbed.channel.length && !foundEmbed.channel.includes(message.channel.id)) {
        if(foundEmbed.errMessage) {
            return message.reply({ content : `${foundEmbed.errMessage}`, allowedMentions : { parse : ['users'] }})
        }
        else {
            return
        }
    }
    if(foundEmbed.role.length && !message.member._roles.filter(a => foundEmbed.role.includes(a)).length) {
        if(foundEmbed.errMessage) {
            return message.reply({ content : `${foundEmbed.errMessage}`, allowedMentions : { parse : ['users'] }})
        }
        else {
            return
        }
    }
    await message?.delete()
    // await webhookSend(message, { 
    //     embeds : JSON.parse(foundEmbed.embed), allowedMentions : { parse : ['users'] },
    //     avatarURL : message.author.avatarURL({ dynamic : true }),
    //     username : message.author.username,
    // })
    // await message.channel.send()
    const foundWebhook = await getWebhook(message)
    await queueWebhook(foundWebhook, message.channel.id, { 
            embeds : JSON.parse(foundEmbed.embed), allowedMentions : { parse : ['users'] },
            avatarURL : message.author.avatarURL({ dynamic : true }),
            username : message.author.username,
        })
}

async function queueWebhook(webhook, channel, content) {
    let foundQueue = client.embeds.get(channel)
    if(!foundQueue) {
        await client.embeds.set(channel, new trading({ hook : webhook, time : 1000 }))
        foundQueue = client.embeds.get(channel)
        await foundQueue.start()
    }
    await foundQueue.queue(content)
}
async function getWebhook(message, content) {
    let foundWebhook = await checkWebhook(message.channel, client.user.id)
    if(!foundWebhook) foundWebhook = await createWebhook(message.channel, client.user.username)
    return foundWebhook;
}

async function checkWebhook(channel, author) {
    const webhook = await channel.fetchWebhooks(0)
    if(webhook.size == 0) return false
    const exist  = webhook.filter(a => a.owner.id == author)
    if(exist.size >=1 ) return exist.first()
    return false
}

async function createWebhook(channel, name) {
    try {
        const webhook = await channel.createWebhook(name)
        return webhook
    }
    catch(e) { console.log(e); }
}
function timer(timestamp) {
    const timeLeft = timestamp - Date.now();
    const days = Math.floor(timeLeft / 86400000);
    const hours = Math.floor(timeLeft / 3600000) - days * 24;
    const minutes = Math.floor(timeLeft / 60000) - days * 1440 - hours * 60;
    const seconds =
        Math.floor(timeLeft / 1000) - days * 86400 - hours * 3600 - minutes * 60;
    const mseconds =
        timeLeft / 1000 - days * 86400 - hours * 3600 - minutes * 60;
    let string = '';
    if (days) string = string + `${days} ${days == 1 ? 'day' : 'days'}`;
    if (hours) string = string + `${hours} ${hours == 1 ? 'hour' : 'hours'}`;
    if (minutes) { string = string + `${minutes} ${minutes == 1 ? 'minute' : 'minutes'}`; }
    if (seconds) { string = string + `${seconds} ${seconds == 1 ? 'second' : 'seconds'}`; }
    if (!string.length) string = `${mseconds.toFixed(1)} second`;
    return string;
}
