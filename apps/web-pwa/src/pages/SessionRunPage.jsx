import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faRepeat, faPlay, faPause, faStop, faCheck, faForward, faChevronLeft, faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import {
  buildSessionRun,
  getElapsedMs,
  pauseSession,
  resumeSession,
  skipRestTimer,
  stopSession,
  tickSession,
  updateCurrentSetValues,
  validateCurrentSet,
} from "@meutreino/core-domain";
import { useAuth } from "../features/auth/useAuth";
import { getActivePlanForUser, getDayPlanForUser } from "../services/storage/repositories/plansRepository";
import { saveSessionRun } from "../services/storage/repositories/sessionsRepository";
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
  const slides = parts.flatMap((part) => {
    const media = getExerciseMedia(part.trim(), language);
    const imageSlide = { type: "image", url: media.imageUrl, label: part.trim() || name || "Exercice" };

    if (customVideoUrl) return [imageSlide];
    if (!media.videoUrl) return [imageSlide];

    return [
      imageSlide,
      {
        type: "video",
        url: media.videoUrl,
        embedId: getYoutubeVideoId(media.videoUrl),
        thumbnailUrl: getYoutubeThumbnailUrl(media.videoUrl),
        label: part.trim() || name || "Video",
      },
    ];
  });

  if (customVideoUrl) {
    slides.push({
      type: "video",
      url: customVideoUrl,
      embedId: getYoutubeVideoId(customVideoUrl),
      thumbnailUrl: getYoutubeThumbnailUrl(customVideoUrl),
      label: name || "Video",
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
      if (!dayData?.rest && !dayData?.cardioOnly && (dayData?.main?.length ?? 0) > 0) {
        const run = buildSessionRun({
          userId: currentUser.id,
          dayId,
          day: dayData,
          planVersion: activePlan?.version ?? "unknown",
          restSeconds: 60,
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

  useEffect(() => {
    async function persistIfFinalized() {
      if (!session || persistedRef.current) return;
      if (session.status !== "completed" && session.status !== "stopped") return;

      const payload = {
        ...session,
        elapsedMs: getElapsedMs(session, Date.now()),
      };
      await saveSessionRun(payload);
      persistedRef.current = true;
    }
    persistIfFinalized();
  }, [session]);

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
    if (day?.main?.length) {
      return day.main.map((exercise, idx) => exercise.id ?? `${dayId}-ex-${idx + 1}`);
    }
    return session?.exercises?.map((exercise) => exercise.id) ?? [];
  }, [day, dayId, session]);
  const progressionExercises = useMemo(() => {
    if (!session?.exercises?.length) return [];
    const hideCurrentExercise = session.status === "running" || session.status === "paused";
    const focusedExerciseId = session.exercises[session.currentExerciseIndex]?.id;
    const byId = new Map(session.exercises.map((exercise, idx) => [exercise.id, { exercise, idx }]));
    const orderedIds = baseExerciseOrderIds.length
      ? baseExerciseOrderIds
      : session.exercises.map((exercise) => exercise.id);

    return orderedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .filter(({ exercise }) => !(hideCurrentExercise && exercise.id === focusedExerciseId));
  }, [session, baseExerciseOrderIds]);

  function setValue(field, value) {
    setSession((prev) => {
      if (!prev) return prev;
      return updateCurrentSetValues(prev, { [field]: value });
    });
  }

  function stepValue(field, delta) {
    const raw = field === "actualReps" ? (currentSet?.actualReps ?? "") : (currentSet?.actualLoad ?? "");
    const current = parseFloat(raw);
    const base = isNaN(current) ? 0 : current;
    const next = Math.max(field === "actualReps" ? 1 : 0, base + delta);
    const formatted = Number.isInteger(next) ? String(next) : next.toFixed(1);
    setValue(field, formatted);
  }

  function onValidateSet() {
    setSession((prev) => {
      if (!prev) return prev;
      return validateCurrentSet(prev, { nowMs: Date.now(), restSeconds: 60 });
    });
    setJustValidated(true);
    setTimeout(() => setJustValidated(false), 700);
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

  if (day.rest || day.cardioOnly || !session) {
    return (
      <div className="page">
        <section className="card">
          <h2>Session non disponible</h2>
          <p className="muted">Ce jour ne contient pas de sequence d exercices a valider.</p>
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
        <div className="session-top-line">
          <div className="session-mini-block">
            <strong>Temps global</strong>
            <p>{elapsedLabel}</p>
          </div>
          <div className="session-mini-block session-pizza-block">
            <strong>Exercices finalises</strong>
            <div className="session-pizza" style={{ "--progress": `${exerciseProgressPercent}%` }}>
              <span>{progressLabel}</span>
            </div>
          </div>
          <div className="session-mini-block session-controls-block">
            <div className="session-control-row">
              {session.status === "running" && (
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
              {session.status === "paused" && (
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
                      aria-label="Arreter la session"
                      title="Arreter la session"
                    >
                      <FontAwesomeIcon icon={faStop} />
                    </button>
                  )}
                </>
              )}
              {(session.status === "completed" || session.status === "stopped") && (
                <button className="primary-btn session-return-btn" type="button" onClick={() => navigate("/")}>
                  Retour accueil
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {session.status === "running" || session.status === "paused" ? (
        <section className="card">
          <h3>Exercice actuel</h3>

          <div className="session-media-top">
            <button
              type="button"
              className="session-media-thumb"
              onClick={() => setMediaModalOpen(true)}
              aria-label={`Agrandir - slide ${activeSlideIndex + 1} sur ${currentSlides.length}`}
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
                        <FontAwesomeIcon icon={faPlay} size="sm" />
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
                    <span>Video a venir</span>
                  </div>
                )
              )}
            </button>
            <div className="session-media-controls">
              {currentSlides.length > 1 && (
                <>
                  <button type="button" className="ghost-btn session-media-nav-btn" onClick={() => cycleSlide(-1)} aria-label="Slide precedent">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <div className="session-media-dots">
                    {currentSlides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`media-dot${i === activeSlideIndex ? " active" : ""}`}
                        aria-label={`Slide ${i + 1}`}
                        onClick={() => setCurrentSlideIndex(i)}
                      />
                    ))}
                  </div>
                  <button type="button" className="ghost-btn session-media-nav-btn" onClick={() => cycleSlide(1)} aria-label="Slide suivant">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="title-main">{currentExercise?.name ?? "-"}</p>
          {(() => {
            const desc = currentExercise?.description || currentMedia.description;
            return desc ? <p className="exercise-description">{desc}</p> : null;
          })()}
          {currentExercise?.note && (
            <p className="exercise-note-readonly">{currentExercise.note}</p>
          )}
          <div className="progress-badge">
            <span>Ex. {session.currentExerciseIndex + 1}/{session.exercises.length}</span>
            <span className="progress-sep">·</span>
            <span data-testid="current-series-label">Serie {session.currentSetIndex + 1}/{currentExercise?.sets.length ?? 0}</span>
          </div>

          {!session.rest.active && <div className="set-edit-grid">
            <div className="set-stepper-group">
              <span className="set-stepper-label">
                <FontAwesomeIcon icon={faRepeat} size="sm" /> Rép.
              </span>
              <div className="set-stepper-row">
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualReps", -1)} disabled={session.rest.active || session.status !== "running"}>−</button>
                <input
                  className="stepper-value-input"
                  size={1}
                  value={currentSet?.actualReps ?? ""}
                  onChange={(e) => setValue("actualReps", e.target.value)}
                  disabled={session.rest.active || session.status !== "running"}
                />
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualReps", 1)} disabled={session.rest.active || session.status !== "running"}>+</button>
              </div>
            </div>
            <div className="set-stepper-group">
              <span className="set-stepper-label">
                <FontAwesomeIcon icon={faDumbbell} size="sm" /> Charge
              </span>
              <div className="set-stepper-row">
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualLoad", -1)} disabled={session.rest.active || session.status !== "running"}>−</button>
                <input
                  className="stepper-value-input"
                  size={1}
                  value={currentSet?.actualLoad ?? ""}
                  onChange={(e) => setValue("actualLoad", e.target.value)}
                  disabled={session.rest.active || session.status !== "running"}
                />
                <button type="button" className="stepper-btn stepper-lg" onClick={() => stepValue("actualLoad", 1)} disabled={session.rest.active || session.status !== "running"}>+</button>
              </div>
            </div>
          </div>}

          {session.rest.active ? (
            <div className="rest-box" data-testid="rest-box">
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center" }}>Récupération</p>
              <div className="rest-countdown">{session.rest.remainingSeconds}</div>
              <p className="rest-label">secondes</p>
              <button className="ghost-btn" type="button" aria-label="Passer le timer" onClick={() => setSession((prev) => skipRestTimer(prev))} style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
                <FontAwesomeIcon icon={faForward} size="xs" /> Passer
              </button>
            </div>
          ) : (
            <button
              className={`primary-btn${justValidated ? " validate-flash" : ""}`}
              type="button"
              aria-label="Valider la serie"
              onClick={onValidateSet}
              disabled={session.status !== "running"}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}
            >
              <FontAwesomeIcon icon={faCheck} /> Valider la série
            </button>
          )}
        </section>
      ) : null}

      {mediaModalOpen && activeSlide ? (
        <div className="media-modal-overlay" onClick={() => setMediaModalOpen(false)} role="dialog" aria-modal="true" aria-label={currentExercise?.name ?? "Media"}>
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
                    title={`Video - ${activeSlide.label}`}
                    src={`https://www.youtube-nocookie.com/embed/${activeSlide.embedId}?rel=0&modestbranding=1&playsinline=1`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video className="media-modal-video" src={activeSlide.url} controls playsInline preload="metadata" />
              )
            ) : (
              <div className="media-modal-placeholder"><FontAwesomeIcon icon={faPlay} size="3x" /><span>Video a venir</span></div>
            )}

            {currentSlides.length > 1 && (
              <>
                <button className="media-modal-nav media-modal-prev" type="button" onClick={() => cycleSlide(-1)} aria-label="Precedent">
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
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="card">
        <h3>Prochains exercices</h3>
        {progressionExercises.length === 0 ? (
          <p className="session-progression-empty">Aucun autre exercice.</p>
        ) : (
          <div className="session-progression-grid">
            {progressionExercises.map(({ exercise, idx }) => {
              const previewImage = getExercisePreviewImage(exercise, uiLanguage);
              const reps = formatExerciseSetMetric(exercise.sets, "targetReps");

              return (
                <button
                  type="button"
                  className="session-progression-item"
                  key={exercise.id}
                  onClick={() => focusExercise(idx)}
                  aria-label={`Focus exercice ${exercise.name}`}
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
                    <p className="session-progression-title">{exercise.name}</p>
                    <p className="session-progression-meta">
                      <span>{exercise.sets?.length ?? 0} series de {reps} Repetitions</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
