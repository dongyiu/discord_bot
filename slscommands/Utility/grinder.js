const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection } = require("discord.js");
const config = require('../../settings/tradeConfig')
const grinder = require('../../db/grinds')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const ms = require('ms')
const applicationsName = ['Trial Mod', 'Gaw Manager', 'Auctioneer', 'Karuta Staff', 'Trades Grinders', 'Trades Traders' ]
const abcEmbed = require('../../utils/abc')
const editJsonFile = require("edit-json-file");
// remember to change add and remove perms later
// grinders settings goes here //
const manager = [ '603972402187206666','444265370577010696','844178631547027478','729643700455604266', '422967413295022080' ]
const grinders = require('../../settings/grinders.json').list
const idkWhatIsThis = require('../../settings/config').status

const logChan = '818654537447505970'
module.exports = {
    name: "grinder",
    description: "applications",
    options: [
        {
          name: 'list',
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: 'List of grinders',
          options : [
              {
                name: 'last-sent',
                description: 'last sent.',
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: false,
              },
              {
                name: 'demote',
                description: 'Ready for demote.',
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: false,
              },
              {
                name: 'number',
                description: 'Number of user will show up in list.',
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
                required: false,
              },
          ]
        },
        {
            name: 'add',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'add grinders dono',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
                {
                    name: 'amount',
                    description: 'amount of donation.',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: true,
                },
            ]
        },
        {
            name: 'remove',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'remove grinders dono',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
                {
                    name: 'amount',
                    description: 'amount of donation.',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: true,
                },
            ]
        },
        {
            name: 'leaderboard',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'grinders leaderboard',
        },
        {
            name: 'adopt',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'adopt your grinders',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
            ]
        },
        {
            name: 'profile',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'view profile',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: false,
                },
            ]
        },
        {
            name: 'disown',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: 'remove a grinder',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
            ]
        },
        {
            name: 'ac',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '.',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
            ]
        },
        {
            name: 'sell',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '...',
        },
        {
            name: 'promote',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '.',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
            ]
        },
        {
            name: 'demote',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '.',
            options : [
                {
                    name: 'user',
                    description: 'Mention a user.',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
            ]
        },
        {
            name: 'sendlimit',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '.',
            options : [
                {
                    name: 'amount',
                    description: 'amount (must be a multiple of 1 million)',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: true,
                },
            ]
        },
        {
            name: 'storage',
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: '.',
            options : [
                {
                    name: 'user',
                    description: 'mention a user',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true,
                },
            ]
        },

    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    disabled : idkWhatIsThis,
    run: async (client, interaction, options) => {
        const file = editJsonFile(`${__dirname}/../../settings/grinders.json`);
        const grinders = file.get('list')
        switch(options.getSubcommand()) {
            case 'list' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleList(interaction, options, client)
                break;
            case 'add' : 
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleAdd(interaction, options, client)
                break;
            case 'remove' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleRemove(interaction, options, client)
                break;
            case 'leaderboard' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, [...manager, ...grinders]))return;
                handleLB(interaction, options, client)
                break;
            case 'profile' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, [...manager, ...grinders]))return;
                handleProfile(interaction, options, client)
                break;
            case 'adopt' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleClaim(interaction, options, client)
                break;
            case 'disown' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleDisown(interaction, options, client)
                break;
            case 'ac' : 
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleAc(interaction, options, client)
                break;
            case 'sell' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleSell(interaction, options, client)
                break;
            case 'promote' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handlePromote(interaction, options, client)
                break;
            case 'demote' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleDemote(interaction, options, client)
                break;
            case 'sendlimit' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleLimit(interaction, options, client)
                break;
            case 'storage' :
                if(!handlePerms(interaction.memberPermissions, interaction.user.id, manager))return;
                handleStorage(interaction, options, client)
                break;

            function handlePerms(perms, id, required) { 
                if(required.includes(id)) {
                    return true
                }else{ return false; }
            }
            
        } 
        async function handleStorage(interaction, options, client) {
            await interaction.deferReply()
            const user = options.get('user').user;
            
            let file = editJsonFile(`${__dirname}/../../settings/grinders.json`);
            file.set('storage', { tag : user.tag, id : user.id })
            file.save()
            return interaction.editReply({ content : `Our storage is ${user}` })
        }
        async function handleLimit(interaction, options, client) {
            await interaction.deferReply()
            const amount = options.get('amount').value;
            if(amount % 1e6 != 0) {
                return interaction.editReply({ content : 'Amount must be a multiple of 1 million !' })
            }
            let file = editJsonFile(`${__dirname}/../../settings/grinders.json`);
            file.set('amount', amount)
            file.save()
            return interaction.editReply({ content : `Current limit for grinders are ${amount.toLocaleString()}` })
        }
        async function handlePromote(interaction, options, client) {
            await interaction.deferReply()
            const user = options.get('user').user
            const length = addUser(user.id)
            const foundUser = await grinder.findOne({ userId : user.id })
            if(foundUser && foundUser.nextdono < Date.now()) {
                foundUser.nextdono = Date.now()
                foundUser.manager.demoted = false
                await foundUser.save()
            }
            return interaction.editReply({ content : `Promoted ${user.tag}. Total Grinders : ${length}` })
        }
        async function handleDemote(interaction, options, client) {
            await interaction.deferReply()
            const user = options.get('user').user
            const foundUser = await grinder.findOne({ userId : user.id })
            if(!foundUser) {
                return interaction.editReply({ content : `${user.tag} is not a grinder` })
            }
            else {
                foundUser.manager.demoted = true
                foundUser.save()
            }
            const length = removeUser(user.id)
            return interaction.editReply({ content : `Demoted ${user.tag}. Total Grinders : ${length}` })
        }
        function removeUser(userId) {
            let file = editJsonFile(`${__dirname}/../../settings/grinders.json`);
            const a = file.get('list').filter(a => a !=  userId)
            file.set("list", a)
            file.save()
            return a.length
        }
        function addUser(userId) {
            let file = editJsonFile(`${__dirname}/../../settings/grinders.json`);
            let a = file.get('list')
            a.push(userId)
            a = new Set(a)
            a = Array.from(a)
            file.set("list", a)
            file.save()
            return a.length
        }
        async function handleSell(interaction, options, client) {
            await interaction.deferReply({ ephemeral : true })
            if(!isManager(interaction.user.id)) {
                interaction.editReply({ content : 'You are not a manager !' })
            }
            else {
                interaction.editReply({ embeds : [new MessageEmbed()
                    .setTitle('Pepe Medal Seller')
                    .setColor('RANDOM')
                    .setDescription(interaction.channel.permissionOverwrites.cache.filter(a => a.type == 'member' && !isManager(a.id))
                    .map(a => `<@${a.id}> - (\`${a.id}\`)`).join('\n'))]})
            }
        }
        async function handleAc(interaction, options, client) {
            await interaction.deferReply({ })
            const user = await options.get('user').user
            const channel = client.channels.cache.get('912723716159442954') || client.channels.cache.get('921568510063292447')
            if(channel.permissionsFor(user.id).has('VIEW_CHANNEL')) {
                channel.permissionOverwrites.delete(user.id)
                return interaction.editReply({ content : 'removed ' + user.tag })
            }
            else {
                channel.permissionOverwrites.edit(user, {
                    VIEW_CHANNEL: true
                })
                return interaction.editReply({ content : 'added ' + user.tag })
            }
            

        }
        async function handleList(interaction, options, client) {
            await interaction.deferReply({})
            const last = options.get('last-sent')?.value
            const number = options.get('number')?.value
            const demote = options.get('demote')?.value
            
            if(last && !ms(last)) {
                return interaction.editReply({ content : `last-sent must be a time. For ex : 1d / 1h / 2d` })
            }
            const data = await grinder.find({ 'manager.demoted' : false }).sort({ nextdono : 1 })

            let list = []
            if(last) {
                const timer = Date.now() - ms(last)
                data.map(a => {
                    if(a.nextdono <= timer) {
                        list.push(a)
                    }
                })
            }
            if(demote) {
                data.map(a => {
                    if(demote == true) {
                        if(a.nextdono <= (Date.now() - ms('2d'))) {
                            list.push(a)
                        }
                    }
                    else {
                        if(!a.nextdono <= (Date.now() - ms('2d'))) {
                            list.push(a)
                        }
                    }
                })
            }
            if(!last && !demote) {
                list = data
            }
            if(number) {
                list = list.slice(0,number)
            }
            const newList = []
            list.map((a,x) => newList.push({ num : (x+1), userId : a.userId, time : a.nextdono }))
            const list2 = niceList(newList, 10);
            const list3 = [] // <@${b.userId}> - (\`${b.userId}\`)
            list2.map(a => list3.push({ description : a.map(b => `\`${b.num}\`. ${b.userId} : <t:${Math.floor(b.time/1000)}:R>`).join('\n'), color : 'RANDOM', title : '`🌺`Grinder List'  }) )
            const list4 = genEmbed(list3.length, list3.length, list3)
            
            const embed = new ButtonEmbeds({
                pages: list4.length ? list4 : [new MessageEmbed().setTitle('0 results').setColor('RED')],
                timeout: 60000,
                disableAtEnd: true,
                userID: interaction.user.id,
            });

            return embed.reply(interaction, false, false);

        }
        async function handleDisown(interaction, options, client) {
            await interaction.deferReply({ })
            const user = options.get('user').user

            
            const foundUser = await grinder.findOne({ userId : user.id })
            if(!foundUser || !foundUser.manager.user) {
                return interaction.editReply({ content : `User is not even adopted...` })
            }
            else if(foundUser.manager.user != interaction.user.id) {
                return interaction.editReply({ content : `You can't disown something u dont own...` })
            }
            else {
                let foundManager = await grinder.findOne({ userId : interaction.user.id })
                if(!foundManager) {
                    foundManager = new grinder({
                        userId : user.id,
                        'manager.status' : true
                    })
                    await foundManager.save()
                }
                foundManager.manager.sent = foundManager.manager.sent - foundUser.donation
                await foundManager.save()
                foundUser.manager.user = null
            }
            await foundUser.save()
            interaction.editReply({ content : `u have disowned ${user.tag} !` })
        }
        async function handleAdd(interaction, options, client) {
            const user = options.get('user').user
            const amount = options.get('amount').value
            await interaction.deferReply({})
            if(amount % 1e6 != 0) {
                return interaction.editReply({ content : 'Amount must be a multiple of 1 million !' })
            }
            else if(!isGrinder(user.id)) {
                return interaction.editReply({ content : 'User is not a grinder !' })
            }
            else {
                let foundUser = await grinder.findOne({ userId : user.id })
                if(!foundUser) {
                    foundUser = new grinder({
                        userId : user.id,
                    })
                    await foundUser.save()
                }
                if(!foundUser.manager.user) {
                    return interaction.editReply({ content : 'User is not adopted yet! Ask a manager to adopt them!' })
                }
                else if(foundUser.manager.user != interaction.user.id) {
                    return interaction.editReply({ content : 'They are not ur child !' })
                }
                else {
                    foundUser.donation = foundUser.donation + amount
                    foundUser.nextdono = foundUser.nextdono + ( (amount / 1e6) * 24 * 60 * 60 * 1000 )
                    await foundUser.save()
                    logs(interaction.user.id, user.id, amount, foundUser.donation, 'add', client)
                    return interaction.editReply({ content : `${user.tag} has donated a total of ${foundUser.donation.toLocaleString()}. \n${duration(foundUser.nextdono)}` })
                }

            }

        }
        async function handleRemove(interaction, options, client) {
            const user = options.get('user').user
            const amount = options.get('amount').value
            await interaction.deferReply({})
            if(amount % 1e6 != 0) {
                return interaction.editReply({ content : 'Amount must be a multiple of 1 million !' })
            }
            else if(!isGrinder(user.id)) {
                return interaction.editReply({ content : 'User is not a grinder !' })
            }
            else {
                let foundUser = await grinder.findOne({ userId : user.id })
                if(!foundUser) {
                    foundUser = new grinder({
                        userId : user.id,
                    })
                    await foundUser.save()
                }
                if(!foundUser.manager.user) {
                    return interaction.editReply({ content : 'User is not adopted yet! Ask a manager to adopt them!' })
                }
                else if(foundUser.manager.user != interaction.user.id) {
                    return interaction.editReply({ content : 'They are not ur child !' })
                }
                else {
                    foundUser.donation = foundUser.donation - amount
                    foundUser.nextdono = foundUser.nextdono - ( (amount / 1e6) * 24 * 60 * 60 * 1000 )
                    await foundUser.save()
                    logs(interaction.user.id, user.id, amount, foundUser.donation, 'remove', client)
                    return interaction.editReply({ content : `${user.tag} has donated a total of ${foundUser.donation.toLocaleString()}. \n${duration(foundUser.nextdono)}` })
                }
            }
        }
        function logs(user, target, added, latest, status = 'add', client) {
            const embed = new MessageEmbed()
            if(status == 'add') {
                embed.setTitle('Donation added')
            }
            else {
                embed.setTitle('Donation removed')
            }
            embed.setDescription([
                `Grinder : <@${target}> - (\`${target}\`)`,
                `Donation Added : ${added.toLocaleString()}`,
                `Total Donation : ${latest.toLocaleString()}`,
                `Manager : <@${user}> - (\`${user}\`)`
            ].join('\n'))
            client.channels.cache.get(logChan)?.send({ embeds : [embed] })
        }
        function isGrinder(id) {
            const file = editJsonFile(`${__dirname}/../../settings/grinders.json`);
            const grinders = file.get('list')
            if(grinders.includes(id)) {
                return true
            } else { return false; }
        }
        function genEmbed(length, perPage, content) {
            const embedList = [];
            const loop = Math.ceil(length / perPage);
            for(let i = 0 ; i < length ; i++) {
                const randomEmbed = new MessageEmbed();
                if(content[i].title) {
                    randomEmbed.setTitle(content[i].title);
                }
                if(content[i].description) {
                    randomEmbed.setDescription(content[i].description);
                }
                if(content[i].color) {
                    randomEmbed.setColor(content[i].color);
                }
                if(content[i].footer) {
                    randomEmbed.setFooter(content[i].footer);
                }
                if(content[i].author) {
                    randomEmbed.setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL({ dynamic : true }));
                }
                embedList.push(randomEmbed);
            }
            return embedList;
        }
        function niceList(list, perPage) {
            try {
                const list1 = [];
                const loop = Math.ceil(list.length / perPage);
                for(let i = 0 ; i < loop ; i++) {
                    const list2 = [];
                    for(let y = 0 ; y < perPage ; y++) {
                        const tempNum = list.shift();
                        if(tempNum) {
                            list2.push(tempNum);
                        }
                    }
                    list1.push(list2);
                }
                return list1;
            }
            catch (e) {
                console.log(e)
            }
            
        }
        async function handleLB(interaction, options, client) {
            const data = await grinder.find({}).sort({donation : -1})

            
            let list = []
            data.map((a,x) => {
                let c = {}
                c['position'] = (x+1)
                list.push({
                    position : c.position,
                    userId : a.userId,
                    donation : a.donation
                })
            })
            const list2 = niceList(list, 10);
            const list3 = []
            list2.map(a => list3.push({ description : a.map(b => `\`${b.position}\`. <@${b.userId}> - (\`${b.userId}\`) : ${b.donation.toLocaleString()}`).join('\n'), color : 'RANDOM', title : '`🌺`Grinder Leaderboard'  }) )
            const list4 = genEmbed(list3.length, list3.length, list3)
            
            const embed = new ButtonEmbeds({
                pages: list4,
                timeout: 60000,
                disableAtEnd: true,
                userID: interaction.user.id,
            });

            return embed.reply(interaction, false);
        }
        function isManager(id) {
            if(manager.includes(id)) {
                return true
            } else { return false; }
        }
        function duration(time) {
            if(time > Date.now()) {
                return `Next payment : **<t:${Math.floor(time/1000)}:R>**`
            }
            else {
                return `Next payment : **NOW** (Last sent : <t:${Math.floor(time/1000)}:R>)`
            }
        }
        async function handleClaim(interaction, options, client) {
            await interaction.deferReply({ })
            const user = options.get('user').user

            if(!isGrinder(user.id)){
                return interaction.editReply({ content : `${user.tag} is not a grinder` })
            }
            let foundUser = await grinder.findOne({ userId : user.id })
            if(!foundUser) {
                foundUser = new grinder({
                    userId : user.id,
                    'manager.user' : interaction.user.id,
                    nextdono : Date.now(),
                })
            }
            else if(foundUser.manager.user) {
                return interaction.editReply({ content : `Error ! ${user.tag} is adopted by <@${foundUser.manager.user}>` })
            }
            else if(user.id == interaction.user.id) {
                return interaction.editReply({ content : `You cant adopt urself. dumb.` })
            }
            else {
                let foundManager = await grinder.findOne({ userId : interaction.user.id })
                if(!foundManager) {
                    foundManager = new grinder({
                        userId : interaction.user.id,
                        'manager.status' : true
                    })
                    await foundManager.save()
                }
                foundManager.manager.sent = foundManager.manager.sent + foundUser.donation
                await foundManager.save()

                foundUser.manager.user = interaction.user.id
            }
            await foundUser.save()
            interaction.editReply({ content : `u have adopted ${user.tag} !` })
        }
        async function handleProfile(interaction, options, client) {
            await interaction.deferReply({ })
            const user = options.get('user')?.user || interaction.user
            const data = editJsonFile(`${__dirname}/../../settings/grinders.json`).data;
            if(!isManager(interaction.user.id) && isManager(user.id)) {
                return interaction.editReply({ content : 'You do not have permission to view a manager profile' })
            }
            if(!isGrinder(user.id) && !isManager(user.id)) {
                return interaction.editReply({ content : 'You can only view a grinder profile' })
            }
            if(!isManager(user.id)) {
                let foundUser = await grinder.findOne({ userId : user.id })
                if(!foundUser) {
                    foundUser = new grinder({
                        userId : user.id,
                    })
                }
                await foundUser.save()

                const embed = new MessageEmbed().setTitle('Grinder Profile').setColor(ee.embed_color).setDescription(`You must send **1,000,000** (1 mil) daily\nYou **MUST** send it to <@${data.storage.id}>: ${data.storage.tag} \nFor advance payment you are not allowed to send more than **${data.amount.toLocaleString()}** or it will **not be counted** !`)
                // if(foundUser.manager.user) {
                //     embed.addField('Parents :', `<@${foundUser.manager.user}> - (\`${foundUser.manager.user}\`)`)
                // }
                // else {
                //     embed.addField('Parents :', `no parents... Ask a manager to adopt u!`)
                // }
                embed.addField('Payment', duration(foundUser.nextdono))
                embed.addField('Amount donated', `${foundUser.donation.toLocaleString()}`)
                return interaction.editReply({ embeds : [embed] })
            }
            else {
                let child = await grinder.find({ 'manager.user' : user.id })

                const embed = new MessageEmbed().setTitle('Manager Profile').setColor(ee.embed_color)
                let list = []
                if(child.length) {
                    let foundManager = await grinder.findOne({ userId : user.id })
                    if(!foundManager) {
                        foundManager = new grinder({
                            userId : user.id,
                            'manager.status' : true
                        })
                        await foundManager.save()
                    }
                    const totalAmount = child.reduce((a, b) => a + b.donation, 0)
                    const survivedChild = []
                    child.filter(a => a.manager.demoted == false).map((a,x) => {
                        survivedChild.push(`\`${x+1}\`. <@${a.userId}> - (\`${a.userId}\`) : ${duration(a.nextdono)}`)
                    })
                    list.push(`Total donation received : ${totalAmount.toLocaleString()}\n`)
                    list.push(`Amount sent to abC : ${(foundManager.manager.sent).toLocaleString()}\n`)
                    list.push(`Amount left : ${(totalAmount - foundManager.manager.sent).toLocaleString()}\n`)
                    list = [...list, ...survivedChild]
                }
                else {
                    list = ['No child']
                }
                const list2 = niceList(list, 10);
                const list3 = []
                list2.map(a => list3.push({ description : a.join('\n'), color : 'RANDOM', title : '`🌺`Manager Profile'  }) )
                const list4 = genEmbed(list3.length, list3.length, list3)
                
                const embedd = new ButtonEmbeds({
                    pages: list4,
                    timeout: 60000,
                    disableAtEnd: true,
                    userID: interaction.user.id,
                });
    
                return embedd.reply(interaction, false, false);
                return interaction.editReply({ embeds : [embed] })
            }

            
        }



    },
};
