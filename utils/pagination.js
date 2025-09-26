const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function paginationComponents(baseId, page, totalPages) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`${baseId}:first`).setLabel("⏪").setStyle(ButtonStyle.Secondary).setDisabled(page<=0),
      new ButtonBuilder().setCustomId(`${baseId}:prev`).setLabel("◀").setStyle(ButtonStyle.Secondary).setDisabled(page<=0),
      new ButtonBuilder().setCustomId(`${baseId}:next`).setLabel("▶").setStyle(ButtonStyle.Secondary).setDisabled(page>=totalPages-1),
      new ButtonBuilder().setCustomId(`${baseId}:last`).setLabel("⏩").setStyle(ButtonStyle.Secondary).setDisabled(page>=totalPages-1)
    )
  ];
}

module.exports = { paginationComponents };
