const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { baseEmbed } = require("../utils/embeds");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/jsonManager");

module.exports = {
  sysOnly: true,
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configurer les salons / paramètres (SYS uniquement)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sc =>
      sc
        .setName("compteur")
        .setDescription("Définir le salon du compteur")
        .addChannelOption(o =>
          o.setName("salon").setDescription("Salon compteur").setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc
        .setName("classement")
        .setDescription("Définir le salon du classement auto")
        .addChannelOption(o =>
          o.setName("salon").setDescription("Salon classement").setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const cfgPath = path.join(__dirname, "..", "data", "config.json");
    const cfg = readJSON(cfgPath, {
      compteurChannelId: "",
      classementChannelId: ""
    });

    if (sub === "compteur") {
      const ch = interaction.options.getChannel("salon", true);
      cfg.compteurChannelId = ch.id;
      writeJSON(cfgPath, cfg);

      const emb = baseEmbed()
        .setColor("Blue")
        .setTitle("⚙️〡Configuration mise à jour")
        .setDescription([
          "`📊`〡Type : Salon Compteur",
          "`📌`〡Nouveau salon : " + ch.toString()
        ].join("\n"));

      return interaction.reply({ embeds: [emb] });
    }

    if (sub === "classement") {
      const ch = interaction.options.getChannel("salon", true);
      cfg.classementChannelId = ch.id;
      writeJSON(cfgPath, cfg);

      const emb = baseEmbed()
        .setColor("Blue")
        .setTitle("⚙️〡Configuration mise à jour")
        .setDescription([
          "`🏆`〡Type : Salon Classement",
          "`📌`〡Nouveau salon : " + ch.toString()
        ].join("\n"));

      return interaction.reply({ embeds: [emb] });
    }
  }
};
