const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Charger les commandes
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
const slashDefs = [];
for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd?.data && cmd?.execute) {
    client.commands.set(cmd.data.name, cmd);
    slashDefs.push(cmd.data.toJSON());
  }
}

// Déploiement auto (global)
const rest = new REST({ version: "10" }).setToken(config.token);
(async () => {
  try {
    console.log("[BOOT] Déploiement des commandes globales...");
    await rest.put(Routes.applicationCommands(config.clientId), { body: slashDefs });
    console.log("[BOOT] Commandes déployées.");
  } catch (e) {
    console.error("[BOOT] Erreur déploiement:", e);
  }
})();

// Charger events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));
for (const file of eventFiles) {
  const evt = require(path.join(eventsPath, file));
  if (evt?.name) {
    if (evt.once) {
      client.once(evt.name, (...args) => evt.execute(...args, client));
    } else {
      client.on(evt.name, (...args) => evt.execute(...args, client));
    }
  }
}

client.once("ready", () => {
  try {
    client.user.setPresence({
      activities: [{ name: config.statut?.texte || "Gestion des avis", type: ActivityType.Custom }],
      status: "online"
    });
  } catch {}
  console.log(`[READY] Connecté en tant que ${client.user.tag}`);

  // Jobs planifiés
  setInterval(() => require("./jobs/updateCounter")(client), 10 * 60 * 1000);
  setInterval(() => require("./jobs/updateClassement")(client), 5 * 60 * 1000);
  setInterval(() => require("./jobs/checkPending")(client), 60 * 1000);
});

client.login(config.token);
