/**
 * Mapping exercice → médias (image + vidéo + description).
 * imageUrl    : URL d'une illustration (source : Everkinetic, CC-BY-SA-4.0).
 * videoUrl    : URL YouTube de démonstration, ou null.
 * description : Présentation de l'exécution globale et de la posture (pas de détail de répétitions).
 *
 * Clé = nom de l'exercice en minuscules, espaces normalisés.
 *
 * Crédits images : Everkinetic (https://github.com/everkinetic/data)
 * Licence : CC-BY-SA-4.0  –  https://creativecommons.org/licenses/by-sa/4.0/
 */

const EK = "https://raw.githubusercontent.com/everkinetic/data/main/src/images-web";

const EXERCISE_MEDIA = {
  // ---------- Membres inférieurs ----------
  "leg extension": {
    imageUrl: `${EK}/leg-extensions-1.png`,
    videoUrl: null,
    description: "Assis sur la machine, dos bien plaqué contre le dossier, tibias positionnés sous le rembourrage. Contractez les quadriceps pour étendre les jambes jusqu'à la quasi-extension, puis redescendez de manière contrôlée. Gardez les hanches immobiles et évitez de balancer le buste.",
  },
  "squat barre libre": {
    imageUrl: `${EK}/barbell-squat-1.png`,
    videoUrl: null,
    description: "Debout, barre posée sur les trapèzes (position haute) ou les deltoïdes postérieurs (position basse), pieds à largeur d'épaules, pointes légèrement tournées vers l'extérieur. Descent en poussant les genoux dans l'axe des pieds et en gardant le buste droit et le regard vers l'avant, jusqu'à ce que les cuisses soient parallèles au sol. Remontez en poussant dans le sol, hanches et épaules à la même vitesse.",
  },
  "soulevé de terre jambes tendues": {
    imageUrl: `${EK}/romanian-dead-lift-1.png`,
    videoUrl: null,
    description: "Debout, barre ou haltères tenus devant les cuisses, jambes quasi tendues avec une légère flexion du genou. Poussez les hanches vers l'arrière en inclinant le buste vers l'avant, en maintenant le dos plat et la barre proche du corps. Descendez jusqu'à la mi-tibia selon votre souplesse, puis contractez les ischio-jambiers et les fessiers pour revenir au buste vertical.",
  },
  "mollets debout": {
    imageUrl: `${EK}/standing-calf-raises-using-machine-1.png`,
    videoUrl: null,
    description: "Debout sur le bord d'une marche ou d'une plateforme, talons dans le vide, épaules sous les appuis de la machine. Descendez les talons sous la ligne de la plateforme pour étirer les mollets, puis montez sur la pointe des pieds en contractant les soléaires et les gastrocnémiens. Maintenez un bref instant en haut avant de redescendre sous contrôle.",
  },
  "leg curl assis": {
    imageUrl: `${EK}/seated-leg-curl-1.png`,
    videoUrl: null,
    description: "Assis sur la machine, dos droit contre le dossier, rembourrage positionné juste au-dessus des talons et contre le haut des genoux. Fléchissez les jambes en ramenant les talons vers les fessiers, en contractant activement les ischio-jambiers. Contrôlez le retour à la position initiale sans laisser tomber le poids.",
  },
  "abduction hanche penché": {
    imageUrl: `${EK}/thigh-abductor-1.png`,
    videoUrl: null,
    description: "Corps incliné vers l'avant, appuis stables sur les avant-bras ou une barre. Écartez la jambe de travail latéralement et légèrement vers l'arrière en contractant le moyen fessier, sans rotation du bassin ni compensation lombaire. Maintenez un instant en position haute, puis redescendez sous contrôle.",
  },
  "leg press 45": {
    imageUrl: `${EK}/leg-press-1.png`,
    videoUrl: null,
    description: "Allongé sur la machine inclinée à 45°, dos et lombaires plaqués contre le siège, pieds sur la plateforme à largeur d'épaules. Fléchissez les genoux en contrôlant la descente jusqu'à environ 90°, puis poussez la plateforme en extension sans verrouiller ni dépasser la ligne des genoux. Ne jamais laisser les lombaires se décoller du siège.",
  },
  "mollets presse 45°": {
    imageUrl: `${EK}/calves-press-on-leg-machine-1.png`,
    videoUrl: null,
    description: "En position sur la presse à jambes, jambes presque tendues pour maintenir la plateforme. Placez l'avant des pieds sur le bord inférieur de la plateforme, talons dans le vide. Fléchissez les chevilles pour laisser descendre les talons, puis montez sur la pointe des pieds en contractant les mollets. Le genou reste stable et légèrement fléchi tout au long du mouvement.",
  },

  // ---------- Dos ----------
  "tirage vertical": {
    imageUrl: `${EK}/wide-grip-lat-pull-down-1.png`,
    videoUrl: null,
    description: "Assis à la machine de tirage, genoux bloqués sous le rembourrage, prise large en pronation, légèrement au-delà de la largeur d'épaules. Tirez la barre vers le haut du sternum en ramenant les coudes vers les hanches et en ouvrant la poitrine, sans cambrer excessivement. Contrôlez la remontée jusqu'à l'extension quasi complète, bras presque tendus.",
  },
  "rowing assis poulie basse": {
    imageUrl: `${EK}/seated-cable-rows-1.png`,
    videoUrl: null,
    description: "Assis sur le banc, pieds sur les appuis, légère flexion des genoux, dos dans une position neutre légèrement inclinée vers l'avant. Tirez la poignée vers le nombril en serrant les omoplates ensemble et en redressant le buste. Contrôlez le retour en tendant les bras et en vous penchant légèrement vers l'avant sans arrondir le bas du dos.",
  },
  "tirage barre penché": {
    imageUrl: `${EK}/reverse-grips-bent-over-barbell-rows-1.png`,
    videoUrl: null,
    description: "Debout, buste incliné à environ 45° vers l'avant, genoux légèrement fléchis, prise en pronation un peu plus large que les épaules. Tirez la barre vers le bas du sternum ou le nombril en ramenant les coudes le long du corps et en serrant les omoplates. Gardez le dos plat et la nuque en alignement naturel tout au long du mouvement.",
  },
  "extension lombaire": {
    imageUrl: `${EK}/hyperextensions-1.png`,
    videoUrl: null,
    description: "Positionné sur le banc à hyperextension, hanches sur le rembourrage en avant des crêtes iliaques, pieds bloqués sous les appuis. Partez en flexion vers le bas, buste à la verticale, puis contractez les érecteurs spinaux, les fessiers et les ischio-jambiers pour remonter jusqu'à l'horizontale du corps. Ne pas hyperétendre au-delà de la ligne droite.",
  },

  // ---------- Bras ----------
  "triceps corde poulie haute": {
    imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`,
    videoUrl: null,
    description: "Debout face à la poulie haute, corde saisie à deux mains, prise en prise neutre. Coudes collés aux flancs et fixes pendant tout le mouvement. Dépliez les avant-bras vers le bas en poussant les deux extrémités de la corde légèrement vers l'extérieur en fin de mouvement pour maximiser la contraction des triceps.",
  },
  "triceps corde + curl 21": {
    imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`,
    videoUrl: null,
    description: "Superset enchaîné sans repos. Triceps corde : coudes fixes aux flancs, dépliez les avant-bras vers le bas à la poulie haute en ouvrant la corde en bas. Curl 21 : debout, coudes contre le corps — 7 rép. de bas au coude à 90°, 7 rép. de 90° à l'épaule, puis 7 rép. en amplitude complète. Gardez le buste immobile sur les deux exercices.",
  },
  "triceps francais + curl poulie": {
    imageUrl: `${EK}/standing-triceps-extension-1.png`,
    videoUrl: null,
    description: "Superset enchaîné sans repos. Triceps français : assis ou debout, bras tendus au-dessus de la tête, coudes pointés vers le plafond et fixes. Fléchissez les avant-bras pour descendre la charge derrière la tête, puis remontez en contractant les triceps. Curl poulie : debout face à la poulie basse, coudes fixes contre le corps, fléchissez les avant-bras jusqu'aux épaules et contrôlez le retour.",
  },
  "curl 21": {
    imageUrl: `${EK}/bicep-curls-with-barbell-1.png`,
    videoUrl: null,
    description: "Debout ou assis, haltères ou barre. Effectuez 7 répétitions dans la moitié basse du mouvement (bras tendus jusqu'au coude à 90°), 7 dans la moitié haute (de 90° jusqu'aux épaules), puis 7 en amplitude complète. Coudes fixes contre le corps tout au long, buste immobile sans balancement.",
  },
  "triceps francais": {
    imageUrl: `${EK}/lying-triceps-extension-with-dumbbells-1.png`,
    videoUrl: null,
    description: "Assis ou debout, barre EZ ou haltères tenus à bras tendus au-dessus de la tête. Gardez les coudes pointés vers le plafond et fixes pendant l'ensemble du mouvement. Fléchissez les avant-bras pour descendre la charge derrière la nuque, puis remontez en extension complète en contractant les triceps.",
  },
  "curl poulie": {
    imageUrl: `${EK}/standing-biceps-curl-with-cable-1.png`,
    videoUrl: null,
    description: "Debout face à la poulie basse, poignée droite ou corde en main, coudes fixes contre le corps. Fléchissez les avant-bras pour amener la poignée vers les épaules en contractant les biceps au maximum. Contrôlez le retour jusqu'à l'extension quasi complète sans laisser les coudes partir vers l'avant.",
  },

  // ---------- Pectoraux / Épaules ----------
  "développé incliné": {
    imageUrl: `${EK}/dumbbell-incline-bench-press-1.png`,
    videoUrl: null,
    description: "Allongé sur un banc incliné à 30°–45°, barre ou haltères en main, poignets dans l'axe du coude. Abaissez la charge vers le haut du sternum en contrôlant, coudes à environ 75° du tronc (ni trop ouverts, ni fermés). Poussez jusqu'à l'extension complète sans verrouiller les coudes ni décoller les épaules du banc.",
  },
  "pec deck": {
    imageUrl: `${EK}/butterfly-machine-1.png`,
    videoUrl: null,
    description: "Assis sur la machine butterfly, dos entièrement plaqué contre le dossier, avant-bras contre les rembourrage ou mains sur les poignées. Ramenez les bras vers le centre en contractant les pectoraux, sans enrouler les épaules vers l'avant. Contrôlez l'ouverture en étirant progressivement les pectoraux sans aller au-delà du plan des épaules.",
  },
  "développé militaire + élévation latérale": {
    imageUrl: `${EK}/seated-military-press-1.png`,
    videoUrl: null,
    description: "Superset enchaîné sans repos. Développé militaire : assis ou debout, barre ou haltères au niveau des épaules, prise à largeur d'épaules. Poussez verticalement au-dessus de la tête, bras presque tendus, abdominaux engagés. Élévation latérale : debout, haltères de chaque côté, bras légèrement fléchis. Élevez latéralement jusqu'à la hauteur des épaules, coude légèrement en avance sur le poignet. Contrôlez la descente sans balancement.",
  },
  "développé militaire": {
    imageUrl: `${EK}/seated-military-press-1.png`,
    videoUrl: null,
    description: "Assis ou debout, barre ou haltères au niveau des épaules, prise à largeur d'épaules. Poussez la charge verticalement au-dessus de la tête jusqu'à l'extension quasi complète, en maintenant le buste droit et les abdominaux engagés pour protéger le bas du dos. Redescendez de manière contrôlée jusqu'au niveau des épaules.",
  },
  "élévation latérale": {
    imageUrl: `${EK}/lateral-dumbbell-raises-1.png`,
    videoUrl: null,
    description: "Debout ou assis, haltères tenus de chaque côté, légère flexion du coude maintenue tout au long. Élevez les bras latéralement jusqu'à la hauteur des épaules, le coude légèrement en avance sur le poignet pour cibler le deltoïde moyen. Contrôlez la descente sans balancer le buste ni hausser les trapèzes.",
  },

  // ---------- Alias legacy – compatibilité DB existante (anciens noms avant renommage) ----------
  // Membres inférieurs
  "mollets verticaux": { imageUrl: `${EK}/standing-calf-raises-using-machine-1.png`, videoUrl: null },
  "soulevé de terre jambes tendues (barre)": { imageUrl: `${EK}/romanian-dead-lift-1.png`, videoUrl: null },
  "leg press 45° pieds écartés": { imageUrl: `${EK}/leg-press-1.png`, videoUrl: null },
  "abducteur tronc penché en avant": { imageUrl: `${EK}/thigh-abductor-1.png`, videoUrl: null },
  // Dos
  "tirage frontal": { imageUrl: `${EK}/wide-grip-lat-pull-down-1.png`, videoUrl: null },
  "rowing penché en pronation (barre)": { imageUrl: `${EK}/reverse-grips-bent-over-barbell-rows-1.png`, videoUrl: null },
  "extension du tronc (hyperextension)": { imageUrl: `${EK}/hyperextensions-1.png`, videoUrl: null },
  // Bras (séparateur "•" legacy)
  "triceps corde • superset • curl 21": { imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`, videoUrl: null },
  "triceps français poulie • superset • curl direct poulie": { imageUrl: `${EK}/lying-triceps-extension-with-dumbbells-1.png`, videoUrl: null },
  "curl direct poulie": { imageUrl: `${EK}/standing-biceps-curl-with-cable-1.png`, videoUrl: null },
  // Pectoraux / Épaules
  "développé couché incliné": { imageUrl: `${EK}/dumbbell-incline-bench-press-1.png`, videoUrl: null },
  "pec deck / butterfly machine": { imageUrl: `${EK}/butterfly-machine-1.png`, videoUrl: null },
  "développé frontal haltères • superset • élévation latérale assis": { imageUrl: `${EK}/seated-military-press-1.png`, videoUrl: null },
  "développé frontal + élévation latérale": { imageUrl: `${EK}/seated-military-press-1.png`, videoUrl: null },
  "développé frontal": { imageUrl: `${EK}/seated-military-press-1.png`, videoUrl: null },
};

/**
 * Normalise un nom d'exercice : minuscules + suppression des accents + espaces normalisés.
 * Permet de matcher "Developpe incline" avec la clé "développé incliné".
 */
function normalizeKey(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

/** Table de lookup avec clés normalisées (construite une seule fois au chargement du module). */
const NORMALIZED_MEDIA = Object.fromEntries(
  Object.entries(EXERCISE_MEDIA).map(([k, v]) => [normalizeKey(k), v])
);

/**
 * Retourne { imageUrl, videoUrl } pour un exercice donné.
 * Retourne { imageUrl: null, videoUrl: null } si non trouvé.
 */
export function getExerciseMedia(name) {
  if (!name) return { imageUrl: null, videoUrl: null };
  return NORMALIZED_MEDIA[normalizeKey(name)] ?? { imageUrl: null, videoUrl: null };
}
