const { SlashCommandBuilder } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const { computeFullRanking } = require("../utils/dataManager");
const { paginationComponents } = require("../utils/pagination");

function pageEmbedFromRanking(ranking, page) {
  const start = page * 10;
  const slice = ranking.slice(start, start + 10);

  const emb = baseEmbed()
    .setColor(0xFFD700)
    .setTitle("🏆〡Classement des membres")
    .setFooter({ 
      text: `Page ${page + 1} / ${Math.max(1, Math.ceil(ranking.length / 10))}〡Full UHQ Gestion Avis 🚀` 
    });

  if (slice.length === 0) {
    emb.setDescription("`📌`〡_Aucune donnée disponible._");
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
            `**${medal}** <@${r.uid}>`,
            "`📊`〡**Total :** **`" + r.total + "`**",
            "`✅`〡Normal : `" + (r.normal + r.attenteNormal) + "` (`" + r.normal + "` finalisés + `" + r.attenteNormal + "` en attente)",
            "`❌`〡Bloqué : `" + (r.bloque + r.attenteBloque) + "` (`" + r.bloque + "` finalisés + `" + r.attenteBloque + "` en attente)",
            "`🔎`〡Appel : `" + r.attenteAppel + "` (en attente)",
            "`💰`〡Validé : `" + r.valide + "`"
          ].join("\n");
        })
        .join("\n─────────────────────\n")
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
    const ranking = computeFullRanking();
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
