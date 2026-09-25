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

   mock: true hace que RankingOverlay use
   nuestra ficha local y NO Freaky Ranking.
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
    .52,
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

  /* círculos */

  ctx.globalAlpha =
    .18;

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
    .1;

  ctx.beginPath();

  ctx.arc(
    90,
    430,
    220,
    0,
    Math.PI * 2
  );

  ctx.fill();

  /* diagonal */

  ctx.globalAlpha =
    .18;

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

  /* ranking */

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

  ctx.fillStyle =
    "#ffffff";

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
  roughness = .8,
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
   ESTACIÓN
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

  /* =======================================================
     PROXIMIDAD

     Cuando entramos:
     freaky:game-near -> WorldScene

     Cuando salimos:
     limpiamos el juego cercano.
  ======================================================= */

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
      distance < 3.9;

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

  const topThree =
    game.rank <= 3;

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
      {/* BASE */}

      <RoundedBox
        position={[
          0,
          .25,
          0,
        ]}
        args={[
          topThree
            ? 2.9
            : 2.55,

          .35,

          topThree
            ? 1.45
            : 1.25,
        ]}
        radius={.13}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#30363a"
          roughness={.65}
        />
      </RoundedBox>

      {/* PEDESTAL */}

      <RoundedBox
        position={[
          0,
          1.1,
          0,
        ]}
        args={[
          topThree
            ? 1.72
            : 1.5,

          1.45,

          .3,
        ]}
        radius={.11}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#50575b"
          roughness={.62}
        />
      </RoundedBox>

      {/* MARCO VERTICAL */}

      <RoundedBox
        position={[
          0,
          topThree
            ? 3.2
            : 3.05,
          0,
        ]}
        args={[
          topThree
            ? 2.4
            : 2.08,

          topThree
            ? 3.7
            : 3.35,

          .2,
        ]}
        radius={.17}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={
            near
              ? game.accent
              : "#242b30"
          }
          emissive={
            game.accent
          }
          emissiveIntensity={
            near
              ? .32
              : .05
          }
          roughness={.32}
        />
      </RoundedBox>

      {/* PORTADA */}

      <mesh
        position={[
          0,
          topThree
            ? 3.2
            : 3.05,
          .115,
        ]}
      >
        <planeGeometry
          args={[
            topThree
              ? 2.12
              : 1.82,

            topThree
              ? 3.38
              : 3.03,
          ]}
        />

        <meshBasicMaterial
          map={poster}
          toneMapped={false}
        />
      </mesh>

      {/* RESPLANDOR CUANDO ESTÁ CERCA */}

      {near && (
        <pointLight
          position={[
            0,
            3,
            1.4,
          ]}
          color={
            game.accent
          }
          intensity={6}
          distance={5}
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
          game:
            GAMES[9],

          position: [
            -10.5,
            .32,
            14,
          ],

          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[8],

          position: [
            10.5,
            .32,
            14,
          ],

          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[7],

          position: [
            -10.5,
            .32,
            6,
          ],

          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[6],

          position: [
            10.5,
            .32,
            6,
          ],

          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[5],

          position: [
            -10.5,
            .32,
            -2,
          ],

          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[4],

          position: [
            10.5,
            .32,
            -2,
          ],

          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[3],

          position: [
            -10.5,
            .32,
            -10,
          ],

          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[2],

          position: [
            10.5,
            .32,
            -10,
          ],

          rotation:
            -Math.PI / 2,
        },

        {
          game:
            GAMES[1],

          position: [
            -10.5,
            .32,
            -18,
          ],

          rotation:
            Math.PI / 2,
        },

        {
          game:
            GAMES[0],

          position: [
            10.5,
            .32,
            -18,
          ],

          rotation:
            -Math.PI / 2,
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
            5.5,
            1,
          ],

          scale: [
            .18,
            10.5,
            ROOM_FRONT_Z -
              ROOM_BACK_Z,
          ],
        },

        {
          position: [
            ROOM_HALF_WIDTH,
            5.5,
            1,
          ],

          scale: [
            .18,
            10.5,
            ROOM_FRONT_Z -
              ROOM_BACK_Z,
          ],
        },

        {
          position: [
            0,
            5.5,
            ROOM_BACK_Z,
          ],

          scale: [
            ROOM_HALF_WIDTH *
              2,

            10.5,

            .18,
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
            .37,
            1,
          ],

          scale: [
            5.2,
            .04,
            48,
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
            -6.5,
            9.7,
            7,
          ],

          scale: [
            .16,
            .12,
            29,
          ],
        },

        {
          position: [
            6.5,
            9.7,
            7,
          ],

          scale: [
            .16,
            .12,
            29,
          ],
        },

        {
          position: [
            -6.5,
            9.7,
            -15,
          ],

          scale: [
            .16,
            .12,
            13,
          ],
        },

        {
          position: [
            6.5,
            9.7,
            -15,
          ],

          scale: [
            .16,
            .12,
            13,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* PAREDES */}

      <InstancedBoxes
        items={
          interiorWalls
        }
        color="#f0eee7"
        roughness={.9}
      />

      {/* PASILLO */}

      <InstancedBoxes
        items={
          centralPath
        }
        color="#555c60"
        roughness={.7}
      />

      {/* PORTAL */}

      <RoundedBox
        position={[
          -4.8,
          3,
          23,
        ]}
        args={[
          .55,
          5.4,
          .7,
        ]}
        radius={.16}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#3c4347"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          4.8,
          3,
          23,
        ]}
        args={[
          .55,
          5.4,
          .7,
        ]}
        radius={.16}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#3c4347"
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          5.45,
          23,
        ]}
        args={[
          10.1,
          .5,
          .7,
        ]}
        radius={.16}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#3c4347"
        />
      </RoundedBox>

      {/* LUMINARIAS */}

      <InstancedBoxes
        items={
          ceilingLights
        }
        color="#ffffff"
        roughness={.12}
        emissive="#ffffff"
        emissiveIntensity={1.4}
        receiveShadow={false}
      />

      {/* ILUMINACIÓN */}

      <pointLight
        position={[
          0,
          8.5,
          15,
        ]}
        color="#fff6e8"
        intensity={42}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          0,
          8.5,
          0,
        ]}
        color="#ffffff"
        intensity={46}
        distance={29}
        decay={2}
      />

      <pointLight
        position={[
          0,
          8.5,
          -17,
        ]}
        color="#eaf5ff"
        intensity={42}
        distance={27}
        decay={2}
      />

      {/* JUEGOS */}

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
          />
        )
      )}

      {/* COLISIONES */}

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
                1.45,
                .28,
                .72,
              ]}
              position={[
                station
                  .position[0],

                .6,

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
