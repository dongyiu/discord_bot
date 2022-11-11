const { Client, Message, MessageEmbed, Collection } = require("discord.js");
global.mongoose = require('mongoose')
const chalk = require("chalk");
const fs = require("fs");
const ms = require('ms')
const client = new Client({
    messageCacheLifetime: 60,
    fetchAllMembers: false,
    messageCacheMaxSize: 10,
    restTimeOffset: 0,
    restWsBridgetimeout: 100,
    shards: "auto",
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: true,
    },
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: 32767,
});
module.exports = client;

client.embeds = new Collection()
const configA = require("./settings/config");
const ee = require("./settings/embed.json");
const prefix = configA.prefix;  
client.prefix = prefix
const  mongoPath = configA.mongoPass
const mongoose = require("mongoose")
mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() =>{
    console.log('Connected to the database!');
}).catch((err) => {
    console.log(err);
});


const token = configA.token;
// Global Variables
client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.cooldowns = new Collection();
client.slashCommands = new Collection();
client.categories = fs.readdirSync("./commands/");
client.post = new Collection();
client.auto = new Collection();
client.timer = new Collection();
client.contextCommands = new Collection();
// Initializing the project
//Loading files, with the client variable like Command Handler, Event Handler, ...
["command_handler", "event_handler", "slash_handler"].forEach((handler) => {
    require(`./handlers/${handler}`)(client)
});

client.login(token);
client.shutup = new Collection();
const config = require('./settings/tradeConfig')
const buyChan = config.buyChan
const sellChan = config.sellChan
const buySchema = require('./db/buys')
const sellSchema = require('./db/sells')
const guildId = configA.guild
const { MessageActionRow, MessageButton, MessageAttachment } = require('discord.js')
new MessageAttachment().setFile('').setName('help').setSpoiler(true)

function perks(role, db, interval) {
    let inter = null
    let least = null
    const perksRoles = Object.keys(config.autoPost.perks)
    role.map(id => {
        if(perksRoles.includes(id)){
            config.autoPost.perks[id] < inter || inter == null ? inter = config.autoPost.perks[id] : null
        }
    })
    if(inter == null) { return { required : false } }
    else {
        least = inter
        if(interval) {
            // interval = ms(interval)
            if(interval < inter) { return { required : true, over : true, least } }
            else { inter = interval }
        }
        else {
            if(db.auto.interval) {
                if(db.auto.interval < inter) { return { required : true, over : true, least } }
                else { inter = db.auto.interval }
            } else { inter = inter + 1 * 60 * 60 * 1000 }
        }
    }
    return { required : true, over : false, interval : inter, least }
}

function startAuto(interval, channelId, db, foundUser, title, lastRan) {
    const timeout = (config.autoPost.default) - ( Date.now() - lastRan )
    const autoType = title.toLowerCase().includes('sell') ? 'selling' : 'buying';
    client.auto.set(
        `${foundUser.id}_${autoType}`, 
        setInterval(async () => {
            const channel = client.channels.cache.get(channelId)
            if(channel && db.shops.length) {
                const menu1 = new MessageActionRow().addComponents(
                    new MessageButton().setLabel('Premium Ads').setCustomId(autoType == 'selling' ? 'P_SELL' : 'P_BUY').setStyle('SECONDARY'),
                    new MessageButton().setLabel('Command Help').setCustomId('HELP').setStyle('SECONDARY')
                    )
    
                const embed = new MessageEmbed().setColor(ee.embed_color).setTitle(`${foundUser.user.tag}'s Trading Shop`).setThumbnail(foundUser.avatarURL({ dynamic : true }))
                .setDescription(`Contact ${foundUser} - (\`${foundUser.id}\`), if you are interested in trading with them`)
                .addField(
                    title,
                    `${db.shops.map((a,x) => (`\`${x+1}\`. ${a}`)).join(' \n')}`
                )
                channel.send({
                    embeds : [embed],
                    components : [menu1],
                    content : `${foundUser.user}`,
                })
            }
            else {
                console.log( 'Error in getting channel ', channelId)
            }
        }, interval)
        )
    client.timer.set(
        `${foundUser.id}_${autoType}`, 
        setTimeout(() => {
           clearInterval(client.auto.get(`${foundUser.id}_${autoType}`))
        }, timeout)
    )
}

function checkPosted(lastRan, cd) {
    let status = null
    let cdLeft = 0;
    if(lastRan > ( Date.now() - cd )) {
        status = false
        cdLeft = ( Date.now() - cd ) - ( lastRan + cd )
    }
    else {
        status = true
    }

    return { status, cdLeft }
}
//loading buy auto post
async function buyAuto(schema, channelId, title, client) {
    let foundAds = await schema.find({ "auto.status" : true, "auto.lastRan" : { $gt : Date.now() - (config.autoPost.default) } })
    let filtered = []
    //fetch members
    const guilId = await client.guilds.cache.get(guildId).members.fetch(0)
    await Promise.all(foundAds.map(a => {
        // get living members
        if(guilId.has(a.userId)){
            const user = guilId.get(a.userId)
            const inter = perks(user._roles, a, a.auto?.interval)
            // get members with latest perks
            if(inter.required  && !inter.over) {
                // check if it's posted
                const check1 = checkPosted(a.auto.lastRan, inter.interval)
                if(check1.status) {
                    startAuto(inter.interval, channelId, a, user, title, a.auto.lastRan)
                }
                else {
                    setTimeout(() => {
                        startAuto(inter.interval, channelId, a, user, title, a.auto.lastRan)
                    }, check1.cdLeft);
                }
                // set interval
            }
        }
    }))
}

async function fetchMore(channel, limit = 5000) {
    if (!channel) {
      throw new Error(`Expected channel, got ${typeof channel}.`);
    }
    if (limit <= 100) {
      return channel.messages.fetch({ limit });
    }
  
    let collection = new Collection();
    let lastId = null;
    let options = {};
    let remaining = limit;
  
    while (remaining > 0) {
      options.limit = remaining > 100 ? 100 : remaining;
      remaining = remaining > 100 ? remaining - 100 : 0;
  
      if (lastId) {
        options.before = lastId;
      }
  
      let messages = await channel.messages.fetch(options);
  
      if (!messages.last()) {
        break;
      }
  
      collection = collection.concat(messages);
      lastId = messages.last().id;
    }
  
    return collection;
}

client.fetchMore = fetchMore
client.startAuto = startAuto

setTimeout(() => {
    buyAuto(buySchema, buyChan, 'Buying shop', client)
    buyAuto(sellSchema,  sellChan, 'Selling shop', client)
}, 5000);

process.on('unhandledRejection', (err) => {
	console.log(err.stack ? err.stack : err);
});

const autoreact = require('./utils/autoReact')
client.ar = new Collection()
client.autoreact = function(userId) { return new autoreact({ ar : client.ar, userId }) }