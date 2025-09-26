const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const path = require("path");
const { readJSON } = require("../utils/jsonManager");
const { paginationComponents } = require("../utils/pagination");

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

function pageEmbedFromRanking(ranking, page) {
  const start = page * 10;
  const slice = ranking.slice(start, start + 10);

  const emb = baseEmbed()
    .setColor("Blue")
    .setTitle("🏆 Classement Avis")
    .setFooter({ text: `Page ${page + 1} / ${Math.max(1, Math.ceil(ranking.length / 10))}〡Full UHQ Gestion Avis 🚀` });

  if (slice.length === 0) {
    emb.setDescription("_Aucune donnée disponible._");
  } else {
    emb.setDescription(
      slice
        .map((r, idx) => {
          const rank = start + idx + 1;
          let medal = `#${rank}`;
          if (rank === 1) medal = "🥇";
          else if (rank === 2) medal = "🥈";
          else if (rank === 3) medal = "🥉";

          return [
            `| ${medal} <@${r.uid}>`,
            `| \`📊\`〡**Total : \`${r.total}\`**`,
            `↳ \`✅\` Normal : \`${r.normal}\` ｜ \`🔎\` Appel : \`${r.attente}\` ｜ \`❌\` Bloqué : \`${r.bloque}\` ｜ \`💰\` Validé : \`${r.valide}\``,
            ""
          ].join("\n");
        })
        .join("\n\n")
    );
  }
  return emb;
}

module.exports = {
  sysOnly: false,
  data: new SlashCommandBuilder()
    .setName("classement")
    .setDescription("Afficher le classement des membres (top 10 par page)"),
  async execute(interaction) {
    const aPath = path.join(__dirname, "..", "data", "avis.json");
    const avis = readJSON(aPath, { users: {}, totalAvis: 0 });

    const ranking = computeRanking(avis);
    const totalPages = Math.max(1, Math.ceil(ranking.length / 10));
    const page = 0;

    const emb = pageEmbedFromRanking(ranking, page);
    const rows = paginationComponents(`rank:${page}`, page, totalPages).map(r => {
      r.components[0].setCustomId(`rank:first:${page}`);
      r.components[1].setCustomId(`rank:prev:${page}`);
      r.components[2].setCustomId(`rank:next:${page}`);
      r.components[3].setCustomId(`rank:last:${page}`);
      return r;
    });

    return interaction.reply({ embeds: [emb], components: rows });
  }
};
