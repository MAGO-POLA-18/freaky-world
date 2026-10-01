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
      (total % 3600) / 60
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

function getViewport() {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      width: 390,
      height: 844,
    };
  }

  const visual =
    window.visualViewport;

  return {
    width:
      visual?.width ||
      window.innerWidth ||
      390,

    height:
      visual?.height ||
      window.innerHeight ||
      844,
  };
}

/* =========================================================
   BOTÓN BASE
========================================================= */

function simpleButtonStyle({
  active = false,
  height = 34,
} = {}) {
  return {
    height,

    border:
      active
        ? "1px solid rgba(95,220,255,.40)"
        : "1px solid rgba(255,255,255,.09)",

    borderRadius:
      9,

    background:
      active
        ? "rgba(95,220,255,.12)"
        : "rgba(255,255,255,.04)",

    color:
      "#fff",

    fontSize:
      9,

    fontWeight:
      900,

    cursor:
      "pointer",

    touchAction:
      "manipulation",
  };
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

  const mediaActiveRef =
    useRef(false);

  const pendingMediaResumeRef =
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
    viewport,
    setViewport,
  ] = useState(
    getViewport
  );

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

  /* =======================================================
     VIEWPORT / ORIENTACIÓN
  ======================================================= */

  useEffect(() => {
    function updateViewport() {
      setViewport(
        getViewport()
      );
    }

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    window.addEventListener(
      "orientationchange",
      updateViewport
    );

    window.visualViewport
      ?.addEventListener(
        "resize",
        updateViewport
      );

    return () => {
      window.removeEventListener(
        "resize",
        updateViewport
      );

      window.removeEventListener(
        "orientationchange",
        updateViewport
      );

      window.visualViewport
        ?.removeEventListener(
          "resize",
          updateViewport
        );
    };
  }, []);

  const landscape =
    viewport.width >
      viewport.height &&
    viewport.height <= 650;

  const compactLandscape =
    landscape &&
    viewport.height <= 430;

  /* =======================================================
     FUENTES DE PROGRAMAS
  ======================================================= */

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

  /* =======================================================
     STORAGE POSICIÓN PODCAST
  ======================================================= */

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
      window.localStorage
        .setItem(
          key,
          String(
            audio.currentTime
          )
        );

      lastSavedPositionRef.current =
        audio.currentTime;
    } catch {
      // Storage opcional.
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
      window.localStorage
        .removeItem(
          key
        );
    } catch {
      // Storage opcional.
    }
  }

  /* =======================================================
     PLAY / PAUSE
  ======================================================= */

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

  /* =======================================================
     CARGAR PROGRAMAS
  ======================================================= */

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

  /* =======================================================
     RESTAURAR EPISODIO GUARDADO
  ======================================================= */

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

  /* =======================================================
     CARGAR PREFERENCIAS
  ======================================================= */

  useEffect(() => {
    try {
      const savedSource =
        window.localStorage
          .getItem(
            STORAGE_STATION
          );

      const savedMuted =
        window.localStorage
          .getItem(
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
        setMuted(true);
      }
    } catch {
      // Preferencias opcionales.
    }
  }, []);
