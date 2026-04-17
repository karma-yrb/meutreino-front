# Web PWA App

Application React/Vite installable (manifest + service worker en place).

## Run (depuis la racine)

```bash
npm run dev
```

## Build (depuis la racine)

```bash
npm run build
```

## Tests (depuis la racine)

```bash
npm run test
npm run test:integration
npm run test:e2e
```

## Comptes demo

- `admin@local` / `admin123`
- `coach@local` / `coach123`
- `user@local` / `user123`

> Les mots de passe sont stockés hashés (PBKDF2-SHA-256) — les valeurs ci-dessus sont les mots de passe en clair à saisir au login.

## Ce qui est livré

- Auth locale avec routes protégées, session TTL 7 jours.
- Mots de passe hashés PBKDF2-SHA-256 via `crypto.subtle`.
- Seed automatique IndexedDB au premier lancement — données réelles préservées lors d'un bump de version de seed (soft seed).
- `navigator.storage.persist()` au démarrage pour protéger la base contre l'éviction navigateur.
- Rôles `admin`, `coach`, `user`.
- Accueil avec détection du jour courant et badge statut de la séance du jour.
- Vue semaine avec badges de statut par jour (Terminée / En cours / En pause / Arrêtée).
- Banner "Reprendre" sur l'accueil pour toute séance interrompue (paused sans TTL, running < 24 h).
- Vue jour en mode visualisation avec édition reps/charge/nombre de séries.
- Mode "Lancer session" :
  - validation série par série,
  - timer récupération avec skip,
  - chrono global avec pause/reprise/stop,
  - progression auto vers exercice suivant,
  - sauvegarde incrémentale en IndexedDB à chaque validation de série.
- Page Profil :
  - édition identité + profil morphologique,
  - indicateurs santé (IMC, masse grasse, poids idéal, risque cardiovasculaire),
  - export JSON des données (séances, poids, plan),
  - indicateur de statut de persistance navigateur.
- Page Progrès : stats, records perso, heatmap, courbes de progression par exercice, tendance poids.
- Écrans admin/coach initiaux.

## Limites V1 (local-only)

| Limite | Impact |
|---|---|
| Données liées au navigateur | Changer de navigateur sur la même machine = perte des données |
| Pas de sync multi-appareils | Téléphone et PC ne partagent rien |
| "Clear browsing data" | Efface toute la base sans récupération |
| Pas d'import JSON | L'export existe, la réimportation est prévue en V1.1 |
| Persistence mobile non garantie | Si `storage.persist()` est refusé, le navigateur peut évincer les données sous pression mémoire |

**Recommandation** : installer l'app via "Ajouter à l'écran d'accueil" et exporter régulièrement depuis le Profil.
