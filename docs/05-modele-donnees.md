# Modele De Donnees V1

## Entites principales

## User

- `id`
- `email`
- `password` — **haché PBKDF2-SHA-256** (100 000 itérations, sel = `"meutreino:" + email`), jamais stocké en clair
- `role` (`admin` | `coach` | `user`)
- `profile`
- `coachId` (nullable)
- `createdAt`
- `updatedAt`

## UserProfile (minimum V1)

- `firstName`
- `lastName`
- `birthYear`
- `sex`
- `weightKg`
- `heightCm`
- `waistCm` (optionnel)

Note: champs minimaux maintenant, extensibles ensuite (objectif, niveau, contraintes santé).

## TemplatePlan

- `id`
- `name`
- `monthLabel` (ex: `2026-04`)
- `days[]`
- `createdByAdminId`
- `createdAt`
- `updatedAt`

## UserPlan

- `id`
- `userId`
- `sourceTemplateId` (nullable)
- `version` (ex: `2026-04-v1`)
- `isActive`
- `days[]`
- `updatedBy` (`admin` | `coach` | `user`)
- `updatedAt`

Preparation evolution mensuelle:

- conserver les versions precedentes,
- activer une seule version a la fois.

## SessionRun

- `id`
- `userId`
- `planVersion`
- `dayId`
- `mode` (`run`)
- `status` (`running` | `paused` | `completed` | `stopped`)
- `startedAt`
- `endedAt`
- `elapsedMs`
- `completedExercisesCount`
- `exerciseRuns[]`

## ExerciseRun

- `exerciseId`
- `status` (`pending` | `in_progress` | `completed`)
- `setRuns[]`

## SetRun

- `index`
- `targetReps`
- `targetLoad`
- `actualReps`
- `actualLoad`
- `validated`
- `validatedAt`
- `restTimerSec`

## WeightHistory

- `id` (auto-incrémenté)
- `userId`
- `weightKg` (max 500)
- `recordedAt`

## WeeklyProgressSnapshot

- `userId`
- `weekKey` (ISO week)
- `completedSessions`
- `completedExercises`
- `totalTrainingMs`

## Historique + reset hebdo

- L'historique session est conserve en permanence.
- Le tableau de bord hebdo est recalcule/reset par `weekKey`.

## Stockage physique (V1)

Toutes les entités sont stockées dans **IndexedDB** via Dexie (`meutreino`, schema v4).

| Table | Indexes |
|---|---|
| `users` | `id`, `email`, `role`, `coachId` |
| `templates` | `id`, `monthLabel`, `createdByAdminId` |
| `userPlans` | `id`, `[userId+isActive]`, `userId`, `isActive` |
| `sessions` | `id`, `userId`, `[userId+dayId]`, `status`, `startedAt`, `dayId` |
| `weightHistory` | `++id`, `userId`, `recordedAt` |
| `appMeta` | `key` |

### Session d'authentification

Stockée dans `localStorage` sous la clé `meutreino.session` :
```json
{ "userId": "user-1", "expiresAt": 1234567890000 }
```
TTL : 7 jours. Expiry vérifiée à chaque `getCurrentUser()`.

### Persistance navigateur

`navigator.storage.persist()` est appelé au démarrage pour demander au navigateur de ne pas évacuer les données sous pression mémoire.
L'indicateur de statut est visible dans la page Profil.
