"use client";

import FeaturedVideoWall from "./FeaturedVideoWall";

import {
  useEffect,
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
   JUEGOS TEMPORALES

   Después reemplazaremos esto por IGDB.
========================================================= */

const GAMES = [
  {
    id: "mock-last-signal",
    mock: true,
    rank: 1,
    title: "THE LAST SIGNAL",
    subtitle: "Silent Peak",
    year: "2026",
    platform: "PS5 · Xbox · PC",
    score: "9.4",
    accent: "#d66cff",
    accent2: "#55206f",
  },
  {
    id: "mock-void-runner",
    mock: true,
    rank: 2,
    title: "VOID RUNNER",
    subtitle: "Pulse Works",
    year: "2026",
    platform: "PS5 · PC",
    score: "9.2",
    accent: "#3d8cff",
    accent2: "#173f83",
  },
  {
    id: "mock-red-horizon",
    mock: true,
    rank: 3,
    title: "RED HORIZON",
    subtitle: "Atlas Interactive",
    year: "2026",
    platform: "PS5 · Xbox · PC",
    score: "9.0",
    accent: "#ff5a3d",
    accent2: "#7a241a",
  },
  {
    id: "mock-deep-blue",
    mock: true,
    rank: 4,
    title: "DEEP BLUE",
    subtitle: "Drift Studios",
    year: "2026",
    platform: "PS5 · Xbox",
    score: "8.9",
    accent: "#35d8ff",
    accent2: "#14516c",
  },
  {
    id: "mock-lumina",
    mock: true,
    rank: 5,
    title: "LUMINA",
    subtitle: "Small Moon",
    year: "2026",
    platform: "Switch 2",
    score: "8.8",
    accent: "#ef64ff",
    accent2: "#673071",
  },
  {
    id: "mock-echoes",
    mock: true,
    rank: 6,
    title: "ECHOES",
    subtitle: "North Shore Games",
    year: "2026",
    platform: "PS5 · PC",
    score: "8.7",
    accent: "#65e59d",
    accent2: "#225d3d",
  },
  {
    id: "mock-black-sun",
    mock: true,
    rank: 7,
    title: "BLACK SUN",
    subtitle: "Orbital Games",
    year: "2026",
    platform: "PC",
    score: "8.6",
    accent: "#ff8848",
    accent2: "#73351d",
  },
  {
    id: "mock-dust-road",
    mock: true,
    rank: 8,
    title: "DUST ROAD",
    subtitle: "Nomad Interactive",
    year: "2025",
    platform: "Xbox · PC",
    score: "8.5",
    accent: "#ffad58",
    accent2: "#74441d",
  },
  {
    id: "mock-neon-district",
    mock: true,
    rank: 9,
    title: "NEON DISTRICT",
    subtitle: "Nightfall Studios",
    year: "2027",
    platform: "PS5 · Xbox · PC",
    score: "8.4",
    accent: "#4fb6ff",
    accent2: "#244b77",
  },
  {
    id: "mock-iron-kingdom",
    mock: true,
    rank: 10,
    title: "IRON KINGDOM",
    subtitle: "Oak Forge",
    year: "2025",
    platform: "Switch 2 · PC",
    score: "8.3",
    accent: "#ffc95b",
    accent2: "#73571d",
  },
];

/* =========================================================
   TEXTURA PORTADA TEMPORAL
========================================================= */

function createPosterTexture(game) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 768;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(
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
    0.48,
    game.accent2
  );

  gradient.addColorStop(
    1,
    "#050609"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    512,
    768
  );

  /* -----------------------------------------
     FORMAS DE FONDO
  ----------------------------------------- */

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";

  ctx.beginPath();

  ctx.arc(
    385,
    155,
    155,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 0.07;

  ctx.beginPath();

  ctx.arc(
    90,
    400,
    210,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha = 1;

  /* -----------------------------------------
     RANKING
  ----------------------------------------- */

  ctx.fillStyle =
    "rgba(0,0,0,0.48)";

  ctx.fillRect(
    24,
    24,
    105,
    62
  );

  ctx.fillStyle = "#ffffff";

  ctx.font =
    "900 34px Arial";

  ctx.fillText(
    `#${game.rank}`,
    42,
    67
  );

  /* -----------------------------------------
     TÍTULO
  ----------------------------------------- */

  ctx.font =
    "900 45px Arial";

  const words =
    game.title.split(" ");

  let line = "";
  let y = 575;

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
      y += 52;
    } else {
      line = next;
    }
  });

  ctx.fillText(
    line.trim(),
    28,
    y
  );

  /* -----------------------------------------
     AÑO
  ----------------------------------------- */

  ctx.font =
    "700 22px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.9)";

  ctx.fillText(
    game.year,
    30,
    680
  );

  /* -----------------------------------------
     PLATAFORMAS
  ----------------------------------------- */

  ctx.font =
    "600 17px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.72)";

  ctx.fillText(
    game.platform,
    30,
    716
  );

  /* -----------------------------------------
     SCORE
  ----------------------------------------- */

  ctx.font =
    "900 23px Arial";

  ctx.fillStyle =
    "#ffffff";

  ctx.textAlign = "right";

  ctx.fillText(
    game.score,
    475,
    716
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

  return texture;
}

/* =========================================================
   TEXTURA DE TEXTO
========================================================= */

function createTextTexture(
  text,
  {
    color = "#ffffff",
    fontSize = 96,
    weight = 900,
    glow = null,
  } = {}
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
    canvas.width,
    canvas.height
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font =
    `${weight} ${fontSize}px Arial`;

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

  texture.minFilter =
    THREE.LinearFilter;

  return texture;
}

/* =========================================================
   TEXTO 3D PLANO
========================================================= */

function FlatText({
  text,
  position,
  rotation = [0, 0, 0],
  width = 8,
  height = 2,
  color = "#ffffff",
  glow = null,
  fontSize = 96,
}) {
  const texture =
    useMemo(
      () =>
        createTextTexture(
          text,
          {
            color,
            glow,
            fontSize,
          }
        ),
      [
        text,
        color,
        glow,
        fontSize,
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
   LUZ EMISIVA GEOMÉTRICA

   No crea PointLight.
   Es mucho más barata para móvil.
========================================================= */

function GlowStrip({
  position,
  rotation = [0, 0, 0],
  size = [1, 0.05, 0.05],
  color = "#ffffff",
  intensity = 1,
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
        roughness={0.3}
      />
    </mesh>
  );
}

/* =========================================================
   PANEL DE PARED
========================================================= */

function WallPanel({
  side,
  z,
  accent,
}) {
  const x =
    side === "left"
      ? -28.55
      : 28.55;

  return (
    <group
      position={[
        x,
        0,
        z,
      ]}
    >
      {/* panel principal */}

      <mesh
        position={[
          0,
          6,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.5,
            12,
            8.7,
          ]}
        />

        <meshStandardMaterial
          color="#0b0e12"
          roughness={0.55}
          metalness={0.32}
        />
      </mesh>

      {/* panel interior */}

      <mesh
        position={[
          side === "left"
            ? 0.28
            : -0.28,
          6,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.14,
            10.5,
            7.65,
          ]}
        />

        <meshStandardMaterial
          color="#151a20"
          roughness={0.45}
          metalness={0.28}
        />
      </mesh>

      {/* luz superior */}

      <GlowStrip
        position={[
          side === "left"
            ? 0.39
            : -0.39,
          11.25,
          0,
        ]}
        size={[
          0.05,
          0.08,
          6.9,
        ]}
        color={accent}
        intensity={0.9}
      />

      {/* luz inferior */}

      <GlowStrip
        position={[
          side === "left"
            ? 0.39
            : -0.39,
          0.55,
          0,
        ]}
        size={[
          0.05,
          0.06,
          6.9,
        ]}
        color={accent}
        intensity={0.55}
      />
    </group>
  );
}

/* =========================================================
   FICHA / EXPOSITOR
========================================================= */

function GameStation({
  game,
  position,
  rotation,
}) {
  const ref = useRef(null);

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
      distance < 5.4;

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
      {/* -----------------------------------------
          MARCO EXTERIOR
      ----------------------------------------- */}

      <RoundedBox
        position={[
          0,
          5.7,
          -0.18,
        ]}
        args={[
          5.6,
          9.9,
          0.48,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#090b0f"
          roughness={0.34}
          metalness={0.48}
        />
      </RoundedBox>

      {/* -----------------------------------------
          MARCO INTERIOR
      ----------------------------------------- */}

      <RoundedBox
        position={[
          0,
          5.7,
          0.09,
        ]}
        args={[
          5.05,
          9.35,
          0.18,
        ]}
        radius={0.12}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#161b21"
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? 0.28
              : 0.055
          }
          roughness={0.38}
          metalness={0.35}
        />
      </RoundedBox>

      {/* -----------------------------------------
          PORTADA
      ----------------------------------------- */}

      <mesh
        position={[
          0,
          5.72,
          0.195,
        ]}
      >
        <planeGeometry
          args={[
            4.58,
            8.72,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* -----------------------------------------
          LUCES LATERALES
      ----------------------------------------- */}

      <GlowStrip
        position={[
          -2.72,
          5.7,
          0.16,
        ]}
        size={[
          0.075,
          8.9,
          0.075,
        ]}
        color={
          game.accent
        }
        intensity={
          near
            ? 2
            : 0.9
        }
      />

      <GlowStrip
        position={[
          2.72,
          5.7,
          0.16,
        ]}
        size={[
          0.075,
          8.9,
          0.075,
        ]}
        color={
          game.accent
        }
        intensity={
          near
            ? 2
            : 0.9
        }
      />

      {/* -----------------------------------------
          BASE
      ----------------------------------------- */}

      <RoundedBox
        position={[
          0,
          0.38,
          0.15,
        ]}
        args={[
          5.9,
          0.65,
          1.25,
        ]}
        radius={0.16}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#11151a"
          roughness={0.38}
          metalness={0.42}
        />
      </RoundedBox>

      {/* -----------------------------------------
          TERMINAL INFORMATIVO
      ----------------------------------------- */}

      <group
        position={[
          0,
          0,
          2.55,
        ]}
      >
        <mesh
          position={[
            0,
            1.05,
            0,
          ]}
          rotation={[
            -0.35,
            0,
            0,
          ]}
        >
          <boxGeometry
            args={[
              2.15,
              1.05,
              0.18,
            ]}
          />

          <meshStandardMaterial
            color="#161c23"
            roughness={0.28}
            metalness={0.5}
            emissive={
              game.accent
            }
            emissiveIntensity={
              0.06
            }
          />
        </mesh>

        <mesh
          position={[
            0,
            0.48,
            0.15,
          ]}
        >
          <boxGeometry
            args={[
              0.3,
              0.95,
              0.3,
            ]}
          />

          <meshStandardMaterial
            color="#171b20"
            metalness={0.45}
            roughness={0.35}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.12,
            0.15,
          ]}
        >
          <boxGeometry
            args={[
              1.75,
              0.2,
              1.15,
            ]}
          />

          <meshStandardMaterial
            color="#101419"
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* -----------------------------------------
          COLISIÓN REAL
      ----------------------------------------- */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            2.95,
            5.25,
            0.65,
          ]}
          position={[
            0,
            5.25,
            0,
          ]}
        />

        <CuboidCollider
          args={[
            1.25,
            0.95,
            0.8,
          ]}
          position={[
            0,
            0.95,
            2.55,
          ]}
        />
      </RigidBody>
    </group>
  );
}

/* =========================================================
   BANCO
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
          0.48,
          0,
        ]}
        args={[
          5.5,
          0.75,
          1.65,
        ]}
        radius={0.28}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#171a1f"
          roughness={0.46}
          metalness={0.22}
        />
      </RoundedBox>

      <GlowStrip
        position={[
          0,
          0.14,
          0.7,
        ]}
        size={[
          4.7,
          0.05,
          0.05,
        ]}
        color="#f3c47b"
        intensity={0.7}
      />

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            2.75,
            0.45,
            0.85,
          ]}
          position={[
            0,
            0.45,
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
          2.5,
          0.7,
          1.4,
        ]}
        radius={0.18}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#15191d"
          roughness={0.55}
          metalness={0.25}
        />
      </RoundedBox>

      {/* vegetación simple y barata */}

      {[
        [-0.7, 0.95, 0],
        [-0.3, 1.15, 0.1],
        [0.15, 1.0, -0.05],
        [0.55, 1.2, 0.08],
        [0.85, 0.9, -0.08],
      ].map(
        (
          [
            x,
            y,
            z,
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
              index % 2
                ? 0.25
                : -0.25,
            ]}
          >
            <coneGeometry
              args={[
                0.22,
                1.4,
                5,
              ]}
            />

            <meshStandardMaterial
              color="#31543c"
              roughness={0.85}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   TOP 10 CENTRAL
========================================================= */

function TopTenIsland() {
  return (
    <group
      position={[
        0,
        0,
        -14,
      ]}
    >
      <RoundedBox
        position={[
          0,
          0.75,
          0,
        ]}
        args={[
          8.8,
          1.35,
          2.5,
        ]}
        radius={0.25}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#11151a"
          roughness={0.32}
          metalness={0.48}
        />
      </RoundedBox>

      <GlowStrip
        position={[
          0,
          0.15,
          1.05,
        ]}
        size={[
          7.8,
          0.06,
          0.06,
        ]}
        color="#f5c47c"
        intensity={1}
      />

      <GlowStrip
        position={[
          0,
          0.15,
          -1.05,
        ]}
        size={[
          7.8,
          0.06,
          0.06,
        ]}
        color="#f5c47c"
        intensity={1}
      />

      <FlatText
        text="TOP 10"
        position={[
          0,
          1.46,
          1.27,
        ]}
        width={6}
        height={1.4}
        color="#fff2d8"
        glow="#f5b85c"
        fontSize={100}
      />

      <FlatText
        text="HOY"
        position={[
          0,
          0.82,
          1.29,
        ]}
        width={2.2}
        height={0.55}
        color="#ffffff"
        fontSize={72}
      />

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            4.4,
            0.75,
            1.25,
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
   ESCENARIO DE VIDEO
========================================================= */

function VideoStage() {
  return (
    <group>
      {/* pared profunda */}

      <RoundedBox
        position={[
          0,
          6.3,
          ROOM_BACK_Z +
            0.05,
        ]}
        args={[
          31,
          12.5,
          0.8,
        ]}
        radius={0.25}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#080a0d"
          roughness={0.45}
          metalness={0.3}
        />
      </RoundedBox>

      {/* marco */}

      <RoundedBox
        position={[
          0,
          6.15,
          ROOM_BACK_Z +
            0.55,
        ]}
        args={[
          24.8,
          9.4,
          0.42,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#20262d"
          roughness={0.32}
          metalness={0.5}
        />
      </RoundedBox>

      {/* fondo negro */}

      <mesh
        position={[
          0,
          6.15,
          ROOM_BACK_Z +
            0.79,
        ]}
      >
        <planeGeometry
          args={[
            23.8,
            8.45,
          ]}
        />

        <meshStandardMaterial
          color="#020203"
          roughness={0.75}
        />
      </mesh>

      {/* iluminación cálida inferior */}

      <GlowStrip
        position={[
          0,
          1.3,
          ROOM_BACK_Z +
            0.9,
        ]}
        size={[
          22.5,
          0.08,
          0.08,
        ]}
        color="#f1bb68"
        intensity={0.85}
      />

      {/* iluminación fría superior */}

      <GlowStrip
        position={[
          0,
          11,
          ROOM_BACK_Z +
            0.9,
        ]}
        size={[
          22.5,
          0.07,
          0.07,
        ]}
        color="#8adfff"
        intensity={0.65}
      />

      {/* plataforma */}

      <RoundedBox
        position={[
          0,
          0.28,
          ROOM_BACK_Z +
            3.4,
        ]}
        args={[
          27,
          0.48,
          5.8,
        ]}
        radius={0.18}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#11151a"
          roughness={0.42}
          metalness={0.35}
        />
      </RoundedBox>

      {/* escalón */}

      <RoundedBox
        position={[
          0,
          0.11,
          ROOM_BACK_Z +
            6,
        ]}
        args={[
          20,
          0.2,
          1.4,
        ]}
        radius={0.1}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#171b20"
          roughness={0.42}
          metalness={0.3}
        />
      </RoundedBox>

      <GlowStrip
        position={[
          0,
          0.23,
          ROOM_BACK_Z +
            6.65,
        ]}
        size={[
          18.5,
          0.04,
          0.04,
        ]}
        color="#f5c477"
        intensity={0.75}
      />

      {/* reproductor existente */}

      <FeaturedVideoWall
        position={[
          0,
          5.2,
          ROOM_BACK_Z +
            0.95,
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
        /* IZQUIERDA */

        {
          game: GAMES[0],
          position: [
            -25.15,
            0,
            -23.5,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[1],
          position: [
            -25.15,
            0,
            -14.3,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[2],
          position: [
            -25.15,
            0,
            -5.1,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[3],
          position: [
            -25.15,
            0,
            4.1,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: GAMES[4],
          position: [
            -25.15,
            0,
            13.3,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        /* DERECHA */

        {
          game: GAMES[5],
          position: [
            25.15,
            0,
            13.3,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[6],
          position: [
            25.15,
            0,
            4.1,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[7],
          position: [
            25.15,
            0,
            -5.1,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[8],
          position: [
            25.15,
            0,
            -14.3,
          ],
          rotation:
            -Math.PI / 2,
          side: "right",
        },

        {
          game: GAMES[9],
          position: [
            25.15,
            0,
            -23.5,
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
          SUELO OSCURO

          No más carretera gris.
      =================================================== */}

      <mesh
        position={[
          0,
          -0.11,
          -4,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            ROOM_HALF_WIDTH *
              2,
            0.2,
            60,
          ]}
        />

        <meshStandardMaterial
          color="#090b0e"
          roughness={0.24}
          metalness={0.38}
        />
      </mesh>

      {/* ===================================================
          PAVIMENTO CENTRAL SUTIL
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
            17,
            0.025,
            55,
          ]}
        />

        <meshStandardMaterial
          color="#101318"
          roughness={0.28}
          metalness={0.42}
        />
      </mesh>

      {/* juntas del suelo */}

      {[
        -25,
        -19,
        -13,
        -7,
        -1,
        5,
        11,
        17,
      ].map((z) => (
        <GlowStrip
          key={`floor-${z}`}
          position={[
            0,
            0.035,
            z,
          ]}
          size={[
            15,
            0.018,
            0.025,
          ]}
          color="#82939d"
          intensity={0.12}
        />
      ))}

      {/* ===================================================
          PAREDES DE GALERÍA
      =================================================== */}

      {stations.map(
        ({
          game,
          position,
          side,
        }) => (
          <WallPanel
            key={`wall-${game.id}`}
            side={side}
            z={position[2]}
            accent={
              game.accent
            }
          />
        )
      )}

      {/* ===================================================
          FICHAS + COLISIONES
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
          LUZ ARQUITECTÓNICA SUPERIOR

          IMPORTANTE:
          queda únicamente en los laterales.
          NO atraviesa la flecha/ventana.
      =================================================== */}

      {[
        -24,
        -15,
        -6,
        3,
        12,
      ].map((z) => (
        <group
          key={`roof-${z}`}
        >
          {/* izquierda */}

          <mesh
            position={[
              -20,
              12.1,
              z,
            ]}
          >
            <boxGeometry
              args={[
                13,
                0.35,
                0.55,
              ]}
            />

            <meshStandardMaterial
              color="#171b20"
              roughness={0.3}
              metalness={0.48}
            />
          </mesh>

          <GlowStrip
            position={[
              -20,
              11.88,
              z,
            ]}
            size={[
              9,
              0.055,
              0.055,
            ]}
            color="#e7e1d4"
            intensity={0.65}
          />

          {/* derecha */}

          <mesh
            position={[
              20,
              12.1,
              z,
            ]}
          >
            <boxGeometry
              args={[
                13,
                0.35,
                0.55,
              ]}
            />

            <meshStandardMaterial
              color="#171b20"
              roughness={0.3}
              metalness={0.48}
            />
          </mesh>

          <GlowStrip
            position={[
              20,
              11.88,
              z,
            ]}
            size={[
              9,
              0.055,
              0.055,
            ]}
            color="#e7e1d4"
            intensity={0.65}
          />
        </group>
      ))}

      {/* ===================================================
          MOLDURAS LONGITUDINALES DEL TECHO

          También solo laterales.
      =================================================== */}

      <mesh
        position={[
          -16.8,
          12.15,
          -4,
        ]}
      >
        <boxGeometry
          args={[
            0.5,
            0.45,
            57,
          ]}
        />

        <meshStandardMaterial
          color="#15191e"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <mesh
        position={[
          16.8,
          12.15,
          -4,
        ]}
      >
        <boxGeometry
          args={[
            0.5,
            0.45,
            57,
          ]}
        />

        <meshStandardMaterial
          color="#15191e"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* ===================================================
          ESCENARIO DE VIDEO
      =================================================== */}

      <VideoStage />

      {/* ===================================================
          ISLA TOP 10
      =================================================== */}

      <TopTenIsland />

      {/* ===================================================
          BANCOS

          Disposición baja para no tapar las fichas.
      =================================================== */}

      <Bench
        position={[
          -7.2,
          0,
          -18.5,
        ]}
      />

      <Bench
        position={[
          7.2,
          0,
          -18.5,
        ]}
      />

      <Bench
        position={[
          -7.2,
          0,
          -9.5,
        ]}
      />

      <Bench
        position={[
          7.2,
          0,
          -9.5,
        ]}
      />

      {/* ===================================================
          VEGETACIÓN PUNTUAL
      =================================================== */}

      <Planter
        position={[
          -12,
          0,
          -27.8,
        ]}
      />

      <Planter
        position={[
          12,
          0,
          -27.8,
        ]}
      />

      <Planter
        position={[
          -12,
          0,
          -16,
        ]}
      />

      <Planter
        position={[
          12,
          0,
          -16,
        ]}
      />

      {/* ===================================================
          LUZ AMBIENTAL DE LA SALA

          Solo 3 luces reales.
          El resto del efecto viene de emissive.
      =================================================== */}

      <ambientLight
        intensity={0.28}
        color="#b8c7d5"
      />

      <pointLight
        position={[
          0,
          9,
          -24,
        ]}
        intensity={10}
        distance={28}
        decay={2}
        color="#8bcfff"
      />

      <pointLight
        position={[
          -14,
          7,
          -5,
        ]}
        intensity={7}
        distance={20}
        decay={2}
        color="#c58cff"
      />

      <pointLight
        position={[
          14,
          7,
          -5,
        ]}
        intensity={7}
        distance={20}
        decay={2}
        color="#ffc47c"
      />
    </group>
  );
}
