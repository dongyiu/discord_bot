/* eslint-disable */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonPages = void 0;
const discord_js_1 = require("discord.js");
const paginationTypeList = ['description', 'field', 'both'];
class ButtonPages {
    constructor(options) {
        this.next = 'right:875443466644095036';
        this.previous = 'left:875443450080817172';
        this.remove = 'white_cross:875472863493238804';
        this.home = 'doubleleft:875443385308151831';
        this.last = 'doubleright:875443494259421184';
        this.currentPage = options.currentPage || 1;
        if (paginationTypeList.indexOf(options.paginationType) === -1) {
            throw new Error('An invalid pagination type has been passed. Valid pagination types: description, field, both.');
        }
        this.options = options;
        this.messageEmbed = new discord_js_1.MessageEmbed();
        this.setupPages(options);
        this.changePage();
        this.component = new discord_js_1.MessageActionRow()
        this.select = new discord_js_1.MessageSelectMenu()
    }
    setupPages(items) {
        return __awaiter(this, void 0, void 0, function* () {
            const colours = [...items.colours];
            const descriptions = items.descriptions ? [...items.descriptions] : undefined;
            const fields = items.fields ? [...items.fields] : undefined;
            const pages = [];
            while (colours.length > 0 || descriptions.length > 0 || (fields === null || fields === void 0 ? void 0 : fields.length) > 0) {
                let pageDescriptions;
                let pageFields;
                if (this.options.paginationType === 'field') {
                    if (!this.options.fields || this.options.fields.length === 0) {
                        throw new Error('No fields have been passed for field pagination. Unable to paginate.');
                    }
                    descriptions === null || descriptions === void 0 ? void 0 : descriptions.splice(0, descriptions === null || descriptions === void 0 ? void 0 : descriptions.length);
                    pageDescriptions = items.descriptions;
                    pageFields = fields.splice(0, this.options.itemsPerPage);
                }
                if (this.options.paginationType === 'description') {
                    if (!this.options.descriptions || this.options.descriptions.length === 0) {
                        throw new Error('No descriptions have been passed for description pagination. Unable to paginate.');
                    }
                    fields === null || fields === void 0 ? void 0 : fields.splice(0, fields === null || fields === void 0 ? void 0 : fields.length);
                    pageDescriptions = descriptions.splice(0, this.options.itemsPerPage);
                    pageFields = items.fields;
                }
                if (this.options.paginationType === 'both') {
                    if ((!this.options.descriptions || this.options.descriptions.length === 0) &&
                        (!this.options.fields || this.options.fields.length === 0)) {
                        throw new Error('No fields/descriptions have been passed for both pagination. Unable to paginate.');
                    }
                    pageDescriptions = descriptions === null || descriptions === void 0 ? void 0 : descriptions.splice(0, this.options.itemsPerPage);
                    pageFields = fields === null || fields === void 0 ? void 0 : fields.splice(0, this.options.itemsPerPage);
                }
                const page = {
                    colours: colours.length > 0 ? colours.splice(0, 1) : pages[pages.length - 1].colours,
                    descriptions: pageDescriptions,
                    fields: pageFields
                };
                pages.push(page);
            }
            this.pages = pages;
        });
    }
    changePage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.messageEmbed
                .setColor(this.pages[this.currentPage - 1].colours[0])
                .setFooter(`Page ${this.currentPage} of ${this.pages.length === 0 ? 1 : this.pages.length}`, this.options.footerImageURL);
            if (this.options.descriptions) {
                this.messageEmbed.setDescription(this.pages[this.currentPage - 1].descriptions.join('\n'));
            }
            if (this.options.fields) {
                this.messageEmbed.spliceFields(0, this.messageEmbed.fields.length, this.pages[this.currentPage - 1].fields);
            }
        });
    }
    setTitle(title) {
        this.messageEmbed.setTitle(title);
        return this;
    }
    setAuthor(name, iconURL, url) {
        this.messageEmbed.setAuthor(name, iconURL, url);
        return this;
    }
    setImage(url) {
        this.messageEmbed.setImage(url);
        return this;
    }
    setThumbnail(url) {
        this.messageEmbed.setThumbnail(url);
        return this;
    }
    setTimestamp(timestamp) {
        this.messageEmbed.setTimestamp(timestamp);
        return this;
    }
    setURL(url) {
        this.messageEmbed.setURL(url);
        return this;
    }
    addMenu(menu){
        this.component.addComponents(
            menu
        );
        return this;
    }
    send(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let homeBtn;
            let lastBtn;
            let removeBtn = new discord_js_1.MessageButton()
                .setCustomId(this.remove)
                .setEmoji(this.remove)
                .setStyle("DANGER");
            if (this.options.includeHome === true) {
                homeBtn = new discord_js_1.MessageButton()
                    .setCustomId(this.home)
                    .setEmoji(this.home)
                    .setStyle("SECONDARY");
            }
            if (this.options.includeLast === true) {
                lastBtn = new discord_js_1.MessageButton()
                    .setCustomId(this.last)
                    // .setLabel('Last')
                    .setEmoji(this.last)
                    .setStyle("SECONDARY");
            }
            let leftBtn = new discord_js_1.MessageButton()
                .setCustomId(this.previous)
                .setEmoji(this.previous)
                .setStyle("SECONDARY");
            let rightBtn = new discord_js_1.MessageButton()
                .setCustomId(this.next)
                .setEmoji(this.next)
                .setStyle("SECONDARY");
            if (this.pages.length === 1) {
                leftBtn.setDisabled(true);
                rightBtn.setDisabled(true);
                if (this.options.includeHome === true) {
                    homeBtn.setDisabled(true);
                }
                if (this.options.includeLast === true) {
                    lastBtn.setDisabled(true)
                }
            }

            const btnArray = [leftBtn, rightBtn, removeBtn]
            if(this.options.includeHome) {
                btnArray.splice(0, 0, homeBtn);
            }
            if(this.options.includeLast) {
                btnArray.splice(-1, 0, lastBtn);
            }
            const msg = yield channel.send({ content: message, embeds: [this.messageEmbed], components: [  { type: 1, components: btnArray } ] });

            const collector = msg.createMessageComponentCollector({filter: (button) => (button.customId === this.next || button.customId === this.previous || button.customId === this.home || button.customId === this.remove || button.customId === this.last) && button.user.id === this.options.userID,  idle: this.options.duration });
            collector.on('collect', (button) => __awaiter(this, void 0, void 0, function* () {
                button.deferUpdate();
                if (button.customId === this.remove) {
                    collector.stop("DELETE");
                    return;
                }
                if (this.pages.length < 2) {
                    this.currentPage = 1;
                    yield this.changePage();
                    !(yield msg.deleted) ? yield msg.edit({ embeds: [this.messageEmbed], components: [ { type: 1, components: btnArray } ] }) : null;
                }
                const action = button.customId;
                switch (action) {
                    case this.next:
                        this.currentPage === this.pages.length ? (this.currentPage = 1) : this.currentPage++;
                        break;
                    case this.previous:
                        this.currentPage === 1 ? (this.currentPage = this.pages.length) : this.currentPage--;
                        break;
                    case this.home:
                        this.currentPage = 1;
                        break;
                    case this.last:
                        this.currentPage = this.pages.length;
                        break;
                }
                yield this.changePage();
                !(yield msg.deleted) ? yield msg.edit({ embeds: [this.messageEmbed], components: [ { type: 1, components: btnArray } ] }) : null;
            }));
            collector.on("end", (collected, reason) => __awaiter(this, void 0, void 0, function* () {
                if (reason != "DELETE") {
                    for (const btn of btnArray) {
                        btn.setDisabled(true);
                    }
                    // if (this.options.includeHome === true) {
                    //     homeBtn.setDisabled(true);
                    // }
                    // leftBtn.setDisabled(true);
                    // rightBtn.setDisabled(true);
                    // removeBtn.setDisabled(true);
                    !(yield msg.deleted) ? yield msg.edit({ embeds: [this.messageEmbed], components: [ { type: 1, components: btnArray } ] }) : null;
                }
                if (reason == "DELETE")
                    !(yield msg.deleted) ? yield msg.delete() : null;
            }));
        });
    }
    reply(member, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let homeBtn;
            let lastBtn;
            let removeBtn = new discord_js_1.MessageButton()
                .setCustomId(this.remove)
                .setEmoji(this.remove)
                .setStyle("DANGER");
            if (this.options.includeHome === true) {
                homeBtn = new discord_js_1.MessageButton()
                    .setCustomId(this.home)
                    .setEmoji(this.home)
                    .setStyle("SECONDARY");
            }
            if (this.options.includeLast === true) {
                lastBtn = new discord_js_1.MessageButton()
                    .setCustomId(this.last)
                    // .setLabel('Last')
                    .setEmoji(this.last)
                    .setStyle("SECONDARY");
            }
            let leftBtn = new discord_js_1.MessageButton()
                .setCustomId(this.previous)
                .setEmoji(this.previous)
                .setStyle("SECONDARY");
            let rightBtn = new discord_js_1.MessageButton()
                .setCustomId(this.next)
                .setEmoji(this.next)
                .setStyle("SECONDARY");
            if (this.pages.length === 1) {
                leftBtn.setDisabled(true);
                rightBtn.setDisabled(true);
                if (this.options.includeHome === true) {
                    homeBtn.setDisabled(true);
                }
                if (this.options.includeLast === true) {
                    lastBtn.setDisabled(true)
                }
            }

            const btnArray = [leftBtn, rightBtn, removeBtn]
            if(this.options.includeHome) {
                btnArray.splice(0, 0, homeBtn);
            }
            if(this.options.includeLast) {
                btnArray.splice(-1, 0, lastBtn);
            }
            yield this.changePage();
            let components;
            if(!this.component.components.length){
                components = [{ type: 1, components: btnArray } ]
            }else{
                components = [ this.component ,{ type: 1, components: btnArray } ]
            }
            const msg = yield member.reply({ content: message, embeds: [this.messageEmbed], components });

            const collector = msg.createMessageComponentCollector({filter: (button) => (button.customId === this.next || button.customId === this.previous || button.customId === this.home || button.customId === this.remove || button.customId === this.last) && button.user.id === this.options.userID,  idle: this.options.duration });
            collector.on('collect', (button) => __awaiter(this, void 0, void 0, function* () {
                button.deferUpdate();
                if (button.customId === this.remove) {
                    collector.stop("DELETE");
                    return;
                }
                if (this.pages.length < 2) {
                    this.currentPage = 1;
                    yield this.changePage();
                    !(yield msg.deleted) ? yield msg.edit({ embeds: [this.messageEmbed], components: [ { type: 1, components: btnArray } ] }) : null;
                }
                const action = button.customId;
                switch (action) {
                    case this.next:
                        this.currentPage === this.pages.length ? (this.currentPage = 1) : this.currentPage++;
                        break;
                    case this.previous:
                        this.currentPage === 1 ? (this.currentPage = this.pages.length) : this.currentPage--;
                        break;
                    case this.home:
                        this.currentPage = 1;
                        break;
                    case this.last:
                        this.currentPage = this.pages.length;
                        break;
                }
                yield this.changePage();
                !(yield msg.deleted) ? yield msg.edit({ embeds: [this.messageEmbed], components: [ { type: 1, components: btnArray } ] }) : null;
            }));
            collector.on("end", (collected, reason) => __awaiter(this, void 0, void 0, function* () {
                if (reason != "DELETE") {
                    for (const btn of btnArray) {
                        btn.setDisabled(true);
                    }
                    // if (this.options.includeHome === true) {
                    //     homeBtn.setDisabled(true);
                    // }
                    // leftBtn.setDisabled(true);
                    // rightBtn.setDisabled(true);
                    // removeBtn.setDisabled(true);
                    !(yield msg.deleted) ? yield msg.edit({ embeds: [this.messageEmbed], components: [ { type: 1, components: btnArray } ] }) : null;
                }
                if (reason == "DELETE")
                    !(yield msg.deleted) ? yield msg.delete() : null;
            }));
        });
    }

}
exports.ButtonPages = ButtonPages;