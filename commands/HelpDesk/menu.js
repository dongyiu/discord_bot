const { Message, Client, MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = {
    name: "menu",
    aliases: ['m'],
    permissions : ["SEND_MESSAGES"],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if(message.author.id != "422967413295022080") return;

        const msgContent = 
        [
            "1. **Making a Report/If You Got Scammed**",
            "`-` If you were **scammed/abused** or need to make a report for any reason. If you're reporting someone bypassing atlas or another minor trade violation use **option 9**. ",
            "",
            "2. **Why Can't I access the Fight/Trade/Auction Channels**:",
            "`-` If you're having trouble accessing certain channels in the server.",
            "",
            "3. **Appealing a Warn/Mute/Blacklist Role:**",
            "`-` If you have been warned, muted, or have one of the blacklist roles(<@&721982346148184127>, <@&761540775523123220>, <@&752263653495144538>,or <@&814921940703772682>) and would like to get unmuted or the warn/roles removed. ",
            "",
            "4. **Redeeming Perks:**",
            "`-` If you need assistance redeeming any of the perks in <#730577159328104578> for boosting, investing, or donating.",
            "",
            "5. **Partnerships :**",
            "`-` If you're interested in partnering with our server.",
            "",
            "6. **Dank Memer Questions/Issues:**",
            "`-` If you have questions/concerns about dank memer bot or the community server.",
            "",
            "7. **Prestige or Box Opening Access:**", 
            "`-` If you need access to <#736510577849139240> to open a god box or <#768315721943220224> to prestige.",
            "",
            "8. **Vouching, Kano, and the <@&720909252792942633> Role:**",
            "`-` For any questions regarding how vouching, kano, or the <@&720909252792942633>/<#723966215000948767>",
            "",
            "9. **Report Minor Trade Violations/Atlas Bypass:**",
            "`-` If you need to make a report about someone posting ads in the wrong channel or other misuse of the trading channels.",
            "",
            "10. **General Support Inquiries:**",
            "`-` If you need general help for anything not listed above.",
        ].join('\n');

        const menus = new MessageActionRow().addComponents(
            new MessageSelectMenu()
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder('Select a number')
            .setCustomId("HELP DESK")
            .setOptions(
                {
                    value : '1',
                    label : 'Making a Report/If You Got Scammed',
                    emoji : '<:dt_1:856033106787827722>',
                },
                {
                    value : '2',
                    label : "Why Can't I access the Fight/Trade/Auction Channels",
                    emoji : '<:dt_2:856033128732557342>'
                },
                {
                    value : '3',
                    label : "Appealing a Warn/Mute/Blacklist Role",
                    emoji : '<:dt_3:856033143505289236>'
                },
                {
                    value : '4',
                    label : "Redeeming Perks",
                    emoji : '<:dt_4:856033155461677056>'
                },
                {
                    value : '5',
                    label : "Partnerships",
                    emoji : '<:dt_5:856033172034158602>'
                },
                {
                    value : '6',
                    label : "Dank Memer Questions/Issues",
                    emoji : '<:dt_6:856033186182332436>'
                },
                {
                    value : '7',
                    label : "Prestige or Box Opening Access",
                    emoji : '<:dt_7:856033202468028416>'
                },
                {
                    value : '8',
                    label : "Vouching, Kano, and the @・trusted trader Role",
                    emoji : '<:dt_8:856033217664778240>'
                },
                {
                    value : '9',
                    label : "Report Minor Trade Violations/Atlas Bypass",
                    emoji : '<:dt_9:856033231031107595>'
                },
                {
                    value : '10',
                    label : "General Support Inquiries",
                    emoji : '<:dt_10:856033246441111572>'
                },
                
            )
        )

        return message.channel.send(
            {
                content : msgContent,
                components : [menus],
                allowedMentions : 
                {
                    parse : []
                }
            }
        );
    },
};
