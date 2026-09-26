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
  useThree,
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
   CONFIG
========================================================= */

const ROOM_HALF_WIDTH =
  29.25;

const ROOM_BACK_Z =
  -34.25;

const FEATURED_VIDEO_URL =
  "https://www.youtube.com/watch?v=M7lc1UVf-VE";

const FEATURED_VIDEO = {
  id:
    "featured-video-screen",

  overlayType:
    "video",

  sourceType:
    "youtube",

  title:
    "VIDEO DESTACADO",

  accent:
    "#58f1ff",

  accent2:
    "#8b5cff",

  description:
    "Pantalla multimedia principal de Freaky World.",

  videoUrl:
    FEATURED_VIDEO_URL,
};

function getYouTubeId(
  url
) {
  if (!url) {
    return null;
  }

  try {
    const parsed =
      new URL(url);

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      return parsed.pathname
        .replace("/", "")
        .split("/")[0];
    }

    if (
      parsed.pathname.startsWith(
        "/shorts/"
      )
    ) {
      return parsed.pathname
        .split("/shorts/")[1]
        ?.split("/")[0];
    }

    if (
      parsed.pathname.startsWith(
        "/embed/"
      )
    ) {
      return parsed.pathname
        .split("/embed/")[1]
        ?.split("/")[0];
    }

    return parsed.searchParams.get(
      "v"
    );
  } catch {
    return null;
  }
}

/* =========================================================
   JUEGOS
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
      "AcciÃ³n Â· Mundo abierto",

    platform:
      "PS5 Â· Xbox Â· PC",

    score:
      "9.4",

    accent:
      "#ff4f95",

    accent2:
      "#7d44ff",

    description:
      "Una enorme ciudad nocturna donde cada distrito cambia segÃºn tus decisiones.",
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
      "PS5 Â· PC",

    score:
      "9.1",

    accent:
      "#5ab8ff",

    accent2:
      "#275c9b",

    description:
      "ExploraciÃ³n narrativa en un archipiÃ©lago abandonado.",
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
      "RPG Â· Ciencia ficciÃ³n",

    platform:
      "Xbox Â· PC",

    score:
      "8.9",

    accent:
      "#ff7b34",

    accent2:
      "#b83a2d",

    description:
      "Una colonia marciana dividida entre corporaciones y exploradores.",
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
      "AcciÃ³n",

    platform:
      "PS5 Â· Xbox Â· PC",

    score:
      "8.8",

    accent:
      "#3ee8c2",

    accent2:
      "#16647c",

    description:
      "Combate rÃ¡pido y estaciones orbitales.",
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
      "PS5 Â· PC",

    score:
      "8.7",

    accent:
      "#ca8dff",

    accent2:
      "#5a3b88",

    description:
      "Una seÃ±al conduce a una estaciÃ³n cientÃ­fica abandonada.",
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
      "Switch 2 Â· PC",

    score:
      "8.6",

    accent:
      "#e6bd59",

    accent2:
      "#705f32",

    description:
      "Reinos mecÃ¡nicos y fortalezas mÃ³viles.",
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
      "ExploraciÃ³n",

    platform:
      "PS5 Â· Xbox",

    score:
      "8.5",

    accent:
      "#45b8ff",

    accent2:
      "#15456e",

    description:
      "ExploraciÃ³n submarina en un ocÃ©ano alienÃ­gena.",
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
      "Civilizaciones alrededor de una estrella que se apaga.",
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
      "Xbox Â· PC",

    score:
      "8.2",

    accent:
      "#d69255",

    accent2:
      "#714433",

    description:
      "VehÃ­culos modificables y carreteras infinitas.",
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
      "Mundos conectados mediante portales de luz.",
  },
];

/* =========================================================
   POSTER
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
    0.55,
    game.accent2
  );

  gradient.addColorStop(
    1,
    "#05070a"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    512,
    768
  );

  ctx.globalAlpha =
    0.15;

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
    420,
    200,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.globalAlpha =
    1;

  ctx.fillStyle =
    "rgba(0,0,0,.5)";

  ctx.fillRect(
    28,
    28,
    90,
    54
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "800 28px Arial";

  ctx.fillText(
    `#${game.rank}`,
    47,
    65
  );

  ctx.font =
    "900 44px Arial";

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
      const next =
        `${line}${word} `;

      if (
        ctx.measureText(
          next
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
          next;
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

  return texture;
}

/* =========================================================
   VIDEO PREVIEW
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
    "#04151d"
  );

  gradient.addColorStop(
    0.48,
    "#24123c"
  );

  gradient.addColorStop(
    1,
    "#10060d"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    1280,
    720
  );

  ctx.globalAlpha =
    0.16;

  ctx.fillStyle =
    "#58f1ff";

  ctx.beginPath();

  ctx.arc(
    1030,
    130,
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

  ctx.fillStyle =
    "#58f1ff";

  ctx.font =
    "800 38px Arial";

  ctx.fillText(
    "FREAKY WORLD",
    70,
    100
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 78px Arial";

  ctx.fillText(
    "VIDEO DESTACADO",
    70,
    205
  );

  ctx.font =
    "600 30px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,.78)";

  ctx.fillText(
    "ACERCATE PARA INTERACTUAR",
    72,
    275
  );

  ctx.beginPath();

  ctx.fillStyle =
    "#ffffff";

  ctx.arc(
    640,
    445,
    80,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.fillStyle =
    "#11151a";

  ctx.moveTo(
    675,
    445
  );

  ctx.lineTo(
    618,
    407
  );

  ctx.lineTo(
    618,
    483
  );

  ctx.closePath();

  ctx.fill();

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

/* =========================================================
   NEON TEXT
========================================================= */

function createNeonTextTexture(
  text,
  color
) {
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

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.font =
    "900 108px Arial";

  ctx.shadowColor =
    color;

  ctx.shadowBlur =
    35;

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
   ARCADE
========================================================= */

function createArcadeTexture(
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
  emissive = "#000000",
  emissiveIntensity = 0,
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
        color={
          color
        }
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
   NEON
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
      position={
        position
      }
      rotation={
        rotation
      }
    >
      <boxGeometry
        args={size}
      />

      <meshStandardMaterial
        color={
          color
        }
        emissive={
          color
        }
        emissiveIntensity={
          2.4
        }
      />
    </mesh>
  );
}

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
  }, [
    texture,
  ]);

  return (
    <mesh
      position={
        position
      }
      rotation={
        rotation
      }
    >
      <planeGeometry
        args={[
          width,
          height,
        ]}
      />

      <meshBasicMaterial
        map={
          texture
        }
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
      [
        type,
      ]
    );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [
    texture,
  ]);

  return (
    <mesh
      position={
        position
      }
      rotation={
        rotation
      }
    >
      <planeGeometry
        args={[
          size,
          size,
        ]}
      />

      <meshBasicMaterial
        map={
          texture
        }
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
   GAME STATION
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

    ref.current
      .getWorldPosition(
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

  return (
    <group
      ref={
        ref
      }
      position={
        position
      }
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
        radius={
          0.15
        }
        smoothness={
          3
        }
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
        radius={
          0.12
        }
        smoothness={
          3
        }
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
        radius={
          0.22
        }
        smoothness={
          4
        }
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
          map={
            poster
          }
          toneMapped={
            false
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   VIDEO WALL

   YA NO CREA UN VIDEO.

   BUSCA EL VIDEO HTML REAL DE WorldScene
   Y CREA LA TEXTURA CON ESE MISMO ELEMENTO.
========================================================= */

function HeroVideoWall() {
  const groupRef =
    useRef(null);

  const screenRef =
    useRef(null);

  const youtubeOverlayRef =
    useRef(null);

  const youtubePlayerRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const videoTextureRef =
    useRef(null);

  const nearRef =
    useRef(false);

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const screenCorners =
    useMemo(
      () => [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ],
      []
    );

  const screenCenter =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const {
    camera,
    size,
  } =
    useThree();

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
    started,
    setStarted,
  ] =
    useState(false);

  const [
    ready,
    setReady,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] =
    useState(0);

  const [
    duration,
    setDuration,
  ] =
    useState(0);

  const [
    youtubeMountEl,
    setYoutubeMountEl,
  ] =
    useState(null);

  const previewTexture =
    useMemo(
      () =>
        createVideoPreviewTexture(),
      []
    );

  const isYouTube =
    FEATURED_VIDEO.sourceType ===
    "youtube";

  const youtubeId =
    useMemo(
      () =>
        getYouTubeId(
          FEATURED_VIDEO.videoUrl
        ),
      []
    );

  const formatTime =
    (
      value
    ) => {
      const safe =
        Number.isFinite(
          value
        )
          ? Math.max(
              0,
              Math.floor(
                value
              )
            )
          : 0;

      const minutes =
        Math.floor(
          safe / 60
        );

      const seconds =
        safe % 60;

      return `${minutes}:${String(
        seconds
      ).padStart(
        2,
        "0"
      )}`;
    };

  const solvePerspective =
    (
      destination
    ) => {
      const source = [
        [
          0,
          0,
        ],
        [
          1280,
          0,
        ],
        [
          1280,
          720,
        ],
        [
          0,
          720,
        ],
      ];

      const matrix =
        [];

      for (
        let index = 0;
        index < 4;
        index += 1
      ) {
        const [
          x,
          y,
        ] =
          source[
            index
          ];

        const [
          u,
          v,
        ] =
          destination[
            index
          ];

        matrix.push([
          x,
          y,
          1,
          0,
          0,
          0,
          -u * x,
          -u * y,
          u,
        ]);

        matrix.push([
          0,
          0,
          0,
          x,
          y,
          1,
          -v * x,
          -v * y,
          v,
        ]);
      }

      for (
        let column = 0;
        column < 8;
        column += 1
      ) {
        let pivot =
          column;

        for (
          let row =
            column + 1;
          row < 8;
          row += 1
        ) {
          if (
            Math.abs(
              matrix[row][column]
            ) >
            Math.abs(
              matrix[pivot][column]
            )
          ) {
            pivot =
              row;
          }
        }

        if (
          Math.abs(
            matrix[pivot][column]
          ) <
          1e-8
        ) {
          return null;
        }

        if (
          pivot !==
          column
        ) {
          const temp =
            matrix[column];

          matrix[column] =
            matrix[pivot];

          matrix[pivot] =
            temp;
        }

        const divisor =
          matrix[column][column];

        for (
          let col =
            column;
          col < 9;
          col += 1
        ) {
          matrix[column][col] /=
            divisor;
        }

        for (
          let row = 0;
          row < 8;
          row += 1
        ) {
          if (
            row ===
            column
          ) {
            continue;
          }

          const factor =
            matrix[row][column];

          for (
            let col =
              column;
            col < 9;
            col += 1
          ) {
            matrix[row][col] -=
              factor *
              matrix[column][col];
          }
        }
      }

      const values =
        matrix.map(
          (
            row
          ) =>
            row[8]
        );

      const [
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
      ] =
        values;

      return `matrix3d(${[
        a,
        d,
        0,
        g,

        b,
        e,
        0,
        h,

        0,
        0,
        1,
        0,

        c,
        f,
        0,
        1,
      ].join(
        ","
      )})`;
    };

  const publishYouTubeState =
    (
      isPlaying,
      ended = false
    ) => {
      setPlaying(
        isPlaying
      );

      window.dispatchEvent(
        new CustomEvent(
          "freaky:youtube-state",
          {
            detail: {
              playing:
                isPlaying,

              ended,
            },
          }
        )
      );
    };

  const playYouTube =
    () => {
      const player =
        youtubePlayerRef.current;

      if (!player) {
        return;
      }

      setStarted(
        true
      );

      publishYouTubeState(
        true
      );

      try {
        player.playVideo();
      } catch {
        publishYouTubeState(
          false
        );
      }
    };

  const pauseYouTube =
    () => {
      const player =
        youtubePlayerRef.current;

      if (!player) {
        return;
      }

      try {
        player.pauseVideo();
      } catch {
        // nada
      }

      publishYouTubeState(
        false
      );
    };

  const seekYouTubeBy =
    (
      seconds
    ) => {
      const player =
        youtubePlayerRef.current;

      if (!player) {
        return;
      }

      try {
        const now =
          player.getCurrentTime?.() ??
          0;

        const total =
          player.getDuration?.() ??
          0;

        const next =
          Math.max(
            0,
            total > 0
              ? Math.min(
                  total,
                  now +
                    seconds
                )
              : now +
                seconds
          );

        player.seekTo(
          next,
          true
        );

        setCurrentTime(
          next
        );
      } catch {
        // nada
      }
    };

  const seekYouTubeTo =
    (
      value
    ) => {
      const player =
        youtubePlayerRef.current;

      if (!player) {
        return;
      }

      const next =
        Number(
          value
        );

      if (
        !Number.isFinite(
          next
        )
      ) {
        return;
      }

      try {
        player.seekTo(
          next,
          true
        );

        setCurrentTime(
          next
        );
      } catch {
        // nada
      }
    };

  /* =======================================================
     VIDEO LOCAL
  ======================================================= */

  useEffect(() => {
    if (isYouTube) {
      return;
    }

    const video =
      document.getElementById(
        "freaky-featured-video"
      );

    if (
      !video ||
      !(
        video instanceof
        HTMLVideoElement
      )
    ) {
      setError(
        true
      );

      return;
    }

    videoRef.current =
      video;

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

    videoTextureRef.current =
      texture;

    const showVideo =
      () => {
        if (
          screenRef.current
        ) {
          screenRef.current
            .material.map =
            texture;

          screenRef.current
            .material
            .needsUpdate =
            true;
        }

        setPlaying(
          true
        );

        setError(
          false
        );
      };

    const showPreview =
      () => {
        if (
          screenRef.current
        ) {
          screenRef.current
            .material.map =
            previewTexture;

          screenRef.current
            .material
            .needsUpdate =
            true;
        }

        setPlaying(
          false
        );
      };

    const handleCanPlay =
      () => {
        setReady(
          true
        );
      };

    const handlePlay =
      () => {
        showVideo();
      };

    const handlePlaying =
      () => {
        showVideo();
      };

    const handlePause =
      () => {
        showPreview();
      };

    const handleEnded =
      () => {
        showPreview();
      };

    const handleError =
      () => {
        showPreview();

        setError(
          true
        );
      };

    video.addEventListener(
      "canplay",
      handleCanPlay
    );

    video.addEventListener(
      "loadeddata",
      handleCanPlay
    );

    video.addEventListener(
      "play",
      handlePlay
    );

    video.addEventListener(
      "playing",
      handlePlaying
    );

    video.addEventListener(
      "pause",
      handlePause
    );

    video.addEventListener(
      "ended",
      handleEnded
    );

    video.addEventListener(
      "error",
      handleError
    );

    if (
      video.readyState >=
      3
    ) {
      setReady(
        true
      );
    }

    if (
      !video.paused &&
      !video.ended
    ) {
      showVideo();
    }

    return () => {
      video.removeEventListener(
        "canplay",
        handleCanPlay
      );

      video.removeEventListener(
        "loadeddata",
        handleCanPlay
      );

      video.removeEventListener(
        "play",
        handlePlay
      );

      video.removeEventListener(
        "playing",
        handlePlaying
      );

      video.removeEventListener(
        "pause",
        handlePause
      );

      video.removeEventListener(
        "ended",
        handleEnded
      );

      video.removeEventListener(
        "error",
        handleError
      );

      texture.dispose();

      videoTextureRef.current =
        null;

      videoRef.current =
        null;
    };
  }, [
    isYouTube,
    previewTexture,
  ]);

  /* =======================================================
     YOUTUBE PLAYER
  ======================================================= */

  useEffect(() => {
    if (
      !isYouTube ||
      !youtubeId ||
      !youtubeMountEl
    ) {
      return;
    }

    let cancelled =
      false;

    let commandHandler =
      null;

    let waitForApi =
      null;

    const createPlayer =
      () => {
        if (
          cancelled ||
          !window.YT?.Player ||
          youtubePlayerRef.current ||
          !youtubeMountEl
        ) {
          return;
        }

        try {
          youtubePlayerRef.current =
            new window.YT.Player(
              youtubeMountEl,
              {
                videoId:
                  youtubeId,

                width:
                  "1280",

                height:
                  "720",

                playerVars: {
                  autoplay:
                    0,

                  controls:
                    0,

                  playsinline:
                    1,

                  rel:
                    0,

                  modestbranding:
                    1,

                  fs:
                    0,

                  iv_load_policy:
                    3,
                },

                events: {
                  onReady:
                    (
                      event
                    ) => {
                      if (
                        cancelled
                      ) {
                        return;
                      }

                      setReady(
                        true
                      );

                      setError(
                        false
                      );

                      try {
                        const total =
                          event.target
                            .getDuration?.();

                        if (
                          Number.isFinite(
                            total
                          )
                        ) {
                          setDuration(
                            total
                          );
                        }

                        const iframe =
                          event.target
                            .getIframe();

                        iframe.style.width =
                          "100%";

                        iframe.style.height =
                          "100%";

                        iframe.style.display =
                          "block";

                        iframe.style.border =
                          "0";

                        iframe.style.pointerEvents =
                          "none";
                      } catch {
                        // nada
                      }
                    },

                  onStateChange:
                    (
                      event
                    ) => {
                      if (
                        cancelled
                      ) {
                        return;
                      }

                      const state =
                        event.data;

                      if (
                        state ===
                        window.YT.PlayerState.PLAYING
                      ) {
                        setStarted(
                          true
                        );

                        setReady(
                          true
                        );

                        setError(
                          false
                        );

                        publishYouTubeState(
                          true
                        );

                        return;
                      }

                      if (
                        state ===
                        window.YT.PlayerState.ENDED
                      ) {
                        try {
                          event.target.seekTo(
                            0,
                            true
                          );

                          event.target.pauseVideo();
                        } catch {
                          // nada
                        }

                        setCurrentTime(
                          0
                        );

                        setStarted(
                          false
                        );

                        publishYouTubeState(
                          false,
                          true
                        );

                        return;
                      }

                      if (
                        state ===
                          window.YT.PlayerState.PAUSED ||
                        state ===
                          window.YT.PlayerState.CUED
                      ) {
                        publishYouTubeState(
                          false
                        );
                      }
                    },

                  onError:
                    () => {
                      if (
                        cancelled
                      ) {
                        return;
                      }

                      setError(
                        true
                      );

                      publishYouTubeState(
                        false
                      );
                    },
                },
              }
            );
        } catch (
          playerError
        ) {
          console.error(
            "FREAKY YOUTUBE PLAYER ERROR:",
            playerError
          );

          setError(
            true
          );
        }
      };

    commandHandler =
      (
        event
      ) => {
        const command =
          event.detail
            ?.command;

        if (
          command ===
          "play"
        ) {
          const player =
            youtubePlayerRef.current;

          if (!player) {
            return;
          }

          setStarted(
            true
          );

          publishYouTubeState(
            true
          );

          try {
            player.playVideo();
          } catch {
            publishYouTubeState(
              false
            );

            setError(
              true
            );
          }

          return;
        }

        if (
          command ===
          "stop"
        ) {
          const player =
            youtubePlayerRef.current;

          if (!player) {
            return;
          }

          try {
            player.pauseVideo();
          } catch {
            // nada
          }

          publishYouTubeState(
            false
          );
        }
      };

    window.addEventListener(
      "freaky:youtube-command",
      commandHandler
    );

    if (
      window.YT?.Player
    ) {
      createPlayer();
    } else {
      const scriptId =
        "youtube-iframe-api";

      let script =
        document.getElementById(
          scriptId
        );

      const previousReady =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady =
        () => {
          if (
            typeof previousReady ===
            "function"
          ) {
            try {
              previousReady();
            } catch {
              // nada
            }
          }

          createPlayer();
        };

      if (!script) {
        script =
          document.createElement(
            "script"
          );

        script.id =
          scriptId;

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async =
          true;

        document.head.appendChild(
          script
        );
      }

      waitForApi =
        window.setInterval(
          () => {
            if (
              window.YT
                ?.Player
            ) {
              window.clearInterval(
                waitForApi
              );

              waitForApi =
                null;

              createPlayer();
            }
          },
          100
        );
    }

    return () => {
      cancelled =
        true;

      if (
        waitForApi
      ) {
        window.clearInterval(
          waitForApi
        );
      }

      if (
        commandHandler
      ) {
        window.removeEventListener(
          "freaky:youtube-command",
          commandHandler
        );
      }

      try {
        youtubePlayerRef.current
          ?.destroy?.();
      } catch {
        // nada
      }

      youtubePlayerRef.current =
        null;
    };
  }, [
    isYouTube,
    youtubeId,
    youtubeMountEl,
  ]);

  /* =======================================================
     TIEMPO / BARRA
  ======================================================= */

  useEffect(() => {
    if (!isYouTube) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          const player =
            youtubePlayerRef.current;

          if (!player) {
            return;
          }

          try {
            const now =
              player.getCurrentTime?.();

            const total =
              player.getDuration?.();

            if (
              Number.isFinite(
                now
              )
            ) {
              setCurrentTime(
                now
              );
            }

            if (
              Number.isFinite(
                total
              ) &&
              total > 0
            ) {
              setDuration(
                total
              );
            }
          } catch {
            // nada
          }
        },
        300
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    isYouTube,
  ]);

  useEffect(() => {
    return () => {
      previewTexture.dispose();
    };
  }, [
    previewTexture,
  ]);

  /* =======================================================
     FRAME
  ======================================================= */

  useFrame(() => {
    if (
      groupRef.current &&
      isYouTube &&
      youtubeOverlayRef.current
    ) {
      const halfW =
        22.5 /
        2;

      const halfH =
        12.65 /
        2;

      const localZ =
        0.37;

      screenCorners[0].set(
        -halfW,
        7.2 + halfH,
        localZ
      );

      screenCorners[1].set(
        halfW,
        7.2 + halfH,
        localZ
      );

      screenCorners[2].set(
        halfW,
        7.2 - halfH,
        localZ
      );

      screenCorners[3].set(
        -halfW,
        7.2 - halfH,
        localZ
      );

      const destination =
        [];

      for (
        let index = 0;
        index <
        screenCorners.length;
        index += 1
      ) {
        const point =
          screenCorners[
            index
          ];

        groupRef.current
          .localToWorld(
            point
          );

        point.project(
          camera
        );

        destination.push([
          (
            point.x *
              0.5 +
            0.5
          ) *
            size.width,

          (
            -point.y *
              0.5 +
            0.5
          ) *
            size.height,
        ]);
      }

      screenCenter.set(
        0,
        7.2,
        localZ
      );

      groupRef.current
        .localToWorld(
          screenCenter
        );

      screenCenter.project(
        camera
      );

      const transform =
        solvePerspective(
          destination
        );

      const overlay =
        youtubeOverlayRef.current;

      const visible =
        started &&
        transform &&
        screenCenter.z >
          -1 &&
        screenCenter.z <
          1;

      overlay.style.display =
        visible
          ? "block"
          : "none";

      if (
        visible &&
        transform
      ) {
        overlay.style.transform =
          transform;
      }
    }

    if (
      !groupRef.current ||
      !playerRuntime.body
    ) {
      return;
    }

    groupRef.current
      .getWorldPosition(
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
      12;

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

    if (
      isNear &&
      isYouTube
    ) {
      window.dispatchEvent(
        new CustomEvent(
          "freaky:youtube-state",
          {
            detail: {
              playing,
            },
          }
        )
      );
    }
  });

  return (
    <group
      ref={
        groupRef
      }
      position={[
        0,
        0,
        -33.72,
      ]}
    >
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
        radius={
          0.42
        }
        smoothness={
          4
        }
      >
        <meshStandardMaterial
          color="#070b10"
          emissive={
            error
              ? "#ff2020"
              : playing
                ? "#35ff7d"
                : near
                  ? "#58f1ff"
                  : "#8b5cff"
          }
          emissiveIntensity={
            playing
              ? 0.22
              : 0.08
          }
        />
      </RoundedBox>

      <mesh
        ref={
          screenRef
        }
        position={[
          0,
          7.2,
          0.28,
        ]}
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

      {isYouTube &&
        youtubeId && (
          <Html
            fullscreen
            zIndexRange={[
              30,
              0,
            ]}
            style={{
              pointerEvents:
                "none",
            }}
          >
            <div
              ref={
                youtubeOverlayRef
              }
              style={{
                position:
                  "absolute",

                left:
                  0,

                top:
                  0,

                width:
                  "1280px",

                height:
                  "720px",

                display:
                  "none",

                transformOrigin:
                  "0 0",

                overflow:
                  "hidden",

                background:
                  "#000",

                pointerEvents:
                  "none",

                willChange:
                  "transform",
              }}
            >
              <div
                ref={
                  setYoutubeMountEl
                }
                style={{
                  position:
                    "absolute",

                  inset:
                    0,

                  width:
                    "100%",

                  height:
                    "100%",

                  pointerEvents:
                    "none",
                }}
              />

              {near && (
                <div
                  style={{
                    position:
                      "absolute",

                    left:
                      "28px",

                    right:
                      "28px",

                    bottom:
                      "24px",

                    padding:
                      "18px 20px",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "14px",

                    borderRadius:
                      "16px",

                    background:
                      "rgba(5,8,12,.78)",

                    backdropFilter:
                      "blur(12px)",

                    WebkitBackdropFilter:
                      "blur(12px)",

                    border:
                      "1px solid rgba(255,255,255,.18)",

                    pointerEvents:
                      "auto",
                  }}
                  onPointerDown={
                    (
                      event
                    ) => {
                      event.stopPropagation();
                    }
                  }
                  onClick={
                    (
                      event
                    ) => {
                      event.stopPropagation();
                    }
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      seekYouTubeBy(
                        -10
                      )
                    }
                    style={{
                      height:
                        "46px",

                      padding:
                        "0 16px",

                      border:
                        "1px solid rgba(255,255,255,.2)",

                      borderRadius:
                        "12px",

                      background:
                        "rgba(255,255,255,.08)",

                      color:
                        "#fff",

                      fontWeight:
                        800,
                    }}
                  >
                    â10 s
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        playing
                      ) {
                        pauseYouTube();
                      } else {
                        playYouTube();
                      }
                    }}
                    style={{
                      height:
                        "46px",

                      minWidth:
                        "150px",

                      padding:
                        "0 18px",

                      border:
                        "1px solid rgba(255,255,255,.25)",

                      borderRadius:
                        "12px",

                      background:
                        playing
                          ? "rgba(145,20,35,.94)"
                          : "rgba(18,90,105,.94)",

                      color:
                        "#fff",

                      fontWeight:
                        900,
                    }}
                  >
                    {playing
                      ? "ââ Pausar"
                      : "â¶ Reproducir"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      seekYouTubeBy(
                        10
                      )
                    }
                    style={{
                      height:
                        "46px",

                      padding:
                        "0 16px",

                      border:
                        "1px solid rgba(255,255,255,.2)",

                      borderRadius:
                        "12px",

                      background:
                        "rgba(255,255,255,.08)",

                      color:
                        "#fff",

                      fontWeight:
                        800,
                    }}
                  >
                    +10 s
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={
                      duration >
                      0
                        ? duration
                        : 1
                    }
                    step="0.1"
                    value={
                      Math.min(
                        currentTime,
                        duration >
                          0
                          ? duration
                          : 1
                      )
                    }
                    onChange={
                      (
                        event
                      ) =>
                        seekYouTubeTo(
                          event.target
                            .value
                        )
                    }
                    style={{
                      flex:
                        "1 1 auto",

                      minWidth:
                        "180px",
                    }}
                  />

                  <div
                    style={{
                      minWidth:
                        "112px",

                      textAlign:
                        "right",

                      color:
                        "#fff",

                      fontSize:
                        "18px",

                      fontWeight:
                        800,

                      fontVariantNumeric:
                        "tabular-nums",

                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {formatTime(
                      currentTime
                    )}
                    {" / "}
                    {formatTime(
                      duration
                    )}
                  </div>
                </div>
              )}
            </div>
          </Html>
        )}

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
        color={
          playing
            ? "#35ff7d"
            : "#58f1ff"
        }
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
        color={
          error
            ? "#ff2020"
            : "#ff4f95"
        }
      />

      <mesh
        position={[
          -11.15,
          13,
          0.4,
        ]}
      >
        <sphereGeometry
          args={[
            0.18,
            16,
            16,
          ]}
        />

        <meshBasicMaterial
          color={
            error
              ? "#ff0000"
              : playing
                ? "#00ff62"
                : ready
                  ? "#00dfff"
                  : "#ffc400"
          }
        />
      </mesh>

      {near && (
        <pointLight
          position={[
            0,
            7,
            3,
          ]}
          color={
            playing
              ? "#35ff7d"
              : "#58f1ff"
          }
          intensity={
            playing
              ? 16
              : 8
          }
          distance={
            18
          }
          decay={
            2
          }
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
      <InstancedBoxes
        items={
          blackWalls
        }
        color="#05080c"
        roughness={
          0.9
        }
      />

      <InstancedBoxes
        items={
          floor
        }
        color="#080c11"
        roughness={
          0.7
        }
      />

      <InstancedBoxes
        items={
          ceilingLights
        }
        color="#ffffff"
        roughness={
          0.1
        }
        emissive="#ffffff"
        emissiveIntensity={
          1.6
        }
      />

      <NeonWord
        text="POPULARES HOY"
        color="#58f1ff"
        position={[
          0,
          10.8,
          29,
        ]}
        width={
          15
        }
        height={
          3
        }
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
          Math.PI / 2,
          0,
        ]}
        width={
          8
        }
        height={
          2
        }
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
          -Math.PI / 2,
          0,
        ]}
        width={
          7
        }
        height={
          2
        }
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
          Math.PI / 2,
          0,
        ]}
        width={
          5
        }
        height={
          2
        }
      />

      <ArcadeIcon
        type="chomper"
        position={[
          -28.95,
          5,
          2,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
        size={
          5
        }
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
          -Math.PI / 2,
          0,
        ]}
        size={
          5.4
        }
      />

      <NeonLine
        position={[
          -29,
          11,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
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
          Math.PI / 2,
          0,
        ]}
        size={[
          42,
          0.07,
          0.07,
        ]}
        color="#ff4f95"
      />

      <pointLight
        position={[
          0,
          10,
          22,
        ]}
        color="#dff8ff"
        intensity={
          30
        }
        distance={
          28
        }
        decay={
          2
        }
      />

      <pointLight
        position={[
          -12,
          9,
          2,
        ]}
        color="#59eaff"
        intensity={
          18
        }
        distance={
          20
        }
        decay={
          2
        }
      />

      <pointLight
        position={[
          12,
          9,
          -6,
        ]}
        color="#ff62ad"
        intensity={
          18
        }
        distance={
          20
        }
        decay={
          2
        }
      />

      {stationLayout.map(
        (
          station
        ) => (
          <GameStation
            key={
              station
                .game
                .id
            }
            game={
              station
                .game
            }
            position={
              station
                .position
            }
            rotation={
              station
                .rotation
            }
            scale={
              station
                .scale
            }
          />
        )
      )}

      <HeroVideoWall />

      <RigidBody
        type="fixed"
        colliders={
          false
        }
      >
        {stationLayout.map(
          (
            station
          ) => (
            <CuboidCollider
              key={
                station
                  .game
                  .id
              }
              args={[
                1.9 *
                  station
                    .scale,

                0.42,

                0.8 *
                  station
                    .scale,
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

                station
                  .rotation,

                0,
              ]}
            />
          )
        )}
      </RigidBody>
    </group>
  );
}
