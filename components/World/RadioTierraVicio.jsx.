"use client";

import { useEffect, useRef, useState } from "react";

const STATIONS = [
  {
    id: "rpgn",
    name: "RPGN Radio",
    subtitle: "Game Music Radio",
    badge: "GAME",
    url: "https://listen.rpgamers.net/rpgn",
  },
  {
    id: "radiosega",
    name: "RadioSEGA",
    subtitle: "SEGA music 24/7",
    badge: "SEGA",
    url: "https://icecast.radiosega.net/rs-mpeg.mp3",
  },
  {
    id: "chiptune",
    name: "Chiptune 24/7",
    subtitle: "8-bit · 16-bit · demoscene",
    badge: "8BIT",
    url: "https://radio.zelerk.com/listen/chiptune/stream.mp3",
  },
  {
    id: "vapor",
    name: "Vapor Funk",
    subtitle: "Future funk · vaporwave",
    badge: "VPR",
    url: "https://radio.zelerk.com/listen/vapor/stream.mp3",
  },
];

const STORAGE_STATION = "tierraVicioRadioStation";
const STORAGE_VOLUME = "tierraVicioRadioVolume";
const STORAGE_MUTED = "tierraVicioRadioMuted";

export default function RadioTierraVicio() {
  const audioRef = useRef(null);
  const userPausedRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [stationId, setStationId] = useState("rpgn");
  const [volume, setVolume] = useState(0.35);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Esperando interacción");

  const station =
    STATIONS.find((item) => item.id === stationId) ||
    STATIONS[0];

  useEffect(() => {
    try {
      const savedStation =
        window.localStorage.getItem(
          STORAGE_STATION
        );

      const savedVolume =
        Number(
          window.localStorage.getItem(
            STORAGE_VOLUME
          )
        );

      const savedMuted =
        window.localStorage.getItem(
          STORAGE_MUTED
        );

      if (
        STATIONS.some(
          (item) =>
            item.id === savedStation
        )
      ) {
        setStationId(
          savedStation
        );
      }

      if (
        Number.isFinite(
          savedVolume
        ) &&
        savedVolume >= 0 &&
        savedVolume <= 1
      ) {
        setVolume(
          savedVolume
        );
      }

      if (
        savedMuted === "true"
      ) {
        setMuted(true);
      }
    } catch {
      // Preferencias opcionales.
    }
  }, []);

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume =
      volume;

    audio.muted =
      muted;

    try {
      window.localStorage.setItem(
        STORAGE_VOLUME,
        String(volume)
      );

      window.localStorage.setItem(
        STORAGE_MUTED,
        String(muted)
      );
    } catch {
      // Preferencias opcionales.
    }
  }, [
    volume,
    muted,
  ]);

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

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const wasPlaying =
      !audio.paused;

    audio.src =
      station.url;

    audio.load();

    setStatus(
      wasPlaying
        ? "Conectando…"
        : "Lista"
    );

    if (
      wasPlaying
    ) {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setStatus(
            "En directo"
          );
        })
        .catch(() => {
          setPlaying(false);
          setStatus(
            "Toca ▶ para escuchar"
          );
        });
    }
  }, [
    station.id,
    station.url,
  ]);

  useEffect(() => {
    const unlockAndPlay =
      () => {
        const audio =
          audioRef.current;

        if (
          !audio ||
          userPausedRef.current ||
          !audio.paused
        ) {
          return;
        }

        audio
          .play()
          .then(() => {
            setPlaying(
              true
            );

            setStatus(
              "En directo"
            );
          })
          .catch(() => {
            setStatus(
              "Toca ▶ para escuchar"
            );
          });
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

      audio.pause();

      setPlaying(false);

      setStatus(
        "Pausada"
      );

      return;
    }

    userPausedRef.current =
      false;

    setStatus(
      "Conectando…"
    );

    audio
      .play()
      .then(() => {
        setPlaying(true);

        setStatus(
          "En directo"
        );
      })
      .catch(() => {
        setPlaying(false);

        setStatus(
          "No se pudo reproducir"
        );
      });
  }

  function changeStation(
    nextStationId
  ) {
    if (
      nextStationId ===
      stationId
    ) {
      return;
    }

    userPausedRef.current =
      false;

    setStationId(
      nextStationId
    );
  }

  function handleCanPlay() {
    if (
      !audioRef.current?.paused
    ) {
      setPlaying(true);

      setStatus(
        "En directo"
      );
    }
  }

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
    setPlaying(false);
  }

  function handleError() {
    setPlaying(false);

    setStatus(
      "Stream no disponible"
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        src={station.url}
        onCanPlay={
          handleCanPlay
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
                  13,

                padding:
                  "0 2px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  marginBottom:
                    5,

                  color:
                    "rgba(255,255,255,.56)",

                  fontSize:
                    9,

                  fontWeight:
                    850,
                }}
              >
                <span>
                  VOLUMEN
                </span>

                <span>
                  {muted
                    ? "MUTE"
                    : `${Math.round(
                        volume *
                          100
                      )}%`}
                </span>
              </div>

              <input
                aria-label="Volumen de Radio Tierra Vicio"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={
                  volume
                }
                onChange={(
                  event
                ) => {
                  const nextVolume =
                    Number(
                      event
                        .target
                        .value
                    );

                  setVolume(
                    nextVolume
                  );

                  if (
                    muted &&
                    nextVolume >
                      0
                  ) {
                    setMuted(
                      false
                    );
                  }
                }}
                style={{
                  width:
                    "100%",

                  height:
                    26,

                  margin:
                    0,

                  accentColor:
                    "#5fdcff",

                  cursor:
                    "pointer",

                  touchAction:
                    "manipulation",
                }}
              />
            </div>

            <div
              style={{
                marginBottom:
                  6,

                color:
                  "rgba(255,255,255,.42)",

                fontSize:
                  8,

                fontWeight:
                  900,

                letterSpacing:
                  ".13em",
              }}
            >
              CANALES
            </div>

            <div
              style={{
                display:
                  "grid",

                gap:
                  5,
              }}
            >
              {STATIONS.map(
                (
                  item
                ) => {
                  const active =
                    item.id ===
                    stationId;

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
                        minHeight:
                          40,

                        width:
                          "100%",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap:
                          8,

                        padding:
                          "7px 8px",

                        border:
                          active
                            ? "1px solid rgba(95,220,255,.30)"
                            : "1px solid rgba(255,255,255,.065)",

                        borderRadius:
                          9,

                        background:
                          active
                            ? "rgba(95,220,255,.09)"
                            : "rgba(255,255,255,.03)",

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
                          width:
                            37,

                          height:
                            26,

                          flex:
                            "0 0 auto",

                          display:
                            "grid",

                          placeItems:
                            "center",

                          borderRadius:
                            7,

                          background:
                            active
                              ? "rgba(95,220,255,.13)"
                              : "rgba(255,255,255,.055)",

                          color:
                            active
                              ? "#68e2ff"
                              : "rgba(255,255,255,.62)",

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

                          flex:
                            1,
                        }}
                      >
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
                              1,

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",

                            color:
                              "rgba(255,255,255,.42)",

                            fontSize:
                              8,
                          }}
                        >
                          {item.subtitle}
                        </span>
                      </span>

                      {active && (
                        <span
                          style={{
                            color:
                              "#68e2ff",

                            fontSize:
                              9,
                          }}
                        >
                          ●
                        </span>
                      )}
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
