"use client";

import FeaturedVideoWall from "./FeaturedVideoWall";

import {
  useEffect,
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
   FREAKY WORLD
   POPULARES HOY — PREMIUM GALLERY

   IMPORTANTE:
   DpadWing tiene su propio suelo cuya cara superior está
   aproximadamente en Y = 0.30.

   Por eso toda la terminación visual de esta sala comienza
   POR ENCIMA de Y = 0.30.
========================================================= */

const ROOM_BACK_Z = -34.25;
const FINISHED_FLOOR_Y = 0.315;

/* =========================================================
   JUEGOS TEMPORALES

   Después estos datos vendrán de IGDB.
========================================================= */

const GAMES = [
  {
    id: "last-signal",
    rank: 1,
    title: "THE LAST SIGNAL",
    subtitle: "Silent Peak",
    year: "2026",
    platform: "PS5 · XBOX · PC",
    score: "9.4",
    trend: "▲ 4 PUESTOS",
    accent: "#d95cff",
    accentDark: "#421653",
  },
  {
    id: "void-runner",
    rank: 2,
    title: "VOID RUNNER",
    subtitle: "Pulse Works",
    year: "2026",
    platform: "PS5 · PC",
    score: "9.2",
    trend: "▲ 2 PUESTOS",
    accent: "#29d9ff",
    accentDark: "#0a4555",
  },
  {
    id: "red-horizon",
    rank: 3,
    title: "RED HORIZON",
    subtitle: "Atlas Interactive",
    year: "2026",
    platform: "PS5 · XBOX · PC",
    score: "9.0",
    trend: "NUEVO",
    accent: "#ff6947",
    accentDark: "#5e1e12",
  },
  {
    id: "deep-blue",
    rank: 4,
    title: "DEEP BLUE",
    subtitle: "Drift Studios",
    year: "2026",
    platform: "PS5 · XBOX",
    score: "8.9",
    trend: "▲ 1 PUESTO",
    accent: "#3f8cff",
    accentDark: "#102b59",
  },
  {
    id: "lumina",
    rank: 5,
    title: "LUMINA",
    subtitle: "Small Moon",
    year: "2026",
    platform: "SWITCH 2",
    score: "8.8",
    trend: "● ESTABLE",
    accent: "#c957ff",
    accentDark: "#3d1554",
  },
  {
    id: "echoes",
    rank: 6,
    title: "ECHOES",
    subtitle: "North Shore Games",
    year: "2026",
    platform: "PS5 · PC",
    score: "8.7",
    trend: "▲ 3 PUESTOS",
    accent: "#42e8a1",
    accentDark: "#0c4e35",
  },
  {
    id: "black-sun",
    rank: 7,
    title: "BLACK SUN",
    subtitle: "Orbital Games",
    year: "2026",
    platform: "PC",
    score: "8.6",
    trend: "NUEVO",
    accent: "#ffb03f",
    accentDark: "#5d3810",
  },
  {
    id: "dust-road",
    rank: 8,
    title: "DUST ROAD",
    subtitle: "Nomad Interactive",
    year: "2025",
    platform: "XBOX · PC",
    score: "8.5",
    trend: "▼ 1 PUESTO",
    accent: "#ff7647",
    accentDark: "#572012",
  },
  {
    id: "neon-district",
    rank: 9,
    title: "NEON DISTRICT",
    subtitle: "Nightfall Studios",
    year: "2027",
    platform: "PS5 · XBOX · PC",
    score: "8.4",
    trend: "▲ 5 PUESTOS",
    accent: "#39bfff",
    accentDark: "#10415a",
  },
  {
    id: "iron-kingdom",
    rank: 10,
    title: "IRON KINGDOM",
    subtitle: "Oak Forge",
    year: "2025",
    platform: "SWITCH 2 · PC",
    score: "8.3",
    trend: "● ESTABLE",
    accent: "#f3ca57",
    accentDark: "#544315",
  },
];

/* =========================================================
   CANVAS — PORTADA TEMPORAL
========================================================= */

function createPosterTexture(game) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 640;
  canvas.height = 960;

  const ctx =
    canvas.getContext("2d");

  /* fondo */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      640,
      960
    );

  gradient.addColorStop(
    0,
    game.accent
  );

  gradient.addColorStop(
    0.48,
    game.accentDark
  );

  gradient.addColorStop(
    1,
    "#050609"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    640,
    960
  );

  /* formas abstractas */

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";

  ctx.beginPath();

  ctx.arc(
    500,
    180,
    190,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 0.07;

  ctx.beginPath();

  ctx.arc(
    100,
    520,
    250,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 0.08;

  ctx.fillRect(
    0,
    360,
    640,
    5
  );

  ctx.fillRect(
    0,
    375,
    640,
    2
  );

  ctx.globalAlpha = 1;

  /* número */

  ctx.fillStyle =
    "rgba(4,5,8,0.72)";

  ctx.fillRect(
    28,
    28,
    122,
    72
  );

  ctx.strokeStyle =
    "rgba(255,255,255,0.35)";

  ctx.lineWidth = 2;

  ctx.strokeRect(
    28,
    28,
    122,
    72
  );

  ctx.fillStyle = "#ffffff";

  ctx.font =
    "900 39px Arial";

  ctx.fillText(
    `#${game.rank}`,
    50,
    78
  );

  /* puntuación */

  ctx.textAlign = "right";

  ctx.font =
    "900 36px Arial";

  ctx.fillText(
    game.score,
    600,
    76
  );

  ctx.textAlign = "left";

  /* título */

  ctx.font =
    "900 52px Arial";

  ctx.fillStyle = "#ffffff";

  const words =
    game.title.split(" ");

  let line = "";
  let y = 730;

  words.forEach((word) => {
    const test =
      `${line}${word} `;

    if (
      ctx.measureText(test).width >
        570 &&
      line
    ) {
      ctx.fillText(
        line.trim(),
        34,
        y
      );

      line = `${word} `;
      y += 58;
    } else {
      line = test;
    }
  });

  ctx.fillText(
    line.trim(),
    34,
    y
  );

  /* estudio */

  ctx.font =
    "600 23px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.68)";

  ctx.fillText(
    game.subtitle,
    35,
    840
  );

  /* línea */

  ctx.fillStyle =
    game.accent;

  ctx.fillRect(
    35,
    868,
    570,
    4
  );

  /* plataformas */

  ctx.font =
    "700 19px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.78)";

  ctx.fillText(
    `${game.year}  ·  ${game.platform}`,
    35,
    910
  );

  /* tendencia */

  ctx.textAlign = "right";

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    game.trend,
    605,
    910
  );

  ctx.textAlign = "left";

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.anisotropy = 4;

  return texture;
}

/* =========================================================
   CANVAS — TEXTO
========================================================= */

function createTextTexture(
  text,
  color = "#ffffff",
  glow = null
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 256;

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    1024,
    256
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font =
    "900 104px Arial";

  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 28;
  }

  ctx.fillStyle = color;

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
   TEXTO PLANO
========================================================= */

function FlatText({
  text,
  position,
  rotation = [0, 0, 0],
  width = 8,
  height = 2,
  color = "#ffffff",
  glow = null,
}) {
  const texture =
    useMemo(
      () =>
        createTextTexture(
          text,
          color,
          glow
        ),
      [
        text,
        color,
        glow,
      ]
    );

  useEffect(() => {
    return () =>
      texture.dispose();
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
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   LED / NEÓN
========================================================= */

function Led({
  position,
  rotation = [0, 0, 0],
  size = [1, 0.06, 0.06],
  color = "#ffffff",
  intensity = 2,
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
        roughness={0.18}
        metalness={0.05}
      />
    </mesh>
  );
}

/* =========================================================
   PANEL ARQUITECTÓNICO DE PARED
========================================================= */

function GalleryBay({
  side,
  z,
  accent,
}) {
  const left =
    side === "left";

  const x =
    left
      ? -29.0
      : 29.0;

  const innerX =
    left
      ? 0.32
      : -0.32;

  return (
    <group
      position={[
        x,
        0,
        z,
      ]}
    >
      {/* cuerpo profundo */}

      <mesh
        position={[
          0,
          6.15,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.55,
            11.6,
            9.1,
          ]}
        />

        <meshPhysicalMaterial
          color="#080a0d"
          roughness={0.34}
          metalness={0.52}
          clearcoat={0.18}
          clearcoatRoughness={
            0.42
          }
        />
      </mesh>

      {/* fondo interior */}

      <mesh
        position={[
          innerX,
          6.1,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.12,
            10.45,
            8.15,
          ]}
        />

        <meshStandardMaterial
          color="#15191e"
          roughness={0.46}
          metalness={0.34}
        />
      </mesh>

      {/* franja superior */}

      <mesh
        position={[
          innerX * 1.08,
          11.42,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.18,
            0.55,
            8.6,
          ]}
        />

        <meshStandardMaterial
          color="#272d34"
          roughness={0.28}
          metalness={0.6}
        />
      </mesh>

      {/* LED superior */}

      <Led
        position={[
          innerX * 1.45,
          11.18,
          0,
        ]}
        size={[
          0.055,
          0.09,
          7.45,
        ]}
        color={accent}
        intensity={2.8}
      />

      {/* LED inferior */}

      <Led
        position={[
          innerX * 1.45,
          0.86,
          0,
        ]}
        size={[
          0.055,
          0.07,
          7.45,
        ]}
        color={accent}
        intensity={1.8}
      />
    </group>
  );
}

/* =========================================================
   EXPOSITOR / PANTALLA
========================================================= */

function GameStation({
  game,
  position,
  rotation,
}) {
  const ref =
    useRef(null);

  const nearRef =
    useRef(false);

  const [
    near,
    setNear,
  ] = useState(false);

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const poster =
    useMemo(
      () =>
        createPosterTexture(
          game
        ),
      [game]
    );

  useEffect(() => {
    return () =>
      poster.dispose();
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
      distance < 5.6;

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
    >
      {/* sombra/retranqueo */}

      <RoundedBox
        position={[
          0,
          5.85,
          -0.28,
        ]}
        args={[
          5.85,
          10.45,
          0.48,
        ]}
        radius={0.2}
        smoothness={3}
      >
        <meshPhysicalMaterial
          color="#050608"
          roughness={0.25}
          metalness={0.62}
          clearcoat={0.35}
          clearcoatRoughness={
            0.3
          }
        />
      </RoundedBox>

      {/* marco principal */}

      <RoundedBox
        position={[
          0,
          5.85,
          0,
        ]}
        args={[
          5.45,
          10.05,
          0.22,
        ]}
        radius={0.17}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#151a20"
          roughness={0.28}
          metalness={0.58}
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.22
              : 0.045
          }
        />
      </RoundedBox>

      {/* pantalla */}

      <mesh
        position={[
          0,
          5.86,
          0.125,
        ]}
      >
        <planeGeometry
          args={[
            4.9,
            9.45,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* LED izquierdo */}

      <Led
        position={[
          -2.83,
          5.85,
          0.17,
        ]}
        size={[
          0.085,
          9.55,
          0.09,
        ]}
        color={
          game.accent
        }
        intensity={
          near
            ? 4.2
            : 2.7
        }
      />

      {/* LED derecho */}

      <Led
        position={[
          2.83,
          5.85,
          0.17,
        ]}
        size={[
          0.085,
          9.55,
          0.09,
        ]}
        color={
          game.accent
        }
        intensity={
          near
            ? 4.2
            : 2.7
        }
      />

      {/* LED superior */}

      <Led
        position={[
          0,
          10.83,
          0.17,
        ]}
        size={[
          5.4,
          0.085,
          0.09,
        ]}
        color={
          game.accent
        }
        intensity={
          near
            ? 4
            : 2.4
        }
      />

      {/* base */}

      <RoundedBox
        position={[
          0,
          0.58,
          0.25,
        ]}
        args={[
          6.1,
          0.48,
          1.2,
        ]}
        radius={0.16}
        smoothness={2}
      >
        <meshPhysicalMaterial
          color="#15191e"
          roughness={0.3}
          metalness={0.55}
          clearcoat={0.25}
        />
      </RoundedBox>

      {/* terminal */}

      <group
        position={[
          0,
          0,
          2.35,
        ]}
      >
        <mesh
          position={[
            0,
            1.1,
            0,
          ]}
          rotation={[
            -0.32,
            0,
            0,
          ]}
        >
          <boxGeometry
            args={[
              2.05,
              1.05,
              0.18,
            ]}
          />

          <meshStandardMaterial
            color="#20262d"
            roughness={0.24}
            metalness={0.62}
            emissive={
              game.accent
            }
            emissiveIntensity={
              0.12
            }
          />
        </mesh>

        <Led
          position={[
            0,
            1.08,
            0.105,
          ]}
          rotation={[
            -0.32,
            0,
            0,
          ]}
          size={[
            1.55,
            0.04,
            0.025,
          ]}
          color={
            game.accent
          }
          intensity={2}
        />

        <mesh
          position={[
            0,
            0.48,
            0.12,
          ]}
        >
          <boxGeometry
            args={[
              0.28,
              0.95,
              0.28,
            ]}
          />

          <meshStandardMaterial
            color="#171b20"
            roughness={0.28}
            metalness={0.6}
          />
        </mesh>

        <RoundedBox
          position={[
            0,
            0.13,
            0.12,
          ]}
          args={[
            1.8,
            0.22,
            1.15,
          ]}
          radius={0.08}
          smoothness={2}
        >
          <meshStandardMaterial
            color="#111419"
            roughness={0.28}
            metalness={0.58}
          />
        </RoundedBox>
      </group>

      {/* colisiones */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            3.05,
            5.25,
            0.55,
          ]}
          position={[
            0,
            5.55,
            0,
          ]}
        />

        <CuboidCollider
          args={[
            1.15,
            0.9,
            0.78,
          ]}
          position={[
            0,
            0.95,
            2.35,
          ]}
        />
      </RigidBody>
    </group>
  );
}

/* =========================================================
   BANCO PREMIUM
========================================================= */

function Bench({
  position,
  rotation = 0,
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
      <RoundedBox
        position={[
          0,
          0.72,
          0,
        ]}
        args={[
          5.6,
          0.82,
          1.75,
        ]}
        radius={0.28}
        smoothness={3}
      >
        <meshPhysicalMaterial
          color="#1b1d21"
          roughness={0.38}
          metalness={0.3}
          clearcoat={0.18}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.29,
          0,
        ]}
      >
        <boxGeometry
          args={[
            4.8,
            0.28,
            1.35,
          ]}
        />

        <meshStandardMaterial
          color="#0a0c0f"
          roughness={0.3}
          metalness={0.58}
        />
      </mesh>

      <Led
        position={[
          0,
          0.35,
          0.78,
        ]}
        size={[
          4.6,
          0.055,
          0.05,
        ]}
        color="#ffc36b"
        intensity={1.8}
      />

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            2.8,
            0.55,
            0.88,
          ]}
          position={[
            0,
            0.65,
            0,
          ]}
        />
      </RigidBody>
    </group>
  );
}

/* =========================================================
   JARDINERA
========================================================= */

function Planter({
  position,
}) {
  const leaves = [
    [-0.7, 1.05, 0, -0.25],
    [-0.35, 1.25, 0.05, 0.18],
    [0, 1.05, -0.08, -0.12],
    [0.38, 1.28, 0.03, 0.24],
    [0.72, 1.02, -0.04, -0.18],
  ];

  return (
    <group
      position={position}
    >
      <RoundedBox
        position={[
          0,
          0.55,
          0,
        ]}
        args={[
          2.65,
          0.7,
          1.4,
        ]}
        radius={0.16}
        smoothness={2}
      >
        <meshPhysicalMaterial
          color="#15191d"
          roughness={0.3}
          metalness={0.48}
          clearcoat={0.2}
        />
      </RoundedBox>

      {leaves.map(
        (
          [
            x,
            y,
            z,
            r,
          ],
          index
        ) => (
          <mesh
            key={index}
            position={[
              x,
              y,
              z,
            ]}
            rotation={[
              0,
              0,
              r,
            ]}
          >
            <coneGeometry
              args={[
                0.24,
                1.45,
                5,
              ]}
            />

            <meshStandardMaterial
              color="#2f6546"
              roughness={0.78}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   ISLA CENTRAL TOP 10
========================================================= */

function TopTenIsland() {
  return (
    <group
      position={[
        0,
        0,
        -14.5,
      ]}
    >
      {/* base */}

      <RoundedBox
        position={[
          0,
          0.72,
          0,
        ]}
        args={[
          8.6,
          1.15,
          2.7,
        ]}
        radius={0.25}
        smoothness={3}
      >
        <meshPhysicalMaterial
          color="#12161b"
          roughness={0.25}
          metalness={0.62}
          clearcoat={0.3}
          clearcoatRoughness={
            0.25
          }
        />
      </RoundedBox>

      {/* tapa */}

      <RoundedBox
        position={[
          0,
          1.32,
          0,
        ]}
        args={[
          7.8,
          0.12,
          2.25,
        ]}
        radius={0.08}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#262d34"
          roughness={0.25}
          metalness={0.6}
        />
      </RoundedBox>

      <Led
        position={[
          0,
          0.28,
          1.25,
        ]}
        size={[
          7.3,
          0.07,
          0.05,
        ]}
        color="#ffc76f"
        intensity={2.8}
      />

      <Led
        position={[
          0,
          0.28,
          -1.25,
        ]}
        size={[
          7.3,
          0.07,
          0.05,
        ]}
        color="#ffc76f"
        intensity={2.8}
      />

      <FlatText
        text="TOP 10 HOY"
        position={[
          0,
          1.41,
          1.36,
        ]}
        width={6.6}
        height={1.35}
        color="#fff5df"
        glow="#ffb84f"
      />

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            4.3,
            0.65,
            1.35,
          ]}
          position={[
            0,
            0.75,
            0,
          ]}
        />
      </RigidBody>
    </group>
  );
}

/* =========================================================
   ESCENARIO DEL FONDO
========================================================= */

function VideoStage() {
  return (
    <group>
      {/* gran fondo */}

      <RoundedBox
        position={[
          0,
          6.4,
          ROOM_BACK_Z +
            0.18,
        ]}
        args={[
          32,
          12.2,
          0.7,
        ]}
        radius={0.22}
        smoothness={3}
      >
        <meshPhysicalMaterial
          color="#07090c"
          roughness={0.3}
          metalness={0.5}
          clearcoat={0.2}
        />
      </RoundedBox>

      {/* alas del escenario */}

      <RoundedBox
        position={[
          -14.5,
          6.1,
          ROOM_BACK_Z +
            0.75,
        ]}
        args={[
          2.4,
          10.8,
          0.55,
        ]}
        radius={0.15}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#181d23"
          roughness={0.28}
          metalness={0.55}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          14.5,
          6.1,
          ROOM_BACK_Z +
            0.75,
        ]}
        args={[
          2.4,
          10.8,
          0.55,
        ]}
        radius={0.15}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#181d23"
          roughness={0.28}
          metalness={0.55}
        />
      </RoundedBox>

      {/* marco de pantalla */}

      <RoundedBox
        position={[
          0,
          6.1,
          ROOM_BACK_Z +
            0.72,
        ]}
        args={[
          24.8,
          9.55,
          0.42,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshPhysicalMaterial
          color="#252b32"
          roughness={0.24}
          metalness={0.68}
          clearcoat={0.22}
        />
      </RoundedBox>

      {/* LED marco */}

      <Led
        position={[
          0,
          11.02,
          ROOM_BACK_Z +
            0.98,
        ]}
        size={[
          23.6,
          0.08,
          0.07,
        ]}
        color="#5fdcff"
        intensity={2.4}
      />

      <Led
        position={[
          -12.2,
          6.1,
          ROOM_BACK_Z +
            0.98,
        ]}
        size={[
          0.07,
          9.2,
          0.07,
        ]}
        color="#5fdcff"
        intensity={2}
      />

      <Led
        position={[
          12.2,
          6.1,
          ROOM_BACK_Z +
            0.98,
        ]}
        size={[
          0.07,
          9.2,
          0.07,
        ]}
        color="#5fdcff"
        intensity={2}
      />

      {/* plataforma */}

      <RoundedBox
        position={[
          0,
          0.58,
          ROOM_BACK_Z +
            3.4,
        ]}
        args={[
          29,
          0.5,
          6.2,
        ]}
        radius={0.2}
        smoothness={3}
      >
        <meshPhysicalMaterial
          color="#14181d"
          roughness={0.24}
          metalness={0.55}
          clearcoat={0.2}
        />
      </RoundedBox>

      <Led
        position={[
          0,
          0.85,
          ROOM_BACK_Z +
            6.25,
        ]}
        size={[
          25,
          0.06,
          0.06,
        ]}
        color="#ffc66d"
        intensity={2.4}
      />

      {/* plantas */}

      <Planter
        position={[
          -12.5,
          0.3,
          ROOM_BACK_Z +
            5.6,
        ]}
      />

      <Planter
        position={[
          12.5,
          0.3,
          ROOM_BACK_Z +
            5.6,
        ]}
      />

      {/* reproductor */}

      <FeaturedVideoWall
        position={[
          0,
          5.2,
          ROOM_BACK_Z +
            1,
        ]}
      />
    </group>
  );
}

/* =========================================================
   TECHO LATERAL

   El centro queda completamente libre.
   NO TOCAMOS LA FLECHA DEL DPADWING.
========================================================= */

function PremiumCeiling() {
  const zs = [
    -27,
    -18,
    -9,
    0,
    9,
    18,
  ];

  return (
    <group>
      {zs.map((z) => (
        <group
          key={z}
        >
          {/* módulo izquierdo */}

          <mesh
            position={[
              -20.8,
              12.25,
              z,
            ]}
          >
            <boxGeometry
              args={[
                13.5,
                0.38,
                1,
              ]}
            />

            <meshPhysicalMaterial
              color="#171b20"
              roughness={0.24}
              metalness={0.58}
              clearcoat={0.18}
            />
          </mesh>

          <Led
            position={[
              -20.8,
              12.02,
              z,
            ]}
            size={[
              9.5,
              0.07,
              0.1,
            ]}
            color="#fff0d3"
            intensity={2}
          />

          {/* módulo derecho */}

          <mesh
            position={[
              20.8,
              12.25,
              z,
            ]}
          >
            <boxGeometry
              args={[
                13.5,
                0.38,
                1,
              ]}
            />

            <meshPhysicalMaterial
              color="#171b20"
              roughness={0.24}
              metalness={0.58}
              clearcoat={0.18}
            />
          </mesh>

          <Led
            position={[
              20.8,
              12.02,
              z,
            ]}
            size={[
              9.5,
              0.07,
              0.1,
            ]}
            color="#fff0d3"
            intensity={2}
          />
        </group>
      ))}

      {/* líneas longitudinales */}

      <mesh
        position={[
          -14.4,
          12.28,
          -4,
        ]}
      >
        <boxGeometry
          args={[
            0.55,
            0.5,
            59,
          ]}
        />

        <meshStandardMaterial
          color="#22272d"
          roughness={0.28}
          metalness={0.58}
        />
      </mesh>

      <mesh
        position={[
          14.4,
          12.28,
          -4,
        ]}
      >
        <boxGeometry
          args={[
            0.55,
            0.5,
            59,
          ]}
        />

        <meshStandardMaterial
          color="#22272d"
          roughness={0.28}
          metalness={0.58}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   ILUMINACIÓN PREMIUM

   Las tiras emissive se ven brillantes.
   Estas luces reales hacen que ese color llegue
   físicamente a suelo, paredes y estructuras.
========================================================= */

function GalleryLighting() {
  return (
    <group>
      {/* luz general interior */}

      <hemisphereLight
        intensity={0.58}
        color="#d9ecff"
        groundColor="#15100d"
      />

      {/* luz fría procedente del techo */}

      <directionalLight
        position={[
          0,
          13,
          7,
        ]}
        intensity={1.25}
        color="#b9dcff"
      />

      {/* iluminación central cálida */}

      <pointLight
        position={[
          0,
          8.5,
          -13,
        ]}
        intensity={42}
        distance={28}
        decay={2}
        color="#ffd29a"
      />

      {/* pantalla fondo */}

      <pointLight
        position={[
          0,
          7,
          -28,
        ]}
        intensity={55}
        distance={25}
        decay={2}
        color="#78d9ff"
      />

      {/* galería izquierda */}

      <pointLight
        position={[
          -20,
          6,
          -17,
        ]}
        intensity={38}
        distance={20}
        decay={2}
        color="#b96dff"
      />

      <pointLight
        position={[
          -20,
          6,
          5,
        ]}
        intensity={34}
        distance={19}
        decay={2}
        color="#ff855d"
      />

      {/* galería derecha */}

      <pointLight
        position={[
          20,
          6,
          -17,
        ]}
        intensity={36}
        distance={20}
        decay={2}
        color="#55dfff"
      />

      <pointLight
        position={[
          20,
          6,
          5,
        ]}
        intensity={34}
        distance={19}
        decay={2}
        color="#ffbd67"
      />
    </group>
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  /*
    Las fichas están algo más separadas que antes.

    Las más cercanas a la entrada comienzan en Z 15.
    Las del fondo terminan en Z -24.
  */

  const stations =
    useMemo(
      () => [
        /* izquierda */

        {
          game: GAMES[0],
          position: [
            -25.3,
            0.3,
            -24,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[1],
          position: [
            -25.3,
            0.3,
            -14.2,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[2],
          position: [
            -25.3,
            0.3,
            -4.4,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[3],
          position: [
            -25.3,
            0.3,
            5.4,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[4],
          position: [
            -25.3,
            0.3,
            15.2,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        /* derecha */

        {
          game: GAMES[5],
          position: [
            25.3,
            0.3,
            15.2,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[6],
          position: [
            25.3,
            0.3,
            5.4,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[7],
          position: [
            25.3,
            0.3,
            -4.4,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[8],
          position: [
            25.3,
            0.3,
            -14.2,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[9],
          position: [
            25.3,
            0.3,
            -24,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          ACABADO DE SUELO

          ESTE es el cambio clave:
          está por encima del suelo físico de DpadWing.
      =================================================== */}

      <mesh
        position={[
          0,
          FINISHED_FLOOR_Y,
          -3.5,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            58.7,
            62.5,
          ]}
        />

        <meshPhysicalMaterial
          color="#0b0d10"
          roughness={0.2}
          metalness={0.48}
          clearcoat={0.32}
          clearcoatRoughness={
            0.24
          }
        />
      </mesh>

      {/* ===================================================
          PLACAS DEL PAVIMENTO

          Rompen la sensación de carretera/plano vacío.
      =================================================== */}

      {[
        -27,
        -21,
        -15,
        -9,
        -3,
        3,
        9,
        15,
        21,
      ].map((z) => (
        <group
          key={`floor-panel-${z}`}
        >
          <mesh
            position={[
              0,
              FINISHED_FLOOR_Y +
                0.006,
              z,
            ]}
            rotation={[
              -Math.PI / 2,
              0,
              0,
            ]}
          >
            <planeGeometry
              args={[
                16,
                5.55,
              ]}
            />

            <meshPhysicalMaterial
              color="#11151a"
              roughness={0.18}
              metalness={0.5}
              clearcoat={0.25}
            />
          </mesh>

          <Led
            position={[
              -8.2,
              FINISHED_FLOOR_Y +
                0.018,
              z,
            ]}
            size={[
              0.035,
              0.025,
              5,
            ]}
            color="#536875"
            intensity={0.4}
          />

          <Led
            position={[
              8.2,
              FINISHED_FLOOR_Y +
                0.018,
              z,
            ]}
            size={[
              0.035,
              0.025,
              5,
            ]}
            color="#536875"
            intensity={0.4}
          />
        </group>
      ))}

      {/* ===================================================
          GALERÍAS DE PARED
      =================================================== */}

      {stations.map(
        ({
          game,
          position,
          side,
        }) => (
          <GalleryBay
            key={`bay-${game.id}`}
            side={side}
            z={position[2]}
            accent={
              game.accent
            }
          />
        )
      )}

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
          />
        )
      )}

      {/* ===================================================
          TECHO PREMIUM LATERAL

          Centro libre = flecha totalmente visible.
      =================================================== */}

      <PremiumCeiling />

      {/* ===================================================
          ESCENARIO
      =================================================== */}

      <VideoStage />

      {/* ===================================================
          ELEMENTO CENTRAL
      =================================================== */}

      <TopTenIsland />

      {/* ===================================================
          MOBILIARIO

          Dejamos circulación central amplia.
      =================================================== */}

      <Bench
        position={[
          -8.5,
          0.3,
          -19,
        ]}
      />

      <Bench
        position={[
          8.5,
          0.3,
          -19,
        ]}
      />

      <Bench
        position={[
          -8.5,
          0.3,
          -7,
        ]}
      />

      <Bench
        position={[
          8.5,
          0.3,
          -7,
        ]}
      />

      {/* ===================================================
          JARDINERAS
      =================================================== */}

      <Planter
        position={[
          -12,
          0.3,
          -27,
        ]}
      />

      <Planter
        position={[
          12,
          0.3,
          -27,
        ]}
      />

      {/* ===================================================
          LUZ

          Ahora los LED no son simplemente rayas de color:
          las luces reales iluminan el espacio.
      =================================================== */}

      <GalleryLighting />
    </group>
  );
}
