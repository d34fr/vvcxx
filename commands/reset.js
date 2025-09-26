const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");

module.exports = {
  sysOnly: true,
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Réinitialiser tous les avis d'un utilisateur")
    .addUserOption(o =>
      o.setName("user").setDescription("Utilisateur").setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const aPath = path.join(__dirname, "..", "data", "avis.json");
    const avis = readJSON(aPath, { users: {}, totalAvis: 0 });

    // --- Cas erreur ---
    if (!avis.users[user.id]) {
      const embErr = baseEmbed()
        .setColor("Red")
        .setTitle("🚫 Erreur")
        .setDescription("`📌`〡Aucun avis enregistré pour cet utilisateur.");
      return interaction.reply({ embeds: [embErr], ephemeral: true });
    }

    // --- Suppression ---
    const u = avis.users[user.id];
    const userTotal = u.total || 0;
    avis.totalAvis = Math.max(0, (avis.totalAvis || 0) - userTotal);

    delete avis.users[user.id];
    writeJSON(aPath, avis);

    // --- Succès ---
    const embOk = baseEmbed()
      .setColor("Green")
      .setTitle("♻️ Réinitialisation effectuée")
      .setDescription([
        "`👤`〡Utilisateur : " + `<@${user.id}>`,
        "`🗑️`〡Tous ses avis ont été supprimés avec succès."
      ].join("\n"));

    return interaction.reply({ embeds: [embOk] });
  }
};
