const path = require("path");
const { readJSON } = require("../utils/jsonManager");
const config = require("../config.json");

module.exports = async function updateCounter(client) {
  try {
    const cfgPath = path.join(__dirname, "..", "data", "config.json");
    const avisPath = path.join(__dirname, "..", "data", "avis.json");
    const cfg = readJSON(cfgPath, { compteurChannelId: "" });
    const avis = readJSON(avisPath, { totalAvis: 0 });

    if (!cfg.compteurChannelId) return;
    const chan = await client.channels.fetch(cfg.compteurChannelId).catch(() => null);
    if (!chan) return;

    const total = avis.totalAvis || 0;
    const newName = `⭐〡Avis Fait﹕${total}`;
    if (chan.manageable) {
      await chan.setName(newName).catch(() => {});
    }
  } catch (e) {
    console.error("[JOB] updateCounter error", e);
  }
}
