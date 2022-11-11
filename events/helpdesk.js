const { MessageEmbed, WebhookClient, MessageActionRow, MessageButton } = require("discord.js");
const client = require("../trade");
var config = require("../settings/config.js");
var ee = require("../settings/embed.json");

client.on('interactionCreate', async interaction => {
    let bled = ['749126083416162375', '858439150478032896']
    if(bled.includes(interaction.user.id))return
    // Slash Command Handling
    if (interaction.isCommand()) return

    // Context Menu Handling
    if (interaction.isContextMenu()) return

    try {
        if(interaction.customId == 'HELP DESK') {
            const options = interaction.values.toString();
    
            const url = 'https://discord.com/api/webhooks/902856377075130408/Y-G5Uu-epPH99CHh4w3nskQsYD0N5L-x8o1r-VhbjOpr51_Tf83x3zZ4VL8NoF9PAkQA';
            const hook = new WebhookClient( { url : url });
            hook.send({
                embeds : [
                    new MessageEmbed().setTitle('Support logs')
                    .addField('User :',  `${interaction.user} - (\`${interaction.user.id}\`)`)
                    .addField('Option :', `${options}`)
                    .setThumbnail(interaction.user.avatarURL())
                    .setColor(ee.embed_color)
                    .setAuthor(interaction.user.username, interaction.user.avatarURL())
                ],
                username : `${client.abc?.username}`,
                avatarURL : client.abc?.avatarURL(),
                allowedMentions: {users: [], roles : []}
            }).catch(e => console.log(e))
    
            if(options == '1') {
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription('Please dm <@902548692379254785> `@Trades mail#4893` with proof')
                        ],
                        ephemeral : true
                    }
                );
            }else if(options == '2') {
                const msgContent = "**Make Sure You're Verified:**\n" +
                "If you aren't verified head over to <#801300689312546816> and do so.\n" +
                '**Blacklist Roles:**\n' +
                "**・events blacklist** - If you have this role you won't be able to see heist, giveaway, or event channels.\n" +
                "**・auctions blacklist** - If you have this role you won't be able to access auction channels or participate in auctions.\n" +
                "**・can't trade** - If you have this role you won't be able to trade(`​pls gift`​ and `​pls share`​ disabled) or access trade channels and fighting/dueling channels.\n" +
                "**・dank blacklist** - If you have this role you won't be able to run dank memer commands or view dank memer channels.\n" +
                'For more information regarding blacklisted role and how to get them removed, head back to <#841405788894527548> and select option `​3`​.\n' +
                '**Channel With Level Requirements:**\n' +
                '`​-`​ You must be level 3+ to access the fight/duel channels due to scams. If you are level 3+ you can gain access by reacting in <#814599063273865286>.\n' +
                '`​-`​ You can gain access to auctions by reacting in <#730829517555236864>. You must be level 5+ to access <#782483247619112991> and to be able to request an auction for your own items.'
    
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
    
            }else if(options == '3') {
                const msgContent = '**Warns/Mutes**\n' +
                "You get warned/muted or given blacklisted roles for breaking server rules. Warns/mutes aren't removed unless they are falsified. If you think you were warned unjustly mention the reason of the warn and your explanation of why it should be removed.\n" +
                '\n' +
                '<@&721982346148184127> - This role is given mainly for declining using middleman during a trade or trying to trade/fight for items/coins which you dont have. To get the role removed you have to either complete a trade of equal value or more with another user in the support channel using middleman or show that you have the items or coins which you posted an ad for/tried to trade. This role can also be given for scamming in another server. In this case it will only be removed if you repay the items/coins that you scammed.\n' +
                '\n' +
                '<@&761540775523123220>/<@&752263653495144538> - If you have only one of the blacklisted roles: Run the cmd `​-myn`​ to check the reason of your blacklist. If you think you were falsely given the role then DM <@!902548692379254785> and explain the reason. These blacklisted roles are generally temporary so it wont be removed/shortened even if you apologize.\n' +
                '\n' +
                'If you have all the three blacklisted roles:\n' +
                'All three roles are only given if:\n' +
                "1. If you owe a user dmc/items and you're given time to pay back\n" +
                "Can be removed after you've paid your debts.\n" +
                '2. Usage of blacklisted words/slurs.\n' +
                'Non-appealable, you need to wait the duration of your blacklist.\n' +
                '\n' +
                "<@&814921940703772682> - This role is only given if you are an alternate account. Can only be removed if you successfully prove that you aren't an alt. else it will stay permanently. If you wish to appeal DM you explanation to <@!902548692379254785>."
    
                  interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
    
            }else if(options == '4') {
                const msgContent = 'Run the command `/claim perks` in <#726008784492953652>';
    
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
            }else if(options == '5') {
                const msgContent = [
                    '__**Partnerships/Heist Partnerships:**__',
                    'Read <#741757629025746964> for partnership info',
                    "Our heist partnerships are currently closed, please refrain for dm'ing staff for heist partnerships ",
                    '',
                    '- Server less than 6k members',
                    '- Dm any <@&742666772309868584>',
                    '- Server less than 10k members',
                    '- Dm any <@&857274783669288982>',
                    '- Server less than 20k members',
                    '- Dm <@!422967413295022080>',
                    '- Server above 20k members',
                    '- Dm <@!422967413295022080>',
                    '',
                    '',
                    '> make sure to read the rules before dming any of the partnership manager above. Minimum member count is 200. Please refrain from contacting any partnership manager if your server has less than 200 members'
                  ].join('\n');
    
                  interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
            }else if(options == '6') {
                const msgContent = [
                    'For **Dank Memer** related questions/issues please ask at : https://discord.gg/meme',
                    '',
                    'You can join the above server for the doing the following - ',
                    '1. Reporting a user for breaking [bot rules](https://dankmemer.lol/rules)',
                    '2. Asking general questions **Related to bot**',
                    '3. Appealing a ban on community server, temporary/permanent bot ban or blacklist',
                    '4. Help with setting up the bot , patreon and bugs.',
                    'Community Link - https://discord.gg/memers',
                    '',
                    "If you're either banned from one/both the above mentioned servers - ",
                    'Appeal at - https://dankmemer.lol/appeals ',
                    '',
                    "**We're not a bot support server so we can't do anything besides the above mentioned steps**"
                  ].join('\n');
    
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
            }else if(options == '7') {
                const msgContent = [
                    'Please Choose From the Following Options:',
                    '1. Prestige Access - access to <#768315721943220224> so that you can prestige',
                    '2. Box Opening - access to <#736510577849139240> so you can open sbags or god boxes',
                ].join('\n');
    
                const selectButtons = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId("BOX").setEmoji('🎁').setStyle(1).setLabel('box-unboxings'),
                    new MessageButton().setCustomId("FROG").setEmoji('🐸').setStyle(1).setLabel('prestige'),
                )
    
                const selectButtonsDisabled = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId("BOX").setEmoji('🎁').setStyle(1).setLabel('box-unboxings').setDisabled(true),
                    new MessageButton().setCustomId("FROG").setEmoji('🐸').setStyle(1).setLabel('prestige').setDisabled(true),
                )
                
                await interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        components : [selectButtons],
                        ephemeral : true
                    }
                );
    
                setTimeout(async () => {
                    await interaction.editReply(
                        {
                            embeds : 
                            [
                                new MessageEmbed()
                                .setAuthor(interaction.user.username, interaction.user.avatarURL())
                                .setColor(ee.embed_color)
                                .setDescription(msgContent)
                            ],
                            components : [selectButtonsDisabled],
                            ephemeral : true
                        }
                    );
                }, 5000);
                
            }else if(options == '8') {
                const msgContent = '౨ৎ ,,  __**The Vouch System**__︵\n' +
                '  ・whenever, you successfully complete a trade with another user you may request the other user to vouch for you. \n' +
                '  ・you can vouch for someone else by heading over <#789750070072311818> to and follow the instructions in the pinned messages.\n' +
                '  ・You can check your vouches by running the command `​=vouch `​,`​ =v`​ in any bot channel.\n' +
                '  ・Falsifying your vouches , faking trades to inflate your vouches or any other misdeeds related to vouches may result in you losing access to trade channels and getting a vouch blacklist.\n' +
                '\n' +
                ' ౨ৎ ,, __**How to get trusted trader**__︵\n' +
                '  ・ reach level 10 on the amari bot (check your level by typing`​ >r`​ in any bot channel)\n' +
                '  ・ read 60 vouches (check your vouches by running `​=v`​ in any bot channel)\n' +
                '  ・If you meet these requirements go over to  and select 10 in <#902934558226399262> in to talk to a staff member and claim the role\n' +
                '\n' +
                '౨ৎ ,, __**Questions about kano**__︵\n' +
                '  ・If you have any questions about kano (our vouch and auction bot) refer to the invite link below \n' +
                '  ・Kano support server : https://discord.gg/FPfthHhDxY'
    
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
            }else if(options == '9') {
                const msgContent = 'Run the command `/report user` in <#726008784492953652>';
    
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
            }else if(options == '10') {
                const msgContent = 'I have given you access to <#757119537828069407>';
    
                await interaction.member.roles.add('841411515684880405')
    
                interaction.reply(
                    {
                        embeds : 
                        [
                            new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.avatarURL())
                            .setColor(ee.embed_color)
                            .setDescription(msgContent)
                        ],
                        ephemeral : true
                    }
                );
            }
            
        }
        if(interaction.customId == 'BOX') {
            await interaction.member.roles.add('780961957792317450')
            
            setTimeout(() => {
                interaction.member.roles.remove('780961957792317450')
            }, 4 * 60 * 1000);
    
            await interaction.reply(
                {
                    embeds : 
                    [
                        new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.avatarURL())
                        .setColor(ee.embed_color)
                        .setDescription('I have given you access to <#736510577849139240>')
                    ],
                    ephemeral : true
                }
            );
        }
    
        if(interaction.customId == 'FROG') {
            await interaction.member.roles.add('768315878121930773')
            
            setTimeout(() => {
                interaction.member.roles.remove('768315878121930773')
            }, 4 * 60 * 1000);
            await interaction.reply(
                {
                    embeds : 
                    [
                        new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.avatarURL())
                        .setColor(ee.embed_color)
                        .setDescription('I have given you access to <#768315721943220224>')
                    ],
                    ephemeral : true
                }
            );
        }
    } catch (error) {
        console.log(error)
        return interaction.reply(
            {
                content : 'An error occured',
                ephemeral : true,
            }
        )
    }
})

