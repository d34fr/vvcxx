const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");

module.exports = {
  sysOnly: true,
  data: new SlashCommandBuilder()
    .setName("compteur")
    .setDescription("Configurer le salon compteur (renommage automatique)")
    .addChannelOption(o =>
      o.setName("salon")
        .setDescription("Salon compteur")
        .setRequired(true)
    ),
  async execute(interaction) {
    const ch = interaction.options.getChannel("salon", true);
    const cfgPath = path.join(__dirname, "..", "data", "config.json");
    const cfg = readJSON(cfgPath, { compteurChannelId: "" });

    cfg.compteurChannelId = ch.id;
    writeJSON(cfgPath, cfg);

    const emb = baseEmbed()
      .setColor("Blue")
      .setTitle("🔢 Compteur configuré")
      .setDescription([
        "`#️⃣`〡Salon défini : " + ch.toString(),
        "`⏱️`〡Mise à jour toutes les **10 minutes**"
      ].join("\n"));

    return interaction.reply({ embeds: [emb], ephemeral: true });
  }
};
