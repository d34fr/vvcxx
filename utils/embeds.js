const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

function baseEmbed() {
  const emb = new EmbedBuilder().setColor(0x2B2D31);
  if (config?.footer?.texte) {
    emb.setFooter({ text: config.footer.texte, iconURL: config.footer.icone || null });
  }
  return emb;
}

function errorEmbed(message) {
  return baseEmbed().setTitle("Erreur").setDescription(message);
}

function okEmbed(title, description) {
  return baseEmbed().setTitle(title).setDescription(description);
}

module.exports = { baseEmbed, errorEmbed, okEmbed };
