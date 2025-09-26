const path = require("path");
const { readJSON } = require("../utils/jsonManager");
const { baseEmbed } = require("../utils/embeds");

// Récupère l'heure actuelle en France (Europe/Paris)
function parisTime() {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function computeRanking(avis) {
  const arr = [];
  for (const [uid, data] of Object.entries(avis.users || {})) {
    arr.push({
      uid,
      total: data.total || 0,
      normal: data.normal || 0,
      bloque: data.bloque || 0,
      attente: data.attente || 0,
      valide: data.valide || 0
    });
  }
  arr.sort((a, b) => b.total - a.total);
  return arr;
}

function chunk(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

module.exports = async function updateClassement(client) {
  try {
    const avisPath = path.join(__dirname, "..", "data", "avis.json");
    const rankStorePath = path.join(__dirname, "..", "data", "classement.json");

    const avis = readJSON(avisPath, { users: {}, totalAvis: 0 });
    const rankStore = readJSON(rankStorePath, { messages: {} });

    const ranking = computeRanking(avis);
    const pages = chunk(ranking, 10);

    for (const [channelId, messageId] of Object.entries(rankStore.messages || {})) {
      const chan = await client.channels.fetch(channelId).catch(() => null);
      if (!chan) continue;

      const msg = await chan.messages.fetch(messageId).catch(() => null);
      if (!msg) continue;

      const emb = baseEmbed()
        .setColor("Blue")
        .setTitle("🏆 Classement Avis")
        .setFooter({ text: `Full UHQ Gestion Avis 🚀〡Maj faite à ${parisTime()}` });

      if (pages.length === 0) {
        emb.setDescription("_Aucune donnée pour le moment._");
      } else {
        const lines = pages[0].map((r, idx) => {
          const rank = idx + 1;
          let medal = `#${rank}`;
          if (rank === 1) medal = "🥇";
          else if (rank === 2) medal = "🥈";
          else if (rank === 3) medal = "🥉";

          return [
            `| ${medal} <@${r.uid}>`,
            `| \`📊\`〡**Total : \`${r.total}\`**`,
            `↳ \`✅\` Normal : \`${r.normal}\` ｜ \`🔎\` Appel : \`${r.attente}\` ｜ \`❌\` Bloqué : \`${r.bloque}\` ｜ \`💰\` Validé : \`${r.valide}\``
          ].join("\n");
        });

        emb.setDescription(lines.join("\n\n"));
      }

      await msg.edit({ embeds: [emb] }).catch(() => {});
    }
  } catch (e) {
    console.error("[JOB] updateClassement error", e);
  }
};
