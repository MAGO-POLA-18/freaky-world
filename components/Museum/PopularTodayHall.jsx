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
   PANTALLA DE VÍDEO
========================================================= */

const FEATURED_VIDEO = {
  id: "featured-video-screen",
  overlayType: "video",
  title: "FEATURED VIDEO WALL",
  accent: "#58f1ff",
  accent2: "#8b5cff",
  description:
    "Pantalla gigante de la sala principal. Al abrirla se muestra un vídeo de YouTube embebido y desde el propio reproductor se puede ampliar a pantalla completa.",
  youtubeEmbed:
    "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&rel=0&playsinline=1",
  youtubePage:
    "https://www.youtube.com/watch?v=M7lc1UVf-VE",
};

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
    accent: "#ff4f95",
    accent2: "#7d44ff",
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
    accent: "#5ab8ff",
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
    accent: "#ff7b34",
    accent2: "#b83a2d",
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
    accent: "#3ee8c2",
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
    accent: "#ca8dff",
    accent2: "#5a3b88",
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
];

/* =========================================================
   PORTADA
========================================================= */

function createPosterTexture(
  game
) {
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
    0.52,
    game.accent2
  );
  gradient.addColorStop(
    1,
    "#070a10"
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 768);

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#ffffff";

  ctx.beginPath();
  ctx.arc(
    390,
    160,
    150,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.globalAlpha = 0.11;
  ctx.beginPath();
  ctx.arc(
    110,
    420,
    210,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(512, 260);
  ctx.lineTo(512, 410);
  ctx.lineTo(0, 620);
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

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 27px Arial";
  ctx.fillText(
    `#${game.rank}`,
    46,
    63
  );

  ctx.font = "900 45px Arial";
  const words =
    game.title.split(" ");

  let line = "";
  let y = 590;

  words.forEach((word) => {
    const test = `${line}${word} `;
    if (
      ctx.measureText(test)
        .width > 450 &&
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
      line = test;
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
  texture.anisotropy = 4;

  return texture;
}

/* =========================================================
   PREVIEW DE VÍDEO
========================================================= */

function createVideoWallTexture() {
  const canvas =
    document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 576;

  const ctx =
    canvas.getContext("2d");

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      1024,
      576
    );

  gradient.addColorStop(
    0,
    "#10141c"
  );
  gradient.addColorStop(
    0.5,
    "#1b1030"
  );
  gradient.addColorStop(
    1,
    "#071018"
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 576);

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#58f1ff";
  ctx.fillRect(
    72,
    72,
    350,
    190
  );

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#ff4f95";
  ctx.fillRect(
    622,
    105,
    280,
    150
  );

  ctx.globalAlpha = 1;

  ctx.fillStyle = "#5cf2ff";
  ctx.font = "800 34px Arial";
  ctx.fillText(
    "FREAKY WORLD",
    70,
    80
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 64px Arial";
  ctx.fillText(
    "FEATURED VIDEO WALL",
    70,
    155
  );

  ctx.font = "500 28px Arial";
  ctx.fillStyle =
    "rgba(255,255,255,.75)";
  ctx.fillText(
    "Embebido de YouTube con opción de pantalla completa",
    72,
    205
  );

  /* play button */
  ctx.beginPath();
  ctx.fillStyle =
    "rgba(255,255,255,.92)";
  ctx.arc(
    512,
    330,
    64,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#101215";
  ctx.moveTo(535, 330);
  ctx.lineTo(492, 302);
  ctx.lineTo(492, 358);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle =
    "rgba(255,255,255,.85)";
  ctx.font = "700 26px Arial";
  ctx.fillText(
    "Pulsa para abrir el vídeo",
    390,
    455
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
  metalness = 0,
  emissive = "#000000",
  emissiveIntensity = 0,
  receiveShadow = true,
}) {
  const ref =
    useRef(null);

  const dummy =
    useMemo(
      () => new THREE.Object3D(),
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

    ref.current.instanceMatrix.needsUpdate =
      true;
  }, [items, dummy]);

  return (
    <instancedMesh
      ref={ref}
      args={[
        null,
        null,
        items.length,
      ]}
      receiveShadow={receiveShadow}
    >
      <boxGeometry
        args={[1, 1, 1]}
      />

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
   DECORACIÓN NEÓN
========================================================= */

function NeonLine({
  position,
  rotation = [0, 0, 0],
  size = [6, 0.08, 0.08],
  color = "#58f1ff",
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.4}
        roughness={0.15}
        metalness={0.15}
      />
    </mesh>
  );
}

function NeonSign({
  position,
  width = 4.5,
  height = 1.2,
  color = "#ff4f95",
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[
          width,
          height,
          0.1,
        ]}
        radius={0.12}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#0f1319"
          emissive={color}
          emissiveIntensity={0.12}
          roughness={0.35}
        />
      </RoundedBox>

      <RoundedBox
        position={[0, 0, 0.06]}
        args={[
          width * 0.83,
          height * 0.42,
          0.05,
        ]}
        radius={0.08}
        smoothness={3}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.9}
          roughness={0.2}
        />
      </RoundedBox>
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
  const ref =
    useRef(null);

  const nearRef =
    useRef(false);

  const worldPosition =
    useMemo(
      () => new THREE.Vector3(),
      []
    );

  const [near, setNear] =
    useState(false);

  const poster =
    useMemo(
      () =>
        createPosterTexture(game),
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
      distance < 4.6 * scale;

    if (
      isNear ===
      nearRef.current
    ) {
      return;
    }

    nearRef.current = isNear;
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
                near: false,
                game,
              },
            }
          )
        );
      }
    };
  }, [game]);

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
          0.26,
          0,
        ]}
        args={[
          3.5,
          0.42,
          1.4,
        ]}
        radius={0.14}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#171d23"
          roughness={0.62}
        />
      </RoundedBox>

      {/* soporte */}
      <RoundedBox
        position={[
          0,
          1.18,
          0,
        ]}
        args={[
          1.05,
          1.55,
          0.32,
        ]}
        radius={0.12}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#303a43"
          roughness={0.55}
        />
      </RoundedBox>

      {/* pantalla grande */}
      <RoundedBox
        position={[
          0,
          4.4,
          0,
        ]}
        args={[
          3.4,
          5.6,
          0.24,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={
            near
              ? "#14181f"
              : "#12161b"
          }
          emissive={game.accent}
          emissiveIntensity={
            near ? 0.3 : 0.08
          }
          roughness={0.28}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          4.4,
          0.135,
        ]}
      >
        <planeGeometry
          args={[
            3.02,
            5.14,
          ]}
        />
        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {near && (
        <pointLight
          position={[
            0,
            4.25,
            1.3,
          ]}
          color={game.accent}
          intensity={8}
          distance={6}
          decay={2}
        />
      )}
    </group>
  );
}

/* =========================================================
   HERO VIDEO WALL
========================================================= */

function HeroVideoWall() {
  const ref =
    useRef(null);

  const nearRef =
    useRef(false);

  const worldPosition =
    useMemo(
      () => new THREE.Vector3(),
      []
    );

  const [near, setNear] =
    useState(false);

  const screenTexture =
    useMemo(
      () =>
        createVideoWallTexture(),
      []
    );

  useEffect(() => {
    return () => {
      screenTexture.dispose();
    };
  }, [screenTexture]);

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
      distance < 7.5;

    if (
      isNear ===
      nearRef.current
    ) {
      return;
    }

    nearRef.current = isNear;
    setNear(isNear);

    window.dispatchEvent(
      new CustomEvent(
        "freaky:game-near",
        {
          detail: isNear
            ? {
                near: true,
                game: FEATURED_VIDEO,
              }
            : {
                near: false,
                game: FEATURED_VIDEO,
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
        -22.8,
      ]}
    >
      {/* estructura */}
      <RoundedBox
        position={[
          0,
          6.4,
          0,
        ]}
        args={[
          24,
          10.5,
          0.45,
        ]}
        radius={0.4}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#10161d"
          emissive={
            near
              ? "#5cf2ff"
              : "#8b5cff"
          }
          emissiveIntensity={
            near ? 0.14 : 0.06
          }
          roughness={0.32}
        />
      </RoundedBox>

      {/* borde neón */}
      <RoundedBox
        position={[
          0,
          6.4,
          0.23,
        ]}
        args={[
          22.8,
          9.3,
          0.08,
        ]}
        radius={0.28}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#141920"
          emissive="#ff4f95"
          emissiveIntensity={0.28}
          roughness={0.22}
        />
      </RoundedBox>

      {/* contenido */}
      <mesh
        position={[
          0,
          6.4,
          0.28,
        ]}
      >
        <planeGeometry
          args={[
            21,
            7.6,
          ]}
        />
        <meshBasicMaterial
          map={screenTexture}
          toneMapped={false}
        />
      </mesh>

      {/* play neon */}
      <mesh
        position={[
          0,
          6.4,
          0.36,
        ]}
      >
        <circleGeometry
          args={[0.82, 40]}
        />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.8}
        />
      </mesh>

      <mesh
        position={[
          0.12,
          6.4,
          0.37,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
      >
        <coneGeometry
          args={[
            0.36,
            0.62,
            3,
          ]}
        />
        <meshStandardMaterial
          color="#101215"
          emissive="#101215"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* glow */}
      {near && (
        <pointLight
          position={[
            0,
            6.4,
            2.2,
          ]}
          color="#5cf2ff"
          intensity={16}
          distance={14}
          decay={2}
        />
      )}
    </group>
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  const stationLayout =
    useMemo(
      () => [
        {
          game: GAMES[8],
          position: [
            -14.5,
            0.32,
            15,
          ],
          rotation:
            Math.PI / 2.4,
          scale: 1.08,
        },
        {
          game: GAMES[7],
          position: [
            14.5,
            0.32,
            15,
          ],
          rotation:
            -Math.PI / 2.4,
          scale: 1.08,
        },
        {
          game: GAMES[6],
          position: [
            -15,
            0.32,
            5,
          ],
          rotation:
            Math.PI / 2.15,
          scale: 1.1,
        },
        {
          game: GAMES[5],
          position: [
            15,
            0.32,
            5,
          ],
          rotation:
            -Math.PI / 2.15,
          scale: 1.1,
        },
        {
          game: GAMES[4],
          position: [
            -14.8,
            0.32,
            -6,
          ],
          rotation:
            Math.PI / 2.05,
          scale: 1.12,
        },
        {
          game: GAMES[3],
          position: [
            14.8,
            0.32,
            -6,
          ],
          rotation:
            -Math.PI / 2.05,
          scale: 1.12,
        },
        {
          game: GAMES[2],
          position: [
            -11.2,
            0.32,
            -16,
          ],
          rotation:
            Math.PI / 2.65,
          scale: 1.18,
        },
        {
          game: GAMES[1],
          position: [
            11.2,
            0.32,
            -16,
          ],
          rotation:
            -Math.PI / 2.65,
          scale: 1.18,
        },
        {
          game: GAMES[0],
          position: [
            0,
            0.32,
            -11.5,
          ],
          rotation: 0,
          scale: 1.22,
        },
      ],
      []
    );

  const sideWalls =
    useMemo(
      () => [
        {
          position: [
            -ROOM_HALF_WIDTH,
            5.8,
            1,
          ],
          scale: [
            0.18,
            11.4,
            52,
          ],
        },
        {
          position: [
            ROOM_HALF_WIDTH,
            5.8,
            1,
          ],
          scale: [
            0.18,
            11.4,
            52,
          ],
        },
        {
          position: [
            0,
            5.8,
            ROOM_BACK_Z,
          ],
          scale: [
            ROOM_HALF_WIDTH * 2,
            11.4,
            0.18,
          ],
        },
      ],
      []
    );

  const floorZones =
    useMemo(
      () => [
        {
          position: [
            0,
            0.05,
            1,
          ],
          scale: [
            36.6,
            0.1,
            52,
          ],
        },
        {
          position: [
            0,
            0.09,
            3.5,
          ],
          scale: [
            10.5,
            0.02,
            33,
          ],
        },
      ],
      []
    );

  const ceilingLightBars =
    useMemo(
      () => [
        {
          position: [
            -11,
            10.2,
            12,
          ],
          scale: [
            0.13,
            0.12,
            19,
          ],
        },
        {
          position: [
            11,
            10.2,
            12,
          ],
          scale: [
            0.13,
            0.12,
            19,
          ],
        },
        {
          position: [
            -7,
            10.2,
            -8,
          ],
          scale: [
            0.13,
            0.12,
            16,
          ],
        },
        {
          position: [
            7,
            10.2,
            -8,
          ],
          scale: [
            0.13,
            0.12,
            16,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* paredes negras */}
      <InstancedBoxes
        items={sideWalls}
        color="#070b10"
        roughness={0.88}
      />

      {/* suelos */}
      <InstancedBoxes
        items={[
          floorZones[0],
        ]}
        color="#06090d"
        roughness={0.92}
      />

      <InstancedBoxes
        items={[
          floorZones[1],
        ]}
        color="#0f141b"
        roughness={0.55}
        emissive="#58f1ff"
        emissiveIntensity={0.08}
      />

      {/* puerta */}
      <RoundedBox
        position={[
          -5.3,
          3.25,
          23,
        ]}
        args={[
          0.65,
          5.9,
          0.8,
        ]}
        radius={0.2}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#161c23"
          emissive="#5cf2ff"
          emissiveIntensity={0.18}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          5.3,
          3.25,
          23,
        ]}
        args={[
          0.65,
          5.9,
          0.8,
        ]}
        radius={0.2}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#161c23"
          emissive="#ff4f95"
          emissiveIntensity={0.18}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          5.95,
          23,
        ]}
        args={[
          11,
          0.55,
          0.8,
        ]}
        radius={0.2}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#161c23"
          emissive="#8b5cff"
          emissiveIntensity={0.18}
        />
      </RoundedBox>

      {/* techo con barras */}
      <InstancedBoxes
        items={ceilingLightBars}
        color="#ffffff"
        roughness={0.12}
        emissive="#ffffff"
        emissiveIntensity={1.7}
        receiveShadow={false}
      />

      {/* neones laterales */}
      <NeonLine
        position={[
          -17.7,
          7.5,
          2,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
        size={[
          18,
          0.08,
          0.08,
        ]}
        color="#5cf2ff"
      />

      <NeonLine
        position={[
          17.7,
          7.5,
          -1,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
        size={[
          18,
          0.08,
          0.08,
        ]}
        color="#ff4f95"
      />

      <NeonLine
        position={[
          -6,
          9.8,
          20,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
        size={[
          8,
          0.08,
          0.08,
        ]}
        color="#8b5cff"
      />

      <NeonLine
        position={[
          6,
          9.8,
          20,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
        size={[
          8,
          0.08,
          0.08,
        ]}
        color="#5cf2ff"
      />

      {/* “carteles” tipo arcade */}
      <NeonSign
        position={[
          -10,
          8.1,
          20.7,
        ]}
        width={5.2}
        height={1.4}
        color="#ff4f95"
      />

      <NeonSign
        position={[
          10,
          8.1,
          20.7,
        ]}
        width={5.2}
        height={1.4}
        color="#5cf2ff"
      />

      {/* luces generales */}
      <pointLight
        position={[
          0,
          9.5,
          17,
        ]}
        color="#ffffff"
        intensity={34}
        distance={22}
        decay={2}
      />

      <pointLight
        position={[
          0,
          9.5,
          0,
        ]}
        color="#b9dfff"
        intensity={26}
        distance={25}
        decay={2}
      />

      <pointLight
        position={[
          0,
          9,
          -15,
        ]}
        color="#ffc7ef"
        intensity={24}
        distance={22}
        decay={2}
      />

      {/* pantallas laterales */}
      {stationLayout.map(
        (station) => (
          <GameStation
            key={station.game.id}
            game={station.game}
            position={
              station.position
            }
            rotation={
              station.rotation
            }
            scale={station.scale}
          />
        )
      )}

      {/* gran pantalla final */}
      <HeroVideoWall />

      {/* colisiones */}
      <RigidBody
        type="fixed"
        colliders={false}
      >
        {stationLayout.map(
          (station) => (
            <CuboidCollider
              key={
                station.game.id
              }
              args={[
                1.8 *
                  station.scale,
                0.4,
                0.8 *
                  station.scale,
              ]}
              position={[
                station.position[0],
                0.78,
                station.position[2],
              ]}
              rotation={[
                0,
                station.rotation,
                0,
              ]}
            />
          )
        )}

        <CuboidCollider
          args={[
            12,
            0.6,
            0.7,
          ]}
          position={[
            0,
            0.7,
            -22.8,
          ]}
        />
      </RigidBody>
    </group>
  );
}
