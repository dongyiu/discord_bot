const client = require("../trade");
const config = require('../settings/config')
const trading = require('../utils/trading')
const { Collection } = require('discord.js');
const db = require('../db/embed')
const blacklist = require('../db/blacklist')

require('dotenv').config()
client.on('ready', async () => {
    console.log(`${client.user.username} Is Online`);
    client.abc = await client.users.fetch('422967413295022080')
    client.user.setActivity(`.`,{type : "WATCHING"});
    const guild = client.guilds.cache.get(config.guild)
    if(!guild) { 
        console.log('FUCK! WRONG GUILD!')
        process.exit() 
    }
    const trade = new trading({ url: process.env.webhook })
    client.trade = trade
    const reaction = new trading({ url : process.env.reaction })
    client.reaction = reaction
    const blacklist = new trading({ url : process.env.blacklist })
    client.blacklist = blacklist
    blacklist.start()
    trade.start()
    reaction.start()
    console.log(`Main guild is ${guild.name}`)
    client.embedCommand = new Collection()
    loadEmbed(client)

    await client.guilds.cache.get(config.guild).members.fetch(0)
})

async function loadEmbed(client) {
    const data = await db.find()
    if(!data.length) return
    data.map(a => {
        client.embedCommand.set(`${a.name}_${a.guildId}`, { guildId: a.guildId, embed: a.embed, channel: a.channel, role: a.role, errMessage: a.errMessage })
    })
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