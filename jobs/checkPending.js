const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const config = require("../config.json");

module.exports = async function checkPending(client) {
  try {
    const pPath = path.join(__dirname, "..", "data", "pending.json");
    const avisPath = path.join(__dirname, "..", "data", "avis.json");
    const pending = readJSON(pPath, { pending: [] });
    const now = Date.now();

    // On sépare les avis expirés et ceux encore en attente
    const toProcess = pending.pending.filter(p => p.endsAt <= now);
    if (toProcess.length === 0) return;

    const remaining = pending.pending.filter(p => p.endsAt > now);
    writeJSON(pPath, { pending: remaining });

    const channelId = config.salons?.avisVerif;
    if (!channelId) return;

    const chan = await client.channels.fetch(channelId).catch(() => null);
    if (!chan) return;

    for (const item of toProcess) {
      const createdTs = Math.floor(item.createdAt / 1000);
      const endsTs = Math.floor(item.endsAt / 1000);

      // Embed "Avis à vérifier"
      const emb = baseEmbed()
        .setColor("Yellow")
        .setTitle("⌛ Avis à vérifier")
        .setDescription(
          [
            "`👤`〡Utilisateur : <@" + item.userId + ">",
            "`#️⃣`〡Numéro : `" + item.numero + "`",
            "`📌`〡Statut courant : " + item.statut,
            "`🕒`〡Créé : <t:" + createdTs + ":F>",
            "`⏳`〡Échéance (7j) : <t:" + endsTs + ":F>"
          ].join("\n")
        );

      // Boutons Valider / Ne pas valider
      const rows = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`review:final:${item.id}:ok`)
            .setLabel("Valider l'avis")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`review:final:${item.id}:ko`)
            .setLabel("Ne pas valider")
            .setStyle(ButtonStyle.Danger)
        )
      ];

      await chan.send({ embeds: [emb], components: rows }).catch(() => {});
    }
  } catch (e) {
    console.error("[JOB] checkPending error", e);
  }
};
