const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const { getUserStats } = require("../utils/dataManager");

module.exports = {
  sysOnly: false,
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("Afficher les informations d'avis d'un utilisateur")
    .addUserOption(o =>
      o.setName("user").setDescription("Utilisateur (facultatif)")
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const stats = getUserStats(user.id);

    const emb = baseEmbed()
      .setColor(0x5865F2)
      .setTitle("🪪〡Profil d'avis")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        [
          "`👤`〡**Utilisateur :** <@" + user.id + ">\n",
          "`📊`〡**Total d'avis :** **`" + stats.total + "`**\n",
          "**📋〡Avis finalisés :**",
          "`✅`〡Normal : `" + stats.normal + "`",
          "`❌`〡Bloqué : `" + stats.bloque + "`",
          "`💰`〡Validé : `" + stats.valide + "`\n",
          "**⏳〡Avis en attente (" + stats.totalAttente + ") :**",
          "`🔎`〡Appel : `" + stats.attenteAppel + "`",
          "`✅`〡Normal : `" + stats.attenteNormal + "`",
          "`❌`〡Bloqué : `" + stats.attenteBloque + "`"
        ].join("\n")
      );

    return interaction.reply({ embeds: [emb] });
  }
};
