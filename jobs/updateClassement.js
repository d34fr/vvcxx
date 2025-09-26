const path = require("path");
const { readJSON } = require("../utils/jsonManager");
const { computeFullRanking } = require("../utils/dataManager");
const { baseEmbed } = require("../utils/embeds");

// Récupère l'heure actuelle en France (Europe/Paris)
function parisTime() {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function chunk(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

module.exports = async function updateClassement(client) {
  try {
    const rankStorePath = path.join(__dirname, "..", "data", "classement.json");

    const rankStore = readJSON(rankStorePath, { messages: {} });

    const ranking = computeFullRanking();
    const pages = chunk(ranking, 10);

    for (const [channelId, messageId] of Object.entries(rankStore.messages || {})) {
      const chan = await client.channels.fetch(channelId).catch(() => null);
      if (!chan) continue;

      const msg = await chan.messages.fetch(messageId).catch(() => null);
      if (!msg) continue;

      const emb = baseEmbed()
        .setColor(0xFFD700)
        .setTitle("🏆〡Classement des membres")
        .setFooter({ text: `Full UHQ Gestion Avis 🚀〡Maj faite à ${parisTime()}` });

      if (pages.length === 0) {
        emb.setDescription("`📌`〡_Aucune donnée pour le moment._");
      } else {
        const lines = pages[0].map((r, idx) => {
          const rank = idx + 1;
          let medal = `#${rank}`;
          if (rank === 1) medal = "🥇";
          else if (rank === 2) medal = "🥈";
          else if (rank === 3) medal = "🥉";

          return [
            `**${medal}** <@${r.uid}>`,
            "`📊`〡**Total :** **`" + r.total + "`**",
            "`✅`〡Normal : `" + (r.normal + r.attenteNormal) + "` ｜ `❌`〡Bloqué : `" + (r.bloque + r.attenteBloque) + "` ｜ `🔎`〡Appel : `" + r.attenteAppel + "` ｜ `💰`〡Validé : `" + r.valide + "`"
          ].join("\n");
        });

        emb.setDescription(lines.join("\n\n─────────────────────\n\n"));
      }

      await msg.edit({ embeds: [emb] }).catch(() => {});
    }
  } catch (e) {
    console.error("[JOB] updateClassement error", e);
  }
};
