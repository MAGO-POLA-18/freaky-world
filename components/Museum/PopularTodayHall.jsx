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

const ROOM_HALF_WIDTH = 29.25;
const ROOM_BACK_Z = -34.25;

/* =========================================================
   VIDEO DIRECTO DE PRUEBA

   IMPORTANTE:
   este NO es YouTube.

   Es un MP4 real que Three.js puede convertir
   directamente en VideoTexture.
========================================================= */

const TEST_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

/* =========================================================
   VIDEO DESTACADO

   Seguimos enviándolo también a WorldScene
   para conservar la opción 2D.
========================================================= */

const FEATURED_VIDEO = {
  id:
    "featured-video-screen",

  overlayType:
    "video",

  title:
    "VIDEO DESTACADO",

  accent:
    "#58f1ff",

  accent2:
    "#8b5cff",

  description:
    "Pantalla multimedia principal de Freaky World.",

  youtubeEmbed:
    "https://www.youtube.com/embed/M7lc1UVf-VE?rel=0&playsinline=1",

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
   CREAR PORTADA PROCEDURAL
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

  /* =======================================================
     DECORACIÓN
  ======================================================= */

  ctx.globalAlpha =
    0.17;

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

  ctx.globalAlpha =
    0.1;

  ctx.beginPath();

  ctx.arc(
    100,
    440,
    210,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    0.17;

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

  /* =======================================================
     RANK
  ======================================================= */

  ctx.fillStyle =
    "rgba(0,0,0,.5)";

  ctx.beginPath();

  ctx.roundRect(
    28,
    28,
    90,
    54,
    16
  );

  ctx.fill();

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "800 28px Arial";

  ctx.fillText(
    `#${game.rank}`,
    47,
    65
  );

  /* =======================================================
     TÍTULO
  ======================================================= */

  ctx.font =
    "900 45px Arial";

  ctx.fillStyle =
    "#ffffff";

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
   PREVIEW DEL VIDEO
========================================================= */

function createVideoPreviewTexture() {
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
    "#061923"
  );

  gradient.addColorStop(
    0.5,
    "#24133e"
  );

  gradient.addColorStop(
    1,
    "#10070e"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    1280,
    720
  );

  /* =======================================================
     LUCES
  ======================================================= */

  ctx.globalAlpha =
    0.16;

  ctx.fillStyle =
    "#58f1ff";

  ctx.beginPath();

  ctx.arc(
    1050,
    140,
    250,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#ff4f95";

  ctx.beginPath();

  ctx.arc(
    160,
    620,
    280,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    1;

  /* =======================================================
     TEXTO
  ======================================================= */

  ctx.fillStyle =
    "#58f1ff";

  ctx.font =
    "800 38px Arial";

  ctx.fillText(
    "FREAKY WORLD",
    75,
    105
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 82px Arial";

  ctx.fillText(
    "VIDEO EN EL MUNDO",
    75,
    205
  );

  ctx.font =
    "500 31px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,.75)";

  ctx.fillText(
    "Tocá directamente la pantalla para reproducir",
    78,
    265
  );

  /* =======================================================
     BOTÓN PLAY
  ======================================================= */

  ctx.beginPath();

  ctx.fillStyle =
    "#ffffff";

  ctx.arc(
    640,
    440,
    78,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.fillStyle =
    "#11151a";

  ctx.moveTo(
    672,
    440
  );

  ctx.lineTo(
    618,
    403
  );

  ctx.lineTo(
    618,
    477
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
   NEON TEXT
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
    1024,
    256
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
    38;

  ctx.fillStyle =
    color;

  ctx.fillText(
    text,
    512,
    128
  );

  ctx.shadowBlur =
    10;

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
   ARCADE ICON
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
      Math.PI *
        0.22,
      Math.PI *
        1.78
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle =
      "#11151a";

    ctx.beginPath();

    ctx.arc(
      270,
      170,
      14,
      0,
      Math.PI *
        2
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
        pattern[0]
          .length *
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
            [
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
          2.4
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
   PANTALLA MP4 REAL

   ESTA ES LA PRUEBA IMPORTANTE.

   - El video es una textura real de Three.js.
   - No hay iframe dentro del mundo.
   - No hay Html de Drei.
   - Tocamos directamente la malla.
   - Sigue reproduciendo aunque nos alejemos.
========================================================= */

function HeroVideoWall() {
  const groupRef =
    useRef(null);

  const screenRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const videoTextureRef =
    useRef(null);

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const nearRef =
    useRef(false);

  const [
    near,
    setNear,
  ] =
    useState(false);

  const [
    playing,
    setPlaying,
  ] =
    useState(false);

  const [
    videoReady,
    setVideoReady,
  ] =
    useState(false);

  const [
    videoError,
    setVideoError,
  ] =
    useState(false);

  const previewTexture =
    useMemo(
      () =>
        createVideoPreviewTexture(),
      []
    );

  /* =======================================================
     CREAR ELEMENTO VIDEO + VIDEOTEXTURE
  ======================================================= */

  useEffect(() => {
    const video =
      document.createElement(
        "video"
      );

    video.src =
      TEST_VIDEO_URL;

    video.crossOrigin =
      "anonymous";

    video.playsInline =
      true;

    video.loop =
      true;

    video.preload =
      "auto";

    /*
      Arranca con audio permitido solo después
      del gesto del usuario.

      Para evitar problemas iniciales:
      muted = true.

      Después podemos agregar control de sonido.
    */

    video.muted =
      true;

    video.setAttribute(
      "playsinline",
      ""
    );

    video.setAttribute(
      "webkit-playsinline",
      ""
    );

    video.addEventListener(
      "canplay",
      () => {
        setVideoReady(
          true
        );
      }
    );

    video.addEventListener(
      "error",
      () => {
        setVideoError(
          true
        );
      }
    );

    const texture =
      new THREE.VideoTexture(
        video
      );

    texture.colorSpace =
      THREE.SRGBColorSpace;

    texture.minFilter =
      THREE.LinearFilter;

    texture.magFilter =
      THREE.LinearFilter;

    texture.generateMipmaps =
      false;

    videoRef.current =
      video;

    videoTextureRef.current =
      texture;

    return () => {
      video.pause();

      video.removeAttribute(
        "src"
      );

      video.load();

      texture.dispose();

      videoRef.current =
        null;

      videoTextureRef.current =
        null;
    };
  }, []);

  /* =======================================================
     PROXIMIDAD
  ======================================================= */

  useFrame(() => {
    if (
      !groupRef.current ||
      !playerRuntime.body
    ) {
      return;
    }

    groupRef.current.getWorldPosition(
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
      9;

    if (
      isNear !==
      nearRef.current
    ) {
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
    }

    /*
      Forzamos actualización del material
      cuando la textura aparece.
    */

    if (
      screenRef.current &&
      videoTextureRef.current &&
      playing
    ) {
      const material =
        screenRef.current
          .material;

      if (
        material.map !==
        videoTextureRef.current
      ) {
        material.map =
          videoTextureRef.current;

        material.needsUpdate =
          true;
      }
    }
  });

  /* =======================================================
     PLAY / PAUSE
  ======================================================= */

  const toggleVideo =
    async (
      event
    ) => {
      event?.stopPropagation?.();

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      try {
        if (
          video.paused
        ) {
          /*
            Esta llamada ocurre directamente
            desde el toque/click del usuario.
          */

          await video.play();

          setPlaying(
            true
          );

          if (
            screenRef.current &&
            videoTextureRef.current
          ) {
            screenRef.current
              .material.map =
              videoTextureRef.current;

            screenRef.current
              .material.needsUpdate =
              true;
          }
        } else {
          video.pause();

          setPlaying(
            false
          );

          if (
            screenRef.current
          ) {
            screenRef.current
              .material.map =
              previewTexture;

            screenRef.current
              .material.needsUpdate =
              true;
          }
        }
      } catch (
        error
      ) {
        console.error(
          "No se pudo reproducir el vídeo:",
          error
        );

        setVideoError(
          true
        );
      }
    };

  /* =======================================================
     CURSOR
  ======================================================= */

  const onPointerEnter =
    () => {
      document.body.style.cursor =
        "pointer";
    };

  const onPointerLeave =
    () => {
      document.body.style.cursor =
        "";
    };

  useEffect(() => {
    return () => {
      document.body.style.cursor =
        "";

      previewTexture.dispose();
    };
  }, [
    previewTexture,
  ]);

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -33.72,
      ]}
    >
      {/* ===================================================
          ESTRUCTURA
      =================================================== */}

      <RoundedBox
        position={[
          0,
          7.2,
          0,
        ]}
        args={[
          25.5,
          13.2,
          0.5,
        ]}
        radius={0.42}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#070b10"
          emissive={
            near
              ? "#58f1ff"
              : "#8b5cff"
          }
          emissiveIntensity={
            near
              ? 0.2
              : 0.07
          }
          roughness={0.28}
        />
      </RoundedBox>

      {/* ===================================================
          PANTALLA CLICKEABLE

          ESTA MISMA MALLA ES LA PANTALLA.
      =================================================== */}

      <mesh
        ref={screenRef}

        position={[
          0,
          7.2,
          0.28,
        ]}

        onPointerEnter={
          onPointerEnter
        }

        onPointerLeave={
          onPointerLeave
        }

        onPointerDown={
          toggleVideo
        }

        onClick={
          toggleVideo
        }
      >
        <planeGeometry
          args={[
            22.5,
            12.65,
          ]}
        />

        <meshBasicMaterial
          map={
            previewTexture
          }
          toneMapped={
            false
          }
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      {/* ===================================================
          MARCO NEÓN
      =================================================== */}

      <NeonLine
        position={[
          0,
          13.58,
          0.34,
        ]}
        size={[
          23,
          0.1,
          0.08,
        ]}
        color="#58f1ff"
      />

      <NeonLine
        position={[
          0,
          0.82,
          0.34,
        ]}
        size={[
          23,
          0.1,
          0.08,
        ]}
        color="#ff4f95"
      />

      {/* ===================================================
          INDICADOR DE ESTADO

          Estas pequeñas luces nos ayudan a saber
          si realmente detectó reproducción.
      =================================================== */}

      <mesh
        position={[
          -11.2,
          13.1,
          0.38,
        ]}
      >
        <sphereGeometry
          args={[
            0.13,
            16,
            16,
          ]}
        />

        <meshStandardMaterial
          color={
            videoError
              ? "#ff3b30"
              : playing
                ? "#34ff7b"
                : videoReady
                  ? "#58f1ff"
                  : "#ffca54"
          }
          emissive={
            videoError
              ? "#ff3b30"
              : playing
                ? "#34ff7b"
                : videoReady
                  ? "#58f1ff"
                  : "#ffca54"
          }
          emissiveIntensity={
            2
          }
        />
      </mesh>

      {/* ===================================================
          GLOW
      =================================================== */}

      {near && (
        <pointLight
          position={[
            0,
            7,
            3,
          ]}
          color="#58f1ff"
          intensity={
            playing
              ? 18
              : 10
          }
          distance={17}
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
     PANTALLAS LATERALES

     IMPORTANTE:
     no hay ninguna pantalla frente al muro de vídeo.
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
            -14,
            0.32,
            -26,
          ],

          rotation:
            Math.PI /
            3.1,

          scale:
            1.15,
        },
      ],
      []
    );

  /* =======================================================
     REVESTIMIENTO NEGRO
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
     LUCES DEL TECHO
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
          NEGRO
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
          TECHO
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
          TITULO
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

      {/* ===================================================
          TEXTOS ARCADE
      =================================================== */}

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
          ICONOS
      =================================================== */}

      <ArcadeIcon
        type="chomper"
        position={[
          -28.95,
          5,
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
          5.2,
          -12,
        ]}
        rotation={[
          0,
          -Math.PI /
            2,
          0,
        ]}
        size={5.4}
      />

      {/* ===================================================
          NEONES
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
          LUCES
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
          PANTALLAS DE JUEGOS
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
          VIDEO MP4 REAL
      =================================================== */}

      <HeroVideoWall />

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
