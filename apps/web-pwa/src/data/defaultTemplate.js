function emptySet() {
  return { reps: "12", load: "-", rest: "-", tempo: "-" };
}

function sets(count) {
  return Array.from({ length: count }, () => emptySet());
}

export const defaultTemplate = {
  id: "template-mois-2",
  name: "Template Mois 2",
  monthLabel: "2026-03",
  createdByAdminId: "admin-1",
  days: [
    {
      id: "lundi",
      label: "LUN",
      fullLabel: "Lundi",
      training: "Treino A",
      title: "Membres inferieurs A",
      warmup: [
        { name: "Etirement fessier", detail: "30 sec chaque cote" },
        { name: "Etirement dynamique ischio", detail: "30 sec chaque cote" },
        { name: "Mobilite hanche 90/90", detail: "12 reps chaque cote" },
        { name: "Etirement mollet", detail: "30 sec chaque cote" },
        { name: "Mobilite cheville", detail: "15 reps chaque cote" },
      ],
      main: [
        {
          id: "lun-ex-1",
          name: "Leg Extension",
          tag: "Activation",
          tagColor: "#f5a623",
          series: [
            { reps: "15", load: "70 kg", rest: "-", tempo: "2020" },
            { reps: "15", load: "70 kg", rest: "-", tempo: "2020" },
          ],
          note: null,
        },
        {
          id: "lun-ex-2",
          name: "Leg Extension",
          tag: "Principal",
          tagColor: "#e53935",
          series: [
            { reps: "12", load: "70 kg", rest: "-", tempo: "3020" },
            { reps: "12", load: "70 kg", rest: "-", tempo: "3020" },
            { reps: "12 + drop set", load: "70 kg -> -30%", rest: "-", tempo: "3020" },
          ],
          note: "Derniere serie: drop set",
        },
        {
          id: "lun-ex-3",
          name: "Squat barre libre",
          tag: null,
          series: [
            { reps: "10", load: "40 kg", rest: "-", tempo: "3020" },
            { reps: "10", load: "40 kg", rest: "-", tempo: "3020" },
            { reps: "10", load: "40 kg", rest: "-", tempo: "3020" },
          ],
          note: null,
        },
        {
          id: "lun-ex-4",
          name: "Soulevé de terre jambes tendues",
          tag: null,
          series: [
            { reps: "12", load: "30 kg", rest: "-", tempo: "3020" },
            { reps: "12", load: "30 kg", rest: "-", tempo: "3020" },
            { reps: "12", load: "30 kg", rest: "-", tempo: "3020" },
          ],
          note: null,
        },
        {
          id: "lun-ex-5",
          name: "Mollets debout",
          tag: "Pyramide",
          tagColor: "#8e44ad",
          series: [
            { reps: "20", load: "Charge legere", rest: "60 s", tempo: "3020" },
            { reps: "15", load: "Charge moyenne", rest: "60 s", tempo: "3020" },
            { reps: "12", load: "Charge lourde", rest: "60 s", tempo: "3020" },
          ],
          note: null,
        },
      ],
    },
    {
      id: "mardi",
      label: "MAR",
      fullLabel: "Mardi",
      training: "Treino B",
      title: "Dorsaux + Biceps",
      warmup: [
        { name: "Etirement pectoraux bilateral", detail: "1 serie" },
        { name: "Mobilite colonne thoracique", detail: "1 serie" },
        { name: "Etirement unilateral lateral tronc", detail: "1 serie" },
      ],
      main: [
        { id: "mar-ex-1", name: "Tirage vertical", tag: "Activation", tagColor: "#f5a623", series: sets(2), note: null },
        { id: "mar-ex-2", name: "Tirage vertical", tag: "Principal", tagColor: "#e53935", series: sets(4), note: null },
        { id: "mar-ex-3", name: "Rowing assis poulie basse", tag: null, series: sets(3), note: null },
        { id: "mar-ex-4", name: "Tirage barre penché", tag: null, series: sets(3), note: null },
        { id: "mar-ex-5", name: "Extension lombaire", tag: null, series: sets(3), note: null },
      ],
    },
    {
      id: "mercredi",
      label: "MER",
      fullLabel: "Mercredi",
      training: "Treino C",
      title: "Triceps + Biceps",
      warmup: [
        { name: "Etirement pectoraux unilateral", detail: "1 serie" },
        { name: "Etirement lateral tronc", detail: "1 serie" },
        { name: "Mobilite YTW", detail: "1 serie" },
      ],
      main: [
        { id: "mer-ex-1", name: "Triceps corde poulie haute", tag: "Activation", tagColor: "#f5a623", series: sets(2), note: null },
        { id: "mer-ex-2", name: "Triceps corde + Curl 21", tag: "Superset", tagColor: "#1abc9c", series: sets(3), note: null },
        { id: "mer-ex-3", name: "Triceps francais + Curl poulie", tag: "Superset", tagColor: "#1abc9c", series: sets(3), note: null },
      ],
    },
    {
      id: "jeudi",
      label: "JEU",
      fullLabel: "Jeudi",
      training: "Treino D",
      title: "Membres inferieurs D",
      warmup: [
        { name: "Etirement quadriceps unilateral", detail: "1 serie" },
        { name: "Etirement dynamique ischio", detail: "1 serie" },
      ],
      main: [
        { id: "jeu-ex-1", name: "Leg Curl assis", tag: "Activation", tagColor: "#f5a623", series: sets(2), note: null },
        { id: "jeu-ex-2", name: "Leg Curl assis", tag: "Principal", tagColor: "#e53935", series: sets(3), note: null },
        { id: "jeu-ex-3", name: "Abduction hanche penché", tag: null, series: sets(3), note: null },
        { id: "jeu-ex-4", name: "Leg Press 45", tag: null, series: sets(3), note: null },
        { id: "jeu-ex-5", name: "Mollets presse 45°", tag: null, series: sets(4), note: null },
      ],
    },
    {
      id: "vendredi",
      label: "VEN",
      fullLabel: "Vendredi",
      training: "Treino E",
      title: "Pectoraux + Epaules",
      warmup: [
        { name: "Etirement pectoraux bilateral", detail: "1 serie" },
        { name: "Etirement rotateurs internes", detail: "1 serie" },
      ],
      main: [
        { id: "ven-ex-1", name: "Développé incliné", tag: "Activation", tagColor: "#f5a623", series: sets(2), note: null },
        { id: "ven-ex-2", name: "Développé incliné", tag: "Principal", tagColor: "#e53935", series: sets(3), note: null },
        { id: "ven-ex-3", name: "Pec deck", tag: null, series: sets(3), note: null },
        { id: "ven-ex-4", name: "Développé militaire + Élévation latérale", tag: "Superset", tagColor: "#1abc9c", series: sets(4), note: null },
      ],
    },
    {
      id: "samedi",
      label: "SAM",
      fullLabel: "Samedi",
      rest: true,
    },
    {
      id: "dimanche",
      label: "DIM",
      fullLabel: "Dimanche",
      training: "Cardio",
      title: "Cardio 40 Minutes",
      cardioOnly: true,
    },
  ],
};

export function buildDefaultTemplate() {
  return JSON.parse(JSON.stringify(defaultTemplate));
}
