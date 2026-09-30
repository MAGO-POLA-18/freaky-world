"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const LIVE_STATIONS = [
  {
    id: "rpgn",
    name: "RPGN Radio",
    subtitle: "Game Music Radio",
    badge: "GAME",
    url: "https://stream.rpgamers.net/rpgn",
  },
  {
    id: "radiosega",
    name: "RadioSEGA",
    subtitle: "SEGA music 24/7",
    badge: "SEGA",
    url: "https://icecast.radiosega.net/rs-mpeg.mp3",
  },
];

const PROGRAMS = [
  {
    id: "go855",
    name: "Game Over 855",
    subtitle:
      "Trilogía Voice of Cards · 19 sep 2026",
    badge: "GO",
    url: "https://www.portalgameover.com/programas/go855.mp3",
  },
  {
    id: "go854",
    name: "Game Over 854",
    subtitle:
      "007 First Light · 5 sep 2026",
    badge: "GO",
    url: "https://www.portalgameover.com/programas/go854.mp3",
  },
  {
    id: "go853",
    name: "Game Over 853",
    subtitle:
      "Arzette · 18 jul 2026",
    badge: "GO",
    url: "https://www.portalgameover.com/programas/go853.mp3",
  },
];

const STORAGE_STATION =
  "tierraVicioRadioStation";

const STORAGE_MUTED =
  "tierraVicioRadioMuted";

const MEDIA_START_EVENT =
  "tierra-vicio-media-start";

const MEDIA_END_EVENT =
  "tierra-vicio-media-end";

export default function RadioTierraVicio() {
  const audioRef =
    useRef(null);

  const rootRef =
    useRef(null);

  const userPausedRef =
    useRef(false);

  const hiddenWasPlayingRef =
    useRef(false);

  const mediaWasPlayingRef =
    useRef(false);

  const stationShouldResumeRef =
    useRef(false);

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

  const allSources = [
    ...LIVE_STATIONS,
    ...PROGRAMS,
  ];

  const source =
    allSources.find(
      (item) =>
        item.id ===
        sourceId
    ) ||
    LIVE_STATIONS[0];

  const isProgram =
    PROGRAMS.some(
      (item) =>
        item.id ===
        source.id
    );

  function playRadio() {
    const audio =
      audioRef.current;

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
          isProgram
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

    audio.pause();

    setPlaying(false);

    setStatus(
      nextStatus
    );
  }

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
        allSources.some(
          (item) =>
            item.id ===
            savedSource
        )
      ) {
        setSourceId(
          savedSource
        );

        if (
          PROGRAMS.some(
            (item) =>
              item.id ===
              savedSource
          )
        ) {
          setTab(
            "programs"
          );
        }
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
      // Preferencias opcionales.
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
      // Preferencias opcionales.
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
      setPlaying(false);

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
        once: true,
        capture: true,
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
     CERRAR PANEL AL TOCAR FUERA
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
          setOpen(false);
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
     PAUSAR AL SALIR DE LA APP
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

          setOpen(false);

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

  function togglePlay() {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (
      !audio.paused
    ) {
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

  function handlePlaying() {
    setPlaying(true);

    setStatus(
      isProgram
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
    setPlaying(false);
  }

  function handleEnded() {
    setPlaying(false);

    userPausedRef.current =
      true;

    setStatus(
      "Programa terminado"
    );
  }

  function handleError() {
    setPlaying(false);

    setStatus(
      "Audio no disponible"
    );
  }

  const currentList =
    tab === "live"
      ? LIVE_STATIONS
      : PROGRAMS;

  return (
    <>
      <audio
        ref={
          audioRef
        }
        preload="none"
        src={
          source.url
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
                "min(320px, calc(100vw - 28px))",

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
            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

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

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap:
                  5,

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

            <div
              style={{
                padding:
                  "10px",

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

                  fontWeight:
                    900,
                }}
              >
                {source.name}
              </div>

              <div
                style={{
                  marginTop:
                    3,

                  color:
                    "rgba(255,255,255,.5)",

                  fontSize:
                    9,
                }}
              >
                {source.subtitle}
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

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 48px",

                gap:
                  7,

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

            <div
              style={{
                display:
                  "grid",

                gap:
                  6,

                maxHeight:
                  250,

                overflowY:
                  "auto",
              }}
            >
              {currentList.map(
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
                          46,

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
          </div>
        )}
      </div>
    </>
  );
}
