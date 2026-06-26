// ===========================================================================
//  logique.js — Fonctions de LOGIQUE PURE de « Mon deuxième cerveau ».
//
//  Ce fichier regroupe les fonctions qui ne dépendent QUE de leurs entrées et
//  sorties (sécurité, stockage). Les sortir ici sert deux buts :
//    1. Clean architecture : séparer la logique de l'affichage (le DOM).
//    2. Tests : ce fichier est chargé à la fois par l'application
//       (« Mon deuxième cerveau.html ») ET par la page de tests (« tests.html »),
//       ce qui permet de vérifier ces fonctions automatiquement.
//
//  ⚠️ Ces fonctions sont volontairement globales (déclarées avec `function`)
//  pour rester appelables depuis le gros <script> de l'application, exactement
//  comme avant l'extraction. Ne pas les transformer en modules.
// ===========================================================================

// --- SÉCURITÉ -------------------------------------------------------------

// Échappe le HTML pour empêcher l'injection de code (XSS) via le contenu des
// notes, des fichiers .json importés ou des charges utiles partagées.
function escapeHtml(texte) {
  return String(texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Ne renvoie une couleur que si elle est inoffensive (les couleurs peuvent
// venir d'un fichier .json importé). Sinon, chaîne vide (= ignorée). Utilisée
// à la fois pour le fond et pour le texte des notes (DRY).
function couleurValidee(c) {
  return (c && /^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([0-9.,%\s/]+\)|[a-zA-Z]+)$/.test(c)) ? c : '';
}

// --- FRONTIÈRE DE STOCKAGE ------------------------------------------------
// SEULES ces deux fonctions parlent directement à localStorage pour les
// données au format JSON. Le format produit est IDENTIQUE à l'historique
// (JSON.stringify/parse) → 100 % rétrocompatible.

function lireJSON(cle, valeurParDefaut) {
  let brut;
  try { brut = localStorage.getItem(cle); } catch (e) { return valeurParDefaut; }
  if (brut === null) return valeurParDefaut;       // clé absente
  try { return JSON.parse(brut); } catch (e) { return valeurParDefaut; }  // contenu illisible
}

function ecrireJSON(cle, valeur) {
  // Peut lever une exception si le quota est dépassé : c'est à l'appelant
  // de la gérer (voir sauvegarderNotesEnStockage).
  localStorage.setItem(cle, JSON.stringify(valeur));
}

// --- EXPORT ----------------------------------------------------------------
// Construit l'objet exporté dans le fichier .json (format, titre, notes,
// positions, liens, état réduit). Fonction PURE : elle ne lit rien dans le
// DOM ni le stockage, elle assemble seulement les données qu'on lui donne.
// C'est ce qui la rend facile à tester (voir tests.html).
function construireExportNotes(donnees) {
  donnees = donnees || {};
  return {
    format: "mon-deuxieme-cerveau",
    version: 1,
    titre: (donnees.titre && donnees.titre.trim()) || 'Mes notes',  // jamais vide
    description: donnees.description ? donnees.description.trim() : '',
    notes: donnees.notes || [],
    positions: donnees.positions || {},
    liens: donnees.liens || [],
    reduites: donnees.reduites || {}
  };
}
