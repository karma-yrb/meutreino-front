/**
 * Mapping exercice → médias (image + vidéo).
 * imageUrl : URL d'une photo/illustration de l'exercice, ou null.
 * videoUrl : URL d'une vidéo YouTube (ou autre) de démonstration, ou null.
 *
 * Clé = nom de l'exercice en minuscules, espaces normalisés.
 * Ajouter les URLs au fur et à mesure.
 */
const EXERCISE_MEDIA = {
  // ---------- Membres inférieurs ----------
  "leg extension": { imageUrl: null, videoUrl: null },
  "squat barre libre": { imageUrl: null, videoUrl: null },
  "souleve de terre jambes tendues": { imageUrl: null, videoUrl: null },
  "mollets verticaux": { imageUrl: null, videoUrl: null },
  "leg curl assis": { imageUrl: null, videoUrl: null },
  "abducteur tronc penche": { imageUrl: null, videoUrl: null },
  "leg press 45": { imageUrl: null, videoUrl: null },
  "mollets leg press": { imageUrl: null, videoUrl: null },

  // ---------- Dos ----------
  "tirage frontal": { imageUrl: null, videoUrl: null },
  "rowing assis poulie basse": { imageUrl: null, videoUrl: null },
  "rowing pronation barre": { imageUrl: null, videoUrl: null },
  "extension du tronc": { imageUrl: null, videoUrl: null },

  // ---------- Bras ----------
  "triceps corde poulie haute": { imageUrl: null, videoUrl: null },
  "triceps corde + curl 21": { imageUrl: null, videoUrl: null },
  "triceps francais + curl poulie": { imageUrl: null, videoUrl: null },

  // ---------- Pectoraux / Épaules ----------
  "developpe incline": { imageUrl: null, videoUrl: null },
  "pec deck": { imageUrl: null, videoUrl: null },
  "developpe frontal + elevation laterale": { imageUrl: null, videoUrl: null },
};

/**
 * Retourne { imageUrl, videoUrl } pour un exercice donné.
 * Retourne { imageUrl: null, videoUrl: null } si non trouvé.
 */
export function getExerciseMedia(name) {
  if (!name) return { imageUrl: null, videoUrl: null };
  const key = name.toLowerCase().trim().replace(/\s+/g, " ");
  return EXERCISE_MEDIA[key] ?? { imageUrl: null, videoUrl: null };
}
