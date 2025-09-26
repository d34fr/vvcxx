const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");

module.exports = {
  sysOnly: true,
  data: new SlashCommandBuilder()
    .setName("setclassement")
    .setDescription("Publier un message de classement auto-mis à jour")
    .addChannelOption(o =>
      o.setName("salon").setDescription("Salon cible").setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("salon", true);

    // Embed envoyé dans le salon cible
    const embInit = baseEmbed()
      .setColor("Blue")
      .setTitle("🏆 Classement des membres")
      .setDescription("`⏳`〡Initialisation en cours…");

    const msg = await channel.send({ embeds: [embInit] });

    // Sauvegarde en JSON
    const storePath = path.join(__dirname, "..", "data", "classement.json");
    const store = readJSON(storePath, { messages: {} });
    store.messages[channel.id] = msg.id;
    writeJSON(storePath, store);

    // Embed de confirmation pour l’utilisateur
    const embOk = baseEmbed()
      .setColor("Green")
      .setTitle("✅ Classement configuré")
      .setDescription([
        "`📌`〡Salon : " + channel.toString(),
        "`🕒`〡Mise à jour automatique toutes les **5 minutes**.",
        "`#️⃣`〡Message ID : `" + msg.id + "`"
      ].join("\n"));

    return interaction.reply({ embeds: [embOk], ephemeral: true });
  }
};
