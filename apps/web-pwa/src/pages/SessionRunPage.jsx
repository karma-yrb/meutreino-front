import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faRepeat, faPlay, faPause, faStop, faCheck, faForward, faChevronLeft, faChevronRight, faXmark, faFlagCheckered, faFire } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  buildPlanDayUpdaterFromSession,
  buildSessionRun,
  getElapsedMs,
  pauseSession,
  restartCurrentExercise,
  resumeSession,
  skipRestTimer,
  stopSession,
  tickSession,
  updateCurrentSetValues,
  validateCurrentSet,
} from "@meutreino/core-domain";
import { useAuth } from "../features/auth/useAuth";
import { getActivePlanForUser, getDayPlanForUser, updateUserPlanDay } from "../services/storage/repositories/plansRepository";
import { getActiveSessionForDay, saveSessionRun } from "../services/storage/repositories/sessionsRepository";
import { getExerciseMedia } from "../data/exerciseMedia";

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getYoutubeVideoId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const shortId = parsed.pathname.replace("/", "").trim();
      return shortId || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function getYoutubeThumbnailUrl(url) {
  const id = getYoutubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function getSlides(exercise, language) {
  if (!exercise) return [{ type: "image", url: null, label: "Exercice" }];

  const name = exercise.name ?? "";
  const parts = name.split(/\s*\+\s*/);
  const customVideoUrl = exercise.videoUrl?.trim() || null;
  const customPreviewImageUrl = exercise.previewImageUrl?.trim() || null;
  const slides = parts.flatMap((part) => {
    const media = getExerciseMedia(part.trim(), language);
    const resolvedVideoUrl = customVideoUrl || media.videoUrl || null;
    const resolvedImageUrl = customPreviewImageUrl || getYoutubeThumbnailUrl(resolvedVideoUrl) || media.imageUrl;
    const imageSlide = { type: "image", url: resolvedImageUrl, label: part.trim() || name || "Exercice" };

    if (customVideoUrl) return [imageSlide];
    if (!media.videoUrl) return [imageSlide];

    return [
      imageSlide,
      {
        type: "video",
        url: media.videoUrl,
        embedId: getYoutubeVideoId(media.videoUrl),
        thumbnailUrl: getYoutubeThumbnailUrl(media.videoUrl),
        label: part.trim() || name || "Vidéo",
      },
    ];
  });

  if (customVideoUrl) {
    slides.push({
      type: "video",
      url: customVideoUrl,
      embedId: getYoutubeVideoId(customVideoUrl),
      thumbnailUrl: getYoutubeThumbnailUrl(customVideoUrl),
      label: name || "Vidéo",
    });
  }

  return slides.length > 0 ? slides : [{ type: "image", url: null, label: name || "Exercice" }];
}

function getExercisePreviewImage(exercise, language) {
  return getSlides(exercise, language).find((slide) => slide.type === "image" && slide.url)?.url ?? null;
}

function formatExerciseSetMetric(sets, key) {
  if (!Array.isArray(sets) || sets.length === 0) return "-";
  const values = sets.map((set) => {
    const value = set?.[key];
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  });
  const uniqueValues = [...new Set(values)];
  return uniqueValues.length === 1 ? uniqueValues[0] : values.join(" / ");
}

function cloneValue(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function sanitizeNumericInput(value, { allowDecimal = false } = {}) {
  const raw = String(value ?? "");
  if (!allowDecimal) return raw.replace(/\D+/g, "");

  const withDot = raw.replace(/,/g, ".");
  const cleaned = withDot.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");
  if (firstDotIndex === -1) return cleaned;

  const integerPart = cleaned.slice(0, firstDotIndex);
  const decimalPart = cleaned.slice(firstDotIndex + 1).replace(/\./g, "");
  return `${integerPart || "0"}.${decimalPart}`;
}

function getSetMetricDisplayValue(set, field) {
  if (field === "actualLoad") {
    return sanitizeNumericInput(set?.actualLoad ?? set?.targetLoad ?? "", { allowDecimal: true }) || "-";
  }
  return sanitizeNumericInput(set?.actualReps ?? set?.targetReps ?? "") || "-";
}

function formatLoadWithUnit(loadValue) {
  return loadValue === "-" ? "-" : `${loadValue} kg`;
}

function isSupersetExercise(exercise) {
  return typeof exercise?.name === "string" && exercise.name.includes(" + ");
}

function getSupersetSubNames(exercise) {
  return (exercise?.name ?? "").split(/\s*\+\s*/);
}

function parseSupersetSubParts(combinedStr, separator, count) {
  if (!combinedStr || combinedStr === "-") return Array(count).fill("-");
  const parts = combinedStr.split(separator).map((p) => p.trim());
  // Single value → same for all sub-exercises (e.g. reps: "12")
  if (parts.length === 1) return Array(count).fill(parts[0]);
  while (parts.length < count) parts.push("-");
  return parts.slice(0, count);
}

function isTimedValue(str) {
  return typeof str === "string" && /[a-zA-Z]/.test(str) && str !== "-";
}

export function SessionRunPage() {
  const { dayId } = useParams();
  const { i18n } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const uiLanguage = i18n.resolvedLanguage || i18n.language || "fr";
  const [day, setDay] = useState(null);
  const [session, setSession] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [justValidated, setJustValidated] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const persistedRef = useRef(false);
  const headerCardRef = useRef(null);
  const stickyActivationYRef = useRef(null);
  const pinnedRef = useRef(false);
  const [isHeaderPinned, setIsHeaderPinned] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser || !dayId) return;
      const [dayData, activePlan] = await Promise.all([
        getDayPlanForUser(currentUser.id, dayId),
        getActivePlanForUser(currentUser.id),
      ]);

      setDay(dayData);

      // Try to resume an in-progress session (< 2h old)
      const existing = await getActiveSessionForDay(currentUser.id, dayId);
      if (existing) {
        setSession(existing);
        persistedRef.current = false;
        return;
      }

      const hasRunnableContent = (dayData?.main?.length ?? 0) > 0 || (dayData?.warmup?.length ?? 0) > 0;
      if (!dayData?.rest && (dayData?.cardioOnly || hasRunnableContent)) {
        // For cardioOnly days, inject a synthetic exercise so the session has 1 item,
        // the timer starts, and progress shows 0/1 → 1/1.
        const dayForSession = dayData.cardioOnly
          ? {
              ...dayData,
              warmup: [],
              main: [{
                id: `${dayId}-cardio`,
                name: dayData.title ?? "Cardio",
                note: null,
                videoUrl: null,
                previewImageUrl: null,
                series: [{ reps: "-", load: "-", rest: "-", tempo: "-" }],
              }],
            }
          : dayData;
        const run = buildSessionRun({
          userId: currentUser.id,
          dayId,
          day: dayForSession,
          planVersion: activePlan?.version ?? "unknown",
          restSeconds: dayData.cardioOnly ? 0 : 60,
          nowMs: Date.now(),
        });
        setSession(run);
      }
    }
    load();
  }, [currentUser, dayId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      setSession((prev) => (prev ? tickSession(prev, t) : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setMediaModalOpen(false);
    }
    if (mediaModalOpen) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
    return undefined;
  }, [mediaModalOpen]);

  // Incremental save: persist session to DB on every set validation, pause, or resume
  // so that closing/reloading the browser does not lose progress.
  const lastSavedJsonRef = useRef(null);
  useEffect(() => {
    if (!session || !currentUser) return;
    // Skip tick-only updates (only rest timer changes) to avoid writes every 500ms
    const snapshot = JSON.stringify({
      status: session.status,
      currentExerciseIndex: session.currentExerciseIndex,
      currentSetIndex: session.currentSetIndex,
      exercises: session.exercises,
    });
    if (snapshot === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = snapshot;
    saveSessionRun({ ...session, elapsedMs: getElapsedMs(session, Date.now()) });
  }, [session, currentUser]);

  useEffect(() => {
    async function persistIfFinalized() {
      if (!session || persistedRef.current) return;
      if (session.status !== "completed" && session.status !== "stopped") return;

      const payload = {
        ...session,
        elapsedMs: getElapsedMs(session, Date.now()),
      };
      await saveSessionRun(payload);

      // Write back actual values (reps/load) to the plan as new defaults
      const updater = buildPlanDayUpdaterFromSession(payload);
      if (updater && currentUser) {
        await updateUserPlanDay(currentUser.id, session.dayId, updater);
      }

      persistedRef.current = true;
    }
    persistIfFinalized();
  }, [session, currentUser]);

  useEffect(() => {
    const topOffset = 8;
    const activateDelta = 6;
    const releaseAtTopY = 4;

    const computeActivationY = () => {
      const card = headerCardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      stickyActivationYRef.current = window.scrollY + rect.top - topOffset;
    };

    const updatePinnedState = () => {
      if (stickyActivationYRef.current === null) return;
      const y = window.scrollY;
      let next = pinnedRef.current;

      if (!pinnedRef.current && y >= stickyActivationYRef.current + activateDelta) {
        next = true;
      } else if (pinnedRef.current && y <= releaseAtTopY) {
        next = false;
      }

      if (next !== pinnedRef.current) {
        pinnedRef.current = next;
        setIsHeaderPinned(next);
      }
    };
    const handleResize = () => {
      computeActivationY();
      updatePinnedState();
    };

    computeActivationY();
    updatePinnedState();

    window.addEventListener("scroll", updatePinnedState, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", updatePinnedState);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const currentExercise = session?.exercises?.[session.currentExerciseIndex] ?? null;
  const currentSet = currentExercise?.sets?.[session.currentSetIndex] ?? null;
  const currentMedia = useMemo(() => getExerciseMedia(currentExercise?.name, uiLanguage), [currentExercise?.name, uiLanguage]);
  const currentSlides = useMemo(() => getSlides(currentExercise, uiLanguage), [currentExercise, uiLanguage]);
  const activeSlideIndex = currentSlides.length > 0 ? currentSlideIndex % currentSlides.length : 0;
  const activeSlide = currentSlides[activeSlideIndex] ?? currentSlides[0];
  const repsInputValue = sanitizeNumericInput(currentSet?.actualReps ?? "");
  const loadInputValue = sanitizeNumericInput(currentSet?.actualLoad ?? "", { allowDecimal: true });
  const orderedSets = useMemo(() => currentExercise?.sets ?? [], [currentExercise]);
  const canRestartCurrentExercise = useMemo(
    () => orderedSets.some((set) => Boolean(set?.validated)),
    [orderedSets],
  );

  const elapsedLabel = formatDuration(session ? getElapsedMs(session, nowMs) : 0);
  const progressLabel = useMemo(() => {
    if (!session) return "0/0";
    return `${session.completedExercisesCount}/${session.exercises.length}`;
  }, [session]);
  const exerciseProgressPercent = useMemo(() => {
    if (!session || session.exercises.length === 0) return 0;
    return Math.round((session.completedExercisesCount / session.exercises.length) * 100);
  }, [session]);
  const baseExerciseOrderIds = useMemo(() => {
    const warmupIds = (day?.warmup ?? []).map((item, idx) => item.id ?? `${dayId}-wu-${idx + 1}`);
    const mainIds = (day?.main ?? []).map((exercise, idx) => exercise.id ?? `${dayId}-ex-${idx + 1}`);
    if (warmupIds.length || mainIds.length) {
      return [...warmupIds, ...mainIds];
    }
    return session?.exercises?.map((exercise) => exercise.id) ?? [];
  }, [day, dayId, session]);
  const orderedExercises = useMemo(() => {
    if (!session?.exercises?.length) return [];
    const hideCurrentExercise = session.status === "running" || session.status === "paused";
    const byId = new Map(session.exercises.map((exercise, idx) => [exercise.id, { exercise, idx }]));
    const orderedIds = baseExerciseOrderIds.length
      ? baseExerciseOrderIds
      : session.exercises.map((exercise) => exercise.id);

    return orderedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .filter(({ idx }) => !(hideCurrentExercise && idx === session.currentExerciseIndex))
      .map(({ exercise, idx }) => {
        const state = exercise?.status === "completed" ? "validated" : "inactive";
        return { exercise, idx, state, order: idx + 1 };
      });
  }, [session, baseExerciseOrderIds]);

  function setValue(field, value) {
    const normalizedValue = field === "actualLoad"
      ? sanitizeNumericInput(value, { allowDecimal: true })
      : sanitizeNumericInput(value);
    setSession((prev) => {
      if (!prev) return prev;
      return updateCurrentSetValues(prev, { [field]: normalizedValue });
    });
  }

  function stepValue(field, delta) {
    const raw = field === "actualReps" ? repsInputValue : loadInputValue;
    const current = parseFloat(raw);
    const base = isNaN(current) ? 0 : current;
    const next = field === "actualReps"
      ? Math.max(1, Math.round(base) + delta)
      : Math.max(0, base + delta);
    const formatted = field === "actualReps" || Number.isInteger(next) ? String(next) : next.toFixed(1);
    setValue(field, formatted);
  }

  function setSupersetPartValue(field, partIndex, value, subCount) {
    const separator = field === "actualReps" ? " + " : " / ";
    const currentStr = field === "actualReps"
      ? (currentSet?.actualReps ?? currentSet?.targetReps ?? "")
      : (currentSet?.actualLoad ?? currentSet?.targetLoad ?? "");
    const parts = parseSupersetSubParts(currentStr, separator, subCount);
    const partIsTimed = isTimedValue(parts[partIndex]);
    parts[partIndex] = partIsTimed
      ? String(value ?? "")
      : (field === "actualLoad"
          ? sanitizeNumericInput(value, { allowDecimal: true })
          : sanitizeNumericInput(value));
    const joined = parts.join(separator);
    setSession((prev) => {
      if (!prev) return prev;
      return updateCurrentSetValues(prev, { [field]: joined });
    });
  }

  function stepSupersetPartValue(field, partIndex, delta, subCount) {
    const separator = field === "actualReps" ? " + " : " / ";
    const currentStr = field === "actualReps"
      ? (currentSet?.actualReps ?? currentSet?.targetReps ?? "")
      : (currentSet?.actualLoad ?? currentSet?.targetLoad ?? "");
    const parts = parseSupersetSubParts(currentStr, separator, subCount);
    const raw = sanitizeNumericInput(parts[partIndex], { allowDecimal: field === "actualLoad" });
    const base = parseFloat(raw);
    const current = isNaN(base) ? 0 : base;
    const next = field === "actualReps"
      ? Math.max(1, Math.round(current) + delta)
      : Math.max(0, current + delta);
    const formatted = field === "actualReps" || Number.isInteger(next) ? String(next) : next.toFixed(1);
    parts[partIndex] = formatted;
    const joined = parts.join(separator);
    setSession((prev) => {
      if (!prev) return prev;
      return updateCurrentSetValues(prev, { [field]: joined });
    });
  }

  function onValidateSet() {
    setSession((prev) => {
      if (!prev) return prev;
      return validateCurrentSet(prev, { nowMs: Date.now() });
    });
    setJustValidated(true);
    setTimeout(() => setJustValidated(false), 700);
  }

  function onRestartExercise() {
    setSession((prev) => {
      if (!prev) return prev;
      return restartCurrentExercise(prev, { nowMs: Date.now() });
    });
    setJustValidated(false);
  }

  function onPauseResume() {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.status === "running") return pauseSession(prev, Date.now());
      if (prev.status === "paused") return resumeSession(prev, Date.now());
      return prev;
    });
  }

  function onStop() {
    setSession((prev) => (prev ? stopSession(prev, Date.now()) : prev));
  }

  function cycleSlide(direction = 1) {
    if (currentSlides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev + direction + currentSlides.length) % currentSlides.length);
  }

  function focusExercise(exerciseIndex) {
    setSession((prev) => {
      if (!prev || !prev.exercises?.[exerciseIndex]) return prev;
      if (prev.currentExerciseIndex === exerciseIndex) return prev;

      const next = cloneValue(prev);
      next.currentExerciseIndex = exerciseIndex;
      const targetExercise = next.exercises[exerciseIndex];
      const nextSetIndex = targetExercise.sets.findIndex((set) => !set.validated);
      next.currentSetIndex = nextSetIndex >= 0 ? nextSetIndex : Math.max(0, targetExercise.sets.length - 1);

      if (targetExercise.status === "pending") {
        targetExercise.status = "in_progress";
      }

      // Switching exercise exits rest mode to let the user continue immediately.
      next.rest.active = false;
      next.rest.remainingSeconds = 0;
      next.rest.endsAtMs = null;

      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!day) {
    return <div className="page">Chargement de la session...</div>;
  }

  if (day.rest || !session) {
    return (
      <div className="page">
        <section className="card">
          <h2>Session non disponible</h2>
          <p className="muted">Ce jour ne contient pas de séquence d'exercices à valider.</p>
          <Link className="primary-btn" to={`/jour/${day.id}`}>
            Retour au jour
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section ref={headerCardRef} className={`card session-header-card${isHeaderPinned ? " compact" : ""}`}>
        <h2>Session en cours - {day.fullLabel}</h2>
        <p className="session-subtitle">{day.title}</p>
        <span
          data-testid="session-status"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {session.status}
        </span>
        <div className={`session-top-line${day.cardioOnly ? " session-top-line--cardio" : ""}`}>
          <div className="session-mini-block">
            <strong>{day.cardioOnly ? "Temps écoulé" : "Temps global"}</strong>
            <p>{elapsedLabel}</p>
          </div>
          {!day.cardioOnly && (
            <div className="session-mini-block session-pizza-block">
              <strong>Exercices finalisés</strong>
              <div className="session-pizza" style={{ "--progress": `${exerciseProgressPercent}%` }}>
                <span>{progressLabel}</span>
              </div>
            </div>
          )}
          <div className="session-mini-block session-controls-block">
            <div className="session-control-row">
              {!day.cardioOnly && session.status === "running" && (
                <button
                  className="ghost-btn session-icon-btn"
                  type="button"
                  onClick={onPauseResume}
                  aria-label="Pause"
                  title="Pause"
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
              )}
              {!day.cardioOnly && session.status === "paused" && (
                <>
                  <button
                    className="ghost-btn session-icon-btn"
                    type="button"
                    onClick={onPauseResume}
                    aria-label="Reprendre"
                    title="Reprendre"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                  {!isHeaderPinned && (
                    <button
                      className="ghost-btn session-icon-btn stop"
                      type="button"
                      onClick={onStop}
                      aria-label="Arrêter la séance"
                      title="Arrêter la séance"
                    >
                      <FontAwesomeIcon icon={faStop} />
                    </button>
                  )}
                </>
              )}
              {(session.status === "completed" || session.status === "stopped") && (
                <button className="primary-btn session-return-btn" type="button" onClick={() => navigate("/")}>
                  Retour à l'accueil
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {!day.cardioOnly && (session.status === "running" || session.status === "paused") ? (
        <section className="card">
          <h3>Exercice actuel</h3>

          <div className="session-media-top">
            <button
              type="button"
              className="session-media-thumb"
              onClick={() => setMediaModalOpen(true)}
              aria-label={`Agrandir - diapositive ${activeSlideIndex + 1} sur ${currentSlides.length}`}
            >
              {activeSlide?.type === "image" ? (
                activeSlide?.url ? (
                  <img src={activeSlide.url} alt={activeSlide.label} className="exercise-media-img" />
                ) : (
                  <div className="exercise-media-placeholder">
                    <FontAwesomeIcon icon={faDumbbell} size="2x" />
                  </div>
                )
              ) : (
                activeSlide?.url ? (
                  activeSlide.thumbnailUrl ? (
                    <div className="exercise-media-video-thumb">
                      <img src={activeSlide.thumbnailUrl} alt={activeSlide.label} className="exercise-media-img" />
                      <span className="exercise-media-play-badge">
                        <FontAwesomeIcon icon={faPlay} size="2x" />
                      </span>
                    </div>
                  ) : (
                    <div className="exercise-media-placeholder video">
                      <FontAwesomeIcon icon={faPlay} size="2x" />
                    </div>
                  )
                ) : (
                  <div className="exercise-media-placeholder video">
                    <FontAwesomeIcon icon={faPlay} size="2x" />
                    <span>Vidéo à venir</span>
                  </div>
                )
              )}
            </button>
            <div className="session-media-controls">
              {currentSlides.length > 1 && (
                <>
                  <button type="button" className="ghost-btn session-media-nav-btn" onClick={() => cycleSlide(-1)} aria-label="Diapositive précédente">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <div className="session-media-dots">
                    {currentSlides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`media-dot${i === activeSlideIndex ? " active" : ""}`}
                        aria-label={`Diapositive ${i + 1}`}
                        onClick={() => setCurrentSlideIndex(i)}
                      />
                    ))}
                  </div>
                  <button type="button" className="ghost-btn session-media-nav-btn" onClick={() => cycleSlide(1)} aria-label="Diapositive suivante">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="title-main">{currentExercise?.name ?? "-"}</p>
          {(() => {
            const desc = currentExercise?.phase === "warmup"
              ? currentMedia.description
              : (currentExercise?.description || currentMedia.description);
            return desc ? <p className="exercise-description">{desc}</p> : null;
          })()}
          {currentExercise?.note && (
            <p className="exercise-note-readonly">{currentExercise.note}</p>
          )}
          <div
            data-testid="current-series-label"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            Série {session.currentSetIndex + 1}/{currentExercise?.sets.length ?? 0}
          </div>

          {canRestartCurrentExercise && currentExercise?.phase !== "warmup" ? (
            <div className="set-global-actions">
              <button
                className="ghost-btn set-restart-btn"
                type="button"
                aria-label="Recommencer l'exercice"
                onClick={onRestartExercise}
              >
                Recommencer l'exercice
              </button>
            </div>
          ) : null}

          <section className="set-ordered-list" aria-label="Séries">
            {orderedSets.map((set, idx) => {
              const isActive = idx === session.currentSetIndex && !set?.validated;
              const isValidated = Boolean(set?.validated);
              const isInactive = !isActive && !isValidated;

              if (isActive) {
                const isWarmup = currentExercise?.phase === "warmup";
                return (
                  <article key={set.id ?? `set-${idx + 1}`} className="set-block set-block--active">
                    <div className="set-block-head">
                      <h4 className="set-block-title">{isWarmup ? "Consigne" : "Série en cours"}</h4>
                      {!isWarmup && <span className="set-block-meta">Série {idx + 1}/{currentExercise?.sets.length ?? 0}</span>}
                    </div>

                    {isWarmup ? (
                      <>
                        {currentExercise.description && (
                          <div className="warmup-consigne-box">
                            <p className="warmup-consigne-text">{currentExercise.description}</p>
                          </div>
                        )}
                        <button
                          className={`set-validate-btn${justValidated ? " validate-flash" : ""}`}
                          type="button"
                          aria-label="Valider l'échauffement"
                          onClick={onValidateSet}
                          disabled={session.status !== "running"}
                        >
                          <span>Valider l'échauffement</span>
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      </>
                    ) : (
                      <>
                        {!session.rest.active && (
                          isSupersetExercise(currentExercise) ? (() => {
                            const subNames = getSupersetSubNames(currentExercise);
                            const repsParts = parseSupersetSubParts(
                              currentSet?.actualReps ?? currentSet?.targetReps ?? "",
                              " + ",
                              subNames.length
                            );
                            const loadParts = parseSupersetSubParts(
                              currentSet?.actualLoad ?? currentSet?.targetLoad ?? "",
                              " / ",
                              subNames.length
                            );
                            const disabled = session.status !== "running";
                            return (
                              <div className="superset-set-editor">
                                {subNames.map((subName, i) => {
                                  const repsVal = repsParts[i] ?? "-";
                                  const loadVal = loadParts[i] ?? "-";
                                  const timedReps = isTimedValue(repsVal);
                                  return (
                                    <div key={i} className="superset-sub-block">
                                      <p className="superset-sub-label">{subName}</p>
                                      <div className="set-edit-inline-grid superset-sub-grid">
                                        <div className="set-edit-inline-label">
                                          <FontAwesomeIcon icon={faRepeat} size="sm" />
                                          <span>Répétitions</span>
                                        </div>
                                        <div className="set-edit-inline-label with-divider">
                                          <FontAwesomeIcon icon={faDumbbell} size="sm" />
                                          <span>Poids</span>
                                        </div>
                                        <div className="set-edit-inline-label with-divider validate-label" aria-hidden="true" />
                                        <div className="set-edit-inline-control">
                                          {timedReps ? (
                                            <input
                                              className="stepper-value-input superset-timed-input"
                                              aria-label={`Répétitions ${subName}`}
                                              value={repsVal === "-" ? "" : repsVal}
                                              onChange={(e) => setSupersetPartValue("actualReps", i, e.target.value, subNames.length)}
                                              disabled={disabled}
                                            />
                                          ) : (
                                            <div className="set-stepper-row">
                                              <button type="button" className="stepper-btn stepper-lg" onClick={() => stepSupersetPartValue("actualReps", i, -1, subNames.length)} disabled={disabled}>−</button>
                                              <input
                                                className="stepper-value-input"
                                                size={1}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                aria-label={`Répétitions ${subName}`}
                                                value={repsVal === "-" ? "" : repsVal}
                                                onChange={(e) => setSupersetPartValue("actualReps", i, e.target.value, subNames.length)}
                                                disabled={disabled}
                                              />
                                              <button type="button" className="stepper-btn stepper-lg" onClick={() => stepSupersetPartValue("actualReps", i, 1, subNames.length)} disabled={disabled}>+</button>
                                            </div>
                                          )}
                                        </div>
                                        <div className="set-edit-inline-control with-divider">
                                          <div className="set-stepper-row">
                                            <button type="button" className="stepper-btn stepper-lg" onClick={() => stepSupersetPartValue("actualLoad", i, -1, subNames.length)} disabled={disabled}>−</button>
                                            <input
                                              className="stepper-value-input"
                                              size={1}
                                              inputMode="decimal"
                                              pattern="[0-9]*[.,]?[0-9]*"
                                              aria-label={`Poids ${subName}`}
                                              value={loadVal === "-" ? "" : loadVal}
                                              onChange={(e) => setSupersetPartValue("actualLoad", i, e.target.value, subNames.length)}
                                              disabled={disabled}
                                            />
                                            <span className="stepper-unit">kg</span>
                                            <button type="button" className="stepper-btn stepper-lg" onClick={() => stepSupersetPartValue("actualLoad", i, 1, subNames.length)} disabled={disabled}>+</button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                <button
                                  className={`set-validate-btn${justValidated ? " validate-flash" : ""}`}
                                  type="button"
                                  aria-label="Valider la série"
                                  onClick={onValidateSet}
                                  disabled={session.status !== "running"}
                                >
                                  <span>Valider la série</span>
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                              </div>
                            );
                          })() : (
                            <div className="set-edit-inline-grid">
                              <div className="set-edit-inline-label">
                                <span className="set-stepper-icon" aria-hidden="true">
                                  <FontAwesomeIcon icon={faRepeat} size="sm" />
                                </span>
                                <span>Répétitions</span>
                              </div>
                              <div className="set-edit-inline-label with-divider">
                                <span className="set-stepper-icon" aria-hidden="true">
                                  <FontAwesomeIcon icon={faDumbbell} size="sm" />
                                </span>
                                <span>Poids</span>
                              </div>
                              <div className="set-edit-inline-label with-divider validate-label">
                                <span className="set-stepper-icon" aria-hidden="true">
                                  <FontAwesomeIcon icon={faCheck} size="sm" />
                                </span>
                                <span>Valider</span>
                              </div>
                              <div className="set-edit-inline-control">
                                <div className="set-stepper-row">
                                  <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualReps", -1)} disabled={session.rest.active || session.status !== "running"}>−</button>
                                  <input
                                    className="stepper-value-input"
                                    size={1}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    aria-label="Répétitions"
                                    value={repsInputValue}
                                    onChange={(e) => setValue("actualReps", e.target.value)}
                                    disabled={session.rest.active || session.status !== "running"}
                                  />
                                  <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualReps", 1)} disabled={session.rest.active || session.status !== "running"}>+</button>
                                </div>
                              </div>
                              <div className="set-edit-inline-control with-divider">
                                <div className="set-stepper-row">
                                  <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualLoad", -1)} disabled={session.rest.active || session.status !== "running"}>−</button>
                                  <input
                                    className="stepper-value-input"
                                    size={1}
                                    inputMode="decimal"
                                    pattern="[0-9]*[.,]?[0-9]*"
                                    aria-label="Poids"
                                    value={loadInputValue}
                                    onChange={(e) => setValue("actualLoad", e.target.value)}
                                    disabled={session.rest.active || session.status !== "running"}
                                  />
                                  <span className="stepper-unit">kg</span>
                                  <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualLoad", 1)} disabled={session.rest.active || session.status !== "running"}>+</button>
                                </div>
                              </div>
                              <button
                                className={`set-validate-btn with-divider${justValidated ? " validate-flash" : ""}`}
                                type="button"
                                aria-label="Valider la série"
                                onClick={onValidateSet}
                                disabled={session.status !== "running"}
                              >
                                <span>Valider la série</span>
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                            </div>
                          )
                        )}

                        {session.rest.active ? (
                          <div className="rest-box" data-testid="rest-box">
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center" }}>Récupération</p>
                            <div className="rest-countdown">{session.rest.remainingSeconds}</div>
                            <p className="rest-label">secondes</p>
                            <button className="ghost-btn" type="button" aria-label="Passer le timer" onClick={() => setSession((prev) => skipRestTimer(prev))} style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
                              <FontAwesomeIcon icon={faForward} size="xs" /> Passer
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </article>
                );
              }

              if (isValidated) {
                const isWarmup = currentExercise?.phase === "warmup";
                return (
                  <article key={set.id ?? `set-${idx + 1}`} className="set-block set-block--validated">
                    <div className="set-block-head set-block-head--compact">
                      <h4 className="set-block-title">{isWarmup ? "Consigne" : `Série ${idx + 1}`}</h4>
                      <span className="set-block-meta validated">Validée</span>
                    </div>
                    {!isWarmup && (
                      isSupersetExercise(currentExercise) ? (() => {
                        const subNames = getSupersetSubNames(currentExercise);
                        const repsParts = parseSupersetSubParts(set.actualReps ?? set.targetReps ?? "", " + ", subNames.length);
                        const loadParts = parseSupersetSubParts(set.actualLoad ?? set.targetLoad ?? "", " / ", subNames.length);
                        return (
                          <div className="set-validated-values superset-validated-values">
                            {subNames.map((subName, i) => (
                              <div key={i} className="superset-validated-row">
                                <span className="superset-sub-name-sm">{subName}</span>
                                <span><FontAwesomeIcon icon={faRepeat} size="xs" /> {repsParts[i] ?? "-"}</span>
                                <span><FontAwesomeIcon icon={faDumbbell} size="xs" /> {(loadParts[i] ?? "-") !== "-" ? `${loadParts[i]} kg` : "-"}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })() : (
                        <div className="set-validated-values">
                          <span>
                            <FontAwesomeIcon icon={faRepeat} size="xs" /> {getSetMetricDisplayValue(set, "actualReps")}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faDumbbell} size="xs" /> {formatLoadWithUnit(getSetMetricDisplayValue(set, "actualLoad"))}
                          </span>
                        </div>
                      )
                    )}
                  </article>
                );
              }

              if (isInactive) {
                const isWarmup = currentExercise?.phase === "warmup";
                return (
                  <article key={set.id ?? `set-${idx + 1}`} className="set-block set-block--inactive">
                    <div className="set-block-head">
                      <h4 className="set-block-title">{isWarmup ? "Consigne" : `Série ${idx + 1}`}</h4>
                      <span className="set-block-meta inactive">Non active</span>
                    </div>
                    {isWarmup ? (
                      currentExercise.description ? (
                        <div className="warmup-consigne-box">
                          <p className="warmup-consigne-text">{currentExercise.description}</p>
                        </div>
                      ) : null
                    ) : (
                      isSupersetExercise(currentExercise) ? (() => {
                        const subNames = getSupersetSubNames(currentExercise);
                        const repsParts = parseSupersetSubParts(set.targetReps ?? "", " + ", subNames.length);
                        const loadParts = parseSupersetSubParts(set.targetLoad ?? "", " / ", subNames.length);
                        return (
                          <div className="superset-inactive-list">
                            {subNames.map((subName, i) => (
                              <div key={i} className="superset-inactive-row">
                                <span className="superset-sub-name-sm">{subName}</span>
                                <span className="superset-inactive-meta">
                                  <FontAwesomeIcon icon={faRepeat} size="xs" /> {repsParts[i] ?? "-"}
                                  {" · "}
                                  <FontAwesomeIcon icon={faDumbbell} size="xs" /> {(loadParts[i] ?? "-") !== "-" ? `${loadParts[i]} kg` : "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })() : (
                        <div className="set-preview-grid">
                          <div className="set-edit-inline-label">
                            <span className="set-stepper-icon" aria-hidden="true">
                              <FontAwesomeIcon icon={faRepeat} size="sm" />
                            </span>
                            <span>Répétitions</span>
                          </div>
                          <div className="set-edit-inline-label">
                            <span className="set-stepper-icon" aria-hidden="true">
                              <FontAwesomeIcon icon={faDumbbell} size="sm" />
                            </span>
                            <span>Poids</span>
                          </div>
                          <div className="set-preview-control">
                            <div className="set-stepper-row">
                              <span className="stepper-btn stepper-lg stepper-static" aria-hidden="true">−</span>
                              <span className="stepper-value-static">{getSetMetricDisplayValue(set, "actualReps")}</span>
                              <span className="stepper-btn stepper-lg stepper-static" aria-hidden="true">+</span>
                            </div>
                          </div>
                          <div className="set-preview-control">
                            <div className="set-stepper-row">
                              <span className="stepper-btn stepper-lg stepper-static" aria-hidden="true">−</span>
                              <span className="stepper-value-static">
                                {getSetMetricDisplayValue(set, "actualLoad")} <span className="stepper-unit">kg</span>
                              </span>
                              <span className="stepper-btn stepper-lg stepper-static" aria-hidden="true">+</span>
                            </div>

                          </div>
                        </div>
                      )
                    )}
                  </article>
                );
              }

              return null;
            })}
          </section>
        </section>
      ) : null}

      {mediaModalOpen && activeSlide ? (
        <div className="media-modal-overlay" onClick={() => setMediaModalOpen(false)} role="dialog" aria-modal="true" aria-label={currentExercise?.name ?? "Média"}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="media-modal-close" type="button" onClick={() => setMediaModalOpen(false)} aria-label="Fermer">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <p className="media-modal-label">{activeSlide.label}</p>

            {activeSlide.type === "image" ? (
              activeSlide.url ? (
                <img src={activeSlide.url} alt={activeSlide.label} className="media-modal-img" />
              ) : (
                <div className="media-modal-placeholder"><FontAwesomeIcon icon={faDumbbell} size="3x" /></div>
              )
            ) : activeSlide.url ? (
              activeSlide.embedId ? (
                <div className="media-modal-video-wrap">
                  <iframe
                    className="media-modal-video"
                    title={`Vidéo - ${activeSlide.label}`}
                    src={`https://www.youtube-nocookie.com/embed/${activeSlide.embedId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video className="media-modal-video" src={activeSlide.url} controls autoPlay playsInline preload="metadata" />
              )
            ) : (
              <div className="media-modal-placeholder"><FontAwesomeIcon icon={faPlay} size="3x" /><span>Vidéo à venir</span></div>
            )}

            {currentSlides.length > 1 && (
              <>
                <button className="media-modal-nav media-modal-prev" type="button" onClick={() => cycleSlide(-1)} aria-label="Précédent">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className="media-modal-nav media-modal-next" type="button" onClick={() => cycleSlide(1)} aria-label="Suivant">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
            <div className="media-modal-dots">
              {currentSlides.map((_, i) => (
                <button
                  key={i}
                  className={`media-dot${i === activeSlideIndex ? " active" : ""}`}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  aria-label={`Diapositive ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="card">
        {day.cardioOnly ? (
          (() => {
            const cardioMedia = getExerciseMedia(day.title, uiLanguage);
            const cardioImg = cardioMedia.imageUrl ?? null;
            const cardioDesc = cardioMedia.description ?? null;
            return (
              <>
                {cardioImg && (
                  <img
                    src={cardioImg}
                    alt={day.title}
                    className="cardio-session-hero-img"
                  />
                )}
                <h3 className="section-title-with-icon">
                  <FontAwesomeIcon icon={faFire} />
                  <span>Séance cardio — {day.title}</span>
                </h3>
                {cardioDesc && <p className="cardio-guide-text" style={{ marginTop: 0 }}>{cardioDesc}</p>}
                {(session.status === "running" || session.status === "paused") && (
                  <div className="cardio-session-actions">
                    <p className="muted cardio-session-hint">Lancez votre activité cardio (tapis, vélo, elliptique…) et appuyez sur Terminer à la fin des 40 minutes.</p>
                    <button
                      type="button"
                      className="primary-btn with-icon cardio-finish-btn"
                      onClick={() => setSession((prev) => {
                        if (!prev) return prev;
                        // Works from both running and paused states
                        const running = prev.status === "paused" ? resumeSession(prev, Date.now()) : prev;
                        return validateCurrentSet(running, { nowMs: Date.now() });
                      })}
                    >
                      <FontAwesomeIcon icon={faFlagCheckered} />
                      <span>Terminer la séance</span>
                    </button>
                  </div>
                )}
                {(session.status === "completed" || session.status === "stopped") && (
                  <p className="muted">Séance enregistrée. Bravo !</p>
                )}
              </>
            );
          })()
        ) : (
          <>
            <h3>Exercices</h3>
            {orderedExercises.length === 0 ? (
              <p className="session-progression-empty">Aucun exercice.</p>
            ) : (
              <div className="session-progression-grid">
                {orderedExercises.map(({ exercise, idx, state, order }) => {
                  const previewImage = getExercisePreviewImage(exercise, uiLanguage);
                  const reps = formatExerciseSetMetric(exercise.sets, "targetReps");
                  const stateLabel = state === "active" ? "En cours" : state === "validated" ? "Validé" : "Non actif";
                  const itemLabel = exercise.phase === "warmup" ? "Échauffement" : "Exercice";

                  return (
                    <button
                      type="button"
                      className={`session-progression-item is-${state}`}
                      key={exercise.id}
                      onClick={() => focusExercise(idx)}
                      aria-label={`Voir l'exercice ${exercise.name}`}
                    >
                      <div className="session-progression-thumb">
                        {previewImage ? (
                          <img src={previewImage} alt={exercise.name} className="exercise-media-img" />
                        ) : (
                          <div className="exercise-media-placeholder">
                            <FontAwesomeIcon icon={faDumbbell} size="lg" />
                          </div>
                        )}
                      </div>
                      <div className="session-progression-body">
                        <div className="session-progression-topline">
                          <p className="session-progression-title">{itemLabel} {order} - {exercise.name}</p>
                          <span className={`session-progression-state ${state}`}>{stateLabel}</span>
                        </div>
                        <p className="session-progression-meta">
                          {exercise.phase === "warmup"
                            ? <span>{exercise.description ?? ""}</span>
                            : <span>{exercise.sets?.length ?? 0} séries de {reps} répétitions</span>
                          }
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
