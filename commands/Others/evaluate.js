const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Collection } = require('discord.js');
const {create} = require("sourcebin");
const grinder = require('../../db/grinds')
const app = require('../../db/apps')
const blacklist = require('../../db/blacklist')
const editJsonFile = require("edit-json-file");
const curr = require('../../utils/currency')
const pretty = require('humanize-duration')

module.exports = {
	name: 'evaluate',
	args: true,
	aliases: ['ev','eval'],
    run: async (client, message, args) => {

    if(message.author.id != "422967413295022080")return;
        
    let content = "```js\n" + args.join(" ")+ "```"
    const prefix = "m??"

    if(content.length > 1024){
        let source = await create([
            {
                name : `${message.author.username} code`,
                content : content,
                language : "javascript",
            },
        ])
        content = source.url
    }

    const embed = new MessageEmbed()
    .addField("Your Code",content )

    try {
        const code = args.join(" ");

        if(!code){
            return message.reply(`${prefix}eval <code>`)
        }

        let evaled;
        if(code.includes("SECRET") || code.includes("TOKEN") || code.includes('process.env')){

            evaled = "shutup"
        }else{
            evaled = await eval(code);
        }

        if(typeof evaled !== "string") evaled = require("util").inspect(evaled, {
            depth : 0,
        });

        let result = clean(evaled);

        if(!isNaN(result) && result.toString().includes("--math")){
            result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        if(result.length > 1024){
            let source = await create([
                {
                    name : `${message.author.username} code`,
                    content : result,
                    language : "javascript",
                },
            ])
            
            embed.addField("Result", source.url).setColor("RANDOM");
        }else{
            embed.addField("Result", "```js\n" + result + "```").setColor("RANDOM");
        }
        return message.reply({embeds: [embed]});
    } catch (error) {
        console.log(error)
        let err = clean(error);
        if(err.length > 1024){
            let source = await create([
                {
                    name : `${message.author.username} code`,
                    content : err,
                    language : "javascript",
                },
            ])

            embed.addField("Result", source.url).setColor("RANDOM");
        }else{
            embed.addField("Result", "```js\n" + err + "```").setColor("RANDOM");
        }
        return message.reply({embeds: [embed]});
    }
    function clean(text) {
        if (typeof(text) === "string")
          return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }

    async function sent(amount, userId) {
        if(typeof amount != 'number') {
            throw new Error('Amount must be a number')
        }
        else {
            const foundUser = await grinder.findOne({ userId })
            if(!foundUser || !foundUser.manager.status) {
                throw new Error('Not a manager !')
            }
            foundUser.manager.sent = foundUser.manager.sent + Number(amount)
            await foundUser.save()
            return foundUser.manager.sent
        }
    }

    function timeZone() {
        let list1 = [0.00,1.00,2.00,3.00,3.30,4.00,5.00,6.00,7.00,8.00,9.00,9.30,10.00,11.00,12.00]
        let list2 = [-1.00,-3.00,-3.30,-4.00,-5.00,-6.00,-7.00,-8.00,-9.00,-10.00,-11.00]
        const options1 = []
        const options2 = []

        list1.map(a => {
            options1.push({ label : `GMT +${a.toFixed(2).toString().replace('.', ':')}`, value : a.toString() })
        })
        list2.map(a => {
            options2.push({ label : `GMT ${a.toFixed(2).toString().replace('.', ':')}`, value : a.toString() })
        })
        const menu = new MessageActionRow().addComponents(
            new MessageSelectMenu().setPlaceholder('Select your timezone')
            .setMinValues(1).setMaxValues(1).setCustomId('list1').setOptions(options1),
        )
        const menu1 = new MessageActionRow().addComponents(
            new MessageSelectMenu().setPlaceholder('Select your timezone')
            .setMinValues(1).setMaxValues(1).setCustomId('list2').setOptions(options2),
        )

        function genCon() {
            const file = editJsonFile(`${__dirname}/../../settings/tmod.json`);
            Object.keys(file.data).filter(a => a.toLowerCase().startsWith('g')).map(a => file.set(a, null))
            file.save()
            const userList = Object.keys(file.data).filter(a => !a.toLowerCase().startsWith('g'))
            userList.map(a => {
                const abc = file.get(`${file.data[a]}`)
                if(abc) {
                    abc.push(a)
                    file.set(`${file.data[a]}`, abc)
                }
                else {
                    file.set(`${file.data[a]}`, [a])
                }
            })
            file.save()
            const timezoneList = Object.keys(file.data).filter(a => a.toLowerCase().startsWith('g') && file.data[a]!= null)
            return timezoneList.map(a => `**${a}** (\`${file.data[a].length}\`)\n${file.data[a].map(a => correctId(a, message) || a).join(' ')}\n\n`).toString().replace(/,/g, '')
        }
        
        return message.channel.send({ content : `__Select ur timezones below :__ \n\n${genCon()}`, components : [menu, menu1] })

    }

    function remove(userId) {
        const file = editJsonFile(`${__dirname}/../../settings/tmod.json`);
        file.unset(userId)
        file.save()
        return `removed ${userId}` 
    }
    function correctId(target, message) {
        return message.guild.members.cache.filter(a => a.user.id.slice(0,15) == target.slice(0,15) ).first()?.user.id
    }
    async function editAmount(userId, amount) {
        if(!Number(amount)) throw new Error(`${amount} is not a number`)
        const data = await grinder.findOne({ userId })
        if(!data) throw new Error(`${userId} not found`)
        data.donation = data.donation + amount
        await data.save()
        return data
    }
        

  }



};
