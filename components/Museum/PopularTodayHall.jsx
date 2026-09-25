"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  RoundedBox,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import {
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
========================================================= */

const GAMES = [
  {
    id: "mock-neon-district",
    mock: true,
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
    id: "mock-echoes",
    mock: true,
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
    id: "mock-red-horizon",
    mock: true,
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
    id: "mock-void-runner",
    mock: true,
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
    id: "mock-last-signal",
    mock: true,
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
    id: "mock-iron-kingdom",
    mock: true,
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
    id: "mock-deep-blue",
    mock: true,
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
    id: "mock-black-sun",
    mock: true,
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
    id: "mock-dust-road",
    mock: true,
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
    id: "mock-lumina",
    mock: true,
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
   PORTADA PROCEDURAL
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
    0.52,
    game.accent2
  );

  gradient.addColorStop(
    1,
    "#080d12"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    512,
    768
  );

  ctx.globalAlpha = 0.18;

  ctx.fillStyle =
    "#ffffff";

  ctx.beginPath();

  ctx.arc(
    390,
    150,
    150,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 0.1;

  ctx.beginPath();

  ctx.arc(
    90,
    430,
    220,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 0.18;

  ctx.beginPath();

  ctx.moveTo(
    0,
    470
  );

  ctx.lineTo(
    512,
    270
  );

  ctx.lineTo(
    512,
    410
  );

  ctx.lineTo(
    0,
    610
  );

  ctx.closePath();

  ctx.fill();

  ctx.globalAlpha = 1;

  ctx.fillStyle =
    "rgba(0,0,0,.48)";

  ctx.beginPath();

  ctx.roundRect(
    28,
    28,
    86,
    52,
    16
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "800 27px Arial";

  ctx.fillText(
    `#${game.rank}`,
    46,
    63
  );

  ctx.font =
    "900 45px Arial";

  const words =
    game.title.split(
      " "
    );

  let line = "";
  let y = 590;

  words.forEach(
    (
      word
    ) => {
      const test =
        `${line}${word} `;

      if (
        ctx.measureText(
          test
        ).width >
          450 &&
        line
      ) {
        ctx.fillText(
          line.trim(),
          28,
          y
        );

        line =
          `${word} `;

        y += 50;
      } else {
        line =
          test;
      }
    }
  );

  ctx.fillText(
    line.trim(),
    28,
    y
  );

  ctx.font =
    "500 20px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,.75)";

  ctx.fillText(
    game.subtitle,
    30,
    720
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 4;

  return texture;
}

/* =========================================================
   INSTANCIAS
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  emissive = "#000000",
  emissiveIntensity = 0,
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
          ...(item.rotation ??
            [0, 0, 0])
        );

        dummy.scale.set(
          ...item.scale
        );

        dummy.updateMatrix();

        ref.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate = true;
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
   ESTACIÓN DE JUEGO
========================================================= */

function GameStation({
  game,
  position,
  rotation,
  scale = 1,
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

    const isNear =
      distance <
      4.4 * scale;

    if (
      isNear ===
      nearRef.current
    ) {
      return;
    }

    nearRef.current =
      isNear;

    setNear(
      isNear
    );

    window.dispatchEvent(
      new CustomEvent(
        "freaky:game-near",
        {
          detail:
            isNear
              ? {
                  near:
                    true,
                  game,
                }
              : {
                  near:
                    false,
                  game,
                },
        }
      )
    );
  });

  useEffect(() => {
    return () => {
      if (
        nearRef.current
      ) {
        window.dispatchEvent(
          new CustomEvent(
            "freaky:game-near",
            {
              detail: {
                near:
                  false,
                game,
              },
            }
          )
        );
      }
    };
  }, [
    game,
  ]);

  return (
    <group
      ref={ref}
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
      scale={[
        scale,
        scale,
        scale,
      ]}
    >
      {/* BASE */}

      <RoundedBox
        position={[
          0,
          0.3,
          0,
        ]}
        args={[
          3.3,
          0.45,
          1.6,
        ]}
        radius={0.15}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#343a3e"
          roughness={0.62}
        />
      </RoundedBox>

      {/* PEDESTAL */}

      <RoundedBox
        position={[
          0,
          1.3,
          0,
        ]}
        args={[
          1.9,
          1.65,
          0.35,
        ]}
        radius={0.13}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#555c60"
          roughness={0.6}
        />
      </RoundedBox>

      {/* MARCO */}

      <RoundedBox
        position={[
          0,
          4.15,
          0,
        ]}
        args={[
          3.05,
          4.85,
          0.24,
        ]}
        radius={0.2}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={
            near
              ? game.accent
              : "#252c31"
          }
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.38
              : 0.06
          }
          roughness={0.32}
        />
      </RoundedBox>

      {/* PORTADA */}

      <mesh
        position={[
          0,
          4.15,
          0.135,
        ]}
      >
        <planeGeometry
          args={[
            2.72,
            4.48,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* RESPLANDOR */}

      {near && (
        <pointLight
          position={[
            0,
            4,
            1.7,
          ]}
          color={
            game.accent
          }
          intensity={7}
          distance={6}
          decay={2}
        />
      )}
    </group>
  );
}

/* =========================================================
   ISLA CENTRAL
========================================================= */

function TrendIsland({
  position,
  title,
  subtitle,
  accent,
}) {
  return (
    <group
      position={position}
    >
      <RoundedBox
        position={[
          0,
          0.38,
          0,
        ]}
        args={[
          6.5,
          0.55,
          3.7,
        ]}
        radius={0.3}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#eef0eb"
          roughness={0.76}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          1.15,
          0,
        ]}
        args={[
          5.2,
          0.8,
          2.6,
        ]}
        radius={0.24}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#2e3539"
          emissive={accent}
          emissiveIntensity={0.08}
          roughness={0.56}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          1.62,
          0,
        ]}
        args={[
          4.2,
          0.08,
          2,
        ]}
        radius={0.04}
        smoothness={2}
      >
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.8}
        />
      </RoundedBox>

      {/* placas */}

      <mesh
        position={[
          -1.5,
          2.1,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.6,
            0.12,
            1.8,
          ]}
        />

        <meshStandardMaterial
          color="#ffffff"
          emissive={accent}
          emissiveIntensity={0.12}
        />
      </mesh>

      <mesh
        position={[
          0,
          2.1,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.6,
            0.12,
            1.8,
          ]}
        />

        <meshStandardMaterial
          color="#ffffff"
          emissive={accent}
          emissiveIntensity={0.12}
        />
      </mesh>

      <mesh
        position={[
          1.5,
          2.1,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.6,
            0.12,
            1.8,
          ]}
        />

        <meshStandardMaterial
          color="#ffffff"
          emissive={accent}
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   HERO TOP 1
========================================================= */

function HeroWall({
  game,
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

    const isNear =
      distance < 6;

    if (
      isNear ===
      nearRef.current
    ) {
      return;
    }

    nearRef.current =
      isNear;

    setNear(
      isNear
    );

    window.dispatchEvent(
      new CustomEvent(
        "freaky:game-near",
        {
          detail:
            isNear
              ? {
                  near:
                    true,
                  game,
                }
              : {
                  near:
                    false,
                  game,
                },
        }
      )
    );
  });

  return (
    <group
      ref={ref}
      position={[
        0,
        0,
        -23.8,
      ]}
    >
      {/* GRAN PANEL */}

      <RoundedBox
        position={[
          0,
          5.9,
          0,
        ]}
        args={[
          15,
          9,
          0.35,
        ]}
        radius={0.4}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={
            near
              ? "#273944"
              : "#1b252b"
          }
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.24
              : 0.08
          }
          roughness={0.42}
        />
      </RoundedBox>

      {/* PORTADA GIGANTE */}

      <mesh
        position={[
          -3.8,
          5.9,
          0.19,
        ]}
      >
        <planeGeometry
          args={[
            5,
            7.5,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* BLOQUE VISUAL DERECHO */}

      <RoundedBox
        position={[
          3.5,
          6.1,
          0.2,
        ]}
        args={[
          5.2,
          5.5,
          0.14,
        ]}
        radius={0.3}
        smoothness={4}
      >
        <meshStandardMaterial
          color={game.accent2}
          emissive={game.accent}
          emissiveIntensity={0.18}
          roughness={0.4}
        />
      </RoundedBox>

      {/* LÍNEA INFERIOR */}

      <RoundedBox
        position={[
          0,
          1.15,
          0.2,
        ]}
        args={[
          11,
          0.15,
          0.14,
        ]}
        radius={0.05}
        smoothness={2}
      >
        <meshStandardMaterial
          color={game.accent}
          emissive={game.accent}
          emissiveIntensity={1}
        />
      </RoundedBox>
    </group>
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  /* =======================================================
     DISTRIBUCIÓN

     Más libre y menos simétrica.
  ======================================================= */

  const stationLayout =
    useMemo(
      () => [
        {
          game:
            GAMES[9],

          position: [
            -12,
            0.32,
            15,
          ],

          rotation:
            Math.PI / 2,

          scale:
            1.05,
        },

        {
          game:
            GAMES[8],

          position: [
            12,
            0.32,
            12,
          ],

          rotation:
            -Math.PI / 2,

          scale:
            1.05,
        },

        {
          game:
            GAMES[7],

          position: [
            -11.5,
            0.32,
            4,
          ],

          rotation:
            Math.PI / 2,

          scale:
            1.1,
        },

        {
          game:
            GAMES[6],

          position: [
            12,
            0.32,
            0,
          ],

          rotation:
            -Math.PI / 2,

          scale:
            1.1,
        },

        {
          game:
            GAMES[5],

          position: [
            -11.5,
            0.32,
            -8,
          ],

          rotation:
            Math.PI / 2,

          scale:
            1.1,
        },

        {
          game:
            GAMES[4],

          position: [
            11.5,
            0.32,
            -9,
          ],

          rotation:
            -Math.PI / 2,

          scale:
            1.15,
        },

        {
          game:
            GAMES[3],

          position: [
            -10.5,
            0.32,
            -17,
          ],

          rotation:
            Math.PI / 2,

          scale:
            1.15,
        },

        {
          game:
            GAMES[2],

          position: [
            10.5,
            0.32,
            -17,
          ],

          rotation:
            -Math.PI / 2,

          scale:
            1.2,
        },

        {
          game:
            GAMES[1],

          position: [
            -2.5,
            0.32,
            -17,
          ],

          rotation:
            0,

          scale:
            1.2,
        },
      ],
      []
    );

  const interiorWalls =
    useMemo(
      () => [
        {
          position: [
            -ROOM_HALF_WIDTH,
            5.7,
            1,
          ],
          scale: [
            0.18,
            11,
            52,
          ],
        },

        {
          position: [
            ROOM_HALF_WIDTH,
            5.7,
            1,
          ],
          scale: [
            0.18,
            11,
            52,
          ],
        },

        {
          position: [
            0,
            5.7,
            ROOM_BACK_Z,
          ],
          scale: [
            37,
            11,
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
            3,
          ],
          scale: [
            6,
            0.04,
            44,
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
            -7.5,
            10.2,
            10,
          ],
          scale: [
            0.18,
            0.12,
            26,
          ],
        },

        {
          position: [
            7.5,
            10.2,
            10,
          ],
          scale: [
            0.18,
            0.12,
            26,
          ],
        },

        {
          position: [
            -7.5,
            10.2,
            -13,
          ],
          scale: [
            0.18,
            0.12,
            14,
          ],
        },

        {
          position: [
            7.5,
            10.2,
            -13,
          ],
          scale: [
            0.18,
            0.12,
            14,
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
        color="#f1efe8"
        roughness={0.9}
      />

      {/* ===================================================
          PASILLO CENTRAL
      =================================================== */}

      <InstancedBoxes
        items={
          centralPath
        }
        color="#5b6266"
        roughness={0.7}
      />

      {/* ===================================================
          PORTAL
      =================================================== */}

      <RoundedBox
        position={[
          -5.2,
          3.2,
          23,
        ]}
        args={[
          0.6,
          5.8,
          0.75,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#40474b"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          5.2,
          3.2,
          23,
        ]}
        args={[
          0.6,
          5.8,
          0.75,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#40474b"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          5.85,
          23,
        ]}
        args={[
          10.8,
          0.55,
          0.75,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#40474b"
        />
      </RoundedBox>

      {/* ===================================================
          ISLA 1
      =================================================== */}

      <TrendIsland
        position={[
          0,
          0,
          9,
        ]}
        title="SUBEN HOY"
        subtitle="Tendencias"
        accent="#69c9ff"
      />

      {/* ===================================================
          ISLA 2
      =================================================== */}

      <TrendIsland
        position={[
          0,
          0,
          -5,
        ]}
        title="COMUNIDAD"
        subtitle="Comentarios"
        accent="#ff8f67"
      />

      {/* ===================================================
          LUMINARIAS
      =================================================== */}

      <InstancedBoxes
        items={
          ceilingLights
        }
        color="#ffffff"
        roughness={0.12}
        emissive="#ffffff"
        emissiveIntensity={1.5}
        receiveShadow={false}
      />

      {/* ===================================================
          ILUMINACIÓN
      =================================================== */}

      <pointLight
        position={[
          0,
          9,
          15,
        ]}
        color="#fff5e7"
        intensity={46}
        distance={30}
        decay={2}
      />

      <pointLight
        position={[
          0,
          9,
          2,
        ]}
        color="#ffffff"
        intensity={50}
        distance={30}
        decay={2}
      />

      <pointLight
        position={[
          0,
          9,
          -13,
        ]}
        color="#e8f4ff"
        intensity={46}
        distance={28}
        decay={2}
      />

      {/* ===================================================
          ESTACIONES
      =================================================== */}

      {stationLayout.map(
        (
          station
        ) => (
          <GameStation
            key={
              station.game.id
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
            scale={
              station.scale
            }
          />
        )
      )}

      {/* ===================================================
          TOP 1 HERO
      =================================================== */}

      <HeroWall
        game={
          GAMES[0]
        }
      />

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
                station.game.id
              }
              args={[
                1.7 *
                  station.scale,

                0.35,

                0.85 *
                  station.scale,
              ]}
              position={[
                station
                  .position[0],

                0.75,

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

        {/* isla 1 */}

        <CuboidCollider
          args={[
            3.25,
            0.5,
            1.85,
          ]}
          position={[
            0,
            0.8,
            9,
          ]}
        />

        {/* isla 2 */}

        <CuboidCollider
          args={[
            3.25,
            0.5,
            1.85,
          ]}
          position={[
            0,
            0.8,
            -5,
          ]}
        />
      </RigidBody>
    </group>
  );
}
