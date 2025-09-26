const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

function ensureFileSync(p, defaultObj) {
  if (!fs.existsSync(p)) {
    fse.ensureDirSync(path.dirname(p));
    fs.writeFileSync(p, JSON.stringify(defaultObj, null, 2));
  }
}

function readJSON(p, fallback = {}) {
  try {
    ensureFileSync(p, fallback);
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("[JSON] Erreur lecture", p, e);
    return JSON.parse(JSON.stringify(fallback));
  }
}

function writeJSON(p, data) {
  try {
    fse.ensureDirSync(path.dirname(p));
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error("[JSON] Erreur écriture", p, e);
    return false;
  }
}

module.exports = { ensureFileSync, readJSON, writeJSON };
