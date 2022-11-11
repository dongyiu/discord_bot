/* eslint-disable */
const { Permissions, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, Util, WebhookClient } = require('discord.js');

module.exports = class trading {
    
    constructor(options) {
        if(!options) throw new Error('ERRoR!');
        // if(!options.url) throw new Error('Missing webhook url');

        this.url = options.url || '';
        this.requestList = [];
        this.counter = 0;
        this.hook = options.hook || new WebhookClient({ url : this.url });
        this.time = Number(options.time) || 1000
    }

    start() {
        setInterval(() => {
            if(this.requestList.length) {
                const content = this.requestList.shift()
                this.hook.send(content)
            }
        }, this.time);
    }

    queue(content) {
        this.requestList.push(content);
    }

    
}
