const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const path = require("path");
const { readJSON } = require("../utils/jsonManager");

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
    const aPath = path.join(__dirname, "..", "data", "avis.json");
    const avis = readJSON(aPath, { users: {}, totalAvis: 0 });
    const u = avis.users[user.id] || {
      attente: 0,
      bloque: 0,
      normal: 0,
      valide: 0,
      total: 0
    };

    const emb = baseEmbed()
      .setColor("Blue")
      .setTitle("🪪 Profil d'avis")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        [
          "`👤`〡Utilisateur : " + `<@${user.id}>\n`,
          "`📊`〡**Total d'avis :** **`" + u.total + "`**",
          "`⌛`〡En attente : `" + u.attente + "`",
          "`✅`〡Normal : `" + u.normal + "`",
          "`❌`〡Bloqué : `" + u.bloque + "`",
          "`💰`〡Validé : `" + u.valide + "`"
        ].join("\n")
      );

    return interaction.reply({ embeds: [emb] });
  }
};
