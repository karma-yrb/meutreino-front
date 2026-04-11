# Rapport de Faisabilité - Cohérence Linguistique

Date: 11 avril 2026  
Projet: MeuTreino (web-pwa)  
Auteur: Audit technique interne

## 1. Objectif du rapport

Évaluer la faisabilité de:
- n'afficher qu'une seule langue à la fois (cible actuelle: français),
- garantir la qualité orthographique (accents inclus),
- préparer une transition vers une version multilingue,
- avec exception temporaire pour les vidéos.

## 2. Périmètre retenu

Inclus:
- textes visibles UI (pages, composants, labels, placeholders, titres, messages),
- dictionnaire i18n actuel (`fr.json`),
- données métier injectées dans l'UI (templates, libellés d'exercices, statuts),
- structure technique i18n.

Hors périmètre:
- contenu des vidéos et leur langue (exception explicitement demandée),
- refonte UX ou produit non liée à la langue.

## 3. État actuel (synthèse)

### 3.1 Point positif

Une base i18n existe déjà et l'application est initialisée en `fr`.

### 3.2 Écarts constatés

- Le dictionnaire `fr.json` est très partiel: seule la page de connexion est réellement branchée sur `t(...)`.
- Une grande partie des textes est codée en dur dans les composants/pages.
- Présence de mélange linguistique dans les contenus métier (français + portugais + anglais), notamment dans certains noms d'entraînements et d'exercices.
- Présence de fautes récurrentes (accents, orthographe, cohérence terminologique).
- Certains statuts techniques sont affichés tels quels (`running`, `stopped`, etc.), donc non localisés.

## 4. Faisabilité par objectif

### Objectif A - Une seule langue à la fois (français)

Faisabilité: **Élevée**  
Complexité: **Moyenne**  
Dépendance majeure: extraction systématique des textes en dur vers i18n.

Conclusion: atteignable rapidement si une passe globale est faite sur tous les écrans et labels d'accessibilité.

### Objectif B - Orthographe et accents

Faisabilité: **Très élevée**  
Complexité: **Faible à moyenne**  
Dépendance majeure: inventaire complet des chaînes visibles.

Conclusion: réalisable en premier lot, avec fort impact qualité perçue.

### Objectif C - Passage multilingue

Faisabilité: **Bonne, sous conditions d'architecture**  
Complexité: **Moyenne à élevée**  
Dépendance majeure: découpler les données métier des libellés localisés (introduire des IDs stables).

Conclusion: faisable, mais déconseillé sans étape de fondation i18n, sinon dette technique élevée.

## 5. Risques et points d'attention

- **Risque de régression UI**: oublier des textes en dur dans des zones secondaires (modales, aria-label, placeholders, tests).
- **Risque de dette i18n**: traduire directement des chaînes métier au lieu d'utiliser des clés stables.
- **Risque test**: les tests actuels semblent couplés à des libellés précis; ils devront évoluer vers des helpers i18n.
- **Risque data historique**: alias existants pour anciens noms; il faut préserver la compatibilité.

## 6. Scénarios de mise en œuvre

### Scénario 1 - Correctif FR immédiat (court terme)

Contenu:
- correction orthographe/accents,
- uniformisation FR des textes visibles,
- sans refonte de structure data.

Avantage:
- rapide, bénéfice immédiat.

Limite:
- prépare mal le vrai multilingue.

### Scénario 2 - Fondation i18n propre (recommandé)

Contenu:
- extraction exhaustive des chaînes UI dans des namespaces i18n,
- normalisation terminologique FR,
- préparation d'un schéma de clés stable.

Avantage:
- base solide pour multi-langue ensuite.

Limite:
- effort initial supérieur au scénario 1.

### Scénario 3 - Multilingue complet immédiat

Contenu:
- FR + nouvelles locales dès maintenant,
- migration simultanée data + UI + tests.

Avantage:
- objectif final atteint d'un coup.

Limite:
- risque élevé, charge importante, plus de régressions probables.

## 7. Recommandation

Recommandation: **Scénario 2 en deux phases**.

Phase 1 (qualité FR):
- corriger tous les textes FR (orthographe/accents/terminologie),
- éliminer les mélanges de langue visibles hors exception vidéo.

Phase 2 (préparation multilingue):
- centraliser l'ensemble des textes UI dans i18n,
- introduire des identifiants métier stables pour éviter de lier la logique aux libellés traduits,
- conserver l'exception vidéo telle qu'elle existe.

## 8. Estimation macro (ordre de grandeur)

- Phase 1: **1 à 2 jours** (selon niveau de couverture attendu).
- Phase 2: **3 à 6 jours** (incluant adaptation des tests et validation).
- Multilingue complet ensuite: **+3 à 8 jours** selon nombre de locales.

## 9. Critères d'acceptation proposés

- Aucun texte utilisateur non français (hors vidéos) sur le parcours principal.
- Aucune faute d'accent/orthographe identifiée dans les écrans et messages clés.
- 100% des libellés UI externalisés dans i18n (incluant aria-label, placeholders, boutons, statuts affichés).
- Ajout d'au moins une locale de test (même partielle) validant la capacité de bascule de langue.

## 10. Conclusion

Le chantier est **faisable** et **pertinent**.  
Le meilleur ratio valeur/risque est d'abord une normalisation française complète, puis une consolidation i18n avant d'ouvrir réellement le multilingue.  
L'exception vidéo actuelle est compatible avec cette trajectoire.

