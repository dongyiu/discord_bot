/* eslint-disable */
const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = class abC {
    
    constructor(options) {
        if(!options) throw new Error('ERRoR!');
        if(!options.user) throw new Error('Missing user');
        if(!options.pages) throw new Error('Missing pages');
        if(!options.starts) throw new Error('Missing starting page');

        this.user = options.user;
        this.timeout = options.timeout || 120 * 1000;
        this.starts = options.starts;
        this.pages = options.pages;
        this.currentPage = options.currentPage || 0;
        this.currentMessage = null;
    }

    getButton(disable = false) {
        const buttons = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('home').setEmoji('doubleleft:875443385308151831').setStyle('SECONDARY').setDisabled(disable),
            new MessageButton().setCustomId('left').setEmoji('left:875443450080817172').setStyle('SECONDARY').setDisabled(disable),
            new MessageButton().setCustomId('cross').setLabel(`${this.currentPage + 1}/${this.starts.embeds.length}`).setStyle('DANGER').setDisabled(disable),
            new MessageButton().setCustomId('right').setEmoji('right:875443466644095036').setStyle('SECONDARY').setDisabled(disable),
            new MessageButton().setCustomId('last').setEmoji('doubleright:875443494259421184').setStyle('SECONDARY').setDisabled(disable),
        )
        return buttons
    }
    
    getMenu(disable = false) {
        const option = []
        this.pages.map(a => {
            option.push({
                value : a.name,
                label : a.name
            })
        })
        const menu = new MessageActionRow().addComponents(
            new MessageSelectMenu().setDisabled(disable).setMaxValues(1).setMinValues(1)
            .setPlaceholder('Select an option').setOptions(option).setCustomId('menu')
        )
        return menu
    }

    first() {
        this.currentPage = 0
        return this.currentPage
    }

    last() {
        this.currentPage = this.starts.embeds.length - 1
        return this.currentPage
    }

    left() {
        this.currentPage = this.currentPage <= 0 ? this.first() : this.currentPage - 1
    }

    right () {
        this.currentPage = this.currentPage >= (this.starts.embeds.length - 1)  ? this.last() : this.currentPage + 1
    }

    editMsg() {
        if(this.currentMessage.deleted) return
        // console.log(this.newMsg())
        this.currentMessage.edit({ components : [this.getButton(), this.getMenu()], embeds : this.newMsg() })
    }
   
    newMsg() {
        const msg = this.starts.embeds[this.currentPage]
        return msg
    }

    editPage(value) {
        //console.log(this.starts)
        this.starts = this.pages.get(value)
        this.currentPage = 0
        //console.log(this.starts)
    }
    
    async send(channel) {
        const button = this.getButton()

        const msg = await channel.send({ content : '\u200B', embeds : this.newMsg(), components : [button, this.getMenu()] })
        this.currentMessage = msg

        const collector = await msg.createMessageComponentCollector({  idle: this.timeout });

        collector.on('collect', async i => {
            await i.deferUpdate();
            if(i.user.id != this.user) {
                return i.followUp({
                    ephemeral : true,
                    content : 'This is not for u!'
                })
            }
            const command = i.customId
            if(command == 'last') {
                this.last()
                this.editMsg()
            }
            else if(command == 'home') {
                this.first()
                this.editMsg()            
            }
            else if(command == 'left') {
                this.left()
                this.editMsg()            
            }
            else if(command == 'right') {
                this.right()
                this.editMsg()            
            }
            else if(command == 'menu') {
                const choice = i.values.toString()
                this.editPage(choice)
                this.editMsg()   
            }
            else if(command == 'cross') {
                try {
                    if(this.currentMessage.deleted) return
                    this.currentMessage.delete()
                }
                catch(e) {  }
            }
        });

        collector.on('end', async collected => {
            // if (collected.size == 0) {
            //     msg.edit({ content: `This message is no longer active` })
            // }
            msg.edit({ content: `This message is no longer active`, components : [this.getButton(true), this.getMenu(true)] })
        });
    }
    
    delete() {
        if(this.currentMessage.deleted) return
        this.currentMessage.delete()
    }
    
    end() {
        this.currentMessage.edit
    }
}
