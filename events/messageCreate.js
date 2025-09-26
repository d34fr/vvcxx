const config = require("../config.json");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!config.prefix) return;
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    // Préfix désactivé : on ne gère rien ici (les commandes slash sont prioritaires)
  }
};
