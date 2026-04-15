/**
 * Mapping exercice → médias (image + vidéo + description).
 * imageUrl    : URL d'une illustration (source : Everkinetic, CC-BY-SA-4.0).
 * videoUrl    : URL YouTube de démonstration (fallback global), ou null.
 * videoUrls   : optionnel, dictionnaire par langue { fr, pt, en, ... }.
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
    videoUrls: {
      fr: "https://www.youtube.com/watch?v=kH2K6JU27MQ",
      pt: "https://www.youtube.com/watch?v=kH2K6JU27MQ",
      en: "https://www.youtube.com/watch?v=kH2K6JU27MQ",
    },
    videoUrl: "https://www.youtube.com/watch?v=kH2K6JU27MQ",
    description: "Assis sur la machine, dos bien plaqué contre le dossier, tibias positionnés sous le rembourrage. Contractez les quadriceps pour étendre les jambes jusqu'à la quasi-extension, puis redescendez de manière contrôlée. Gardez les hanches immobiles et évitez de balancer le buste.",
  },
  "squat barre libre": {
    imageUrl: `${EK}/barbell-squat-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=4nZj-5fuwXY",
    description: "Debout, barre posée sur les trapèzes (position haute) ou les deltoïdes postérieurs (position basse), pieds à largeur d'épaules, pointes légèrement tournées vers l'extérieur. Descendez en poussant les genoux dans l'axe des pieds et en gardant le buste droit et le regard vers l'avant, jusqu'à ce que les cuisses soient parallèles au sol. Remontez en poussant dans le sol, hanches et épaules à la même vitesse.",
  },
  "soulevé de terre jambes tendues": {
    imageUrl: `${EK}/romanian-dead-lift-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=_heuRfpIrbs",
    description: "Debout, barre ou haltères tenus devant les cuisses, jambes quasi tendues avec une légère flexion du genou. Poussez les hanches vers l'arrière en inclinant le buste vers l'avant, en maintenant le dos plat et la barre proche du corps. Descendez jusqu'à la mi-tibia selon votre souplesse, puis contractez les ischio-jambiers et les fessiers pour revenir au buste vertical.",
  },
  "mollets debout": {
    imageUrl: `${EK}/standing-calf-raises-using-machine-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=SVtg-1loH4c",
    description: "Debout sur le bord d'une marche ou d'une plateforme, talons dans le vide, épaules sous les appuis de la machine. Descendez les talons sous la ligne de la plateforme pour étirer les mollets, puis montez sur la pointe des pieds en contractant les soléaires et les gastrocnémiens. Maintenez un bref instant en haut avant de redescendre sous contrôle.",
  },
  "flexion ischio-jambiers assis": {
    imageUrl: `${EK}/seated-leg-curl-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=eOt-l7DQmaQ",
    description: "Assis sur la machine, dos droit contre le dossier, rembourrage positionné juste au-dessus des talons et contre le haut des genoux. Fléchissez les jambes en ramenant les talons vers les fessiers, en contractant activement les ischio-jambiers. Contrôlez le retour à la position initiale sans laisser tomber le poids.",
  },
  "leg curl assis": {
    imageUrl: `${EK}/seated-leg-curl-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=eOt-l7DQmaQ",
    description: "Assis sur la machine, dos droit contre le dossier, rembourrage positionné juste au-dessus des talons et contre le haut des genoux. Fléchissez les jambes en ramenant les talons vers les fessiers, en contractant activement les ischio-jambiers. Contrôlez le retour à la position initiale sans laisser tomber le poids.",
  },
  "abducteurs machine tronc penché": {
    imageUrl: `${EK}/thigh-abductor-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=iN1AlYptk1A",
    description: "Assis sur la machine abducteurs avec le tronc incliné vers l'avant, fessiers en appui sur le siège. Écartez les cuisses contre les rembourrrages en contractant le moyen fessier, sans rotation du bassin. Contrôlez le retour sans laisser les genoux se rapprocher brusquement.",
  },
  "abduction hanche penché": {
    imageUrl: `${EK}/thigh-abductor-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=iN1AlYptk1A",
    description: "Assis sur la machine abducteurs avec le tronc incliné vers l'avant, fessiers en appui sur le siège. Écartez les cuisses contre les rembourrages en contractant le moyen fessier, sans rotation du bassin. Contrôlez le retour sans laisser les genoux se rapprocher brusquement.",
  },
  "leg press 45": {
    imageUrl: `${EK}/leg-press-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=JvdmoQh27HU",
    description: "Allongé sur la machine inclinée à 45°, dos et lombaires plaqués contre le siège, pieds sur la plateforme à largeur d'épaules. Fléchissez les genoux en contrôlant la descente jusqu'à environ 90°, puis poussez la plateforme en extension sans verrouiller ni dépasser la ligne des genoux. Ne jamais laisser les lombaires se décoller du siège.",
  },
  "mollets presse 45°": {
    imageUrl: `${EK}/calves-press-on-leg-machine-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=dhRz1Ns60Zg",
    description: "En position sur la presse à jambes, jambes presque tendues pour maintenir la plateforme. Placez l'avant des pieds sur le bord inférieur de la plateforme, talons dans le vide. Fléchissez les chevilles pour laisser descendre les talons, puis montez sur la pointe des pieds en contractant les mollets. Le genou reste stable et légèrement fléchi tout au long du mouvement.",
  },

  // ---------- Dos ----------
  "tirage vertical": {
    imageUrl: `${EK}/wide-grip-lat-pull-down-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=TDQ2G4jmx40",
    description: "Assis à la machine de tirage, genoux bloqués sous le rembourrage, prise large en pronation, légèrement au-delà de la largeur d'épaules. Tirez la barre vers le haut du sternum en ramenant les coudes vers les hanches et en ouvrant la poitrine, sans cambrer excessivement. Contrôlez la remontée jusqu'à l'extension quasi complète, bras presque tendus.",
  },
  "rowing assis poulie basse": {
    imageUrl: `${EK}/seated-cable-rows-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=CgOuas9TsH4",
    description: "Assis sur le banc, pieds sur les appuis, légère flexion des genoux, dos dans une position neutre légèrement inclinée vers l'avant. Tirez la poignée vers le nombril en serrant les omoplates ensemble et en redressant le buste. Contrôlez le retour en tendant les bras et en vous penchant légèrement vers l'avant sans arrondir le bas du dos.",
  },
  "tirage barre penché": {
    imageUrl: `${EK}/reverse-grips-bent-over-barbell-rows-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=3BhIn8rdA4o",
    description: "Debout, buste incliné à environ 45° vers l'avant, genoux légèrement fléchis, prise en pronation un peu plus large que les épaules. Tirez la barre vers le bas du sternum ou le nombril en ramenant les coudes le long du corps et en serrant les omoplates. Gardez le dos plat et la nuque en alignement naturel tout au long du mouvement.",
  },
  "extension lombaire": {
    imageUrl: `${EK}/hyperextensions-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=C2rPJj53HNQ",
    description: "Positionné sur le banc à hyperextension, hanches sur le rembourrage en avant des crêtes iliaques, pieds bloqués sous les appuis. Partez en flexion vers le bas, buste à la verticale, puis contractez les érecteurs spinaux, les fessiers et les ischio-jambiers pour remonter jusqu'à l'horizontale du corps. Ne pas hyperétendre au-delà de la ligne droite.",
  },

  // ---------- Bras ----------
  "triceps corde poulie haute": {
    imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=_w-HpW70nSQ",
    description: "Debout face à la poulie haute, corde saisie à deux mains, prise en prise neutre. Coudes collés aux flancs et fixes pendant tout le mouvement. Dépliez les avant-bras vers le bas en poussant les deux extrémités de la corde légèrement vers l'extérieur en fin de mouvement pour maximiser la contraction des triceps.",
  },
  "triceps corde": {
    imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=_w-HpW70nSQ",
    description: "Debout face à la poulie haute, corde saisie à deux mains, prise en prise neutre. Coudes collés aux flancs et fixes pendant tout le mouvement. Dépliez les avant-bras vers le bas en poussant les deux extrémités de la corde légèrement vers l'extérieur en fin de mouvement pour maximiser la contraction des triceps.",
  },
  "triceps corde + curl 21": {
    imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=6RdWmkS5JOM",
    description: "Superset enchaîné sans repos. Triceps corde : coudes fixes aux flancs, dépliez les avant-bras vers le bas à la poulie haute en ouvrant la corde en bas. Curl 21 : debout, coudes contre le corps — 7 rép. de bas au coude à 90°, 7 rép. de 90° à l'épaule, puis 7 rép. en amplitude complète. Gardez le buste immobile sur les deux exercices.",
  },
  "triceps francais + curl poulie": {
    imageUrl: `${EK}/standing-triceps-extension-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=PlhVpFOxDcg",
    description: "Superset enchaîné sans repos. Triceps français : assis ou debout, bras tendus au-dessus de la tête, coudes pointés vers le plafond et fixes. Fléchissez les avant-bras pour descendre la charge derrière la tête, puis remontez en contractant les triceps. Curl poulie : debout face à la poulie basse, coudes fixes contre le corps, fléchissez les avant-bras jusqu'aux épaules et contrôlez le retour.",
  },
  "curl 21": {
    imageUrl: `${EK}/bicep-curls-with-barbell-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=oq7jXQP3Fk8",
    description: "Debout ou assis, haltères ou barre. Effectuez 7 répétitions dans la moitié basse du mouvement (bras tendus jusqu'au coude à 90°), 7 dans la moitié haute (de 90° jusqu'aux épaules), puis 7 en amplitude complète. Coudes fixes contre le corps tout au long, buste immobile sans balancement.",
  },
  "triceps francais": {
    imageUrl: `${EK}/lying-triceps-extension-with-dumbbells-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=fYqswDVbJDg",
    description: "Assis ou debout, barre EZ ou haltères tenus à bras tendus au-dessus de la tête. Gardez les coudes pointés vers le plafond et fixes pendant l'ensemble du mouvement. Fléchissez les avant-bras pour descendre la charge derrière la nuque, puis remontez en extension complète en contractant les triceps.",
  },
  "curl poulie": {
    imageUrl: `${EK}/standing-biceps-curl-with-cable-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=2MUEL4nL6hA",
    description: "Debout face à la poulie basse, poignée droite ou corde en main, coudes fixes contre le corps. Fléchissez les avant-bras pour amener la poignée vers les épaules en contractant les biceps au maximum. Contrôlez le retour jusqu'à l'extension quasi complète sans laisser les coudes partir vers l'avant.",
  },

  // ---------- Pectoraux / Épaules ----------
  "développé incliné": {
    imageUrl: `${EK}/dumbbell-incline-bench-press-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=1zOF0H7Upws",
    description: "Allongé sur un banc incliné à 30°–45°, barre ou haltères en main, poignets dans l'axe du coude. Abaissez la charge vers le haut du sternum en contrôlant, coudes à environ 75° du tronc (ni trop ouverts, ni fermés). Poussez jusqu'à l'extension complète sans verrouiller les coudes ni décoller les épaules du banc.",
  },
  "pec deck": {
    imageUrl: `${EK}/butterfly-machine-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=3jYo5cMU3d4",
    description: "Assis sur la machine butterfly, dos entièrement plaqué contre le dossier, avant-bras contre les rembourrages ou mains sur les poignées. Ramenez les bras vers le centre en contractant les pectoraux, sans enrouler les épaules vers l'avant. Contrôlez l'ouverture en étirant progressivement les pectoraux sans aller au-delà du plan des épaules.",
  },
  "développé militaire + élévation latérale": {
    imageUrl: `${EK}/seated-military-press-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=4iy1yoGRPz4",
    description: "Superset enchaîné sans repos. Développé militaire : assis ou debout, barre ou haltères au niveau des épaules, prise à largeur d'épaules. Poussez verticalement au-dessus de la tête, bras presque tendus, abdominaux engagés. Élévation latérale : debout, haltères de chaque côté, bras légèrement fléchis. Élevez latéralement jusqu'à la hauteur des épaules, coude légèrement en avance sur le poignet. Contrôlez la descente sans balancement.",
  },
  "développé militaire": {
    imageUrl: `${EK}/seated-military-press-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=4iy1yoGRPz4",
    description: "Assis ou debout, barre ou haltères au niveau des épaules, prise à largeur d'épaules. Poussez la charge verticalement au-dessus de la tête jusqu'à l'extension quasi complète, en maintenant le buste droit et les abdominaux engagés pour protéger le bas du dos. Redescendez de manière contrôlée jusqu'au niveau des épaules.",
  },
  "élévation latérale": {
    imageUrl: `${EK}/lateral-dumbbell-raises-1.png`,
    videoUrl: "https://www.youtube.com/watch?v=37ICmoDzh8Q",
    description: "Debout ou assis, haltères tenus de chaque côté, légère flexion du coude maintenue tout au long. Élevez les bras latéralement jusqu'à la hauteur des épaules, le coude légèrement en avance sur le poignet pour cibler le deltoïde moyen. Contrôlez la descente sans balancer le buste ni hausser les trapèzes.",
  },

  // ---------- Mobilité / Échauffement ----------
  "etirement fessier": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=mT-3b4rgRzg",
    description: "Étirement du piriforme et du fessier en amplitude confortable, sans douleur."
  },
  "etirement dynamique ischio": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=wtXwCkB6OBs",
    description: "Mouvement dynamique pour mobiliser les ischio-jambiers avant le travail principal."
  },
  "mobilite hanche 90/90": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=VYvMMw8z3rE",
    description: "Transition 90/90 contrôlée pour préparer la rotation interne et externe de hanche."
  },
  "etirement mollet": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=mafo7o7OnFo",
    description: "Étirement du mollet au mur, talon ancré au sol et alignement du pied."
  },
  "mobilite cheville": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=ElrpduJn92Y",
    description: "Drill genou-vers-mur pour augmenter la dorsiflexion de cheville."
  },
  "etirement pectoraux bilateral": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=M850sCj9LHQ",
    description: "Étirement bilatéral des pectoraux en ouverture thoracique."
  },
  "etirement pectoraux unilateral": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=86GYarExzgc",
    description: "Étirement unilatéral des pectoraux pour corriger les asymétries."
  },
  "mobilite colonne thoracique": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=CzKg4Kf3E0s",
    description: "Mobilité thoracique au sol pour améliorer la posture et la rotation."
  },
  "etirement unilateral lateral tronc": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=Dt1LDEkYXDo",
    description: "Inclinaison latérale contrôlée pour étirer le flanc et le grand dorsal."
  },
  "etirement lateral tronc": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=Dt1LDEkYXDo",
    description: "Étirement latéral du tronc, sans compensation lombaire."
  },
  "mobilite ytw": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=QdGTI4Lshg4",
    description: "Séquence Y-T-W pour activer les muscles scapulaires et stabilisateurs de l'épaule."
  },
  "etirement quadriceps unilateral": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=zi5__zBRzYc",
    description: "Étirement unilatéral du quadriceps avec bassin neutre."
  },
  "etirement rotateurs internes": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=-YFWrYkJVBs",
    description: "Mobilité d'épaule en rotation interne avec serviette."
  },
  "grand étirement du monde": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=-CiWQ2IvY34",
    description: "Grand étirement dynamique au sol. En fente avant, placez la main du côté avant au niveau du pied, ouvrez le coude vers le sol puis tournez le buste en direction du genou avant en levant le bras opposé vers le plafond. Alternez les côtés en contrôlant la rotation thoracique.",
  },
  "mobilité colonne thoracique au sol": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=CzKg4Kf3E0s",
    description: "Allongé sur le côté, genoux fléchis à 90° et bras tendus devant soi. Faites pivoter le bras supérieur vers l'arrière en ouvrant la poitrine, en cherchant à poser l'épaule au sol. Maintenez les genoux groupés pour isoler la rotation à la colonne thoracique.",
  },
  // Alias PT-BR fréquents des captures/imports
  "alongamento do gluteo (piriforme)": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=mT-3b4rgRzg" },
  "alongamento dinamico da posterior da coxa": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=nSUfsT3D2rQ" },
  "mobilidade de quadril 90/90": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=VYvMMw8z3rE" },
  "alongamento para panturrilha": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=mafo7o7OnFo" },
  "mobilidade de tornozelo": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=ElrpduJn92Y" },
  "alongamento do peitoral bilateral": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=M850sCj9LHQ" },
  "alongamento do peitoral unilateral": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=86GYarExzgc" },
  "alongamento unilateral da lateral do tronco": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=Dt1LDEkYXDo" },
  "mobilidade da coluna toracica no chao": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=CzKg4Kf3E0s" },
  "alongamento do quadriceps unilateral": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=zi5__zBRzYc" },
  "alongamento dos rotadores internos com bastante": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=-YFWrYkJVBs" },
  "maior alongamento do mundo": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=-CiWQ2IvY34" },

  // ---------- Abdominaux ----------
  "abdos ciseaux": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=XyLTb8ZTh48",
    description: "Allongé sur le dos, mains sous les lombaires, jambes tendues légèrement décollées du sol. Croisez les jambes en alternance en amplitude courte, talons ne touchant jamais le sol. Gardez le bas du dos plaqué au sol et le menton légèrement rentré.",
  },
  "abdos v-sit": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=LPsepk-C-d4",
    description: "Allongé sur le dos, bras le long du corps. Levez simultanément les jambes tendues et le buste vers le centre en formant un V, en contractant fortement les abdominaux. Contrôlez la descente sans laisser ni les jambes ni le buste toucher le sol entre les répétitions.",
  },
  "abdos ciseaux + abdos inférieurs": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=XyLTb8ZTh48",
    description: "Superset sans repos. Abdos ciseaux : allongé sur le dos, mains sous les lombaires, jambes tendues légèrement décollées du sol — croisements alternés en amplitude courte, talons ne touchant pas le sol. Abdos inférieurs : montez lentement les jambes tendues de l'horizontal à la verticale, puis redescendez de manière contrôlée sans toucher le sol.",
  },
  "abdos ciseaux + abdos v-sit": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=XyLTb8ZTh48",
    description: "Superset sans repos. Abdos ciseaux : allongé sur le dos, mains sous les lombaires, jambes tendues légèrement décollées du sol — croisements alternés en amplitude courte, talons ne touchant pas le sol. Abdos V-sit : levez simultanément les jambes tendues et le buste vers le centre en formant un V, puis contrôlez la descente.",
  },
  "abdos inférieurs": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=Y5pB0u0PLNc",
    description: "Allongé sur le dos, mains sous les lombaires. Jambes tendues, montez-les lentement de l'horizontal à la verticale en contractant les abdominaux bas. Redescendez de manière contrôlée sans laisser les talons toucher le sol.",
  },
  "abdos inférieurs + abdos v-sit": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=Tj7O4-GEI7Y",
    description: "Superset sans repos. Abdos inférieurs : allongé sur le dos, mains sous les lombaires, montée lente des jambes tendues de l'horizontal à la verticale puis redescente contrôlée sans toucher le sol. Abdos V-sit : levez simultanément buste et jambes tendues vers le centre en V, contrôlez la descente.",
  },
  "abdos inférieurs + abdos canif": {
    imageUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=Tj7O4-GEI7Y",
    description: "Superset sans repos. Abdos inférieurs : allongé sur le dos, mains sous les lombaires, montée lente des jambes tendues de l'horizontal à la verticale puis redescente contrôlée sans toucher le sol. Abdos V-sit : levez simultanément buste et jambes tendues vers le centre en V, contrôlez la descente.",
  },

  // ---------- Cardio ----------
  "cardio 40 minutes": {
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    videoUrl: null,
    description: "Zone 2 cardiaque – 40 minutes. Commencez par 5 min d'échauffement à allure légère (marche rapide ou jogging tranquille). Enchaînez 30 min à intensité modérée : vous devez pouvoir parler en phrases courtes tout en sentant votre souffle s'accélérer — c'est la zone 2 (60–70 % de votre FCmax). Maintenez une posture droite, épaules relâchées, foulée ou pédalage détendu et régulier. Terminez par 5 min de retour au calme (marche + étirements mollets et hanches). La zone 2 améliore l'endurance aérobie, l'efficacité lipidique et favorise la récupération musculaire en fin de semaine d'entraînement.",
  },
  "cardio": {
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    videoUrl: null,
    description: "Séance cardio en zone 2. Adoptez un rythme modéré (60–70 % de votre FCmax) sur tapis, vélo, elliptique ou en extérieur. Respectez la durée indiquée et terminez par un retour au calme progressif.",
  },  "cardio post-entraînement": {
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    videoUrl: null,
    description: "HIIT post-entraînement des membres supérieurs. Durée totale du HIIT : 21 min. 2 min à intensité modérée/haute + 1 min à basse intensité. Réalisable sur tapis, vélo, escalier, elliptique ou en extérieur. Comment faire : commencez à basse intensité et maintenez un rythme lent pendant 3 à 4 minutes pour échauffer le corps avant d'enchaîner le HIIT. Pendant les 2 minutes à intensité modérée/haute, augmentez progressivement l'effort de façon à être très essoufflé en fin de bloc — sollicitez pleinement votre système cardiovasculaire. Pendant la minute à basse intensité, l'effort doit rester facile pour vous permettre de récupérer votre souffle avant le prochain intervalle.",
  },
  "aérobio post-entraînement": {
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    videoUrl: null,
    description: "HIIT post-entraînement des membres supérieurs. Durée totale du HIIT : 21 min. 2 min à intensité modérée/haute + 1 min à basse intensité. Réalisable sur tapis, vélo, escalier, elliptique ou en extérieur. Comment faire : commencez à basse intensité et maintenez un rythme lent pendant 3 à 4 minutes pour échauffer le corps avant d'enchaîner le HIIT. Pendant les 2 minutes à intensité modérée/haute, augmentez progressivement l'effort de façon à être très essoufflé en fin de bloc — sollicitez pleinement votre système cardiovasculaire. Pendant la minute à basse intensité, l'effort doit rester facile pour vous permettre de récupérer votre souffle avant le prochain intervalle.",
  },
  // ---------- Alias legacy – compatibilité DB existante (anciens noms avant renommage) ----------
  // Membres inférieurs
  "mollets verticaux": { imageUrl: `${EK}/standing-calf-raises-using-machine-1.png`, videoUrl: "https://www.youtube.com/watch?v=SVtg-1loH4c" },
  "soulevé de terre jambes tendues (barre)": { imageUrl: `${EK}/romanian-dead-lift-1.png`, videoUrl: "https://www.youtube.com/watch?v=_heuRfpIrbs" },
  "leg press 45° pieds écartés": { imageUrl: `${EK}/leg-press-1.png`, videoUrl: "https://www.youtube.com/watch?v=JvdmoQh27HU" },
  "abducteur tronc penché en avant": { imageUrl: `${EK}/thigh-abductor-1.png`, videoUrl: "https://www.youtube.com/watch?v=zU6X_LO362s" },
  // Dos
  "tirage frontal": { imageUrl: `${EK}/wide-grip-lat-pull-down-1.png`, videoUrl: "https://www.youtube.com/watch?v=TDQ2G4jmx40" },
  "rowing penché en pronation (barre)": { imageUrl: `${EK}/reverse-grips-bent-over-barbell-rows-1.png`, videoUrl: "https://www.youtube.com/watch?v=3BhIn8rdA4o" },
  "extension du tronc (hyperextension)": { imageUrl: `${EK}/hyperextensions-1.png`, videoUrl: "https://www.youtube.com/watch?v=C2rPJj53HNQ" },
  // Bras (séparateur "•" legacy)
  "triceps corde • superset • curl 21": { imageUrl: `${EK}/triceps-pushdown-with-rope-and-cable-1.png`, videoUrl: "https://www.youtube.com/watch?v=6RdWmkS5JOM" },
  "triceps français poulie • superset • curl direct poulie": { imageUrl: `${EK}/lying-triceps-extension-with-dumbbells-1.png`, videoUrl: "https://www.youtube.com/watch?v=PlhVpFOxDcg" },
  "curl direct poulie": { imageUrl: `${EK}/standing-biceps-curl-with-cable-1.png`, videoUrl: "https://www.youtube.com/watch?v=2MUEL4nL6hA" },
  // Pectoraux / Épaules
  "développé couché incliné": { imageUrl: `${EK}/dumbbell-incline-bench-press-1.png`, videoUrl: "https://www.youtube.com/watch?v=1zOF0H7Upws" },
  "pec deck / butterfly machine": { imageUrl: `${EK}/butterfly-machine-1.png`, videoUrl: "https://www.youtube.com/watch?v=3jYo5cMU3d4" },
  "développé frontal haltères • superset • élévation latérale assis": { imageUrl: `${EK}/seated-military-press-1.png`, videoUrl: "https://www.youtube.com/watch?v=4iy1yoGRPz4" },
  "développé frontal + élévation latérale": { imageUrl: `${EK}/seated-military-press-1.png`, videoUrl: "https://www.youtube.com/watch?v=4iy1yoGRPz4" },
  "développé frontal": { imageUrl: `${EK}/seated-military-press-1.png`, videoUrl: "https://www.youtube.com/watch?v=4iy1yoGRPz4" },
  // Abdominaux (anciens noms)
  "abdos canif": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=LPsepk-C-d4" },
  "abdos ciseaux + abdos canif": { imageUrl: null, videoUrl: "https://www.youtube.com/watch?v=XyLTb8ZTh48" },
};

const LANGUAGE_VIDEO_FALLBACKS = {
  fr: ["fr", "pt", "en"],
  pt: ["pt", "fr", "en"],
  en: ["en", "fr", "pt"],
};

function normalizeLanguageTag(language) {
  if (!language) return "fr";
  return String(language).toLowerCase().replace("_", "-");
}

function getLanguageCandidates(language) {
  const normalized = normalizeLanguageTag(language);
  const primary = normalized.split("-")[0];
  const configured = LANGUAGE_VIDEO_FALLBACKS[primary] ?? [primary, "fr", "en", "pt"];
  return Array.from(new Set([normalized, primary, ...configured, "fr", "en", "pt"])).filter(Boolean);
}

function resolveVideoUrl(media, language) {
  if (!media) return null;
  if (media.videoUrls && typeof media.videoUrls === "object") {
    for (const candidate of getLanguageCandidates(language)) {
      const url = media.videoUrls[candidate];
      if (url) return url;
    }
  }
  return media.videoUrl ?? null;
}

export function getExerciseVideoSearchUrl(name, language = "fr") {
  if (!name) return null;
  const primary = normalizeLanguageTag(language).split("-")[0];
  const suffixByLanguage = {
    fr: "exécution correcte musculation",
    pt: "execucao correta musculacao",
    en: "proper form gym exercise",
  };
  const suffix = suffixByLanguage[primary] ?? suffixByLanguage.fr;
  const query = `${name} ${suffix}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

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
 * Retourne { imageUrl, videoUrl, videoUrls, description } pour un exercice donné.
 * Retourne { imageUrl: null, videoUrl: null } si non trouvé.
 */
export function getExerciseMedia(name, options = {}) {
  const language = typeof options === "string" ? options : options.language;
  if (!name) return { imageUrl: null, videoUrl: null, videoUrls: null, description: null };

  const media = NORMALIZED_MEDIA[normalizeKey(name)];
  if (!media) return { imageUrl: null, videoUrl: null, videoUrls: null, description: null };

  return {
    ...media,
    videoUrl: resolveVideoUrl(media, language),
    videoUrls: media.videoUrls ?? null,
  };
}
