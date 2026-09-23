"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Image,
  Text,
} from "@react-three/drei";

/* =========================================================
   FREAKY RANKING
========================================================= */

const FREAKY_RANKING_URL =
  "https://freakyranking.base44.app";

/* =========================================================
   POSICIONES

   Dos filas de cinco portadas.
========================================================= */

const X_POSITIONS = [
  -9.6,
  -4.8,
  0,
  4.8,
  9.6,
];

const TOP_ROW_Y =
  10.1;

const BOTTOM_ROW_Y =
  3.85;

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
    return {
      label:
        official.toFixed(
          1
        ),

      type:
        "OFICIAL",
    };
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
    return {
      label:
        community.toFixed(
          1
        ),

      type:
        "COMUNIDAD",
    };
  }

  return {
    label:
      "S/E",

    type:
      "",
  };
}

/* =========================================================
   COLOR PUESTO
========================================================= */

function getRankColor(
  rank
) {
  if (
    rank === 1
  ) {
    return "#e5bd42";
  }

  if (
    rank === 2
  ) {
    return "#c2c9d1";
  }

  if (
    rank === 3
  ) {
    return "#c97842";
  }

  return "#20262d";
}

/* =========================================================
   PORTADA INDIVIDUAL
========================================================= */

function GamePoster({
  game,
  index,
}) {
  const rank =
    index + 1;

  const column =
    index % 5;

  const row =
    index < 5
      ? 0
      : 1;

  const x =
    X_POSITIONS[
      column
    ];

  const y =
    row === 0
      ? TOP_ROW_Y
      : BOTTOM_ROW_Y;

  const score =
    getScore(
      game
    );

  /* =======================================================
     ABRIR FICHA REAL

     Abrimos en pestaña nueva para que por ahora
     no pierdas la posición dentro del mundo 3D.
  ======================================================= */

  const openGame =
    (event) => {
      event.stopPropagation();

      const url =
        `${FREAKY_RANKING_URL}/game/${game.id}`;

      const newWindow =
        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

      /*
        Fallback por si algún navegador
        bloquea la nueva pestaña.
      */

      if (
        !newWindow
      ) {
        window.location.href =
          url;
      }
    };

  return (
    <group
      position={[
        x,
        y,
        0,
      ]}
    >
      {/* =================================================
          MARCO EXTERIOR
      ================================================= */}

      <mesh
        position={[
          0,
          0,
          -0.18,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            3.65,
            5.25,
            0.18,
          ]}
        />

        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* =================================================
          MARCO INTERIOR
      ================================================= */}

      <mesh
        position={[
          0,
          0,
          -0.08,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            3.38,
            4.98,
            0.16,
          ]}
        />

        <meshStandardMaterial
          color="#080b0e"
          roughness={0.6}
          metalness={0.25}
        />
      </mesh>

      {/* =================================================
          PORTADA
      ================================================= */}

      {game
        .cover_image ? (
        <Image
          url={
            game
              .cover_image
          }
          position={[
            0,
            0,
            0.04,
          ]}
          scale={[
            3.15,
            4.72,
          ]}
          transparent={
            false
          }
          onClick={
            openGame
          }
          onPointerOver={(
            event
          ) => {
            event.stopPropagation();

            document
              .body
              .style
              .cursor =
              "pointer";
          }}
          onPointerOut={
            () => {
              document
                .body
                .style
                .cursor =
                "default";
            }
          }
        />
      ) : (
        <mesh
          position={[
            0,
            0,
            0.04,
          ]}
          onClick={
            openGame
          }
        >
          <planeGeometry
            args={[
              3.15,
              4.72,
            ]}
          />

          <meshStandardMaterial
            color="#252c33"
          />
        </mesh>
      )}

      {/* =================================================
          NÚMERO DEL RANKING
      ================================================= */}

      <mesh
        position={[
          -1.32,
          1.92,
          0.11,
        ]}
      >
        <circleGeometry
          args={[
            0.42,
            32,
          ]}
        />

        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          roughness={0.35}
          metalness={0.45}
        />
      </mesh>

      <Text
        position={[
          -1.32,
          1.92,
          0.13,
        ]}
        fontSize={
          0.33
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

      {/* =================================================
          TÍTULO
      ================================================= */}

      <Text
        position={[
          0,
          -2.92,
          0,
        ]}
        fontSize={
          0.25
        }
        maxWidth={
          3.8
        }
        color="#f4f7f9"
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {
          game.title
        }
      </Text>

      {/* =================================================
          PUNTUACIÓN
      ================================================= */}

      <Text
        position={[
          0,
          -3.3,
          0,
        ]}
        fontSize={
          0.28
        }
        color="#73d9ff"
        anchorX="center"
        anchorY="middle"
      >
        {
          score.label
        }
      </Text>
    </group>
  );
}

/* =========================================================
   EXPOSICIÓN COMPLETA
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
     CARGAR TOP 10
  ======================================================= */

  useEffect(() => {
    let active =
      true;

    async function load() {
      try {
        setStatus(
          "loading"
        );

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
            ? data.games
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
          "No se pudo cargar el TOP 10:",
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
    };
  }, []);

  return (
    <group
      position={
        position
      }
      rotation={
        rotation
      }
    >
      {/* =================================================
          PANEL DE FONDO
      ================================================= */}

      <mesh
        position={[
          0,
          7.25,
          -0.32,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            26.5,
            14.5,
            0.42,
          ]}
        />

        <meshStandardMaterial
          color="#090d11"
          roughness={0.93}
        />
      </mesh>

      {/* =================================================
          CABECERA
      ================================================= */}

      <Text
        position={[
          0,
          14.25,
          0.02,
        ]}
        fontSize={
          0.7
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
          13.55,
          0.02,
        ]}
        fontSize={
          0.25
        }
        color="#78d9ff"
        anchorX="center"
        anchorY="middle"
      >
        Tocá una portada para entrar en su ficha
      </Text>

      {/* =================================================
          CARGANDO
      ================================================= */}

      {status ===
        "loading" && (
        <Text
          position={[
            0,
            7,
            0.03,
          ]}
          fontSize={
            0.45
          }
          color="#aebbc5"
          anchorX="center"
          anchorY="middle"
        >
          Cargando ranking...
        </Text>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {status ===
        "error" && (
        <Text
          position={[
            0,
            7,
            0.03,
          ]}
          fontSize={
            0.38
          }
          color="#ff8f8f"
          anchorX="center"
          anchorY="middle"
        >
          No se pudo cargar el ranking
        </Text>
      )}

      {/* =================================================
          JUEGOS
      ================================================= */}

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

      {/* =================================================
          ILUMINACIÓN DE GALERÍA
      ================================================= */}

      <pointLight
        position={[
          0,
          9,
          6,
        ]}
        intensity={
          105
        }
        distance={
          32
        }
        decay={
          2
        }
        color="#dcefff"
      />

      <pointLight
        position={[
          -10,
          8,
          4,
        ]}
        intensity={
          45
        }
        distance={
          18
        }
        decay={
          2
        }
        color="#fff1ce"
      />

      <pointLight
        position={[
          10,
          8,
          4,
        ]}
        intensity={
          45
        }
        distance={
          18
        }
        decay={
          2
        }
        color="#fff1ce"
      />
    </group>
  );
}
