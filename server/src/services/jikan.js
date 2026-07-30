// services/jikan.js
// Client de l'API publique Jikan (MyAnimeList).
//
// Un service, pas un modèle : Jikan est une dépendance externe, pas notre
// base de données. Ses pannes ne sont pas des bugs de Kinka, d'où l'erreur
// typée ci-dessous que le contrôleur traduit en 502 Bad Gateway plutôt qu'en
// 500 « erreur interne » — un administrateur qui surveille les erreurs doit
// pouvoir distinguer les deux.
const BASE = 'https://api.jikan.moe/v4';                           // base URL de l'API Jikan

class ErreurServiceExterne extends Error {                         // panne côté Jikan, pas côté Kinka
  constructor(message, statut) {
    super(message);
    this.name = 'ErreurServiceExterne';
    this.serviceExterne = true;                                    // repéré par le contrôleur
    this.statutSource = statut || null;                            // code renvoyé par Jikan
  }
}

const pause = (ms) => new Promise(r => setTimeout(r, ms));         // temporisation

// Jikan limite à ~3 requêtes/seconde et répond 429 au-delà : on réessaie.
async function appeler(chemin, essais = 3) {
  for (let i = 0; i < essais; i++) {
    let res;
    try {
      res = await fetch(BASE + chemin);
    } catch {                                                      // réseau injoignable
      if (i === essais - 1) throw new ErreurServiceExterne('Service manga externe injoignable', null);
      await pause(1000);
      continue;
    }
    if (res.status === 429) {                                      // quota atteint
      await pause(2000);
      continue;
    }
    if (!res.ok) {
      throw new ErreurServiceExterne(`Service manga externe indisponible (${res.status})`, res.status);
    }
    return res.json();
  }
  throw new ErreurServiceExterne('Service manga externe saturé, réessayez plus tard', 429);
}

const rechercher = (q, limite = 20) =>                             // recherche par titre
  appeler(`/manga?q=${encodeURIComponent(q)}&limit=${limite}&sfw=true`);

const parId = (malId) => appeler(`/manga/${encodeURIComponent(malId)}`); // fiche par identifiant MAL

const top = (page, limite, type) =>                                // classement des plus populaires
  appeler(`/top/manga?page=${page}&limit=${limite}&type=${type}`);

module.exports = { appeler, rechercher, parId, top, pause, ErreurServiceExterne };
