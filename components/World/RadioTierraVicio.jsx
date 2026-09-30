"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const STATIONS = [
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

  const interruptedByExternalMediaRef =
    useRef(false);

  const stationShouldResumeRef =
    useRef(false);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    stationId,
    setStationId,
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

  const station =
    STATIONS.find(
      (item) =>
        item.id ===
        stationId
    ) ||
    STATIONS[0];

  function playRadio(
    nextStatus =
      "En directo"
  ) {
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
          nextStatus
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
      const savedStation =
        window.localStorage.getItem(
          STORAGE_STATION
        );

      const savedMuted =
        window.localStorage.getItem(
          STORAGE_MUTED
        );

      if (
        STATIONS.some(
          (item) =>
            item.id ===
            savedStation
        )
      ) {
        setStationId(
          savedStation
        );
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
     GUARDAR EMISORA
  ========================================================= */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_STATION,
        stationId
      );
    } catch {
      // Preferencias opcionales.
    }
  }, [
    stationId,
  ]);

  /* =========================================================
     CAMBIO DE EMISORA
  ========================================================= */

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    audio.src =
      station.url;

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
        "Lista"
      );
    }
  }, [
    station.id,
    station.url,
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

    window.addEventListener(
      "keydown",
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

      window.removeEventListener(
        "keydown",
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
     PAUSAR AL SALIR DE LA APP / PÁGINA
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

    const handlePageHide =
      () => {
        const audio =
          audioRef.current;

        if (!audio) {
          return;
        }

        hiddenWasPlayingRef.current =
          !audio.paused &&
          !userPausedRef.current;

        if (
          !audio.paused
        ) {
          pauseRadio(
            "Pausada al salir"
          );
        }

        setOpen(false);
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "pagehide",
        handlePageHide
      );
    };
  }, []);

  /* =========================================================
     COORDINACIÓN CON TRAILERS / VÍDEOS
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

        interruptedByExternalMediaRef.current =
          false;

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
          (
            mediaWasPlayingRef.current ||
            interruptedByExternalMediaRef.current
          ) &&
          !userPausedRef.current &&
          !document.hidden;

        mediaWasPlayingRef.current =
          false;

        interruptedByExternalMediaRef.current =
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
     PLAY / PAUSE
  ========================================================= */

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

      mediaWasPlayingRef.current =
        false;

      interruptedByExternalMediaRef.current =
        false;

      hiddenWasPlayingRef.current =
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

  /* =========================================================
     CAMBIAR EMISORA
  ========================================================= */

  function changeStation(
    nextStationId
  ) {
    if (
      nextStationId ===
      stationId
    ) {
      return;
    }

    const audio =
      audioRef.current;

    stationShouldResumeRef.current =
      Boolean(audio) &&
      !audio.paused &&
      !userPausedRef.current;

    setStationId(
      nextStationId
    );
  }

  /* =========================================================
     EVENTOS AUDIO
  ========================================================= */

  function handlePlaying() {
    setPlaying(true);

    setStatus(
      "En directo"
    );
  }

  function handleWaiting() {
    setStatus(
      "Conectando…"
    );
  }

  function handlePause() {
    const audio =
      audioRef.current;

    setPlaying(false);

    if (
      audio &&
      !userPausedRef.current &&
      !document.hidden &&
      !hiddenWasPlayingRef.current &&
      !mediaWasPlayingRef.current
    ) {
      interruptedByExternalMediaRef.current =
        true;

      setStatus(
        "Pausada por otro audio"
      );
    }
  }

  function handleError() {
    setPlaying(false);

    setStatus(
      "Stream no disponible"
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <audio
        ref={
          audioRef
        }
        preload="none"
        src={
          station.url
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
        onPointerMove={(
          event
        ) =>
          event.stopPropagation()
        }
        onPointerUp={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          aria-label="Abrir Radio Tierra Vicio"
          aria-expanded={
            open
          }
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

            backdropFilter:
              "blur(10px)",

            WebkitBackdropFilter:
              "blur(10px)",

            color:
              "#fff",

            fontSize:
              19,

            fontWeight:
              900,

            cursor:
              "pointer",

            touchAction:
              "manipulation",

            boxShadow:
              playing
                ? "0 0 18px rgba(95,220,255,.16)"
                : "none",
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
                "min(290px, calc(100vw - 28px))",

              boxSizing:
                "border-box",

              padding:
                14,

              border:
                "1px solid rgba(255,255,255,.15)",

              borderRadius:
                16,

              background:
                "rgba(5,8,12,.94)",

              backdropFilter:
                "blur(18px)",

              WebkitBackdropFilter:
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

                gap:
                  12,

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
                    marginTop:
                      2,

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
                  padding:
                    "5px 7px",

                  borderRadius:
                    8,

                  background:
                    playing
                      ? "rgba(95,220,255,.12)"
                      : "rgba(255,255,255,.07)",

                  color:
                    playing
                      ? "#68e2ff"
                      : "rgba(255,255,255,.55)",

                  fontSize:
                    9,

                  fontWeight:
                    900,

                  whiteSpace:
                    "nowrap",
                }}
              >
                {playing
                  ? "ON AIR"
                  : "OFF"}
              </div>
            </div>

            <div
              style={{
                padding:
                  "10px 11px",

                marginBottom:
                  10,

                borderRadius:
                  11,

                border:
                  "1px solid rgba(255,255,255,.08)",

                background:
                  "rgba(255,255,255,.055)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    10,
                }}
              >
                <div
                  style={{
                    width:
                      42,

                    height:
                      36,

                    flex:
                      "0 0 auto",

                    display:
                      "grid",

                    placeItems:
                      "center",

                    borderRadius:
                      9,

                    background:
                      "rgba(95,220,255,.12)",

                    color:
                      "#68e2ff",

                    fontSize:
                      9,

                    fontWeight:
                      950,
                  }}
                >
                  {station.badge}
                </div>

                <div
                  style={{
                    minWidth:
                      0,

                    flex:
                      1,
                  }}
                >
                  <div
                    style={{
                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      whiteSpace:
                        "nowrap",

                      fontSize:
                        13,

                      fontWeight:
                        850,
                    }}
                  >
                    {station.name}
                  </div>

                  <div
                    style={{
                      marginTop:
                        2,

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      whiteSpace:
                        "nowrap",

                      color:
                        "rgba(255,255,255,.5)",

                      fontSize:
                        10,
                    }}
                  >
                    {station.subtitle}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop:
                    8,

                  color:
                    "rgba(255,255,255,.45)",

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

                  fontSize:
                    12,

                  fontWeight:
                    850,

                  cursor:
                    "pointer",

                  touchAction:
                    "manipulation",
                }}
              >
                {playing
                  ? "Ⅱ  Pausar"
                  : "▶  Escuchar"}
              </button>

              <button
                type="button"
                aria-label={
                  muted
                    ? "Activar sonido"
                    : "Silenciar"
                }
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

                  cursor:
                    "pointer",

                  touchAction:
                    "manipulation",
                }}
              >
                {muted
                  ? "×♪"
                  : "♪"}
              </button>
            </div>

            <div
              style={{
                marginBottom:
                  6,

                color:
                  "rgba(255,255,255,.45)",

                fontSize:
                  9,

                fontWeight:
                  850,
              }}
            >
              EMISORAS
            </div>

            <div
              style={{
                display:
                  "grid",

                gap:
                  6,
              }}
            >
              {STATIONS.map(
                (
                  item
                ) => {
                  const active =
                    item.id ===
                    station.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        changeStation(
                          item.id
                        )
                      }
                      style={{
                        width:
                          "100%",

                        minHeight:
                          43,

                        display:
                          "grid",

                        gridTemplateColumns:
                          "44px 1fr",

                        alignItems:
                          "center",

                        gap:
                          9,

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

                        cursor:
                          "pointer",

                        touchAction:
                          "manipulation",
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
                              : "rgba(255,255,255,.6)",

                          fontSize:
                            8,

                          fontWeight:
                            950,
                        }}
                      >
                        {item.badge}
                      </span>

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

                            whiteSpace:
                              "nowrap",

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

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",

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
