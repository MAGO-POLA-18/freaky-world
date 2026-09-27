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
   INSTANCED BOXES
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  emissive = "#000000",
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

    ref.current.instanceMatrix.needsUpdate =
      true;
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
    >
      <boxGeometry />

      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={
          emissiveIntensity
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   LÍNEA LUMINOSA
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
  intensity = 1.25,
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
        emissiveIntensity={
          intensity
        }
        toneMapped={false}
      />
    </mesh>
  );
}

/* =========================================================
   PALABRA / CARTEL
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
   MÓDULO ARQUITECTÓNICO PARA CADA FICHA
========================================================= */

function StationArchitecture({
  position,
  rotation,
  accent,
}) {
  return (
    <group
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >
      {/* panel profundo de pared */}
      <RoundedBox
        position={[
          0,
          5.1,
          -0.7,
        ]}
        args={[
          6.8,
          10.8,
          0.65,
        ]}
        radius={0.18}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#11161c"
          roughness={0.72}
          metalness={0.12}
        />
      </RoundedBox>

      {/* panel interior */}
      <RoundedBox
        position={[
          0,
          5.1,
          -0.34,
        ]}
        args={[
          5.9,
          9.8,
          0.12,
        ]}
        radius={0.12}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#080b0f"
          roughness={0.55}
          metalness={0.22}
        />
      </RoundedBox>

      {/* luz vertical exterior izquierda */}
      <NeonLine
        position={[
          -3.12,
          5.15,
          0.03,
        ]}
        size={[
          0.055,
          8.7,
          0.06,
        ]}
        color={accent}
        intensity={0.75}
      />

      {/* luz vertical exterior derecha */}
      <NeonLine
        position={[
          3.12,
          5.15,
          0.03,
        ]}
        size={[
          0.055,
          8.7,
          0.06,
        ]}
        color={accent}
        intensity={0.75}
      />

      {/* remate superior */}
      <mesh
        position={[
          0,
          10.18,
          -0.28,
        ]}
      >
        <boxGeometry
          args={[
            6.3,
            0.32,
            0.5,
          ]}
        />

        <meshStandardMaterial
          color="#222a32"
          roughness={0.42}
          metalness={0.3}
        />
      </mesh>

      {/* zócalo inferior */}
      <mesh
        position={[
          0,
          0.34,
          -0.15,
        ]}
      >
        <boxGeometry
          args={[
            6.2,
            0.55,
            1.05,
          ]}
        />

        <meshStandardMaterial
          color="#171d23"
          roughness={0.58}
          metalness={0.22}
        />
      </mesh>
    </group>
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
      {/* base */}
      <RoundedBox
        position={[
          0,
          0.25,
          0,
        ]}
        args={[
          3.9,
          0.42,
          1.25,
        ]}
        radius={0.13}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#11161b"
          roughness={0.5}
          metalness={0.3}
        />
      </RoundedBox>

      {/* soporte */}
      <RoundedBox
        position={[
          0,
          1.08,
          0,
        ]}
        args={[
          0.9,
          1.35,
          0.3,
        ]}
        radius={0.1}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#303942"
          roughness={0.42}
          metalness={0.3}
        />
      </RoundedBox>

      {/* marco exterior */}
      <RoundedBox
        position={[
          0,
          4.55,
          0,
        ]}
        args={[
          4.15,
          6.35,
          0.28,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#0c1015"
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.34
              : 0.055
          }
          roughness={0.38}
          metalness={0.28}
        />
      </RoundedBox>

      {/* pantalla / portada */}
      <mesh
        position={[
          0,
          4.55,
          0.155,
        ]}
      >
        <planeGeometry
          args={[
            3.72,
            5.82,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* pequeña luz inferior */}
      <NeonLine
        position={[
          0,
          1.82,
          0.22,
        ]}
        size={[
          2.6,
          0.045,
          0.045,
        ]}
        color={
          game.accent
        }
        intensity={
          near
            ? 1.8
            : 0.75
        }
      />
    </group>
  );
}

/* =========================================================
   ESCENARIO DEL VIDEO
========================================================= */

function VideoStage() {
  return (
    <group>
      {/* fondo arquitectónico */}
      <RoundedBox
        position={[
          0,
          6.25,
          ROOM_BACK_Z +
            0.05,
        ]}
        args={[
          31,
          13,
          0.75,
        ]}
        radius={0.28}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#0b0f14"
          roughness={0.6}
          metalness={0.18}
        />
      </RoundedBox>

      {/* marco exterior */}
      <mesh
        position={[
          0,
          6.2,
          ROOM_BACK_Z +
            0.5,
        ]}
      >
        <boxGeometry
          args={[
            24.7,
            9.8,
            0.32,
          ]}
        />

        <meshStandardMaterial
          color="#202832"
          roughness={0.38}
          metalness={0.35}
        />
      </mesh>

      {/* hueco oscuro detrás del reproductor */}
      <mesh
        position={[
          0,
          6.2,
          ROOM_BACK_Z +
            0.69,
        ]}
      >
        <planeGeometry
          args={[
            23.8,
            8.9,
          ]}
        />

        <meshStandardMaterial
          color="#020304"
          roughness={0.8}
        />
      </mesh>

      {/* iluminación arquitectónica */}
      <NeonLine
        position={[
          0,
          11.15,
          ROOM_BACK_Z +
            0.72,
        ]}
        size={[
          22.8,
          0.06,
          0.06,
        ]}
        color="#58f1ff"
        intensity={0.8}
      />

      <NeonLine
        position={[
          -12.55,
          6.2,
          ROOM_BACK_Z +
            0.72,
        ]}
        size={[
          0.06,
          9.7,
          0.06,
        ]}
        color="#58f1ff"
        intensity={0.55}
      />

      <NeonLine
        position={[
          12.55,
          6.2,
          ROOM_BACK_Z +
            0.72,
        ]}
        size={[
          0.06,
          9.7,
          0.06,
        ]}
        color="#58f1ff"
        intensity={0.55}
      />

      {/* plataforma baja */}
      <RoundedBox
        position={[
          0,
          0.28,
          ROOM_BACK_Z +
            3.1,
        ]}
        args={[
          27,
          0.5,
          5.8,
        ]}
        radius={0.18}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#12181e"
          roughness={0.55}
          metalness={0.22}
        />
      </RoundedBox>

      <FeaturedVideoWall
        position={[
          0,
          5.2,
          ROOM_BACK_Z +
            0.9,
        ]}
      />
    </group>
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  const stations =
    useMemo(
      () => [
        {
          game: GAMES[0],
          position: [
            -22.4,
            0,
            -24,
          ],
          rotation:
            Math.PI / 2,
        },
        {
          game: GAMES[1],
          position: [
            -22.4,
            0,
            -14.5,
          ],
          rotation:
            Math.PI / 2,
        },
        {
          game: GAMES[2],
          position: [
            -22.4,
            0,
            -5,
          ],
          rotation:
            Math.PI / 2,
        },
        {
          game: GAMES[3],
          position: [
            -22.4,
            0,
            4.5,
          ],
          rotation:
            Math.PI / 2,
        },
        {
          game: GAMES[4],
          position: [
            -22.4,
            0,
            14,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          game: GAMES[5],
          position: [
            22.4,
            0,
            14,
          ],
          rotation:
            -Math.PI / 2,
        },
        {
          game: GAMES[6],
          position: [
            22.4,
            0,
            4.5,
          ],
          rotation:
            -Math.PI / 2,
        },
        {
          game: GAMES[7],
          position: [
            22.4,
            0,
            -5,
          ],
          rotation:
            -Math.PI / 2,
        },
        {
          game: GAMES[8],
          position: [
            22.4,
            0,
            -14.5,
          ],
          rotation:
            -Math.PI / 2,
        },
        {
          game: GAMES[9],
          position: [
            22.4,
            0,
            -24,
          ],
          rotation:
            -Math.PI / 2,
        },
      ],
      []
    );

  /* =======================================================
     PANELES DE PARED
  ======================================================= */

  const wallPanels =
    useMemo(
      () => {
        const items = [];

        const zs = [
          -24,
          -14.5,
          -5,
          4.5,
          14,
        ];

        zs.forEach(
          (z) => {
            items.push({
              position: [
                -28.35,
                6,
                z,
              ],
              scale: [
                0.55,
                6.1,
                4.35,
              ],
            });

            items.push({
              position: [
                28.35,
                6,
                z,
              ],
              scale: [
                0.55,
                6.1,
                4.35,
              ],
            });
          }
        );

        return items;
      },
      []
    );

  /* =======================================================
     PILARES ENTRE MÓDULOS
  ======================================================= */

  const wallPillars =
    useMemo(
      () => {
        const items = [];

        const zs = [
          -29,
          -19.25,
          -9.75,
          -0.25,
          9.25,
          18.75,
        ];

        zs.forEach(
          (z) => {
            items.push({
              position: [
                -27.55,
                6.1,
                z,
              ],
              scale: [
                0.38,
                6.15,
                0.34,
              ],
            });

            items.push({
              position: [
                27.55,
                6.1,
                z,
              ],
              scale: [
                0.38,
                6.15,
                0.34,
              ],
            });
          }
        );

        return items;
      },
      []
    );

  /* =======================================================
     TECHO TÉCNICO
  ======================================================= */

  const ceilingFrames =
    useMemo(
      () => {
        const items = [];

        [
          -25,
          -16,
          -7,
          2,
          11,
          20,
        ].forEach(
          (z) => {
            items.push({
              position: [
                0,
                12.45,
                z,
              ],
              scale: [
                23.8,
                0.22,
                0.32,
              ],
            });
          }
        );

        return items;
      },
      []
    );

  const ceilingLongitudinal =
    useMemo(
      () => [
        {
          position: [
            -17,
            12.3,
            -3,
          ],
          scale: [
            0.32,
            0.28,
            27,
          ],
        },
        {
          position: [
            -8.5,
            12.3,
            -3,
          ],
          scale: [
            0.24,
            0.24,
            27,
          ],
        },
        {
          position: [
            8.5,
            12.3,
            -3,
          ],
          scale: [
            0.24,
            0.24,
            27,
          ],
        },
        {
          position: [
            17,
            12.3,
            -3,
          ],
          scale: [
            0.32,
            0.28,
            27,
          ],
        },
      ],
      []
    );

  /* =======================================================
     PLACAS DEL SUELO
  ======================================================= */

  const floorPlates =
    useMemo(
      () => {
        const items = [];

        [
          -25,
          -16,
          -7,
          2,
          11,
          20,
        ].forEach(
          (z) => {
            items.push({
              position: [
                0,
                0.015,
                z,
              ],
              scale: [
                7.1,
                0.025,
                3.7,
              ],
            });
          }
        );

        return items;
      },
      []
    );

  return (
    <group>
      {/* ===================================================
          SUELO GENERAL
      =================================================== */}

      <mesh
        position={[
          0,
          -0.1,
          -4,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            ROOM_HALF_WIDTH *
              2,
            0.18,
            60,
          ]}
        />

        <meshStandardMaterial
          color="#080b0e"
          roughness={0.8}
          metalness={0.08}
        />
      </mesh>

      {/* ===================================================
          FRANJA CENTRAL
      =================================================== */}

      <mesh
        position={[
          0,
          0.005,
          -3,
        ]}
      >
        <boxGeometry
          args={[
            14.8,
            0.025,
            56,
          ]}
        />

        <meshStandardMaterial
          color="#10151a"
          roughness={0.72}
          metalness={0.1}
        />
      </mesh>

      <InstancedBoxes
        items={floorPlates}
        color="#151b21"
        roughness={0.64}
        metalness={0.15}
      />

      {/* líneas discretas del recorrido */}

      <NeonLine
        position={[
          -7.55,
          0.055,
          -3,
        ]}
        size={[
          0.045,
          0.025,
          55,
        ]}
        color="#58f1ff"
        intensity={0.45}
      />

      <NeonLine
        position={[
          7.55,
          0.055,
          -3,
        ]}
        size={[
          0.045,
          0.025,
          55,
        ]}
        color="#58f1ff"
        intensity={0.45}
      />

      {/* ===================================================
          PAREDES MODULARES
      =================================================== */}

      <InstancedBoxes
        items={wallPanels}
        color="#11171d"
        roughness={0.76}
        metalness={0.12}
      />

      <InstancedBoxes
        items={wallPillars}
        color="#28313a"
        roughness={0.42}
        metalness={0.35}
      />

      {/* ===================================================
          ARQUITECTURA INDIVIDUAL DE LAS FICHAS
      =================================================== */}

      {stations.map(
        ({
          game,
          position,
          rotation,
        }) => (
          <StationArchitecture
            key={`architecture-${game.id}`}
            position={position}
            rotation={rotation}
            accent={
              game.accent
            }
          />
        )
      )}

      {/* ===================================================
          TECHO
      =================================================== */}

      <InstancedBoxes
        items={ceilingFrames}
        color="#222a31"
        roughness={0.42}
        metalness={0.32}
      />

      <InstancedBoxes
        items={
          ceilingLongitudinal
        }
        color="#171d23"
        roughness={0.46}
        metalness={0.28}
      />

      {/* luces de techo integradas */}

      {[
        -25,
        -16,
        -7,
        2,
        11,
        20,
      ].map((z) => (
        <group
          key={`ceiling-light-${z}`}
        >
          <NeonLine
            position={[
              -12.5,
              12.12,
              z,
            ]}
            size={[
              6,
              0.055,
              0.055,
            ]}
            color="#d9f7ff"
            intensity={0.75}
          />

          <NeonLine
            position={[
              12.5,
              12.12,
              z,
            ]}
            size={[
              6,
              0.055,
              0.055,
            ]}
            color="#d9f7ff"
            intensity={0.75}
          />
        </group>
      ))}

      {/* ===================================================
          CARTEL PRINCIPAL
      =================================================== */}

      <group
        position={[
          0,
          0,
          ROOM_BACK_Z,
        ]}
      >
        <mesh
          position={[
            0,
            12.65,
            0.58,
          ]}
        >
          <boxGeometry
            args={[
              20,
              2.25,
              0.42,
            ]}
          />

          <meshStandardMaterial
            color="#111820"
            roughness={0.42}
            metalness={0.28}
          />
        </mesh>

        <NeonWord
          text="POPULARES HOY"
          color="#58f1ff"
          position={[
            0,
            12.7,
            0.82,
          ]}
          width={15}
          height={2.5}
        />
      </group>

      {/* ===================================================
          ESCENARIO Y VIDEO
      =================================================== */}

      <VideoStage />

      {/* ===================================================
          FICHAS
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
            scale={1.42}
          />
        )
      )}
    </group>
  );
}
