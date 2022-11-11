/* eslint-disable */
const { MessageEmbed, MessageButton } = require("discord.js");

const defaultOptions = {
  userID: null,
  pages: [],
  remove: 'white_cross:875472863493238804',
  home: null,
  button: ['left:875443450080817172', 'right:875443466644095036'],
  disableAtEnd: false,
  pageCount: "Page {current}/{total}",
  timeout: 60000,
};

module.exports = class ButtonEmbeds {
  constructor(opts = defaultOptions) {
    Object.assign(this, defaultOptions);
    Object.assign(this, opts);
  }
  async send(channel) {
    const opts = {
      userID: this.userID,
      remove: this.remove,
      home: this.home,
      button: this.button,
      removeAtEnd: this.removeAtEnd,
      disableAtEnd: this.disableAtEnd,
      pageCount: this.pageCount,
      timeout: this.timeout,
    };
    const pages = [...this.pages];
    let page = 0;
    let homeBtn;
    let removeBtn = new MessageButton()
      .setCustomId(opts.remove)
      .setEmoji(opts.remove)
      .setStyle("DANGER");

    if (typeof opts.home == "string" && pages.length > 1) {
      homeBtn = new MessageButton()
        .setCustomId(opts.home)
        .setEmoji(opts.home)
        .setStyle("SECONDARY");
    }

    let leftBtn = new MessageButton()
      .setCustomId(opts.button[0])
      .setEmoji(opts.button[0])
      .setStyle("SECONDARY");

    let rightBtn = new MessageButton()
      .setCustomId(opts.button[1])
      .setEmoji(opts.button[1])
      .setStyle("SECONDARY");

    if (!pages.length) throw new Error("IYA's Embed Pages: Hmmm I can't paginate empty pages!");

    if (typeof opts.pageCount == "string") {
      for (let i = 0; i < pages.length; i++) {
        if (pages[i] instanceof MessageEmbed)
          pages[i].setFooter(
            opts.pageCount
              .replace(/\{current\}/g, i + 1)
              .replace(/\{total\}/g, pages.length)
          );
        else if (typeof pages[i] == "string")
          pages[i] = `${opts.pageCount
            .replace(/\{current\}/g, i + 1)
            .replace(/\{total\}/g, pages.length)}\n${pages[i]}`;
      }
    }

    let message = await channel.send({
      embeds: [pages[page]],
      components: [
        opts.home
          ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
          : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
      ],
    });

    if (!Array.isArray(opts.button) || opts.button.length < 2)
      throw new Error(
        "IYA's Embed Pages: Must be two buttons given in 'button' options"
      );

    if (opts.timeout < 1000 || opts.timeout > 259200000)
      throw new Error(
        "IYA's Embed Pages: Spawner timeout must be between 1 second and 3 days"
      );

    const buttons = {};

    if (typeof opts.home == "string" && pages.length > 1) {
      buttons.home = homeBtn;
      if (!buttons.home) return;
    }

    // if (pages.length > 1) {
    buttons.left = leftBtn;

    if (!buttons.left) return;

    buttons.right = rightBtn;
    // }

    if (typeof opts.remove == "string") {
      buttons.remove = removeBtn;
      if (!buttons.remove) return;
    }

    if (pages.length === 1) {
      leftBtn.setDisabled(true);
      rightBtn.setDisabled(true);
    }

    const collector = message.createMessageComponentCollector({
      filter: (button) =>
        (button.customId === buttons.home?.customId ||
          button.customId === buttons.remove.customId ||
          button.customId === buttons.left.customId ||
          button.customId === buttons.right.customId) &&
        button.user.id === opts.userID,
      idle: opts.timeout,
    });

    collector.on("collect", async (button) => {
      button.deferUpdate();
      if (
        buttons.home &&
        button.customId.toString() == buttons.home.customId.toString()
      ) {
        page = 0;

        !(await message.deleted)
          ? await message.edit({
              embeds: [pages[page]],
              components: [
                opts.home
                  ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                  : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
              ],
            })
          : null;
      } else if (
        buttons.remove &&
        button.customId.toString() == buttons.remove.customId.toString()
      ) {
        collector.stop("DELETE");

        return;
      } else if (
        button.customId.toString() == buttons.left.customId.toString()
      ) {
        if (pages[page - 1]) {
          page--;

          !(await message.deleted)
            ? await message.edit({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        } else {
          page = pages.length - 1;

          !(await message.deleted)
            ? await message.edit({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        }
      } else if (
        button.customId.toString() == buttons.right.customId.toString()
      ) {
        if (pages[page + 1]) {
          page++;

          !(await message.deleted)
            ? await message.edit({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        } else {
          page = 0;

          !(await message.deleted)
            ? await message.edit({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (opts.disableAtEnd && reason != "DELETE") {
        for (const button of Object.values(buttons)) {
          await button.setDisabled(true);
        }
        !(await message.deleted)
          ? message.edit({
              embeds: [pages[page]],
              components: [
                opts.home
                  ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                  : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
              ],
            })
          : null;
      }

      if (reason == "DELETE") !(await message.deleted) ? await message.delete() : null;
    });
  }

  async reply(interaction, hidden = false, defer = true) {
    const opts = {
      userID: this.userID,
      remove: this.remove,
      home: this.home,
      button: this.button,
      removeAtEnd: this.removeAtEnd,
      disableAtEnd: this.disableAtEnd,
      pageCount: this.pageCount,
      timeout: this.timeout,
      currentPage : this.currentPage,
    };
    if(defer) {
      await interaction.deferReply({ ephemeral : hidden ? true : false });
    }
    const pages = [...this.pages];
    let page = opts.currentPage || 0;
    let homeBtn;
    let removeBtn = new MessageButton()
      .setCustomId(opts.remove)
      .setEmoji(opts.remove)
      .setStyle("DANGER");

    if (typeof opts.home == "string" && pages.length > 1) {
      homeBtn = new MessageButton()
        .setCustomId(opts.home)
        .setEmoji(opts.home)
        .setStyle("SECONDARY");
    }

    let leftBtn = new MessageButton()
      .setCustomId(opts.button[0])
      .setEmoji(opts.button[0])
      .setStyle("SECONDARY");

    let rightBtn = new MessageButton()
      .setCustomId(opts.button[1])
      .setEmoji(opts.button[1])
      .setStyle("SECONDARY");

    if (!pages.length) throw new Error("IYA's Embed Pages: Hmmm I can't paginate empty pages!");

    if (typeof opts.pageCount == "string") {
      for (let i = 0; i < pages.length; i++) {
        if (pages[i] instanceof MessageEmbed)
          pages[i].setFooter(
            opts.pageCount
              .replace(/\{current\}/g, i + 1)
              .replace(/\{total\}/g, pages.length)
          );
        else if (typeof pages[i] == "string")
          pages[i] = `${opts.pageCount
            .replace(/\{current\}/g, i + 1)
            .replace(/\{total\}/g, pages.length)}\n${pages[i]}`;
      }
    }

    let message = await interaction.editReply({
      embeds: [pages[page]],
      components: [
        opts.home
          ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
          : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
      ],
    });

    if (!Array.isArray(opts.button) || opts.button.length < 2)
      throw new Error(
        "IYA's Embed Pages: Must be two buttons given in 'button' options"
      );

    if (opts.timeout < 1000 || opts.timeout > 259200000)
      throw new Error(
        "IYA's Embed Pages: Spawner timeout must be between 1 second and 3 days"
      );

    const buttons = {};

    if (typeof opts.home == "string" && pages.length > 1) {
      buttons.home = homeBtn;
      if (!buttons.home) return;
    }

    // if (pages.length > 1) {
    buttons.left = leftBtn;

    if (!buttons.left) return;

    buttons.right = rightBtn;
    // }

    if (typeof opts.remove == "string") {
      buttons.remove = removeBtn;
      if (!buttons.remove) return;
    }

    if (pages.length === 1) {
      leftBtn.setDisabled(true);
      rightBtn.setDisabled(true);
    }

    const collector = message.createMessageComponentCollector({
      filter: (button) =>
        (button.customId === buttons.home?.customId ||
          button.customId === buttons.remove.customId ||
          button.customId === buttons.left.customId ||
          button.customId === buttons.right.customId) &&
        button.user.id === opts.userID,
      idle: opts.timeout,
    });

    collector.on("collect", async (button) => {
      button.deferUpdate();
      if (
        buttons.home &&
        button.customId.toString() == buttons.home.customId.toString()
      ) {
        page = 0;

        !(await message.deleted)
          ? await interaction.editReply({
              embeds: [pages[page]],
              components: [
                opts.home
                  ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                  : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
              ],
            })
          : null;
      } else if (
        buttons.remove &&
        button.customId.toString() == buttons.remove.customId.toString() &&
        !interaction.ephemeral
      ) {
        collector.stop("DELETE");

        return;
      } else if (
        button.customId.toString() == buttons.left.customId.toString()
      ) {
        if (pages[page - 1]) {
          page--;

          !(await message.deleted)
            ? await interaction.editReply({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        } else {
          page = pages.length - 1;

          !(await message.deleted)
            ? await interaction.editReply({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        }
      } else if (
        button.customId.toString() == buttons.right.customId.toString()
      ) {
        if (pages[page + 1]) {
          page++;

          !(await message.deleted)
            ? await interaction.editReply({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        } else {
          page = 0;

          !(await message.deleted)
            ? await interaction.editReply({
                embeds: [pages[page]],
                components: [
                  opts.home
                    ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                    : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
                ],
              })
            : null;
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (opts.disableAtEnd && reason != "DELETE") {
        for (const button of Object.values(buttons)) {
          await button.setDisabled(true);
        }
        !(await message.deleted)
          ? interaction.editReply({
              embeds: [pages[page]],
              components: [
                opts.home
                  ? { type: 1, components: [homeBtn, leftBtn, rightBtn, removeBtn]}
                  : { type: 1, components: [leftBtn, rightBtn, removeBtn]},
              ],
            })
          : null;
      }
      if (reason == "DELETE") !(await message.deleted && !interaction.ephemeral) ? await interaction.deleteReply() : null;
    });
  }

};
