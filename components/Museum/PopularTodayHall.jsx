"use client";

import FeaturedVideoWall from "./FeaturedVideoWall";
import GameCoverMaterial from "./GameCoverTexture";

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

   DATOS:
   Freaky World API -> Supabase -> datos sincronizados IGDB

   IMPORTANTE:
   Estos 10 juegos todavía NO representan el algoritmo
   definitivo de "Populares Hoy".

   En esta fase estamos sustituyendo correctamente los
   juegos ficticios por datos reales de nuestra base.
========================================================= */

const ROOM_BACK_Z = -34.25;
const FINISHED_FLOOR_Y = 0.315;

/* =========================================================
   COLORES DE LOS 10 EXPOSITORES

   El color pertenece al diseño de la sala, no a IGDB.
========================================================= */

const ACCENTS = [
  {
    accent: "#d95cff",
    accentDark: "#421653",
  },
  {
    accent: "#29d9ff",
    accentDark: "#0a4555",
  },
  {
    accent: "#ff6947",
    accentDark: "#5e1e12",
  },
  {
    accent: "#3f8cff",
    accentDark: "#102b59",
  },
  {
    accent: "#c957ff",
    accentDark: "#3d1554",
  },
  {
    accent: "#42e8a1",
    accentDark: "#0c4e35",
  },
  {
    accent: "#ffb03f",
    accentDark: "#5d3810",
  },
  {
    accent: "#ff7647",
    accentDark: "#572012",
  },
  {
    accent: "#39bfff",
    accentDark: "#10415a",
  },
  {
    accent: "#f3ca57",
    accentDark: "#544315",
  },
];

/* =========================================================
   FALLBACK

   Solo aparece si /api/games falla.

   Esto evita que un problema de red deje la sala vacía.
========================================================= */

const FALLBACK_GAMES = Array.from(
  {
    length: 10,
  },
  (_, index) => ({
    id: `loading-${index + 1}`,
    rank: index + 1,
    title: "FREAKY WORLD",
    subtitle: "Cargando juego...",
    year: "",
    platform: "",
    score: "--",
    trend: "",
    cover: null,
    ...ACCENTS[index],
  })
);

/* =========================================================
   NORMALIZAR DATOS DE NUESTRA API
========================================================= */

function normalizeApiGame(
  game,
  index
) {
  const platforms =
    game.platforms
      ?.map(
        (platform) =>
          platform.abbreviation ||
          platform.name
      )
      .filter(Boolean)
      .slice(0, 4)
      .join(" · ") || "";

  const scoreValue =
    typeof game.totalRating ===
    "number"
      ? game.totalRating
      : typeof game.rating ===
        "number"
        ? game.rating
        : null;

  /*
    Nuestra API usa escala 0-100.
    Visualmente la sala usa escala 0-10.
  */

  const score =
    scoreValue !== null
      ? (
          Number(scoreValue) / 10
        ).toFixed(1)
      : "--";

  return {
    ...game,

    id: game.id,

    rank: index + 1,

    title:
      game.name ||
      "SIN TÍTULO",

    subtitle:
      game.developer ||
      game.publisher ||
      "Desarrollador desconocido",

    year:
      game.year
        ? String(game.year)
        : "",

    platform:
      platforms,

    score,

    /*
      No inventamos tendencias.

      Esto llegará cuando implementemos el sistema
      real de Populares Hoy.
    */

    trend: "",

    accent:
      ACCENTS[index]?.accent ||
      "#5fdcff",

    accentDark:
      ACCENTS[index]?.accentDark ||
      "#123b47",
  };
}

/* =========================================================
   CANVAS — PORTADA FALLBACK
========================================================= */

function createFallbackPosterTexture(
  game
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 640;
  canvas.height = 960;

  const ctx =
    canvas.getContext("2d");

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

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    640,
    960
  );

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

  ctx.globalAlpha = 1;

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

  ctx.textAlign = "right";

  ctx.font =
    "900 36px Arial";

  ctx.fillText(
    game.score,
    600,
    76
  );

  ctx.textAlign = "left";

  ctx.font =
    "900 52px Arial";

  ctx.fillStyle = "#ffffff";

  const words =
    game.title.split(" ");

  let line = "";
  let y = 730;

  words.forEach(
    (word) => {
      const test =
        `${line}${word} `;

      if (
        ctx.measureText(test)
          .width > 570 &&
        line
      ) {
        ctx.fillText(
          line.trim(),
          34,
          y
        );

        line =
          `${word} `;

        y += 58;
      } else {
        line = test;
      }
    }
  );

  ctx.fillText(
    line.trim(),
    34,
    y
  );

  ctx.font =
    "600 23px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.68)";

  ctx.fillText(
    game.subtitle,
    35,
    840
  );

  ctx.fillStyle =
    game.accent;

  ctx.fillRect(
    35,
    868,
    570,
    4
  );

  ctx.font =
    "700 19px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.78)";

  ctx.fillText(
    `${game.year}${
      game.year &&
      game.platform
        ? "  ·  "
        : ""
    }${game.platform}`,
    35,
    910
  );

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
    document.createElement(
      "canvas"
    );

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
      ? -29
      : 29;

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
   PORTADA REAL / FALLBACK
========================================================= */

function GamePoster({
  game,
}) {
  const fallbackTexture =
    useMemo(
      () =>
        createFallbackPosterTexture(
          game
        ),
      [game]
    );

  useEffect(() => {
    return () => {
      fallbackTexture.dispose();
    };
  }, [fallbackTexture]);

  const realCover =
    game.cover?.large ||
    game.cover?.medium ||
    null;

  if (realCover) {
    return (
      <GameCoverMaterial
        imageUrl={realCover}
        fallbackColor={
          game.accentDark
        }
      />
    );
  }

  return (
    <meshBasicMaterial
      map={fallbackTexture}
      toneMapped={false}
    />
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

      {/* PORTADA REAL */}

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

        <GamePoster
          game={game}
        />
      </mesh>

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
   ISLA CENTRAL
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
        text="TOP 10"
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
   TECHO
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
        <group key={z}>
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
   ILUMINACIÓN
========================================================= */

function GalleryLighting() {
  return (
    <group>
      <hemisphereLight
        intensity={0.58}
        color="#d9ecff"
        groundColor="#15100d"
      />

      <directionalLight
        position={[
          0,
          13,
          7,
        ]}
        intensity={1.25}
        color="#b9dcff"
      />

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
  const [
    games,
    setGames,
  ] = useState(
    FALLBACK_GAMES
  );

  /* =======================================================
     CARGAR DATOS REALES

     El navegador llama solamente a nuestra API.
     Las claves de Supabase e IGDB nunca llegan al cliente.
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadGames() {
      try {
        const response =
          await fetch(
            "/api/games",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `API respondió ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !data?.ok ||
          !Array.isArray(
            data.games
          )
        ) {
          throw new Error(
            "Respuesta de juegos inválida."
          );
        }

        const normalized =
          data.games
            .slice(0, 10)
            .map(
              (
                game,
                index
              ) =>
                normalizeApiGame(
                  game,
                  index
                )
            );

        if (
          active &&
          normalized.length ===
            10
        ) {
          setGames(
            normalized
          );
        }
      } catch (error) {
        /*
          No desmontamos la sala.

          Si la API falla, conservamos el fallback.
        */

        console.error(
          "[Freaky World / PopularTodayHall]",
          error
        );
      }
    }

    loadGames();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     POSICIONES DE LOS 10 EXPOSITORES
  ======================================================= */

  const stations =
    useMemo(
      () => [
        {
          game: games[0],
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
          game: games[1],
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
          game: games[2],
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
          game: games[3],
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
          game: games[4],
          position: [
            -25.3,
            0.3,
            15.2,
          ],
          rotation:
            Math.PI / 2,
          side: "left",
        },

        {
          game: games[5],
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
          game: games[6],
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
          game: games[7],
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
          game: games[8],
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
          game: games[9],
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
      [games]
    );

  return (
    <group>
      {/* ===================================================
          SUELO
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

      {/* GALERÍAS */}

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

      {/* JUEGOS */}

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

      <PremiumCeiling />

      <VideoStage />

      <TopTenIsland />

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

      <GalleryLighting />
    </group>
  );
}
