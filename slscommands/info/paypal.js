const { CommandInteraction, Client, Constants, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const config = require('../../settings/tradeConfig')
const buySchema = require('../../db/buys')
const sellSchema = require('../../db/sells')
const ee = require('../../settings/embed.json')
const similar = require('string-similarity')
const ButtonEmbeds = require('../../utils/ButtonEmbeds')
const pretty = require('humanize-duration')
const mm = require('../../settings/middleman')
const mmS = require('../../db/middlemans')
const idkWhatIsThis = require('../../settings/config').status

module.exports = {
    name: "paypal",
    description: "check paypal money value for 2 years special",
    options: [
        {
          name: 'amount',
          type: Constants.ApplicationCommandOptionTypes.NUMBER,
          description: 'enter an amount',
          required : true,
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
        await interaction.deferReply({ ephemeral : true })
        const amount = options.get('amount').value

        const total =  calc(amount)
        interaction.editReply({ content : `**${amount}** will be counted as **${total}**` })

        function handleTwenty(num) {
            if(num < 20) return { current : 0, remainder : num } 
            let count1 = (Math.floor(num / 20) * 7);
            const remainder1 = num % 20;
            count1 = (num - remainder1) + count1;
            return { current : count1, remainder : remainder1 }
        }
        
        function handleTen(num) {
            if(num < 10) return { current : 0, remainder : num } 
            let count1 = (Math.floor(num / 10) * 3);
            const remainder1 = num % 10;
            count1 = (num - remainder1) + count1;
            return { current : count1, remainder : remainder1 }
        }
        
        function handleFive(num) {
            if(num < 5) return { current : 0, remainder : num } 
            let count1 = (Math.floor(num / 5) * 1);
            const remainder1 = num % 5;
            count1 = (num - remainder1) + count1;
            return { current : count1, remainder : remainder1 }
        }
        
        function calc(num) {
            const current = handleTwenty(num)
            if(current.remainder == 0) {
                return current.current
            }
            const current2 = handleTen(current.remainder)
            if(current2.remainder == 0) {
                return current2.current + current.current
            }
            const current3 = handleTen(current2.remainder)
            if(current3.remainder == 0) {
                return current3.current + current2.current + current.current
            }
            else {
                return current3.current + current2.current + current.current + current3.remainder
            }
        
        }
    },
};
