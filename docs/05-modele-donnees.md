# Modele De Donnees V1

## Entites principales

## User

- `id`
- `email`
- `passwordHash` (V1 local)
- `role` (`admin` | `coach` | `user`)
- `profile`
- `coachId` (nullable)
- `createdAt`
- `updatedAt`

## UserProfile (minimum V1)

- `firstName`
- `lastName`
- `birthYear` (ou age si simplifie)
- `sex`
- `weightKg`
- `heightCm`

Note: champs minimaux maintenant, extensibles ensuite (objectif, niveau, contraintes sante).

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

## WeeklyProgressSnapshot

- `userId`
- `weekKey` (ISO week)
- `completedSessions`
- `completedExercises`
- `totalTrainingMs`

## Historique + reset hebdo

- L'historique session est conserve en permanence.
- Le tableau de bord hebdo est recalcule/reset par `weekKey`.
