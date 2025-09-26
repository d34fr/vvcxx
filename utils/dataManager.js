const path = require("path");
const { readJSON } = require("./jsonManager");

/**
 * Calcule les vraies statistiques d'un utilisateur en combinant avis.json et pending.json
 */
function getUserStats(userId) {
  const avisPath = path.join(__dirname, "..", "data", "avis.json");
  const pendingPath = path.join(__dirname, "..", "data", "pending.json");
  
  const avis = readJSON(avisPath, { users: {}, totalAvis: 0 });
  const pending = readJSON(pendingPath, { pending: [] });
  
  // Stats de base depuis avis.json
  const baseStats = avis.users[userId] || {
    attente: 0,
    bloque: 0,
    normal: 0,
    valide: 0,
    total: 0
  };
  
  // Compter les avis en attente par statut réel
  const userPending = pending.pending.filter(p => p.userId === userId);
  const pendingStats = {
    normal: 0,
    bloque: 0,
    appel: 0
  };
  
  userPending.forEach(p => {
    if (p.statut === "Normal") pendingStats.normal++;
    else if (p.statut === "Bloqué") pendingStats.bloque++;
    else if (p.statut === "Appel") pendingStats.appel++;
  });
  
  return {
    // Avis validés/finalisés
    normal: baseStats.normal || 0,
    bloque: baseStats.bloque || 0,
    valide: baseStats.valide || 0,
    
    // Avis en attente par statut
    attenteNormal: pendingStats.normal,
    attenteBloque: pendingStats.bloque,
    attenteAppel: pendingStats.appel,
    
    // Totaux
    totalAttente: userPending.length,
    totalFinalise: (baseStats.normal || 0) + (baseStats.bloque || 0) + (baseStats.valide || 0),
    total: (baseStats.normal || 0) + (baseStats.bloque || 0) + (baseStats.valide || 0) + userPending.length
  };
}

/**
 * Calcule le classement complet avec les vrais statuts
 */
function computeFullRanking() {
  const avisPath = path.join(__dirname, "..", "data", "avis.json");
  const pendingPath = path.join(__dirname, "..", "data", "pending.json");
  
  const avis = readJSON(avisPath, { users: {}, totalAvis: 0 });
  const pending = readJSON(pendingPath, { pending: [] });
  
  const ranking = [];
  const allUsers = new Set([
    ...Object.keys(avis.users || {}),
    ...pending.pending.map(p => p.userId)
  ]);
  
  for (const userId of allUsers) {
    const stats = getUserStats(userId);
    ranking.push({
      uid: userId,
      ...stats
    });
  }
  
  // Trier par total décroissant
  ranking.sort((a, b) => b.total - a.total);
  return ranking;
}

module.exports = { getUserStats, computeFullRanking };