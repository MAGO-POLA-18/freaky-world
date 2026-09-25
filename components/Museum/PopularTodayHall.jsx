"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Html,
  RoundedBox,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import {
  createPortal,
} from "react-dom";

import * as THREE from "three";

import {
  playerInput,
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   SALA
========================================================= */

const ROOM_HALF_WIDTH = 18.5;

const ROOM_FRONT_Z = 27;
const ROOM_BACK_Z = -25;

/* =========================================================
   DATOS FICTICIOS

   Después se sustituyen por Freaky Ranking real.
========================================================= */

const GAMES = [
  {
    rank: 1,
    title: "NEON DISTRICT",
    subtitle: "Nightfall Studios",
    year: "2027",
    genre: "Acción · Mundo abierto",
    platform: "PS5 · Xbox · PC",
    score: "9.4",
    accent: "#ff5f78",
    accent2: "#7048e8",
    description:
      "Una enorme ciudad nocturna donde cada distrito cambia según tus decisiones y reputación.",
  },

  {
    rank: 2,
    title: "ECHOES",
    subtitle: "North Shore Games",
    year: "2026",
    genre: "Aventura",
    platform: "PS5 · PC",
    score: "9.1",
    accent: "#64c7ff",
    accent2: "#275c9b",
    description:
      "Exploración narrativa en un archipiélago abandonado donde el entorno reconstruye recuerdos.",
  },

  {
    rank: 3,
    title: "RED HORIZON",
    subtitle: "Atlas Interactive",
    year: "2026",
    genre: "RPG · Ciencia ficción",
    platform: "Xbox · PC",
    score: "8.9",
    accent: "#ff873d",
    accent2: "#9c3232",
    description:
      "Una colonia marciana dividida entre corporaciones, exploradores y nuevos asentamientos.",
  },

  {
    rank: 4,
    title: "VOID RUNNER",
    subtitle: "Pulse Works",
    year: "2026",
    genre: "Acción",
    platform: "PS5 · Xbox · PC",
    score: "8.8",
    accent: "#46e6c8",
    accent2: "#16647c",
    description:
      "Combate rápido, estaciones orbitales y recorridos que cambian en cada partida.",
  },

  {
    rank: 5,
    title: "THE LAST SIGNAL",
    subtitle: "Silent Peak",
    year: "2026",
    genre: "Terror",
    platform: "PS5 · PC",
    score: "8.7",
    accent: "#d79cff",
    accent2: "#563b79",
    description:
      "Una señal desconocida conduce a una estación científica que debería llevar años vacía.",
  },

  {
    rank: 6,
    title: "IRON KINGDOM",
    subtitle: "Oak Forge",
    year: "2025",
    genre: "RPG",
    platform: "Switch 2 · PC",
    score: "8.6",
    accent: "#e6bd59",
    accent2: "#705f32",
    description:
      "Reinos mecánicos, fortalezas móviles y un sistema de combate centrado en armas modulares.",
  },

  {
    rank: 7,
    title: "DEEP BLUE",
    subtitle: "Drift Studios",
    year: "2026",
    genre: "Exploración",
    platform: "PS5 · Xbox",
    score: "8.5",
    accent: "#45b8ff",
    accent2: "#15456e",
    description:
      "Exploración submarina en un océano alienígena lleno de estructuras imposibles.",
  },

  {
    rank: 8,
    title: "BLACK SUN",
    subtitle: "Orbital Games",
    year: "2026",
    genre: "Estrategia",
    platform: "PC",
    score: "8.4",
    accent: "#ffca54",
    accent2: "#903b42",
    description:
      "Construcción de civilizaciones alrededor de una estrella que comienza a apagarse.",
  },

  {
    rank: 9,
    title: "DUST ROAD",
    subtitle: "Nomad Interactive",
    year: "2025",
    genre: "Supervivencia",
    platform: "Xbox · PC",
    score: "8.2",
    accent: "#d69255",
    accent2: "#714433",
    description:
      "Carreteras infinitas, vehículos modificables y asentamientos repartidos por el desierto.",
  },

  {
    rank: 10,
    title: "LUMINA",
    subtitle: "Small Moon",
    year: "2026",
    genre: "Plataformas",
    platform: "Switch 2",
    score: "8.1",
    accent: "#75e3ab",
    accent2: "#3284a0",
    description:
      "Un viaje colorido por pequeños mundos conectados mediante portales de luz.",
  },
];

/* =========================================================
   POSTER PROCEDURAL

   Generamos una portada totalmente por código.

   No depende de imágenes externas.
========================================================= */

function createPosterTexture(
  game
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 512;
  canvas.height = 768;

  const ctx =
    canvas.getContext(
      "2d"
    );

  /* fondo */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      512,
      768
    );

  gradient.addColorStop(
    0,
    game.accent
  );

  gradient.addColorStop(
    0.5,
    game.accent2
  );

  gradient.addColorStop(
    1,
    "#090d12"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    512,
    768
  );

  /* círculos */

  ctx.globalAlpha = 0.2;

  ctx.fillStyle =
    "#ffffff";

  ctx.beginPath();

  ctx.arc(
    390,
    155,
    155,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 0.12;

  ctx.beginPath();

  ctx.arc(
    120,
    440,
    210,
    0,
    Math.PI * 2
  );

  ctx.fill();

  /* forma diagonal */

  ctx.globalAlpha = 0.22;

  ctx.fillStyle =
    "#ffffff";

  ctx.beginPath();

  ctx.moveTo(
    0,
    470
  );

  ctx.lineTo(
    512,
    260
  );

  ctx.lineTo(
    512,
    410
  );

  ctx.lineTo(
    0,
    620
  );

  ctx.closePath();

  ctx.fill();

  ctx.globalAlpha = 1;

  /* ranking */

  ctx.fillStyle =
    "rgba(0,0,0,0.55)";

  ctx.beginPath();

  ctx.roundRect(
    30,
    30,
    90,
    55,
    18
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "700 28px Arial";

  ctx.fillText(
    `#${game.rank}`,
    50,
    68
  );

  /* título */

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 48px Arial";

  const words =
    game.title.split(
      " "
    );

  let line = "";
  let y = 585;

  words.forEach(
    (
      word
    ) => {
      const test =
        `${line}${word} `;

      const width =
        ctx.measureText(
          test
        ).width;

      if (
        width > 450 &&
        line
      ) {
        ctx.fillText(
          line.trim(),
          30,
          y
        );

        line =
          `${word} `;

        y += 54;
      } else {
        line =
          test;
      }
    }
  );

  ctx.fillText(
    line.trim(),
    30,
    y
  );

  /* estudio */

  ctx.font =
    "500 21px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.75)";

  ctx.fillText(
    game.subtitle,
    32,
    720
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 4;

  texture.needsUpdate =
    true;

  return texture;
}

/* =========================================================
   INSTANCIAS
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  emissive = "#000000",
  emissiveIntensity = 0,
  castShadow = false,
  receiveShadow = true,
}) {
  const ref =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        dummy.position.set(
          ...item.position
        );

        dummy.rotation.set(
          ...(
            item.rotation ??
            [0, 0, 0]
          )
        );

        dummy.scale.set(
          ...item.scale
        );

        dummy.updateMatrix();

        ref.current
          .setMatrixAt(
            index,
            dummy.matrix
          );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate =
      true;

    ref.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={ref}
      args={[
        null,
        null,
        items.length,
      ]}
      castShadow={
        castShadow
      }
      receiveShadow={
        receiveShadow
      }
    >
      <boxGeometry
        args={[
          1,
          1,
          1,
        ]}
      />

      <meshStandardMaterial
        color={color}
        roughness={
          roughness
        }
        metalness={
          metalness
        }
        emissive={
          emissive
        }
        emissiveIntensity={
          emissiveIntensity
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   ESTACIÓN INTERACTIVA
========================================================= */

function GameStation({
  game,
  position,
  rotation,
  onOpen,
}) {
  const ref =
    useRef(null);

  const nearRef =
    useRef(false);

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const [
    near,
    setNear,
  ] =
    useState(false);

  const poster =
    useMemo(
      () =>
        createPosterTexture(
          game
        ),
      [
        game,
      ]
    );

  useEffect(() => {
    return () => {
      poster.dispose();
    };
  }, [
    poster,
  ]);

  /* =======================================================
     PROXIMIDAD
  ======================================================= */

  useFrame(() => {
    if (
      !ref.current ||
      !playerRuntime.body
    ) {
      return;
    }

    ref.current.getWorldPosition(
      worldPosition
    );

    const player =
      playerRuntime.body.translation();

    const dx =
      player.x -
      worldPosition.x;

    const dz =
      player.z -
      worldPosition.z;

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    const nextNear =
      distance <
      (
        game.rank <= 3
          ? 4.1
          : 3.7
      );

    if (
      nextNear !==
      nearRef.current
    ) {
      nearRef.current =
        nextNear;

      setNear(
        nextNear
      );
    }
  });

  const topThree =
    game.rank <= 3;

  return (
    <group
      ref={ref}
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >
      {/* ===================================================
          BASE
      =================================================== */}

      <RoundedBox
        position={[
          0,
          0.25,
          0,
        ]}
        args={[
          topThree
            ? 2.9
            : 2.55,

          0.35,

          topThree
            ? 1.45
            : 1.25,
        ]}
        radius={0.13}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#30363a"
          roughness={0.65}
        />
      </RoundedBox>

      {/* ===================================================
          PEDESTAL
      =================================================== */}

      <RoundedBox
        position={[
          0,
          1.15,
          0,
        ]}
        args={[
          topThree
            ? 1.75
            : 1.55,

          1.55,

          0.3,
        ]}
        radius={0.11}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#474e52"
          roughness={0.62}
        />
      </RoundedBox>

      {/* ===================================================
          MARCO VERTICAL
      =================================================== */}

      <RoundedBox
        position={[
          0,
          topThree
            ? 3.15
            : 3.0,
          0,
        ]}
        args={[
          topThree
            ? 2.35
            : 2.05,

          topThree
            ? 3.55
            : 3.2,

          0.19,
        ]}
        radius={0.16}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={
            near
              ? game.accent
              : "#20272c"
          }
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.38
              : 0.08
          }
          roughness={0.35}
        />
      </RoundedBox>

      {/* ===================================================
          PORTADA VERTICAL
      =================================================== */}

      <mesh
        position={[
          0,
          topThree
            ? 3.15
            : 3.0,
          0.115,
        ]}
      >
        <planeGeometry
          args={[
            topThree
              ? 2.08
              : 1.8,

            topThree
              ? 3.22
              : 2.88,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          LÍNEA ACENTO
      =================================================== */}

      <RoundedBox
        position={[
          0,
          1.95,
          0.13,
        ]}
        args={[
          1.55,
          0.09,
          0.08,
        ]}
        radius={0.03}
        smoothness={2}
      >
        <meshStandardMaterial
          color={game.accent}
          emissive={
            game.accent
          }
          emissiveIntensity={0.8}
        />
      </RoundedBox>

      {/* ===================================================
          BOTÓN DE PROXIMIDAD
      =================================================== */}

      {near && (
        <Html
          position={[
            0,
            topThree
              ? 5.35
              : 5.05,
            0.3,
          ]}
          center
          distanceFactor={8}
          zIndexRange={[
            100,
            100,
          ]}
        >
          <button
            type="button"

            onPointerDown={(
              event
            ) => {
              event.stopPropagation();
            }}

            onTouchStart={(
              event
            ) => {
              event.stopPropagation();
            }}

            onClick={(
              event
            ) => {
              event.stopPropagation();

              onOpen(
                game
              );
            }}

            style={{
              border:
                "1px solid rgba(255,255,255,.32)",

              borderRadius:
                "999px",

              padding:
                "10px 15px",

              background:
                "rgba(17,22,26,.96)",

              color:
                "#ffffff",

              fontWeight:
                800,

              fontSize:
                "12px",

              letterSpacing:
                ".05em",

              whiteSpace:
                "nowrap",

              boxShadow:
                "0 8px 24px rgba(0,0,0,.35)",

              touchAction:
                "manipulation",
            }}
          >
            VER FICHA
          </button>
        </Html>
      )}
    </group>
  );
}

/* =========================================================
   FICHA 2D

   Sin iframe.
   Sin pantalla negra.
   Se monta fuera de Three.js.
========================================================= */

function GameDetailOverlay({
  game,
  onClose,
}) {
  const [
    ready,
    setReady,
  ] =
    useState(false);

  useEffect(() => {
    setReady(true);

    playerInput.uiLocked =
      true;

    playerInput.x = 0;
    playerInput.y = 0;
    playerInput.lookX = 0;
    playerInput.lookY = 0;
    playerInput.dashRequested =
      false;

    const previous =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      playerInput.uiLocked =
        false;

      playerInput.x = 0;
      playerInput.y = 0;
      playerInput.lookX = 0;
      playerInput.lookY = 0;

      document.body.style
        .overflow =
        previous;
    };
  }, []);

  if (
    !ready ||
    typeof document ===
      "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      onPointerDown={(
        event
      ) => {
        event.stopPropagation();

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}

      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          999999,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          "12px",

        boxSizing:
          "border-box",

        background:
          "rgba(8,12,15,.72)",

        backdropFilter:
          "blur(8px)",

        WebkitBackdropFilter:
          "blur(8px)",
      }}
    >
      <div
        onPointerDown={(
          event
        ) => {
          event.stopPropagation();
        }}

        style={{
          width:
            "min(900px,96vw)",

          maxHeight:
            "94vh",

          overflowY:
            "auto",

          borderRadius:
            "22px",

          background:
            "#f4f2ec",

          color:
            "#16191c",

          boxShadow:
            "0 28px 90px rgba(0,0,0,.55)",

          fontFamily:
            "system-ui,-apple-system,sans-serif",

          position:
            "relative",
        }}
      >
        {/* =================================================
            CABECERA VISUAL
        ================================================= */}

        <div
          style={{
            minHeight:
              "230px",

            padding:
              "26px",

            boxSizing:
              "border-box",

            background:
              `linear-gradient(135deg, ${game.accent}, ${game.accent2}, #111820)`,

            color:
              "#ffffff",

            position:
              "relative",

            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              position:
                "absolute",

              width:
                "230px",

              height:
                "230px",

              borderRadius:
                "50%",

              background:
                "rgba(255,255,255,.12)",

              right:
                "-45px",

              top:
                "-60px",
            }}
          />

          <button
            type="button"
            onClick={
              onClose
            }
            style={{
              position:
                "absolute",

              right:
                "14px",

              top:
                "14px",

              width:
                "42px",

              height:
                "42px",

              borderRadius:
                "50%",

              border:
                "1px solid rgba(255,255,255,.35)",

              background:
                "rgba(0,0,0,.28)",

              color:
                "#fff",

              fontSize:
                "24px",

              zIndex:
                3,
            }}
          >
            ×
          </button>

          <div
            style={{
              fontSize:
                "13px",

              fontWeight:
                800,

              letterSpacing:
                ".12em",

              opacity:
                0.88,
            }}
          >
            POPULARES HOY · #{game.rank}
          </div>

          <h1
            style={{
              margin:
                "48px 0 0",

              fontSize:
                "clamp(34px,7vw,68px)",

              lineHeight:
                0.96,

              maxWidth:
                "650px",
            }}
          >
            {game.title}
          </h1>

          <div
            style={{
              marginTop:
                "13px",

              opacity:
                0.82,

              fontWeight:
                600,
            }}
          >
            {game.subtitle}
          </div>
        </div>

        {/* =================================================
            CONTENIDO
        ================================================= */}

        <div
          style={{
            padding:
              "22px",
          }}
        >
          {/* PUNTUACIÓN */}

          <div
            style={{
              display:
                "flex",

              gap:
                "12px",

              flexWrap:
                "wrap",

              alignItems:
                "stretch",
            }}
          >
            <div
              style={{
                minWidth:
                  "95px",

                padding:
                  "15px",

                borderRadius:
                  "16px",

                background:
                  "#171c20",

                color:
                  "#fff",

                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  fontSize:
                    "11px",

                  opacity:
                    0.65,

                  textTransform:
                    "uppercase",
                }}
              >
                Freaky
              </div>

              <div
                style={{
                  fontSize:
                    "34px",

                  fontWeight:
                    900,

                  color:
                    game.accent,
                }}
              >
                {game.score}
              </div>
            </div>

            <div
              style={{
                flex:
                  1,

                minWidth:
                  "200px",

                padding:
                  "15px",

                borderRadius:
                  "16px",

                background:
                  "#e8e5dc",
              }}
            >
              <strong>
                {game.genre}
              </strong>

              <div
                style={{
                  marginTop:
                    "5px",

                  color:
                    "#596168",
                }}
              >
                {game.year} · {game.platform}
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize:
                "16px",

              lineHeight:
                1.6,

              color:
                "#4b5358",

              margin:
                "20px 0",
            }}
          >
            {game.description}
          </p>

          {/* =================================================
              PREVIEW TIPO VIDEO

              Todavía no cargamos iframe.
          ================================================= */}

          <div
            style={{
              position:
                "relative",

              width:
                "100%",

              aspectRatio:
                "16/9",

              borderRadius:
                "18px",

              overflow:
                "hidden",

              background:
                `linear-gradient(135deg, ${game.accent2}, #101820 65%)`,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",
            }}
          >
            <div
              style={{
                position:
                  "absolute",

                inset:
                  0,

                background:
                  `radial-gradient(circle at 70% 30%, ${game.accent}88, transparent 35%)`,
              }}
            />

            <div
              style={{
                position:
                  "relative",

                width:
                  "68px",

                height:
                  "68px",

                borderRadius:
                  "50%",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                background:
                  "rgba(255,255,255,.92)",

                color:
                  "#111",

                fontSize:
                  "28px",

                paddingLeft:
                  "5px",

                boxShadow:
                  "0 12px 40px rgba(0,0,0,.3)",
              }}
            >
              ▶
            </div>

            <div
              style={{
                position:
                  "absolute",

                left:
                  "18px",

                bottom:
                  "16px",

                color:
                  "#ffffff",

                fontWeight:
                  800,
              }}
            >
              Tráiler / vídeo destacado
            </div>
          </div>

          {/* BOTONES */}

          <div
            style={{
              display:
                "flex",

              gap:
                "9px",

              flexWrap:
                "wrap",

              marginTop:
                "20px",
            }}
          >
            <button
              type="button"
              style={{
                border:
                  0,

                padding:
                  "12px 17px",

                borderRadius:
                  "12px",

                background:
                  game.accent,

                color:
                  "#111",

                fontWeight:
                  900,
              }}
            >
              Ver ficha completa
            </button>

            <button
              type="button"
              style={{
                padding:
                  "12px 17px",

                borderRadius:
                  "12px",

                border:
                  "1px solid #ccd0d2",

                background:
                  "#ffffff",

                color:
                  "#202428",

                fontWeight:
                  700,
              }}
            >
              Calificar
            </button>

            <button
              type="button"
              onClick={
                onClose
              }
              style={{
                padding:
                  "12px 17px",

                borderRadius:
                  "12px",

                border:
                  "1px solid #ccd0d2",

                background:
                  "transparent",

                color:
                  "#30363a",
              }}
            >
              Volver al mundo
            </button>
          </div>
        </div>
      </div>
    </div>,

    document.body
  );
}

/* =========================================================
   SALA PRINCIPAL
========================================================= */

export default function PopularTodayHall() {
  const [
    selectedGame,
    setSelectedGame,
  ] =
    useState(null);

  /* =======================================================
     DISTRIBUCIÓN

     5 izquierda + 5 derecha.

     Ordenamos de 10 hacia 1 mientras avanzamos.
  ======================================================= */

  const stationLayout =
    useMemo(
      () => [
        {
          game:
            GAMES[9],
          position: [
            -10.5,
            0.32,
            14,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[8],
          position: [
            10.5,
            0.32,
            14,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[7],
          position: [
            -10.5,
            0.32,
            6,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[6],
          position: [
            10.5,
            0.32,
            6,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[5],
          position: [
            -10.5,
            0.32,
            -2,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[4],
          position: [
            10.5,
            0.32,
            -2,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[3],
          position: [
            -10.5,
            0.32,
            -10,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[2],
          position: [
            10.5,
            0.32,
            -10,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[1],
          position: [
            -10.5,
            0.32,
            -18,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[0],
          position: [
            10.5,
            0.32,
            -18,
          ],
          rotation:
            -Math.PI / 2,
        },
      ],
      []
    );

  /* =======================================================
     REVESTIMIENTOS
  ======================================================= */

  const interiorWalls =
    useMemo(
      () => [
        {
          position: [
            -ROOM_HALF_WIDTH,
            5.5,
            1,
          ],
          scale: [
            0.18,
            10.5,
            52,
          ],
        },

        {
          position: [
            ROOM_HALF_WIDTH,
            5.5,
            1,
          ],
          scale: [
            0.18,
            10.5,
            52,
          ],
        },

        {
          position: [
            0,
            5.5,
            ROOM_BACK_Z,
          ],
          scale: [
            37,
            10.5,
            0.18,
          ],
        },
      ],
      []
    );

  const centralPath =
    useMemo(
      () => [
        {
          position: [
            0,
            0.37,
            1,
          ],
          scale: [
            5.2,
            0.04,
            48,
          ],
        },
      ],
      []
    );

  const ceilingLights =
    useMemo(
      () => [
        {
          position: [
            -6.5,
            9.7,
            7,
          ],
          scale: [
            0.16,
            0.12,
            29,
          ],
        },

        {
          position: [
            6.5,
            9.7,
            7,
          ],
          scale: [
            0.16,
            0.12,
            29,
          ],
        },

        {
          position: [
            -6.5,
            9.7,
            -15,
          ],
          scale: [
            0.16,
            0.12,
            13,
          ],
        },

        {
          position: [
            6.5,
            9.7,
            -15,
          ],
          scale: [
            0.16,
            0.12,
            13,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          PAREDES CLARAS
      =================================================== */}

      <InstancedBoxes
        items={
          interiorWalls
        }
        color="#ece9e1"
        roughness={0.9}
      />

      {/* ===================================================
          PASILLO
      =================================================== */}

      <InstancedBoxes
        items={
          centralPath
        }
        color="#464d51"
        roughness={0.7}
      />

      {/* ===================================================
          PORTAL
      =================================================== */}

      <RoundedBox
        position={[
          -4.8,
          3,
          23,
        ]}
        args={[
          0.55,
          5.4,
          0.7,
        ]}
        radius={0.16}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#333a3e"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          4.8,
          3,
          23,
        ]}
        args={[
          0.55,
          5.4,
          0.7,
        ]}
        radius={0.16}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#333a3e"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          5.45,
          23,
        ]}
        args={[
          10.1,
          0.5,
          0.7,
        ]}
        radius={0.16}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#333a3e"
        />
      </RoundedBox>

      {/* ===================================================
          ILUMINACIÓN VISUAL
      =================================================== */}

      <InstancedBoxes
        items={
          ceilingLights
        }
        color="#ffffff"
        roughness={0.12}
        emissive="#ffffff"
        emissiveIntensity={1.3}
        receiveShadow={false}
      />

      {/* ===================================================
          ILUMINACIÓN REAL

          Más viva que antes.
      =================================================== */}

      <pointLight
        position={[
          0,
          8.5,
          15,
        ]}
        color="#fff4e5"
        intensity={38}
        distance={27}
        decay={2}
      />

      <pointLight
        position={[
          0,
          8.5,
          0,
        ]}
        color="#ffffff"
        intensity={42}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          0,
          8.5,
          -17,
        ]}
        color="#e7f3ff"
        intensity={38}
        distance={26}
        decay={2}
      />

      {/* ===================================================
          10 JUEGOS
      =================================================== */}

      {stationLayout.map(
        (
          station
        ) => (
          <GameStation
            key={
              station.game.rank
            }
            game={
              station.game
            }
            position={
              station.position
            }
            rotation={
              station.rotation
            }
            onOpen={(
              game
            ) => {
              playerInput.x = 0;
              playerInput.y = 0;

              setSelectedGame(
                game
              );
            }}
          />
        )
      )}

      {/* ===================================================
          FONDO
      =================================================== */}

      <RoundedBox
        position={[
          0,
          5.6,
          -24.8,
        ]}
        args={[
          12,
          6.8,
          0.2,
        ]}
        radius={0.3}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#26323a"
          emissive="#294859"
          emissiveIntensity={0.22}
        />
      </RoundedBox>

      {/* ===================================================
          COLISIONES
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {stationLayout.map(
          (
            station
          ) => (
            <CuboidCollider
              key={
                `collider-${station.game.rank}`
              }
              args={[
                1.45,
                0.28,
                0.72,
              ]}
              position={[
                station
                  .position[0],

                0.6,

                station
                  .position[2],
              ]}
              rotation={[
                0,
                station.rotation,
                0,
              ]}
            />
          )
        )}
      </RigidBody>

      {/* ===================================================
          FICHA 2D
      =================================================== */}

      {selectedGame && (
        <GameDetailOverlay
          game={
            selectedGame
          }
          onClose={() => {
            setSelectedGame(
              null
            );
          }}
        />
      )}
    </group>
  );
}
