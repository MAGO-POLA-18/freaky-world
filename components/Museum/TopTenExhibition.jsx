"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Image,
  Text,
} from "@react-three/drei";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import {
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   POSICIONES
========================================================= */

const X_POSITIONS = [
  -9.4,
  -4.7,
  0,
  4.7,
  9.4,
];

const TOP_ROW_Y =
  12.35;

const BOTTOM_ROW_Y =
  8.95;

/* =========================================================
   POSICIÓN DE CADA CUADRO
========================================================= */

function getPosterPosition(
  index
) {
  return {
    x:
      X_POSITIONS[
        index % 5
      ],

    y:
      index < 5
        ? TOP_ROW_Y
        : BOTTOM_ROW_Y,
  };
}

/* =========================================================
   SCORE
========================================================= */

function getScore(
  game
) {
  const official =
    Number(
      game?.avg_score ||
        0
    );

  if (
    official > 0
  ) {
    return official.toFixed(
      1
    );
  }

  const community =
    Number(
      game
        ?.community_score ||
        game
          ?.external_rating ||
        0
    );

  if (
    community > 0
  ) {
    return community.toFixed(
      1
    );
  }

  return "S/E";
}

/* =========================================================
   COLOR RANK
========================================================= */

function getRankColor(
  rank
) {
  if (
    rank === 1
  ) {
    return "#e7c34b";
  }

  if (
    rank === 2
  ) {
    return "#c7ced7";
  }

  if (
    rank === 3
  ) {
    return "#ce7b42";
  }

  return "#151b22";
}

/* =========================================================
   POSTER
========================================================= */

function GamePoster({
  game,
  index,
}) {
  const rank =
    index + 1;

  const {
    x,
    y,
  } =
    getPosterPosition(
      index
    );

  const score =
    getScore(
      game
    );

  return (
    <group
      position={[
        x,
        y,
        0,
      ]}
    >
      {/* MARCO */}

      <mesh
        position={[
          0,
          0,
          -0.09,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            3.25,
            2.95,
            0.16,
          ]}
        />

        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          roughness={
            0.38
          }
          metalness={
            0.55
          }
        />
      </mesh>

      {/* BASE */}

      <mesh
        position={[
          0,
          0,
          -0.01,
        ]}
      >
        <planeGeometry
          args={[
            3.02,
            2.72,
          ]}
        />

        <meshStandardMaterial
          color="#090c10"
        />
      </mesh>

      {/* PORTADA */}

      {game
        .cover_image ? (
        <Image
          url={
            game
              .cover_image
          }
          position={[
            0,
            0.22,
            0.06,
          ]}
          scale={[
            2.78,
            2.2,
          ]}
          transparent={
            false
          }
        />
      ) : (
        <mesh
          position={[
            0,
            0.22,
            0.06,
          ]}
        >
          <planeGeometry
            args={[
              2.78,
              2.2,
            ]}
          />

          <meshStandardMaterial
            color="#252c33"
          />
        </mesh>
      )}

      {/* PUESTO */}

      <mesh
        position={[
          -1.23,
          1.05,
          0.15,
        ]}
      >
        <circleGeometry
          args={[
            0.34,
            32,
          ]}
        />

        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
        />
      </mesh>

      <Text
        position={[
          -1.23,
          1.05,
          0.17,
        ]}
        fontSize={
          0.27
        }
        color={
          rank === 1
            ? "#111111"
            : "#ffffff"
        }
        anchorX="center"
        anchorY="middle"
      >
        {rank}
      </Text>

      {/* TÍTULO */}

      <Text
        position={[
          0,
          -1.06,
          0.15,
        ]}
        fontSize={
          0.18
        }
        maxWidth={
          2.7
        }
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {
          game.title
        }
      </Text>

      {/* SCORE */}

      <Text
        position={[
          1.2,
          -1.08,
          0.15,
        ]}
        fontSize={
          0.18
        }
        color="#77dcff"
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </Text>
    </group>
  );
}

/* =========================================================
   EXPOSICIÓN
========================================================= */

export default function TopTenExhibition({
  position = [
    0,
    0,
    0,
  ],

  rotation = [
    0,
    0,
    0,
  ],
}) {
  const group =
    useRef(null);

  const lastGameId =
    useRef(null);

  const posterWorld =
    useRef(
      new THREE.Vector3()
    );

  const wallWorld =
    useRef(
      new THREE.Vector3()
    );

  const projected =
    useRef(
      new THREE.Vector3()
    );

  const {
    camera,
  } = useThree();

  const [
    games,
    setGames,
  ] = useState([]);

  const [
    status,
    setStatus,
  ] = useState(
    "loading"
  );

  /* =======================================================
     CARGA
  ======================================================= */

  useEffect(() => {
    let active =
      true;

    async function load() {
      try {
        const response =
          await fetch(
            "/api/world-top10",
            {
              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !active
        ) {
          return;
        }

        const nextGames =
          Array.isArray(
            data?.games
          )
            ? data.games.slice(
                0,
                10
              )
            : [];

        setGames(
          nextGames
        );

        setStatus(
          "ready"
        );
      } catch (
        error
      ) {
        console.error(
          "TOP 10 ERROR:",
          error
        );

        if (
          active
        ) {
          setStatus(
            "error"
          );
        }
      }
    }

    load();

    return () => {
      active =
        false;

      window.dispatchEvent(
        new CustomEvent(
          "freaky:game-near",
          {
            detail: {
              near:
                false,
            },
          }
        )
      );
    };
  }, []);

  /* =======================================================
     INTERACCIÓN

     NUEVO SISTEMA:

     1. Miramos si el jugador está cerca
        de LA PARED, no de cada portada.

     2. Ignoramos la diferencia vertical
        jugador-portada.

     3. Entre las 10 portadas elegimos
        la que esté más cerca del centro
        de la cámara.

     Resultado:

     funcionan fila superior e inferior.
  ======================================================= */

  useFrame(() => {
    if (
      !group.current ||
      !playerRuntime.body ||
      games.length === 0
    ) {
      return;
    }

    const player =
      playerRuntime
        .body
        .translation();

    /* =====================================================
       CENTRO DE LA PARED EN MUNDO
    ===================================================== */

    wallWorld
      .current
      .set(
        0,
        8,
        0
      );

    group.current
      .localToWorld(
        wallWorld.current
      );

    /*
      Solo usamos distancia horizontal.

      La altura del jugador NO importa.
    */

    const wallDx =
      wallWorld
        .current.x -
      player.x;

    const wallDz =
      wallWorld
        .current.z -
      player.z;

    const horizontalDistance =
      Math.sqrt(
        wallDx *
          wallDx +
        wallDz *
          wallDz
      );

    /*
      Fuera de la zona de la exposición.
    */

    if (
      horizontalDistance >
      14
    ) {
      if (
        lastGameId
          .current !==
        null
      ) {
        lastGameId.current =
          null;

        window.dispatchEvent(
          new CustomEvent(
            "freaky:game-near",
            {
              detail: {
                near:
                  false,
              },
            }
          )
        );
      }

      return;
    }

    /* =====================================================
       BUSCAR QUÉ PORTADA ESTÁ MIRANDO
    ===================================================== */

    let selected =
      null;

    let bestScore =
      Infinity;

    games.forEach(
      (
        game,
        index
      ) => {
        const {
          x,
          y,
        } =
          getPosterPosition(
            index
          );

        posterWorld
          .current
          .set(
            x,
            y,
            0.2
          );

        group.current
          .localToWorld(
            posterWorld
              .current
          );

        projected
          .current
          .copy(
            posterWorld
              .current
          )
          .project(
            camera
          );

        /*
          Portada detrás
          de la cámara.
        */

        if (
          projected
            .current.z <
            -1 ||
          projected
            .current.z >
            1
        ) {
          return;
        }

        /*
          Calculamos cercanía al centro
          visual.

          X e Y cuentan igual.

          Así podés mirar arriba
          para elegir las superiores.
        */

        const screenDistance =
          Math.sqrt(
            projected
              .current.x *
              projected
                .current.x +
            projected
              .current.y *
              projected
                .current.y
          );

        /*
          Solo consideramos cuadros
          razonablemente cerca
          del centro de la pantalla.
        */

        if (
          screenDistance >
          0.78
        ) {
          return;
        }

        if (
          screenDistance <
          bestScore
        ) {
          bestScore =
            screenDistance;

          selected =
            game;
        }
      }
    );

    const nextId =
      selected?.id ||
      null;

    if (
      nextId ===
      lastGameId.current
    ) {
      return;
    }

    lastGameId.current =
      nextId;

    window.dispatchEvent(
      new CustomEvent(
        "freaky:game-near",
        {
          detail: {
            near:
              Boolean(
                selected
              ),

            game:
              selected ||
              null,
          },
        }
      )
    );
  });

  return (
    <group
      ref={group}
      position={
        position
      }
      rotation={
        rotation
      }
    >
      {/* PANEL */}

      <mesh
        position={[
          0,
          10.9,
          -0.25,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            26.5,
            7.7,
            0.4,
          ]}
        />

        <meshStandardMaterial
          color="#080c10"
          roughness={
            0.92
          }
        />
      </mesh>

      {/* TÍTULO */}

      <Text
        position={[
          0,
          14.25,
          0.02,
        ]}
        fontSize={
          0.58
        }
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        FREAKY RANKING · TOP 10
      </Text>

      <Text
        position={[
          0,
          13.72,
          0.02,
        ]}
        fontSize={
          0.2
        }
        color="#7ad9ff"
        anchorX="center"
        anchorY="middle"
      >
        Acercate y mirá una portada
      </Text>

      {/* CARGANDO */}

      {status ===
        "loading" && (
        <Text
          position={[
            0,
            10.5,
            0.03,
          ]}
          fontSize={
            0.42
          }
          color="#b6c1ca"
          anchorX="center"
          anchorY="middle"
        >
          Cargando ranking...
        </Text>
      )}

      {/* ERROR */}

      {status ===
        "error" && (
        <Text
          position={[
            0,
            10.5,
            0.03,
          ]}
          fontSize={
            0.36
          }
          color="#ff8e8e"
          anchorX="center"
          anchorY="middle"
        >
          No se pudo cargar el ranking
        </Text>
      )}

      {/* JUEGOS */}

      {status ===
        "ready" &&
        games.map(
          (
            game,
            index
          ) => (
            <GamePoster
              key={
                game.id
              }
              game={
                game
              }
              index={
                index
              }
            />
          )
        )}

      {/* LUZ */}

      <pointLight
        position={[
          0,
          11,
          5,
        ]}
        intensity={
          115
        }
        distance={
          30
        }
        decay={
          2
        }
        color="#dceeff"
      />
    </group>
  );
}
