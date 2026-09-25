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

import * as THREE from "three";

import {
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   DIMENSIONES

   AHORA USAMOS CASI TODO EL EDIFICIO REAL.

   Ala:
   60 x 70 x 15 m

   No hacemos una segunda caja interior.
========================================================= */

const ROOM_HALF_WIDTH = 29.25;

const ROOM_FRONT_Z = 34;
const ROOM_BACK_Z = -34.25;

/* =========================================================
   VIDEO DESTACADO

   El mismo vídeo funciona:

   1) directamente sobre la pantalla del mundo
   2) en el overlay 2D existente
========================================================= */

const FEATURED_VIDEO = {
  id: "featured-video-screen",

  overlayType:
    "video",

  title:
    "VIDEO DESTACADO",

  accent:
    "#58f1ff",

  accent2:
    "#8b5cff",

  description:
    "Pantalla multimedia de Freaky World. El vídeo puede reproducirse dentro de la sala mientras seguís recorriendo el mundo o abrirse en la interfaz 2D.",

  youtubeEmbed:
    "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&rel=0&playsinline=1",

  youtubePage:
    "https://www.youtube.com/watch?v=M7lc1UVf-VE",
};

/* =========================================================
   JUEGOS FICTICIOS
========================================================= */

const GAMES = [
  {
    id:
      "mock-neon-district",

    mock:
      true,

    rank:
      1,

    title:
      "NEON DISTRICT",

    subtitle:
      "Nightfall Studios",

    year:
      "2027",

    genre:
      "Acción · Mundo abierto",

    platform:
      "PS5 · Xbox · PC",

    score:
      "9.4",

    accent:
      "#ff4f95",

    accent2:
      "#7d44ff",

    description:
      "Una enorme ciudad nocturna donde cada distrito cambia según tus decisiones y reputación.",
  },

  {
    id:
      "mock-echoes",

    mock:
      true,

    rank:
      2,

    title:
      "ECHOES",

    subtitle:
      "North Shore Games",

    year:
      "2026",

    genre:
      "Aventura",

    platform:
      "PS5 · PC",

    score:
      "9.1",

    accent:
      "#5ab8ff",

    accent2:
      "#275c9b",

    description:
      "Exploración narrativa en un archipiélago abandonado donde el entorno reconstruye recuerdos.",
  },

  {
    id:
      "mock-red-horizon",

    mock:
      true,

    rank:
      3,

    title:
      "RED HORIZON",

    subtitle:
      "Atlas Interactive",

    year:
      "2026",

    genre:
      "RPG · Ciencia ficción",

    platform:
      "Xbox · PC",

    score:
      "8.9",

    accent:
      "#ff7b34",

    accent2:
      "#b83a2d",

    description:
      "Una colonia marciana dividida entre corporaciones, exploradores y nuevos asentamientos.",
  },

  {
    id:
      "mock-void-runner",

    mock:
      true,

    rank:
      4,

    title:
      "VOID RUNNER",

    subtitle:
      "Pulse Works",

    year:
      "2026",

    genre:
      "Acción",

    platform:
      "PS5 · Xbox · PC",

    score:
      "8.8",

    accent:
      "#3ee8c2",

    accent2:
      "#16647c",

    description:
      "Combate rápido, estaciones orbitales y recorridos que cambian en cada partida.",
  },

  {
    id:
      "mock-last-signal",

    mock:
      true,

    rank:
      5,

    title:
      "THE LAST SIGNAL",

    subtitle:
      "Silent Peak",

    year:
      "2026",

    genre:
      "Terror",

    platform:
      "PS5 · PC",

    score:
      "8.7",

    accent:
      "#ca8dff",

    accent2:
      "#5a3b88",

    description:
      "Una señal desconocida conduce a una estación científica que debería llevar años vacía.",
  },

  {
    id:
      "mock-iron-kingdom",

    mock:
      true,

    rank:
      6,

    title:
      "IRON KINGDOM",

    subtitle:
      "Oak Forge",

    year:
      "2025",

    genre:
      "RPG",

    platform:
      "Switch 2 · PC",

    score:
      "8.6",

    accent:
      "#e6bd59",

    accent2:
      "#705f32",

    description:
      "Reinos mecánicos, fortalezas móviles y un sistema de combate centrado en armas modulares.",
  },

  {
    id:
      "mock-deep-blue",

    mock:
      true,

    rank:
      7,

    title:
      "DEEP BLUE",

    subtitle:
      "Drift Studios",

    year:
      "2026",

    genre:
      "Exploración",

    platform:
      "PS5 · Xbox",

    score:
      "8.5",

    accent:
      "#45b8ff",

    accent2:
      "#15456e",

    description:
      "Exploración submarina en un océano alienígena lleno de estructuras imposibles.",
  },

  {
    id:
      "mock-black-sun",

    mock:
      true,

    rank:
      8,

    title:
      "BLACK SUN",

    subtitle:
      "Orbital Games",

    year:
      "2026",

    genre:
      "Estrategia",

    platform:
      "PC",

    score:
      "8.4",

    accent:
      "#ffca54",

    accent2:
      "#903b42",

    description:
      "Construcción de civilizaciones alrededor de una estrella que comienza a apagarse.",
  },

  {
    id:
      "mock-dust-road",

    mock:
      true,

    rank:
      9,

    title:
      "DUST ROAD",

    subtitle:
      "Nomad Interactive",

    year:
      "2025",

    genre:
      "Supervivencia",

    platform:
      "Xbox · PC",

    score:
      "8.2",

    accent:
      "#d69255",

    accent2:
      "#714433",

    description:
      "Carreteras infinitas, vehículos modificables y asentamientos repartidos por el desierto.",
  },

  {
    id:
      "mock-lumina",

    mock:
      true,

    rank:
      10,

    title:
      "LUMINA",

    subtitle:
      "Small Moon",

    year:
      "2026",

    genre:
      "Plataformas",

    platform:
      "Switch 2",

    score:
      "8.1",

    accent:
      "#75e3ab",

    accent2:
      "#3284a0",

    description:
      "Un viaje colorido por pequeños mundos conectados mediante portales de luz.",
  },
];

/* =========================================================
   PORTADA DE JUEGO
========================================================= */

function createPosterTexture(
  game
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    512;

  canvas.height =
    768;

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
    "#070a10"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    512,
    768
  );

  /* formas */

  ctx.globalAlpha =
    0.16;

  ctx.fillStyle =
    "#ffffff";

  ctx.beginPath();

  ctx.arc(
    390,
    160,
    150,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    0.1;

  ctx.beginPath();

  ctx.arc(
    110,
    420,
    210,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    0.15;

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

  ctx.globalAlpha =
    1;

  /* número */

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

  /* título */

  ctx.font =
    "900 45px Arial";

  const words =
    game.title.split(
      " "
    );

  let line =
    "";

  let y =
    590;

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

        y +=
          50;
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

  texture.anisotropy =
    4;

  return texture;
}

/* =========================================================
   PREVIEW DEL MURO DE VIDEO
========================================================= */

function createVideoWallTexture() {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    1280;

  canvas.height =
    720;

  const ctx =
    canvas.getContext(
      "2d"
    );

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      1280,
      720
    );

  gradient.addColorStop(
    0,
    "#071923"
  );

  gradient.addColorStop(
    0.48,
    "#21113c"
  );

  gradient.addColorStop(
    1,
    "#120711"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    1280,
    720
  );

  /* decoración */

  ctx.globalAlpha =
    0.14;

  ctx.fillStyle =
    "#58f1ff";

  ctx.beginPath();

  ctx.arc(
    1060,
    150,
    240,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#ff4f95";

  ctx.beginPath();

  ctx.arc(
    170,
    610,
    280,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    1;

  ctx.fillStyle =
    "#5cf2ff";

  ctx.font =
    "800 38px Arial";

  ctx.fillText(
    "FREAKY WORLD",
    75,
    100
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 82px Arial";

  ctx.fillText(
    "VIDEO DESTACADO",
    75,
    205
  );

  ctx.font =
    "500 31px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,.72)";

  ctx.fillText(
    "Reproducilo acá o abrilo en pantalla completa",
    78,
    265
  );

  /* play */

  ctx.beginPath();

  ctx.fillStyle =
    "rgba(255,255,255,.94)";

  ctx.arc(
    640,
    435,
    72,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.fillStyle =
    "#11151a";

  ctx.moveTo(
    668,
    435
  );

  ctx.lineTo(
    620,
    402
  );

  ctx.lineTo(
    620,
    468
  );

  ctx.closePath();

  ctx.fill();

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy =
    4;

  return texture;
}

/* =========================================================
   NEON TEXTURE
========================================================= */

function createNeonTextTexture({
  text,
  color,
}) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    1024;

  canvas.height =
    256;

  const ctx =
    canvas.getContext(
      "2d"
    );

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.font =
    "900 112px Arial";

  ctx.shadowColor =
    color;

  ctx.shadowBlur =
    40;

  ctx.fillStyle =
    color;

  ctx.fillText(
    text,
    512,
    128
  );

  ctx.shadowBlur =
    12;

  ctx.fillStyle =
    "#ffffff";

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
   ARCADE ART

   Decoración simple:
   círculo tipo arcade + invasor pixel.
========================================================= */

function createArcadeArtTexture(
  type
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    512;

  canvas.height =
    512;

  const ctx =
    canvas.getContext(
      "2d"
    );

  ctx.clearRect(
    0,
    0,
    512,
    512
  );

  if (
    type ===
    "chomper"
  ) {
    ctx.shadowColor =
      "#ffe44f";

    ctx.shadowBlur =
      35;

    ctx.fillStyle =
      "#ffe44f";

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

    ctx.fillStyle =
      "#101015";

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
    const pixel =
      34;

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

    ctx.shadowColor =
      "#7cf4ff";

    ctx.shadowBlur =
      25;

    ctx.fillStyle =
      "#7cf4ff";

    const startX =
      (
        512 -
        pattern[0].length *
          pixel
      ) /
      2;

    const startY =
      120;

    pattern.forEach(
      (
        row,
        rowIndex
      ) => {
        row
          .split("")
          .forEach(
            (
              value,
              colIndex
            ) => {
              if (
                value ===
                "1"
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
  metalness = 0,
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
    if (
      !ref.current
    ) {
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

        ref.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate =
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
   NEON LINE
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
  color =
    "#58f1ff",
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
          2.5
        }
        roughness={0.15}
      />
    </mesh>
  );
}

/* =========================================================
   NEON WORD
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
        createNeonTextTexture({
          text,
          color,
        }),
      [
        text,
        color,
      ]
    );

  useEffect(() => {
    return () =>
      texture.dispose();
  }, [
    texture,
  ]);

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
        toneMapped={
          false
        }
        side={
          THREE.DoubleSide
        }
      />
    </mesh>
  );
}

/* =========================================================
   ARCADE ICON
========================================================= */

function ArcadeIcon({
  type,
  position,
  rotation = [
    0,
    0,
    0,
  ],
  size = 4,
}) {
  const texture =
    useMemo(
      () =>
        createArcadeArtTexture(
          type
        ),
      [
        type,
      ]
    );

  useEffect(() => {
    return () =>
      texture.dispose();
  }, [
    texture,
  ]);

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
        toneMapped={
          false
        }
        side={
          THREE.DoubleSide
        }
      />
    </mesh>
  );
}

/* =========================================================
   ESTACIÓN
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
    return () =>
      poster.dispose();
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
      4.8 *
        scale;

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
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#151a20"
          roughness={0.62}
        />
      </RoundedBox>

      {/* SOPORTE */}

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
          roughness={0.55}
        />
      </RoundedBox>

      {/* MARCO */}

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
        castShadow
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
          roughness={0.3}
        />
      </RoundedBox>

      {/* PORTADA */}

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
          toneMapped={
            false
          }
        />
      </mesh>

      {near && (
        <pointLight
          position={[
            0,
            4.3,
            1.5,
          ]}
          color={
            game.accent
          }
          intensity={8}
          distance={7}
          decay={2}
        />
      )}
    </group>
  );
}

/* =========================================================
   GRAN PANTALLA DE VIDEO

   ESTA ES LA PARTE NUEVA.

   - preview en 3D
   - botón REPRODUCIR AQUÍ
   - iframe pegado al muro
   - sigue reproduciendo aunque te alejes
   - opción 2D sigue funcionando mediante WorldScene
========================================================= */

function HeroVideoWall() {
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

  const [
    playing3D,
    setPlaying3D,
  ] =
    useState(false);

  const screenTexture =
    useMemo(
      () =>
        createVideoWallTexture(),
      []
    );

  useEffect(() => {
    return () =>
      screenTexture.dispose();
  }, [
    screenTexture,
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
      8;

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
                  game:
                    FEATURED_VIDEO,
                }
              : {
                  near:
                    false,
                  game:
                    FEATURED_VIDEO,
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
        -33.75,
      ]}
    >
      {/* ===================================================
          GRAN ESTRUCTURA

          Formato casi 16:9.
      =================================================== */}

      <RoundedBox
        position={[
          0,
          7.25,
          0,
        ]}
        args={[
          24.5,
          13,
          0.48,
        ]}
        radius={0.42}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#090d12"
          emissive="#8b5cff"
          emissiveIntensity={
            near
              ? 0.2
              : 0.07
          }
          roughness={0.3}
        />
      </RoundedBox>

      {/* ===================================================
          PREVIEW 3D

          Se oculta cuando empieza YouTube.
      =================================================== */}

      {!playing3D && (
        <mesh
          position={[
            0,
            7.25,
            0.27,
          ]}
        >
          <planeGeometry
            args={[
              21,
              11.8,
            ]}
          />

          <meshBasicMaterial
            map={
              screenTexture
            }
            toneMapped={
              false
            }
          />
        </mesh>
      )}

      {/* ===================================================
          YOUTUBE DENTRO DEL MUNDO

          840px x 472px
          escalado a:
          ~21m x 11.8m

          Mantiene el iframe montado aunque caminemos.
      =================================================== */}

      {playing3D && (
        <Html
          transform
          position={[
            0,
            7.25,
            0.29,
          ]}
          scale={
            0.025
          }
          zIndexRange={[
            30,
            30,
          ]}
          style={{
            width:
              "840px",

            height:
              "472px",

            overflow:
              "hidden",

            background:
              "#000",

            borderRadius:
              "10px",

            boxShadow:
              "0 0 35px rgba(88,241,255,.35)",
          }}
        >
          <iframe
            src={
              FEATURED_VIDEO
                .youtubeEmbed
            }
            title="Freaky World Video Wall"
            width="840"
            height="472"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            style={{
              display:
                "block",

              width:
                "840px",

              height:
                "472px",

              border:
                0,

              background:
                "#000",
            }}
          />
        </Html>
      )}

      {/* ===================================================
          BOTÓN SOBRE LA PANTALLA

          Solo aparece:
          - cuando estamos cerca
          - antes de reproducir
      =================================================== */}

      {near &&
        !playing3D && (
          <Html
            transform
            position={[
              0,
              4.4,
              0.5,
            ]}
            scale={
              0.014
            }
            zIndexRange={[
              40,
              40,
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

                setPlaying3D(
                  true
                );
              }}

              style={{
                width:
                  "310px",

                padding:
                  "18px 24px",

                borderRadius:
                  "999px",

                border:
                  "2px solid rgba(255,255,255,.5)",

                background:
                  "rgba(5,9,13,.94)",

                color:
                  "#ffffff",

                fontSize:
                  "20px",

                fontWeight:
                  900,

                letterSpacing:
                  ".05em",

                boxShadow:
                  "0 10px 40px rgba(0,0,0,.5)",

                touchAction:
                  "manipulation",
              }}
            >
              ▶ REPRODUCIR AQUÍ
            </button>
          </Html>
        )}

      {/* ===================================================
          DETENER

          Solo visible cuando nos volvemos a acercar.
      =================================================== */}

      {near &&
        playing3D && (
          <Html
            transform
            position={[
              0,
              1.15,
              0.55,
            ]}
            scale={
              0.011
            }
            zIndexRange={[
              40,
              40,
            ]}
          >
            <button
              type="button"

              onPointerDown={(
                event
              ) => {
                event.stopPropagation();
              }}

              onClick={(
                event
              ) => {
                event.stopPropagation();

                setPlaying3D(
                  false
                );
              }}

              style={{
                width:
                  "220px",

                padding:
                  "14px 18px",

                borderRadius:
                  "999px",

                border:
                  "1px solid rgba(255,255,255,.35)",

                background:
                  "rgba(5,9,13,.9)",

                color:
                  "#fff",

                fontWeight:
                  800,

                fontSize:
                  "17px",
              }}
            >
              DETENER VIDEO
            </button>
          </Html>
        )}

      {/* ===================================================
          NEON DEL MARCO
      =================================================== */}

      <NeonLine
        position={[
          0,
          13.6,
          0.34,
        ]}
        size={[
          22,
          0.09,
          0.08,
        ]}
        color="#58f1ff"
      />

      <NeonLine
        position={[
          0,
          0.9,
          0.34,
        ]}
        size={[
          22,
          0.09,
          0.08,
        ]}
        color="#ff4f95"
      />

      {near && (
        <pointLight
          position={[
            0,
            7,
            3,
          ]}
          color="#58f1ff"
          intensity={16}
          distance={16}
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
  /* =======================================================
     PANTALLAS

     IMPORTANTE:

     GAMES[0] — NEON DISTRICT —
     YA NO ESTÁ EN EL CENTRO.

     TOP 1 queda reservado para el futuro.

     Frente a la gran pantalla no hay nada.
  ======================================================= */

  const stationLayout =
    useMemo(
      () => [
        {
          game:
            GAMES[9],

          position: [
            -22,
            0.32,
            22,
          ],

          rotation:
            Math.PI /
            2.25,

          scale:
            1.05,
        },

        {
          game:
            GAMES[8],

          position: [
            22,
            0.32,
            22,
          ],

          rotation:
            -Math.PI /
            2.25,

          scale:
            1.05,
        },

        {
          game:
            GAMES[7],

          position: [
            -23,
            0.32,
            10,
          ],

          rotation:
            Math.PI /
            2.12,

          scale:
            1.08,
        },

        {
          game:
            GAMES[6],

          position: [
            23,
            0.32,
            10,
          ],

          rotation:
            -Math.PI /
            2.12,

          scale:
            1.08,
        },

        {
          game:
            GAMES[5],

          position: [
            -23,
            0.32,
            -3,
          ],

          rotation:
            Math.PI /
            2.08,

          scale:
            1.1,
        },

        {
          game:
            GAMES[4],

          position: [
            23,
            0.32,
            -3,
          ],

          rotation:
            -Math.PI /
            2.08,

          scale:
            1.1,
        },

        {
          game:
            GAMES[3],

          position: [
            -21,
            0.32,
            -17,
          ],

          rotation:
            Math.PI /
            2.3,

          scale:
            1.13,
        },

        {
          game:
            GAMES[2],

          position: [
            21,
            0.32,
            -17,
          ],

          rotation:
            -Math.PI /
            2.3,

          scale:
            1.13,
        },

        {
          game:
            GAMES[1],

          position: [
            -13,
            0.32,
            -25,
          ],

          rotation:
            Math.PI /
            3,

          scale:
            1.16,
        },
      ],
      []
    );

  /* =======================================================
     REVESTIMIENTOS NEGROS

     Pegados prácticamente a la carcasa real.

     Ya no queda el corredor muerto detrás.
  ======================================================= */

  const blackWalls =
    useMemo(
      () => [
        {
          position: [
            -ROOM_HALF_WIDTH,
            7,
            0,
          ],

          scale: [
            0.14,
            13.5,
            68,
          ],
        },

        {
          position: [
            ROOM_HALF_WIDTH,
            7,
            0,
          ],

          scale: [
            0.14,
            13.5,
            68,
          ],
        },

        {
          position: [
            0,
            7,
            ROOM_BACK_Z,
          ],

          scale: [
            58.5,
            13.5,
            0.14,
          ],
        },
      ],
      []
    );

  /* =======================================================
     SUELO

     Una capa mínima sobre el suelo existente.
  ======================================================= */

  const floor =
    useMemo(
      () => [
        {
          position: [
            0,
            0.325,
            0,
          ],

          scale: [
            58.2,
            0.025,
            68,
          ],
        },
      ],
      []
    );

  /* =======================================================
     RIELES DE TECHO
  ======================================================= */

  const ceilingLights =
    useMemo(
      () => [
        {
          position: [
            -15,
            12.3,
            13,
          ],

          scale: [
            0.16,
            0.12,
            34,
          ],
        },

        {
          position: [
            15,
            12.3,
            13,
          ],

          scale: [
            0.16,
            0.12,
            34,
          ],
        },

        {
          position: [
            -8,
            12.3,
            -20,
          ],

          scale: [
            0.16,
            0.12,
            20,
          ],
        },

        {
          position: [
            8,
            12.3,
            -20,
          ],

          scale: [
            0.16,
            0.12,
            20,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          INTERIOR NEGRO
      =================================================== */}

      <InstancedBoxes
        items={
          blackWalls
        }
        color="#05080c"
        roughness={0.9}
      />

      <InstancedBoxes
        items={
          floor
        }
        color="#080c11"
        roughness={0.7}
      />

      {/* ===================================================
          ILUMINACIÓN DE TECHO
      =================================================== */}

      <InstancedBoxes
        items={
          ceilingLights
        }
        color="#ffffff"
        roughness={0.1}
        emissive="#ffffff"
        emissiveIntensity={1.6}
        receiveShadow={false}
      />

      {/* ===================================================
          TÍTULOS NEÓN REALES
      =================================================== */}

      <NeonWord
        text="POPULARES HOY"
        color="#58f1ff"
        position={[
          0,
          10.8,
          29,
        ]}
        width={15}
        height={3}
      />

      <NeonWord
        text="INSERT COIN"
        color="#ff4f95"
        position={[
          -29,
          8,
          18,
        ]}
        rotation={[
          0,
          Math.PI /
            2,
          0,
        ]}
        width={8}
        height={2}
      />

      <NeonWord
        text="LEVEL UP"
        color="#8b5cff"
        position={[
          29,
          8,
          8,
        ]}
        rotation={[
          0,
          -Math.PI /
            2,
          0,
        ]}
        width={7}
        height={2}
      />

      <NeonWord
        text="PLAY"
        color="#ffe44f"
        position={[
          -29,
          8,
          -16,
        ]}
        rotation={[
          0,
          Math.PI /
            2,
          0,
        ]}
        width={5}
        height={2}
      />

      {/* ===================================================
          ARCADE ART
      =================================================== */}

      <ArcadeIcon
        type="chomper"
        position={[
          -28.95,
          5.2,
          2,
        ]}
        rotation={[
          0,
          Math.PI /
            2,
          0,
        ]}
        size={5}
      />

      <ArcadeIcon
        type="invader"
        position={[
          28.95,
          5.5,
          -12,
        ]}
        rotation={[
          0,
          -Math.PI /
            2,
          0,
        ]}
        size={5.5}
      />

      {/* ===================================================
          LÍNEAS DE NEÓN
      =================================================== */}

      <NeonLine
        position={[
          -29,
          11,
          0,
        ]}
        rotation={[
          0,
          Math.PI /
            2,
          0,
        ]}
        size={[
          42,
          0.07,
          0.07,
        ]}
        color="#58f1ff"
      />

      <NeonLine
        position={[
          29,
          11,
          0,
        ]}
        rotation={[
          0,
          Math.PI /
            2,
          0,
        ]}
        size={[
          42,
          0.07,
          0.07,
        ]}
        color="#ff4f95"
      />

      {/* ===================================================
          LUZ AMBIENTE
      =================================================== */}

      <pointLight
        position={[
          0,
          10,
          22,
        ]}
        color="#dff8ff"
        intensity={30}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          -12,
          9,
          2,
        ]}
        color="#59eaff"
        intensity={18}
        distance={20}
        decay={2}
      />

      <pointLight
        position={[
          12,
          9,
          -6,
        ]}
        color="#ff62ad"
        intensity={18}
        distance={20}
        decay={2}
      />

      {/* ===================================================
          JUEGOS LATERALES

          Ya no hay ninguno delante del video.
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
          VIDEO WALL

          ÚNICO ELEMENTO FRONTAL DEL FONDO.
      =================================================== */}

      <HeroVideoWall />

      {/* ===================================================
          FÍSICA
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
                1.9 *
                  station.scale,

                0.42,

                0.8 *
                  station.scale,
              ]}
              position={[
                station
                  .position[0],

                0.8,

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
    </group>
  );
}
