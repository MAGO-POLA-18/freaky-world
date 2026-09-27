"use client";

import FeaturedVideoWall from "./FeaturedVideoWall";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import {
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   CONFIG
========================================================= */

const ROOM_HALF_WIDTH = 29.25;
const ROOM_BACK_Z = -34.25;

/* =========================================================
   JUEGOS
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
    accent: "#ff4f95",
    accent2: "#7d44ff",
    description:
      "Una enorme ciudad nocturna donde cada distrito cambia según tus decisiones.",
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
    accent: "#5ab8ff",
    accent2: "#275c9b",
    description:
      "Exploración narrativa en un archipiélago abandonado.",
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
    accent: "#ff7b34",
    accent2: "#b83a2d",
    description:
      "Una colonia marciana dividida entre corporaciones y exploradores.",
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
    accent: "#3ee8c2",
    accent2: "#16647c",
    description:
      "Combate rápido y estaciones orbitales.",
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
    accent: "#ca8dff",
    accent2: "#5a3b88",
    description:
      "Una señal conduce a una estación científica abandonada.",
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
      "Reinos mecánicos y fortalezas móviles.",
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
      "Exploración submarina en un océano alienígena.",
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
      "Civilizaciones alrededor de una estrella que se apaga.",
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
      "Vehículos modificables y carreteras infinitas.",
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
      "Mundos conectados mediante portales de luz.",
  },
];

/* =========================================================
   POSTER DE JUEGO
========================================================= */

function createPosterTexture(game) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 768;

  const ctx =
    canvas.getContext("2d");

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
    0.55,
    game.accent2
  );

  gradient.addColorStop(
    1,
    "#05070a"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    512,
    768
  );

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#fff";

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
    100,
    420,
    200,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 1;

  ctx.fillStyle =
    "rgba(0,0,0,.5)";

  ctx.fillRect(
    28,
    28,
    90,
    54
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 28px Arial";

  ctx.fillText(
    `#${game.rank}`,
    47,
    65
  );

  ctx.font = "900 44px Arial";

  const words =
    game.title.split(" ");

  let line = "";
  let y = 590;

  words.forEach((word) => {
    const next =
      `${line}${word} `;

    if (
      ctx.measureText(next).width >
        450 &&
      line
    ) {
      ctx.fillText(
        line.trim(),
        28,
        y
      );

      line = `${word} `;
      y += 50;
    } else {
      line = next;
    }
  });

  ctx.fillText(
    line.trim(),
    28,
    y
  );

  ctx.font = "500 20px Arial";

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

  return texture;
}

/* =========================================================
   TEXTO NEÓN
========================================================= */

function createNeonTextTexture(
  text,
  color
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 256;

  const ctx =
    canvas.getContext("2d");

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 108px Arial";

  ctx.shadowColor = color;
  ctx.shadowBlur = 35;
  ctx.fillStyle = color;

  ctx.fillText(
    text,
    512,
    128
  );

  ctx.shadowBlur = 10;
  ctx.fillStyle = "#fff";

  ctx.fillText(
    text,
    512,
    128
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

/* =========================================================
   ICONOS ARCADE
========================================================= */

function createArcadeTexture(type) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const ctx =
    canvas.getContext("2d");

  if (type === "chomper") {
    ctx.shadowColor = "#ffe44f";
    ctx.shadowBlur = 35;
    ctx.fillStyle = "#ffe44f";

    ctx.beginPath();

    ctx.moveTo(
      256,
      256
    );

    ctx.arc(
      256,
      256,
      155,
      Math.PI * 0.22,
      Math.PI * 1.78
    );

    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#11151a";

    ctx.beginPath();

    ctx.arc(
      270,
      170,
      14,
      0,
      Math.PI * 2
    );

    ctx.fill();
  } else {
    const pixel = 34;

    const pattern = [
      "00100100",
      "00011000",
      "01111110",
      "11011011",
      "11111111",
      "10111101",
      "10100101",
      "01000010",
    ];

    ctx.shadowColor = "#7cf4ff";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#7cf4ff";

    const startX =
      (
        512 -
        pattern[0].length *
          pixel
      ) / 2;

    const startY = 120;

    pattern.forEach(
      (row, rowIndex) => {
        row
          .split("")
          .forEach(
            (
              value,
              colIndex
            ) => {
              if (
                value === "1"
              ) {
                ctx.fillRect(
                  startX +
                    colIndex *
                      pixel,
                  startY +
                    rowIndex *
                      pixel,
                  pixel,
                  pixel
                );
              }
            }
          );
      }
    );
  }

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

/* =========================================================
   INSTANCED BOXES
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  emissive = "#000",
  emissiveIntensity = 0,
}) {
  const ref = useRef(null);

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
      (item, index) => {
        dummy.position.set(
          ...item.position
        );

        dummy.rotation.set(
          ...(
            item.rotation ?? [
              0,
              0,
              0,
            ]
          )
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

    ref.current.instanceMatrix
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
      receiveShadow
    >
      <boxGeometry />

      <meshStandardMaterial
        color={color}
        roughness={roughness}
        emissive={emissive}
        emissiveIntensity={
          emissiveIntensity
        }
      />
    </instancedMesh>
  );
}
/* =========================================================
   LÍNEA NEÓN
========================================================= */

function NeonLine({
  position,
  rotation = [
    0,
    0,
    0,
  ],
  size = [
    6,
    0.08,
    0.08,
  ],
  color = "#58f1ff",
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <boxGeometry
        args={size}
      />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.4}
      />
    </mesh>
  );
}

/* =========================================================
   PALABRA NEÓN
========================================================= */

function NeonWord({
  text,
  color,
  position,
  rotation = [
    0,
    0,
    0,
  ],
  width = 8,
  height = 2,
}) {
  const texture =
    useMemo(
      () =>
        createNeonTextTexture(
          text,
          color
        ),
      [
        text,
        color,
      ]
    );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <planeGeometry
        args={[
          width,
          height,
        ]}
      />

      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* =========================================================
   ICONO ARCADE
========================================================= */

function ArcadeIcon({
  type,
  position,
  rotation,
  size = 5,
}) {
  const texture =
    useMemo(
      () =>
        createArcadeTexture(
          type
        ),
      [type]
    );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <planeGeometry
        args={[
          size,
          size,
        ]}
      />

      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
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
  const ref = useRef(null);

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
  ] = useState(false);

  const poster =
    useMemo(
      () =>
        createPosterTexture(
          game
        ),
      [game]
    );

  useEffect(() => {
    return () => {
      poster.dispose();
    };
  }, [poster]);

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
      playerRuntime.body
        .translation();

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
      4.8 * scale;

    if (
      isNear ===
      nearRef.current
    ) {
      return;
    }

    nearRef.current =
      isNear;

    setNear(isNear);

    window.dispatchEvent(
      new CustomEvent(
        "freaky:game-near",
        {
          detail: isNear
            ? {
                near: true,
                game,
              }
            : {
                near: false,
                game,
              },
        }
      )
    );
  });

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
      <RoundedBox
        position={[
          0,
          0.28,
          0,
        ]}
        args={[
          3.8,
          0.45,
          1.45,
        ]}
        radius={0.15}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#151a20"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          1.2,
          0,
        ]}
        args={[
          1.05,
          1.55,
          0.34,
        ]}
        radius={0.12}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#303942"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          4.65,
          0,
        ]}
        args={[
          3.8,
          6.1,
          0.25,
        ]}
        radius={0.22}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#101419"
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.38
              : 0.09
          }
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          4.65,
          0.14,
        ]}
      >
        <planeGeometry
          args={[
            3.4,
            5.6,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  const stations = useMemo(
    () => [
      {
        game: GAMES[0],
        position: [-21.5, 0, -23],
        rotation: Math.PI / 2,
      },
      {
        game: GAMES[1],
        position: [-21.5, 0, -14],
        rotation: Math.PI / 2,
      },
      {
        game: GAMES[2],
        position: [-21.5, 0, -5],
        rotation: Math.PI / 2,
      },
      {
        game: GAMES[3],
        position: [-21.5, 0, 4],
        rotation: Math.PI / 2,
      },
      {
        game: GAMES[4],
        position: [-21.5, 0, 13],
        rotation: Math.PI / 2,
      },

      {
        game: GAMES[5],
        position: [21.5, 0, 13],
        rotation: -Math.PI / 2,
      },
      {
        game: GAMES[6],
        position: [21.5, 0, 4],
        rotation: -Math.PI / 2,
      },
      {
        game: GAMES[7],
        position: [21.5, 0, -5],
        rotation: -Math.PI / 2,
      },
      {
        game: GAMES[8],
        position: [21.5, 0, -14],
        rotation: -Math.PI / 2,
      },
      {
        game: GAMES[9],
        position: [21.5, 0, -23],
        rotation: -Math.PI / 2,
      },
    ],
    []
  );

  /* =======================================================
     ESTRUCTURAS DEL TECHO
  ======================================================= */

  const ceilingBars = useMemo(
    () => [
      {
        position: [-18, 12.4, -23],
        scale: [5, 0.12, 0.12],
      },
      {
        position: [18, 12.4, -23],
        scale: [5, 0.12, 0.12],
      },

      {
        position: [-18, 12.4, -14],
        scale: [5, 0.12, 0.12],
      },
      {
        position: [18, 12.4, -14],
        scale: [5, 0.12, 0.12],
      },

      {
        position: [-18, 12.4, -5],
        scale: [5, 0.12, 0.12],
      },
      {
        position: [18, 12.4, -5],
        scale: [5, 0.12, 0.12],
      },

      {
        position: [-18, 12.4, 4],
        scale: [5, 0.12, 0.12],
      },
      {
        position: [18, 12.4, 4],
        scale: [5, 0.12, 0.12],
      },

      {
        position: [-18, 12.4, 13],
        scale: [5, 0.12, 0.12],
      },
      {
        position: [18, 12.4, 13],
        scale: [5, 0.12, 0.12],
      },
    ],
    []
  );

  /* =======================================================
     COLUMNAS / MARCOS LATERALES
  ======================================================= */

  const sideStructures = useMemo(
    () => [
      {
        position: [-27.6, 5.5, -27],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [-27.6, 5.5, -18],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [-27.6, 5.5, -9],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [-27.6, 5.5, 0],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [-27.6, 5.5, 9],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [-27.6, 5.5, 18],
        scale: [0.18, 5.5, 0.18],
      },

      {
        position: [27.6, 5.5, -27],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [27.6, 5.5, -18],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [27.6, 5.5, -9],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [27.6, 5.5, 0],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [27.6, 5.5, 9],
        scale: [0.18, 5.5, 0.18],
      },
      {
        position: [27.6, 5.5, 18],
        scale: [0.18, 5.5, 0.18],
      },
    ],
    []
  );

  return (
    <group>
      {/* ===================================================
          SUELO BASE
      =================================================== */}

      <mesh
        position={[0, -0.08, -5]}
        receiveShadow
      >
        <boxGeometry
          args={[
            ROOM_HALF_WIDTH * 2,
            0.16,
            59,
          ]}
        />

        <meshStandardMaterial
          color="#090c10"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* ===================================================
          CAMINO CENTRAL
      =================================================== */}

      <mesh
        position={[0, 0.015, -4]}
      >
        <boxGeometry
          args={[9.5, 0.025, 54]}
        />

        <meshStandardMaterial
          color="#11171d"
          roughness={0.7}
        />
      </mesh>

      {/* bordes del camino */}

      <NeonLine
        position={[
          -4.9,
          0.045,
          -4,
        ]}
        size={[
          0.06,
          0.025,
          54,
        ]}
        color="#31d9ff"
      />

      <NeonLine
        position={[
          4.9,
          0.045,
          -4,
        ]}
        size={[
          0.06,
          0.025,
          54,
        ]}
        color="#31d9ff"
      />

      {/* cortes transversales del recorrido */}

      {[-24, -15, -6, 3, 12, 21].map(
        (z) => (
          <group
            key={`floor-${z}`}
          >
            <NeonLine
              position={[
                -3.8,
                0.05,
                z,
              ]}
              size={[
                2.2,
                0.025,
                0.055,
              ]}
              color="#ff3ea5"
            />

            <NeonLine
              position={[
                3.8,
                0.05,
                z,
              ]}
              size={[
                2.2,
                0.025,
                0.055,
              ]}
              color="#755cff"
            />
          </group>
        )
      )}

      {/* ===================================================
          CABECERA POPULARES HOY
      =================================================== */}

      <NeonWord
        text="POPULARES HOY"
        color="#58f1ff"
        position={[
          0,
          10.5,
          ROOM_BACK_Z + 0.28,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
        width={17}
        height={4.2}
      />

      <NeonLine
        position={[
          0,
          8.6,
          ROOM_BACK_Z + 0.31,
        ]}
        size={[
          15,
          0.07,
          0.06,
        ]}
        color="#ff3ea5"
      />

      {/* ===================================================
          PANTALLA PRINCIPAL
      =================================================== */}

      <FeaturedVideoWall
        position={[
          0,
          5.2,
          ROOM_BACK_Z + 0.55,
        ]}
      />

      {/* ===================================================
          ICONOS ARCADE EN PARED TRASERA
      =================================================== */}

      <ArcadeIcon
        type="chomper"
        position={[
          -20.5,
          9.2,
          ROOM_BACK_Z + 0.34,
        ]}
        rotation={[0, 0, 0]}
        size={5.5}
      />

      <ArcadeIcon
        type="invader"
        position={[
          20.5,
          9.2,
          ROOM_BACK_Z + 0.34,
        ]}
        rotation={[0, 0, 0]}
        size={5.5}
      />

      {/* ===================================================
          TOP 10 - INDICADOR CENTRAL
      =================================================== */}

      <group
        position={[
          0,
          0,
          14.5,
        ]}
      >
        <RoundedBox
          position={[
            0,
            0.18,
            0,
          ]}
          args={[
            7.5,
            0.32,
            3.4,
          ]}
          radius={0.2}
          smoothness={3}
        >
          <meshStandardMaterial
            color="#11161b"
            roughness={0.5}
            metalness={0.25}
          />
        </RoundedBox>

        <NeonLine
          position={[
            0,
            0.37,
            -1.25,
          ]}
          size={[
            5.7,
            0.04,
            0.05,
          ]}
          color="#58f1ff"
        />

        <NeonLine
          position={[
            0,
            0.37,
            1.25,
          ]}
          size={[
            5.7,
            0.04,
            0.05,
          ]}
          color="#ff3ea5"
        />

        <NeonWord
          text="TOP 10"
          color="#ffffff"
          position={[
            0,
            0.39,
            0,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          width={5.5}
          height={1.5}
        />
      </group>

      {/* ===================================================
          EXPOSITOR CENTRAL 1
      =================================================== */}

      <group
        position={[
          -7.5,
          0,
          -7,
        ]}
      >
        <RoundedBox
          position={[
            0,
            0.45,
            0,
          ]}
          args={[
            2.7,
            0.9,
            2.7,
          ]}
          radius={0.25}
          smoothness={3}
        >
          <meshStandardMaterial
            color="#11161c"
            roughness={0.45}
            metalness={0.35}
          />
        </RoundedBox>

        <mesh
          position={[
            0,
            2.1,
            0,
          ]}
          rotation={[
            0,
            Math.PI / 4,
            0,
          ]}
        >
          <octahedronGeometry
            args={[0.8, 0]}
          />

          <meshStandardMaterial
            color="#58f1ff"
            emissive="#58f1ff"
            emissiveIntensity={1.3}
            roughness={0.3}
          />
        </mesh>

        <NeonLine
          position={[
            0,
            1.05,
            0,
          ]}
          size={[
            0.055,
            1.5,
            0.055,
          ]}
          color="#58f1ff"
        />
      </group>

      {/* ===================================================
          EXPOSITOR CENTRAL 2
      =================================================== */}

      <group
        position={[
          7.5,
          0,
          -7,
        ]}
      >
        <RoundedBox
          position={[
            0,
            0.45,
            0,
          ]}
          args={[
            2.7,
            0.9,
            2.7,
          ]}
          radius={0.25}
          smoothness={3}
        >
          <meshStandardMaterial
            color="#11161c"
            roughness={0.45}
            metalness={0.35}
          />
        </RoundedBox>

        <mesh
          position={[
            0,
            2.1,
            0,
          ]}
          rotation={[
            Math.PI / 4,
            0,
            Math.PI / 4,
          ]}
        >
          <icosahedronGeometry
            args={[0.8, 0]}
          />

          <meshStandardMaterial
            color="#ff3ea5"
            emissive="#ff3ea5"
            emissiveIntensity={1.3}
            roughness={0.3}
          />
        </mesh>

        <NeonLine
          position={[
            0,
            1.05,
            0,
          ]}
          size={[
            0.055,
            1.5,
            0.055,
          ]}
          color="#ff3ea5"
        />
      </group>

      {/* ===================================================
          ESTRUCTURAS DEL TECHO
      =================================================== */}

      <InstancedBoxes
        items={ceilingBars}
        color="#171d23"
        roughness={0.45}
        emissive="#25313b"
        emissiveIntensity={0.25}
      />

      {/* líneas luminosas techo izquierda */}

      <NeonLine
        position={[
          -18,
          12.28,
          -5,
        ]}
        size={[
          0.09,
          0.08,
          45,
        ]}
        color="#58f1ff"
      />

      {/* líneas luminosas techo derecha */}

      <NeonLine
        position={[
          18,
          12.28,
          -5,
        ]}
        size={[
          0.09,
          0.08,
          45,
        ]}
        color="#ff3ea5"
      />

      {/* ===================================================
          ESTRUCTURA DE PAREDES
      =================================================== */}

      <InstancedBoxes
        items={sideStructures}
        color="#1b2229"
        roughness={0.6}
        emissive="#26333d"
        emissiveIntensity={0.18}
      />

      {/* ===================================================
          LÍNEAS LATERALES
      =================================================== */}

      <NeonLine
        position={[
          -27.4,
          9.5,
          -5,
        ]}
        size={[
          0.07,
          0.07,
          49,
        ]}
        color="#58f1ff"
      />

      <NeonLine
        position={[
          27.4,
          9.5,
          -5,
        ]}
        size={[
          0.07,
          0.07,
          49,
        ]}
        color="#ff3ea5"
      />

      {/* ===================================================
          ESTACIONES TOP 10
      =================================================== */}

      {stations.map(
        ({
          game,
          position,
          rotation,
        }) => (
          <GameStation
            key={game.id}
            game={game}
            position={position}
            rotation={rotation}
          />
        )
      )}

      {/* ===================================================
          COLISIONES EXPOSITORES CENTRALES
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            1.5,
            1.4,
            1.5,
          ]}
          position={[
            -7.5,
            1.4,
            -7,
          ]}
        />

        <CuboidCollider
          args={[
            1.5,
            1.4,
            1.5,
          ]}
          position={[
            7.5,
            1.4,
            -7,
          ]}
        />
      </RigidBody>
    </group>
  );
}
