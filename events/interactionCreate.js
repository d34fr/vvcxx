const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");
const { baseEmbed } = require("../utils/embeds");
const config = require("../config.json");
const { paginationComponents } = require("../utils/pagination");
const { computeFullRanking } = require("../utils/dataManager");

function isSYS(userId) {
  return Array.isArray(config.sys) && config.sys.includes(userId);
}

function pageEmbedFromRanking(ranking, page) {
  const start = page * 10;
  const slice = ranking.slice(start, start + 10);

  const emb = baseEmbed()
    .setColor(0xFFD700)
    .setTitle("🏆〡Classement des membres")
    .setFooter({
      text: `Page ${page + 1} / ${Math.max(1, Math.ceil(ranking.length / 10))}`,
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
            "`✅`〡Normal : `" + (r.normal + r.attenteNormal) + "` (`" + r.normal + "` + `" + r.attenteNormal + "` en attente)",
            "`❌`〡Bloqué : `" + (r.bloque + r.attenteBloque) + "` (`" + r.bloque + "` + `" + r.attenteBloque + "` en attente)",
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
  name: "interactionCreate",
  async execute(interaction, client) {
    try {
      // --- Slash commands ---
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.sysOnly !== false && !isSYS(interaction.user.id)) {
          const embErr = baseEmbed()
            .setColor("Red")
            .setTitle("🚫 Erreur")
            .setDescription(
              "`📌`〡Vous devez être dans la liste **SYS** pour utiliser cette commande."
            );
          return interaction.reply({ embeds: [embErr], ephemeral: true });
        }
        return await command.execute(interaction, client);
      }

      // --- Boutons ---
      if (interaction.isButton()) {
        const parts = interaction.customId.split(":");

        // review:final:<id>:ok|ko
        if (parts[0] === "review" && parts[1] === "final") {
          if (!isSYS(interaction.user.id)) {
            const embErr = baseEmbed()
              .setColor("Red")
              .setTitle("🚫 Erreur")
              .setDescription("`📌`〡Action réservée aux SYS.");
            return interaction.reply({ embeds: [embErr], ephemeral: true });
          }

          const id = parts[2];
          const action = parts[3];
          const pPath = path.join(__dirname, "..", "data", "pending.json");
          const aPath = path.join(__dirname, "..", "data", "avis.json");
          const p = readJSON(pPath, { pending: [] });
          const a = readJSON(aPath, { users: {}, totalAvis: 0 });

          const idx = p.pending.findIndex((x) => x.id === id);
          if (idx === -1) {
            const embErr = baseEmbed()
              .setColor("Red")
              .setTitle("🚫 Erreur")
              .setDescription("`📌`〡Avis introuvable ou déjà traité.");
            return interaction.reply({ embeds: [embErr], ephemeral: true });
          }

          const item = p.pending[idx];
          p.pending.splice(idx, 1);
          writeJSON(pPath, p);

          const userData =
            a.users[item.userId] || {
              attente: 0,
              bloque: 0,
              normal: 0,
              valide: 0,
              total: 0,
            };
          if (userData.attente > 0) userData.attente -= 1;
          if (action === "ok") userData.normal += 1;
          else userData.bloque += 1;
          userData.total =
            userData.attente +
            userData.bloque +
            userData.normal +
            userData.valide;
          a.users[item.userId] = userData;
          writeJSON(aPath, a);

          const embOk = baseEmbed()
            .setColor(action === "ok" ? "Green" : "Red")
            .setTitle(action === "ok" ? "✅ Décision enregistrée" : "❌ Avis refusé")
            .setDescription(
              [
                "`👤`〡Utilisateur : <@" + item.userId + ">",
                "`#️⃣`〡Numéro : `" + item.numero + "`",
                "`📌`〡Décision : " +
                  (action === "ok"
                    ? "`✅ Validé (Normal)`"
                    : "`❌ Refusé (Bloqué)`"),
              ].join("\n")
            );

          return interaction.reply({ embeds: [embOk], ephemeral: true });
        }

        // review:modify:<userId>:<id>
        if (parts[0] === "review" && parts[1] === "modify") {
          if (!isSYS(interaction.user.id)) {
            const embErr = baseEmbed()
              .setColor("Red")
              .setTitle("🚫 Erreur")
              .setDescription("`📌`〡Action réservée aux SYS.");
            return interaction.reply({ embeds: [embErr], ephemeral: true });
          }

          const userId = parts[2];
          const id = parts[3];

          const menu = new StringSelectMenuBuilder()
            .setCustomId(`review:set:${id}`)
            .setPlaceholder("📌 Choisir un statut")
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel("✅ Mettre en Normal")
                .setValue("Normal"),
              new StringSelectMenuOptionBuilder()
                .setLabel("❌ Mettre en Bloqué")
                .setValue("Bloqué"),
              new StringSelectMenuOptionBuilder()
                .setLabel("🔎 Mettre en Appel")
                .setValue("Appel")
            );

          const row = new ActionRowBuilder().addComponents(menu);

          return interaction.reply({
            embeds: [
              baseEmbed()
                .setColor("Blue")
                .setTitle("📝 Modification de statut")
                .setDescription(
                  "`👤`〡Utilisateur : <@" +
                    userId +
                    ">\n`📌`〡Choisissez un nouveau statut ci-dessous."
                ),
            ],
            components: [row],
            ephemeral: true,
          });
        }

        // Pagination classement: rank:<action>:<page>
        if (parts[0] === "rank") {
          const action = parts[1];
          let page = parseInt(parts[2] || "0", 10) || 0;

          const ranking = computeFullRanking();
          const totalPages = Math.max(1, Math.ceil(ranking.length / 10));

          if (action === "first") page = 0;
          if (action === "prev") page = Math.max(0, page - 1);
          if (action === "next") page = Math.min(totalPages - 1, page + 1);
          if (action === "last") page = totalPages - 1;

          const emb = pageEmbedFromRanking(ranking, page);
          const rows = paginationComponents(`rank:${page}`, page, totalPages).map((r) => {
            r.components[0].setCustomId(`rank:first:${page}`);
            r.components[1].setCustomId(`rank:prev:${page}`);
            r.components[2].setCustomId(`rank:next:${page}`);
            r.components[3].setCustomId(`rank:last:${page}`);
            return r;
          });

          return interaction
            .update({ embeds: [emb], components: rows })
            .catch(async () => {
              await interaction
                .reply({ embeds: [emb], components: rows, ephemeral: true })
                .catch(() => {});
            });
        }
      }

      // --- Sélecteur de statut ---
      if (interaction.isStringSelectMenu()) {
        const parts = interaction.customId.split(":");
        if (parts[0] === "review" && parts[1] === "set") {
          if (!isSYS(interaction.user.id)) {
            const embErr = baseEmbed()
              .setColor("Red")
              .setTitle("🚫 Erreur")
              .setDescription("`📌`〡Action réservée aux SYS.");
            return interaction.reply({ embeds: [embErr], ephemeral: true });
          }

          const id = parts[2];
          const newStatut = interaction.values[0];

          const pPath = path.join(__dirname, "..", "data", "pending.json");
          const p = readJSON(pPath, { pending: [] });
          const idx = p.pending.findIndex((x) => x.id === id);
          if (idx === -1) {
            const embErr = baseEmbed()
              .setColor("Red")
              .setTitle("🚫 Erreur")
              .setDescription("`📌`〡Avis introuvable.");
            return interaction.reply({ embeds: [embErr], ephemeral: true });
          }

          p.pending[idx].statut = newStatut;
          writeJSON(pPath, p);

          const embOk = baseEmbed()
            .setColor("Green")
            .setTitle("✅ Statut modifié")
            .setDescription("`📌`〡Nouveau statut : **" + newStatut + "**");

          return interaction.update({ embeds: [embOk], components: [] });
        }
      }
    } catch (e) {
      console.error("[interactionCreate] error", e);
      if (interaction.isRepliable()) {
        try {
          const embErr = baseEmbed()
            .setColor("Red")
            .setTitle("⚠️ Erreur")
            .setDescription("`📌`〡Une erreur est survenue.");
          await interaction.reply({ embeds: [embErr], ephemeral: true });
        } catch {}
      }
    }
  },
};
