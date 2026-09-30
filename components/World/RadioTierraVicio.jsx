"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   RADIO EN DIRECTO
========================================================= */

const LIVE_STATIONS = [
  {
    id: "rpgn",
    kind: "live",
    name: "RPGN Radio",
    subtitle: "Game Music Radio",
    badge: "GAME",
    url: "https://stream.rpgamers.net/rpgn",
  },
  {
    id: "radiosega",
    kind: "live",
    name: "RadioSEGA",
    subtitle: "SEGA music 24/7",
    badge: "SEGA",
    url: "https://icecast.radiosega.net/rs-mpeg.mp3",
  },
];

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_STATION =
  "tierraVicioRadioStation";

const STORAGE_MUTED =
  "tierraVicioRadioMuted";

const STORAGE_POSITION_PREFIX =
  "tierraVicioProgramPosition:";

/* =========================================================
   EVENTOS
========================================================= */

const MEDIA_START_EVENT =
  "tierra-vicio-media-start";

const MEDIA_END_EVENT =
  "tierra-vicio-media-end";

/* =========================================================
   HELPERS
========================================================= */

function makeEpisodeSource(
  show,
  episode
) {
  return {
    id:
      `episode:${show.id}:${episode.id}`,

    kind:
      "program",

    showId:
      show.id,

    episodeId:
      episode.id,

    name:
      episode.title,

    subtitle:
      show.name,

    badge:
      show.badge,

    url:
      episode.audioUrl,

    date:
      episode.date,

    apiDuration:
      episode.duration,

    description:
      episode.description,
  };
}

function formatTime(
  seconds
) {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return "0:00";
  }

  const total =
    Math.floor(seconds);

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) /
        60
    );

  const secs =
    total % 60;

  if (hours > 0) {
    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  }

  return `${minutes}:${String(
    secs
  ).padStart(
    2,
    "0"
  )}`;
}

function formatDate(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "es-ES",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function RadioTierraVicio() {
  const audioRef =
    useRef(null);

  const rootRef =
    useRef(null);

  const sourceRef =
    useRef(
      LIVE_STATIONS[0]
    );

  const userPausedRef =
    useRef(false);

  const hiddenWasPlayingRef =
    useRef(false);

  const mediaWasPlayingRef =
    useRef(false);

  const stationShouldResumeRef =
    useRef(false);

  const pendingSavedSourceRef =
    useRef(null);

  const restoredPositionRef =
    useRef(null);

  const lastSavedPositionRef =
    useRef(0);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    tab,
    setTab,
  ] = useState("live");

  const [
    sourceId,
    setSourceId,
  ] = useState("rpgn");

  const [
    muted,
    setMuted,
  ] = useState(false);

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] = useState(
    "Esperando interacción"
  );

  const [
    shows,
    setShows,
  ] = useState([]);

  const [
    programsLoading,
    setProgramsLoading,
  ] = useState(true);

  const [
    programsError,
    setProgramsError,
  ] = useState(false);

  const [
    expandedShowId,
    setExpandedShowId,
  ] = useState(null);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  /* =========================================================
     FUENTES DE PROGRAMAS
  ========================================================= */

  const programSources =
    useMemo(
      () =>
        shows.flatMap(
          (show) =>
            show.episodes.map(
              (episode) =>
                makeEpisodeSource(
                  show,
                  episode
                )
            )
        ),
      [
        shows,
      ]
    );

  const allSources =
    useMemo(
      () => [
        ...LIVE_STATIONS,
        ...programSources,
      ],
      [
        programSources,
      ]
    );

  const source =
    allSources.find(
      (item) =>
        item.id ===
        sourceId
    ) ||
    LIVE_STATIONS[0];

  const isProgram =
    source.kind ===
    "program";

  sourceRef.current =
    source;

  /* =========================================================
     POSICIÓN DEL PODCAST
  ========================================================= */

  function positionStorageKey(
    selectedSource =
      sourceRef.current
  ) {
    if (
      !selectedSource ||
      selectedSource.kind !==
        "program"
    ) {
      return null;
    }

    return (
      STORAGE_POSITION_PREFIX +
      selectedSource.id
    );
  }

  function saveCurrentPosition() {
    const audio =
      audioRef.current;

    const selectedSource =
      sourceRef.current;

    if (
      !audio ||
      selectedSource.kind !==
        "program" ||
      !Number.isFinite(
        audio.currentTime
      )
    ) {
      return;
    }

    const key =
      positionStorageKey(
        selectedSource
      );

    if (!key) {
      return;
    }

    try {
      window.localStorage.setItem(
        key,
        String(
          audio.currentTime
        )
      );

      lastSavedPositionRef.current =
        audio.currentTime;
    } catch {
      // Opcional.
    }
  }

  function clearSavedPosition(
    selectedSource =
      sourceRef.current
  ) {
    const key =
      positionStorageKey(
        selectedSource
      );

    if (!key) {
      return;
    }

    try {
      window.localStorage.removeItem(
        key
      );
    } catch {
      // Opcional.
    }
  }

  /* =========================================================
     PLAY / PAUSE
  ========================================================= */

  function playRadio() {
    const audio =
      audioRef.current;

    const selectedSource =
      sourceRef.current;

    if (
      !audio ||
      document.hidden
    ) {
      return;
    }

    audio
      .play()
      .then(() => {
        setPlaying(true);

        setStatus(
          selectedSource.kind ===
            "program"
            ? "Reproduciendo"
            : "En directo"
        );
      })
      .catch(() => {
        setPlaying(false);

        setStatus(
          "Toca ▶ para escuchar"
        );
      });
  }

  function pauseRadio(
    nextStatus =
      "Pausada"
  ) {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    saveCurrentPosition();

    audio.pause();

    setPlaying(false);

    setStatus(
      nextStatus
    );
  }

  /* =========================================================
     CARGAR PROGRAMAS
  ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadPrograms() {
      try {
        setProgramsLoading(
          true
        );

        setProgramsError(
          false
        );

        const response =
          await fetch(
            "/api/radio/programs",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Programas no disponibles"
          );
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        const nextShows =
          Array.isArray(
            data?.shows
          )
            ? data.shows
            : [];

        setShows(
          nextShows
        );

        if (
          nextShows.length >
            0 &&
          !expandedShowId
        ) {
          setExpandedShowId(
            nextShows[0].id
          );
        }

        setProgramsLoading(
          false
        );
      } catch {
        if (cancelled) {
          return;
        }

        setProgramsLoading(
          false
        );

        setProgramsError(
          true
        );
      }
    }

    loadPrograms();

    /*
      Si la página queda abierta muchas
      horas, vuelve a consultar.
    */

    const interval =
      window.setInterval(
        loadPrograms,
        6 * 60 * 60 * 1000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        interval
      );
    };
  }, []);

  /* =========================================================
     RESTAURAR EPISODIO GUARDADO
  ========================================================= */

  useEffect(() => {
    const pending =
      pendingSavedSourceRef.current;

    if (!pending) {
      return;
    }

    const exact =
      programSources.find(
        (item) =>
          item.id ===
          pending
      );

    if (exact) {
      pendingSavedSourceRef.current =
        null;

      setSourceId(
        exact.id
      );

      setTab(
        "programs"
      );

      setExpandedShowId(
        exact.showId
      );

      return;
    }

    /*
      Compatibilidad con la versión
      anterior que guardaba go855,
      go854, etc.
    */

    if (
      /^go\d+$/i.test(
        pending
      )
    ) {
      const legacyNumber =
        pending.replace(
          /^go/i,
          ""
        );

      const legacy =
        programSources.find(
          (item) =>
            item.showId ===
              "game-over" &&
            item.name.includes(
              `Game Over ${legacyNumber}`
            )
        );

      if (legacy) {
        pendingSavedSourceRef.current =
          null;

        setSourceId(
          legacy.id
        );

        setTab(
          "programs"
        );

        setExpandedShowId(
          legacy.showId
        );
      }
    }
  }, [
    programSources,
  ]);

  /* =========================================================
     CARGAR PREFERENCIAS
  ========================================================= */

  useEffect(() => {
    try {
      const savedSource =
        window.localStorage.getItem(
          STORAGE_STATION
        );

      const savedMuted =
        window.localStorage.getItem(
          STORAGE_MUTED
        );

      if (
        LIVE_STATIONS.some(
          (item) =>
            item.id ===
            savedSource
        )
      ) {
        setSourceId(
          savedSource
        );
      } else if (
        savedSource
      ) {
        pendingSavedSourceRef.current =
          savedSource;
      }

      if (
        savedMuted ===
        "true"
      ) {
        setMuted(
          true
        );
      }
    } catch {
      // Preferencias opcionales.
    }
  }, []);

  /* =========================================================
     MUTE
  ========================================================= */

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted =
      muted;

    try {
      window.localStorage.setItem(
        STORAGE_MUTED,
        String(muted)
      );
    } catch {
      // Opcional.
    }
  }, [
    muted,
  ]);

  /* =========================================================
     GUARDAR FUENTE
  ========================================================= */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_STATION,
        sourceId
      );
    } catch {
      // Opcional.
    }
  }, [
    sourceId,
  ]);

  /* =========================================================
     CAMBIO DE FUENTE
  ========================================================= */

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    restoredPositionRef.current =
      null;

    lastSavedPositionRef.current =
      0;

    setCurrentTime(
      0
    );

    setDuration(
      Number.isFinite(
        source.apiDuration
      )
        ? source.apiDuration
        : 0
    );

    audio.src =
      source.url;

    audio.load();

    if (
      stationShouldResumeRef.current
    ) {
      stationShouldResumeRef.current =
        false;

      setStatus(
        "Conectando…"
      );

      playRadio();
    } else {
      setPlaying(
        false
      );

      setStatus(
        isProgram
          ? "Listo para reproducir"
          : "Lista"
      );
    }
  }, [
    source.id,
    source.url,
  ]);

  /* =========================================================
     RESTAURAR POSICIÓN
  ========================================================= */

  function restoreProgramPosition() {
    const audio =
      audioRef.current;

    const selectedSource =
      sourceRef.current;

    if (
      !audio ||
      selectedSource.kind !==
        "program"
    ) {
      return;
    }

    if (
      restoredPositionRef.current ===
      selectedSource.id
    ) {
      return;
    }

    restoredPositionRef.current =
      selectedSource.id;

    const key =
      positionStorageKey(
        selectedSource
      );

    if (!key) {
      return;
    }

    try {
      const saved =
        Number(
          window.localStorage.getItem(
            key
          )
        );

      if (
        Number.isFinite(
          saved
        ) &&
        saved > 0
      ) {
        const realDuration =
          Number.isFinite(
            audio.duration
          )
            ? audio.duration
            : 0;

        /*
          Si estaba prácticamente
          terminado, no restauramos.
        */

        if (
          realDuration > 0 &&
          saved >=
            realDuration - 5
        ) {
          clearSavedPosition(
            selectedSource
          );

          return;
        }

        audio.currentTime =
          saved;

        setCurrentTime(
          saved
        );

        lastSavedPositionRef.current =
          saved;
      }
    } catch {
      // Opcional.
    }
  }

  /* =========================================================
     PRIMERA INTERACCIÓN
  ========================================================= */

  useEffect(() => {
    const unlockAndPlay =
      () => {
        const audio =
          audioRef.current;

        if (
          !audio ||
          userPausedRef.current ||
          !audio.paused ||
          document.hidden
        ) {
          return;
        }

        playRadio();
      };

    window.addEventListener(
      "pointerdown",
      unlockAndPlay,
      {
        once:
          true,

        capture:
          true,
      }
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        unlockAndPlay,
        true
      );
    };
  }, []);

  /* =========================================================
     CERRAR AL TOCAR FUERA
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsidePointer =
      (event) => {
        if (
          rootRef.current &&
          !rootRef.current.contains(
            event.target
          )
        ) {
          setOpen(
            false
          );
        }
      };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointer,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointer,
        true
      );
    };
  }, [
    open,
  ]);

  /* =========================================================
     SALIR DE LA APP
  ========================================================= */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        const audio =
          audioRef.current;

        if (!audio) {
          return;
        }

        if (
          document.hidden
        ) {
          saveCurrentPosition();

          hiddenWasPlayingRef.current =
            !audio.paused &&
            !userPausedRef.current;

          if (
            hiddenWasPlayingRef.current
          ) {
            pauseRadio(
              "Pausada al salir"
            );
          }

          setOpen(
            false
          );

          return;
        }

        if (
          hiddenWasPlayingRef.current &&
          !userPausedRef.current
        ) {
          hiddenWasPlayingRef.current =
            false;

          playRadio();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  /* =========================================================
     GUARDAR ANTES DE CERRAR
  ========================================================= */

  useEffect(() => {
    const handlePageHide =
      () => {
        saveCurrentPosition();
      };

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    return () => {
      window.removeEventListener(
        "pagehide",
        handlePageHide
      );
    };
  }, []);

  /* =========================================================
     TRAILERS / VÍDEOS
  ========================================================= */

  useEffect(() => {
    const handleMediaStart =
      () => {
        const audio =
          audioRef.current;

        if (!audio) {
          return;
        }

        mediaWasPlayingRef.current =
          !audio.paused &&
          !userPausedRef.current;

        if (
          mediaWasPlayingRef.current
        ) {
          pauseRadio(
            "Pausada por vídeo"
          );
        }
      };

    const handleMediaEnd =
      () => {
        const shouldResume =
          mediaWasPlayingRef.current &&
          !userPausedRef.current &&
          !document.hidden;

        mediaWasPlayingRef.current =
          false;

        if (
          shouldResume
        ) {
          playRadio();
        }
      };

    window.addEventListener(
      MEDIA_START_EVENT,
      handleMediaStart
    );

    window.addEventListener(
      MEDIA_END_EVENT,
      handleMediaEnd
    );

    return () => {
      window.removeEventListener(
        MEDIA_START_EVENT,
        handleMediaStart
      );

      window.removeEventListener(
        MEDIA_END_EVENT,
        handleMediaEnd
      );
    };
  }, []);

  /* =========================================================
     CONTROLES
  ========================================================= */

  function togglePlay() {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      userPausedRef.current =
        true;

      hiddenWasPlayingRef.current =
        false;

      mediaWasPlayingRef.current =
        false;

      pauseRadio(
        "Pausada"
      );

      return;
    }

    userPausedRef.current =
      false;

    setStatus(
      "Conectando…"
    );

    playRadio();
  }

  function changeSource(
    nextId
  ) {
    if (
      nextId ===
      sourceId
    ) {
      return;
    }

    saveCurrentPosition();

    const audio =
      audioRef.current;

    stationShouldResumeRef.current =
      Boolean(audio) &&
      !audio.paused &&
      !userPausedRef.current;

    setSourceId(
      nextId
    );
  }

  function seekTo(
    value
  ) {
    const audio =
      audioRef.current;

    if (
      !audio ||
      !isProgram
    ) {
      return;
    }

    const next =
      Number(value);

    if (
      !Number.isFinite(
        next
      )
    ) {
      return;
    }

    const max =
      Number.isFinite(
        audio.duration
      ) &&
      audio.duration > 0
        ? audio.duration
        : duration;

    const clamped =
      max > 0
        ? Math.max(
            0,
            Math.min(
              next,
              max
            )
          )
        : Math.max(
            0,
            next
          );

    audio.currentTime =
      clamped;

    setCurrentTime(
      clamped
    );

    saveCurrentPosition();
  }

  function skipBy(
    seconds
  ) {
    const audio =
      audioRef.current;

    if (
      !audio ||
      !isProgram
    ) {
      return;
    }

    const max =
      Number.isFinite(
        audio.duration
      ) &&
      audio.duration > 0
        ? audio.duration
        : duration;

    let next =
      audio.currentTime +
      seconds;

    next =
      Math.max(
        0,
        next
      );

    if (
      max > 0
    ) {
      next =
        Math.min(
          next,
          max
        );
    }

    audio.currentTime =
      next;

    setCurrentTime(
      next
    );

    saveCurrentPosition();
  }

  /* =========================================================
     AUDIO EVENTS
  ========================================================= */

  function handlePlaying() {
    setPlaying(
      true
    );

    setStatus(
      sourceRef.current.kind ===
        "program"
        ? "Reproduciendo"
        : "En directo"
    );
  }

  function handleWaiting() {
    setStatus(
      "Conectando…"
    );
  }

  function handlePause() {
    setPlaying(
      false
    );

    saveCurrentPosition();
  }

  function handleLoadedMetadata() {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (
      Number.isFinite(
        audio.duration
      ) &&
      audio.duration > 0
    ) {
      setDuration(
        audio.duration
      );
    }

    restoreProgramPosition();
  }

  function handleDurationChange() {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (
      Number.isFinite(
        audio.duration
      ) &&
      audio.duration > 0
    ) {
      setDuration(
        audio.duration
      );
    }

    restoreProgramPosition();
  }

  function handleTimeUpdate() {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const next =
      audio.currentTime;

    setCurrentTime(
      next
    );

    if (
      sourceRef.current.kind !==
        "program"
    ) {
      return;
    }

    /*
      Guardamos aproximadamente
      cada 5 segundos.
    */

    if (
      Math.abs(
        next -
          lastSavedPositionRef.current
      ) >= 5
    ) {
      saveCurrentPosition();
    }
  }

  function handleEnded() {
    setPlaying(
      false
    );

    userPausedRef.current =
      true;

    if (
      sourceRef.current.kind ===
      "program"
    ) {
      clearSavedPosition();

      setCurrentTime(
        duration
      );
    }

    setStatus(
      "Programa terminado"
    );
  }

  function handleError() {
    setPlaying(
      false
    );

    setStatus(
      "Audio no disponible"
    );
  }

  /* =========================================================
     DATOS VISUALES
  ========================================================= */

  const sourceDate =
    isProgram
      ? formatDate(
          source.date
        )
      : "";

  const progressMax =
    duration > 0
      ? duration
      : 1;

  const progressValue =
    duration > 0
      ? Math.min(
          currentTime,
          duration
        )
      : 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <audio
        ref={
          audioRef
        }
        preload={
          isProgram
            ? "metadata"
            : "none"
        }
        muted={
          muted
        }
        onPlaying={
          handlePlaying
        }
        onWaiting={
          handleWaiting
        }
        onPause={
          handlePause
        }
        onEnded={
          handleEnded
        }
        onError={
          handleError
        }
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onDurationChange={
          handleDurationChange
        }
        onTimeUpdate={
          handleTimeUpdate
        }
      />

      <div
        ref={
          rootRef
        }
        style={{
          position:
            "fixed",

          top:
            14,

          left:
            14,

          zIndex:
            100000,

          fontFamily:
            "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",

          color:
            "#fff",

          pointerEvents:
            "auto",
        }}
        onPointerDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        {/* BOTÓN RADIO */}

        <button
          type="button"
          aria-label="Abrir Radio Tierra Vicio"
          onClick={() =>
            setOpen(
              (
                current
              ) =>
                !current
            )
          }
          style={{
            width:
              42,

            height:
              36,

            display:
              "grid",

            placeItems:
              "center",

            padding:
              0,

            border:
              playing
                ? "1px solid rgba(95,220,255,.58)"
                : "1px solid rgba(255,255,255,.16)",

            borderRadius:
              10,

            background:
              playing
                ? "rgba(10,62,76,.84)"
                : "rgba(0,0,0,.54)",

            color:
              "#fff",

            fontSize:
              19,

            fontWeight:
              900,

            cursor:
              "pointer",
          }}
        >
          ♪
        </button>

        {/* PANEL */}

        {open && (
          <div
            style={{
              position:
                "absolute",

              top:
                45,

              left:
                0,

              width:
                "min(350px, calc(100vw - 28px))",

              maxHeight:
                "calc(100vh - 78px)",

              overflow:
                "hidden",

              display:
                "flex",

              flexDirection:
                "column",

              boxSizing:
                "border-box",

              padding:
                14,

              border:
                "1px solid rgba(255,255,255,.15)",

              borderRadius:
                16,

              background:
                "rgba(5,8,12,.96)",

              backdropFilter:
                "blur(18px)",

              boxShadow:
                "0 18px 55px rgba(0,0,0,.42)",
            }}
          >
            {/* CABECERA */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                flexShrink:
                  0,

                marginBottom:
                  12,
              }}
            >
              <div>
                <div
                  style={{
                    color:
                      "#5fdcff",

                    fontSize:
                      9,

                    fontWeight:
                      950,

                    letterSpacing:
                      ".16em",
                  }}
                >
                  RADIO
                </div>

                <div
                  style={{
                    fontSize:
                      17,

                    fontWeight:
                      900,
                  }}
                >
                  TIERRA VICIO
                </div>
              </div>

              <div
                style={{
                  color:
                    playing
                      ? "#68e2ff"
                      : "#777",

                  fontSize:
                    9,

                  fontWeight:
                    900,
                }}
              >
                {playing
                  ? "ON AIR"
                  : "OFF"}
              </div>
            </div>

            {/* TABS */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap:
                  5,

                flexShrink:
                  0,

                marginBottom:
                  12,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setTab(
                    "live"
                  )
                }
                style={{
                  height:
                    34,

                  border:
                    tab ===
                    "live"
                      ? "1px solid rgba(95,220,255,.4)"
                      : "1px solid rgba(255,255,255,.08)",

                  borderRadius:
                    9,

                  background:
                    tab ===
                    "live"
                      ? "rgba(95,220,255,.12)"
                      : "rgba(255,255,255,.04)",

                  color:
                    "#fff",

                  fontSize:
                    9,

                  fontWeight:
                    900,
                }}
              >
                EN DIRECTO
              </button>

              <button
                type="button"
                onClick={() =>
                  setTab(
                    "programs"
                  )
                }
                style={{
                  height:
                    34,

                  border:
                    tab ===
                    "programs"
                      ? "1px solid rgba(95,220,255,.4)"
                      : "1px solid rgba(255,255,255,.08)",

                  borderRadius:
                    9,

                  background:
                    tab ===
                    "programs"
                      ? "rgba(95,220,255,.12)"
                      : "rgba(255,255,255,.04)",

                  color:
                    "#fff",

                  fontSize:
                    9,

                  fontWeight:
                    900,
                }}
              >
                PROGRAMAS
              </button>
            </div>

            {/* AHORA SUENA */}

            <div
              style={{
                padding:
                  "10px",

                flexShrink:
                  0,

                marginBottom:
                  10,

                borderRadius:
                  11,

                background:
                  "rgba(255,255,255,.05)",
              }}
            >
              <div
                style={{
                  fontSize:
                    12,

                  lineHeight:
                    1.3,

                  fontWeight:
                    900,
                }}
              >
                {source.name}
              </div>

              <div
                style={{
                  marginTop:
                    4,

                  color:
                    "rgba(255,255,255,.5)",

                  fontSize:
                    9,
                }}
              >
                {source.subtitle}

                {sourceDate
                  ? ` · ${sourceDate}`
                  : ""}
              </div>

              <div
                style={{
                  marginTop:
                    6,

                  color:
                    "#68e2ff",

                  fontSize:
                    9,
                }}
              >
                {status}
              </div>
            </div>

            {/* PROGRESO DEL PROGRAMA */}

            {isProgram && (
              <div
                style={{
                  flexShrink:
                    0,

                  padding:
                    "9px 10px 10px",

                  marginBottom:
                    10,

                  border:
                    "1px solid rgba(255,255,255,.07)",

                  borderRadius:
                    11,

                  background:
                    "rgba(255,255,255,.025)",
                }}
              >
                <input
                  type="range"
                  min="0"
                  max={
                    progressMax
                  }
                  step="1"
                  value={
                    progressValue
                  }
                  disabled={
                    duration <= 0
                  }
                  onChange={(
                    event
                  ) =>
                    seekTo(
                      event.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",

                    margin:
                      0,

                    accentColor:
                      "#68e2ff",

                    touchAction:
                      "manipulation",

                    opacity:
                      duration > 0
                        ? 1
                        : 0.45,
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    marginTop:
                      3,

                    color:
                      "rgba(255,255,255,.48)",

                    fontSize:
                      9,

                    fontVariantNumeric:
                      "tabular-nums",
                  }}
                >
                  <span>
                    {formatTime(
                      currentTime
                    )}
                  </span>

                  <span>
                    {duration > 0
                      ? formatTime(
                          duration
                        )
                      : "--:--"}
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "1fr 1fr",

                    gap:
                      6,

                    marginTop:
                      7,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      skipBy(
                        -15
                      )
                    }
                    style={{
                      height:
                        29,

                      border:
                        "1px solid rgba(255,255,255,.09)",

                      borderRadius:
                        8,

                      background:
                        "rgba(255,255,255,.04)",

                      color:
                        "#ddd",

                      fontSize:
                        10,

                      fontWeight:
                        800,
                    }}
                  >
                    ↶ 15 s
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      skipBy(
                        30
                      )
                    }
                    style={{
                      height:
                        29,

                      border:
                        "1px solid rgba(255,255,255,.09)",

                      borderRadius:
                        8,

                      background:
                        "rgba(255,255,255,.04)",

                      color:
                        "#ddd",

                      fontSize:
                        10,

                      fontWeight:
                        800,
                    }}
                  >
                    30 s ↷
                  </button>
                </div>
              </div>
            )}

            {/* PLAY / MUTE */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 48px",

                gap:
                  7,

                flexShrink:
                  0,

                marginBottom:
                  12,
              }}
            >
              <button
                type="button"
                onClick={
                  togglePlay
                }
                style={{
                  height:
                    40,

                  border:
                    "1px solid rgba(95,220,255,.28)",

                  borderRadius:
                    10,

                  background:
                    "rgba(95,220,255,.10)",

                  color:
                    "#fff",

                  fontWeight:
                    850,
                }}
              >
                {playing
                  ? "Ⅱ  Pausar"
                  : "▶  Escuchar"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setMuted(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                style={{
                  height:
                    40,

                  border:
                    "1px solid rgba(255,255,255,.11)",

                  borderRadius:
                    10,

                  background:
                    "rgba(255,255,255,.05)",

                  color:
                    "#fff",

                  fontSize:
                    16,
                }}
              >
                {muted
                  ? "×♪"
                  : "♪"}
              </button>
            </div>

            {/* LISTA */}

            <div
              style={{
                minHeight:
                  0,

                overflowY:
                  "auto",

                WebkitOverflowScrolling:
                  "touch",
              }}
            >
              {/* EN DIRECTO */}

              {tab ===
                "live" && (
                <div
                  style={{
                    display:
                      "grid",

                    gap:
                      6,
                  }}
                >
                  {LIVE_STATIONS.map(
                    (
                      item
                    ) => {
                      const active =
                        item.id ===
                        source.id;

                      return (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          onClick={() =>
                            changeSource(
                              item.id
                            )
                          }
                          style={{
                            width:
                              "100%",

                            minHeight:
                              48,

                            display:
                              "grid",

                            gridTemplateColumns:
                              "42px 1fr",

                            alignItems:
                              "center",

                            gap:
                              8,

                            padding:
                              "7px 9px",

                            border:
                              active
                                ? "1px solid rgba(95,220,255,.30)"
                                : "1px solid rgba(255,255,255,.07)",

                            borderRadius:
                              10,

                            background:
                              active
                                ? "rgba(95,220,255,.09)"
                                : "rgba(255,255,255,.035)",

                            color:
                              "#fff",

                            textAlign:
                              "left",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "grid",

                              placeItems:
                                "center",

                              height:
                                28,

                              borderRadius:
                                7,

                              background:
                                "rgba(255,255,255,.06)",

                              color:
                                active
                                  ? "#68e2ff"
                                  : "#999",

                              fontSize:
                                8,

                              fontWeight:
                                950,
                            }}
                          >
                            {item.badge}
                          </span>

                          <span>
                            <span
                              style={{
                                display:
                                  "block",

                                fontSize:
                                  11,

                                fontWeight:
                                  850,
                              }}
                            >
                              {item.name}
                            </span>

                            <span
                              style={{
                                display:
                                  "block",

                                marginTop:
                                  2,

                                color:
                                  "rgba(255,255,255,.43)",

                                fontSize:
                                  9,
                              }}
                            >
                              {item.subtitle}
                            </span>
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {/* PROGRAMAS */}

              {tab ===
                "programs" && (
                <div>
                  {programsLoading && (
                    <div
                      style={{
                        padding:
                          16,

                        textAlign:
                          "center",

                        color:
                          "rgba(255,255,255,.48)",

                        fontSize:
                          10,
                      }}
                    >
                      Cargando programas…
                    </div>
                  )}

                  {programsError && (
                    <div
                      style={{
                        padding:
                          16,

                        textAlign:
                          "center",

                        color:
                          "#ff9b9b",

                        fontSize:
                          10,
                      }}
                    >
                      No se pudieron cargar los programas.
                    </div>
                  )}

                  {!programsLoading &&
                    !programsError &&
                    shows.map(
                      (
                        show
                      ) => {
                        const expanded =
                          expandedShowId ===
                          show.id;

                        return (
                          <div
                            key={
                              show.id
                            }
                            style={{
                              marginBottom:
                                7,

                              overflow:
                                "hidden",

                              border:
                                "1px solid rgba(255,255,255,.07)",

                              borderRadius:
                                11,

                              background:
                                "rgba(255,255,255,.025)",
                            }}
                          >
                            {/* CABECERA PROGRAMA */}

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedShowId(
                                  expanded
                                    ? null
                                    : show.id
                                )
                              }
                              style={{
                                width:
                                  "100%",

                                minHeight:
                                  52,

                                display:
                                  "grid",

                                gridTemplateColumns:
                                  "42px 1fr auto",

                                alignItems:
                                  "center",

                                gap:
                                  8,

                                padding:
                                  "8px 10px",

                                border:
                                  0,

                                background:
                                  expanded
                                    ? "rgba(95,220,255,.06)"
                                    : "transparent",

                                color:
                                  "#fff",

                                textAlign:
                                  "left",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "grid",

                                  placeItems:
                                    "center",

                                  height:
                                    30,

                                  borderRadius:
                                    7,

                                  background:
                                    "rgba(255,255,255,.06)",

                                  color:
                                    "#68e2ff",

                                  fontSize:
                                    8,

                                  fontWeight:
                                    950,
                                }}
                              >
                                {show.badge}
                              </span>

                              <span>
                                <span
                                  style={{
                                    display:
                                      "block",

                                    fontSize:
                                      11,

                                    fontWeight:
                                      900,
                                  }}
                                >
                                  {show.name}
                                </span>

                                <span
                                  style={{
                                    display:
                                      "block",

                                    marginTop:
                                      2,

                                    color:
                                      "rgba(255,255,255,.43)",

                                    fontSize:
                                      9,
                                  }}
                                >
                                  {show.episodeCount} episodios
                                </span>
                              </span>

                              <span
                                style={{
                                  color:
                                    "rgba(255,255,255,.48)",

                                  fontSize:
                                    14,

                                  transform:
                                    expanded
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",

                                  transition:
                                    "transform .15s ease",
                                }}
                              >
                                ▾
                              </span>
                            </button>

                            {/* EPISODIOS */}

                            {expanded && (
                              <div
                                style={{
                                  display:
                                    "grid",

                                  gap:
                                    5,

                                  padding:
                                    "0 7px 7px",
                                }}
                              >
                                {show.episodes.map(
                                  (
                                    episode
                                  ) => {
                                    const episodeSource =
                                      makeEpisodeSource(
                                        show,
                                        episode
                                      );

                                    const active =
                                      source.id ===
                                      episodeSource.id;

                                    let savedPosition =
                                      0;

                                    try {
                                      savedPosition =
                                        Number(
                                          window.localStorage.getItem(
                                            STORAGE_POSITION_PREFIX +
                                              episodeSource.id
                                          )
                                        ) || 0;
                                    } catch {
                                      savedPosition =
                                        0;
                                    }

                                    return (
                                      <button
                                        key={
                                          episodeSource.id
                                        }
                                        type="button"
                                        onClick={() =>
                                          changeSource(
                                            episodeSource.id
                                          )
                                        }
                                        style={{
                                          width:
                                            "100%",

                                          display:
                                            "grid",

                                          gridTemplateColumns:
                                            "1fr auto",

                                          alignItems:
                                            "center",

                                          gap:
                                            8,

                                          padding:
                                            "8px 9px",

                                          border:
                                            active
                                              ? "1px solid rgba(95,220,255,.28)"
                                              : "1px solid rgba(255,255,255,.055)",

                                          borderRadius:
                                            8,

                                          background:
                                            active
                                              ? "rgba(95,220,255,.08)"
                                              : "rgba(0,0,0,.15)",

                                          color:
                                            "#fff",

                                          textAlign:
                                            "left",
                                        }}
                                      >
                                        <span
                                          style={{
                                            minWidth:
                                              0,
                                          }}
                                        >
                                          <span
                                            style={{
                                              display:
                                                "block",

                                              overflow:
                                                "hidden",

                                              textOverflow:
                                                "ellipsis",

                                              fontSize:
                                                10,

                                              lineHeight:
                                                1.3,

                                              fontWeight:
                                                active
                                                  ? 900
                                                  : 750,
                                            }}
                                          >
                                            {episode.title}
                                          </span>

                                          <span
                                            style={{
                                              display:
                                                "block",

                                              marginTop:
                                                3,

                                              color:
                                                "rgba(255,255,255,.4)",

                                              fontSize:
                                                8,
                                            }}
                                          >
                                            {formatDate(
                                              episode.date
                                            )}

                                            {savedPosition >
                                            5
                                              ? ` · seguir en ${formatTime(
                                                  savedPosition
                                                )}`
                                              : ""}
                                          </span>
                                        </span>

                                        <span
                                          style={{
                                            color:
                                              active
                                                ? "#68e2ff"
                                                : "rgba(255,255,255,.38)",

                                            fontSize:
                                              12,
                                          }}
                                        >
                                          {active &&
                                          playing
                                            ? "Ⅱ"
                                            : "▶"}
                                        </span>
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
