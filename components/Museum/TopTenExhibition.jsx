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

   Toda la exposición queda ARRIBA
   del nivel del segundo piso.

   Piso superior ≈ Y 7

   Fila inferior = Y 9
   Fila superior = Y 12.4
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
   PUNTUACIÓN
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
   COLOR DEL PUESTO
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
   TARJETA
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

  const openGame =
    (event) => {
      event.stopPropagation();

      /*
        Navegamos directamente.

        Esto evita problemas de popups
        bloqueados en Safari/iPhone.
      */

      window.location.href =
        `${FREAKY_RANKING_URL}/game/${game.id}`;
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

      {/* =================================================
          BASE NEGRA
      ================================================= */}

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

      {/* =================================================
          PORTADA

          onPointerUp funciona mejor en móvil.
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
          onPointerUp={
            openGame
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
            0.22,
            0.06,
          ]}
          onPointerUp={
            openGame
          }
          onClick={
            openGame
          }
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

      {/* =================================================
          SUPERFICIE DE CLICK

          Invisible.

          Ocupa toda la tarjeta para que
          no haga falta tocar exactamente
          la imagen.
      ================================================= */}

      <mesh
        position={[
          0,
          0,
          0.12,
        ]}
        onPointerUp={
          openGame
        }
        onClick={
          openGame
        }
      >
        <planeGeometry
          args={[
            3.2,
            2.95,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={
            false
          }
        />
      </mesh>

      {/* =================================================
          PUESTO
      ================================================= */}

      <mesh
        position={[
          -1.23,
          1.05,
          0.16,
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
          0.18,
        ]}
        fontSize={
          0.27
        }
        color={
          rank === 1
            ? "#101010"
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
          -1.06,
          0.17,
        ]}
        fontSize={
          0.19
        }
        maxWidth={
          2.75
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

      {/* =================================================
          PUNTUACIÓN
      ================================================= */}

      <Text
        position={[
          1.2,
          -1.08,
          0.17,
        ]}
        fontSize={
          0.19
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
          nextGames.slice(
            0,
            10
          )
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
          PANEL

          Empieza aproximadamente en Y 7.15
          y termina en Y 14.8.

          Todo queda por encima del piso.
      ================================================= */}

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

      {/* =================================================
          TÍTULO
      ================================================= */}

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
        Tocá una portada para abrir su ficha
      </Text>

      {/* =================================================
          ESTADO CARGANDO
      ================================================= */}

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

      {/* =================================================
          ERROR
      ================================================= */}

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

      {/* =================================================
          TOP 10
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
          LUCES
      ================================================= */}

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

      <pointLight
        position={[
          -10,
          10,
          3,
        ]}
        intensity={
          40
        }
        distance={
          15
        }
        decay={
          2
        }
        color="#fff0d2"
      />

      <pointLight
        position={[
          10,
          10,
          3,
        ]}
        intensity={
          40
        }
        distance={
          15
        }
        decay={
          2
        }
        color="#fff0d2"
      />
    </group>
  );
}
