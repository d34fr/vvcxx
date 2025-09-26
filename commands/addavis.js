const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { errorEmbed, baseEmbed } = require("../utils/embeds");
const config = require("../config.json");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");

function isSYS(userId) {
  return Array.isArray(config.sys) && config.sys.includes(userId);
}

// Associer statut => emoji + format
function formatStatut(statut) {
  switch (statut) {
    case "Normal": return "`✅ Normal`";
    case "Appel": return "`🔎 Appel`";
    case "Bloqué": return "`❌ Bloqué`";
    default: return "`" + statut + "`";
  }
}

module.exports = {
  sysOnly: true,
  data: new SlashCommandBuilder()
    .setName("addavis")
    .setDescription("Ajoute un avis à un utilisateur (en attente 7j)")
    .addUserOption(o => o.setName("user").setDescription("Utilisateur").setRequired(true))
    .addStringOption(o => 
      o.setName("statut").setDescription("Statut initial")
       .setChoices(
         { name: "Appel", value: "Appel" },
         { name: "Bloqué", value: "Bloqué" },
         { name: "Normal", value: "Normal" }
       ).setRequired(true))
    .addStringOption(o => o.setName("numero").setDescription("Numéro d'avis").setRequired(true)),
  async execute(interaction) {
    if (!isSYS(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed("🚫〡Vous ne pouvez pas exécuter cette commande.")], ephemeral: true });
    }

    const member = interaction.options.getUser("user", true);
    const statut = interaction.options.getString("statut", true);
    const numero = interaction.options.getString("numero", true);

    const avisPath = path.join(__dirname, "..", "data", "avis.json");
    const pendingPath = path.join(__dirname, "..", "data", "pending.json");
    const avis = readJSON(avisPath, { users: {}, totalAvis: 0 });
    const p = readJSON(pendingPath, { pending: [] });

    const now = Date.now();
    const endsAt = now + 7 * 24 * 60 * 60 * 1000;

    const id = `${member.id}_${now}`;
    p.pending.push({
      id, userId: member.id, numero, statut, createdAt: now, endsAt, guildId: interaction.guildId
    });
    writeJSON(pendingPath, p);

    const u = avis.users[member.id] || { attente: 0, bloque: 0, normal: 0, valide: 0, total: 0 };
    u.attente += 1;
    u.total = u.attente + u.bloque + u.normal + u.valide;
    avis.users[member.id] = u;
    avis.totalAvis = Math.max(0, (avis.totalAvis || 0) + 1);
    writeJSON(avisPath, avis);

    // Embed dans le salon "Avis en attente"
    const attenteChanId = config.salons?.avisAttente;
    if (attenteChanId) {
      const chan = await interaction.client.channels.fetch(attenteChanId).catch(() => null);
      if (chan) {
        const embAtt = baseEmbed()
          .setColor("Yellow")
          .setTitle("⌛〡Nouvel avis en attente (" + formatStatut(statut) + ")")
          .setDescription([
            "`👤`〡Utilisateur : " + `<@${member.id}>`,
            "`#️⃣`〡Numéro : `" + numero + "`",
            "`📌`〡Statut : " + formatStatut(statut),
            "`⏳`〡Vérification le : " + `<t:${Math.floor(endsAt/1000)}:F>`
          ].join("\n"));
        await chan.send({ embeds: [embAtt] }).catch(() => {});
      }
    }

    // Bouton de modification
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`review:modify:${member.id}:${id}`).setLabel("Modifier le statut de l'avis").setEmoji("⭐").setStyle(ButtonStyle.Secondary)
    );

    // Embed de réponse dans le salon courant
    const emb = baseEmbed()
      .setColor("Yellow")
      .setTitle("📝〡Avis ajouté (" + formatStatut(statut) + ")")
      .setDescription([
        "`👤`〡Utilisateur : " + `<@${member.id}>`,
        "`#️⃣`〡Numéro : `" + numero + "`",
        "`📌`〡Statut : " + formatStatut(statut),
        "`⏳`〡Vérification le : " + `<t:${Math.floor(endsAt/1000)}:F>`
      ].join("\n"));

    return interaction.reply({ embeds: [emb], components: [row] });
  }
};
