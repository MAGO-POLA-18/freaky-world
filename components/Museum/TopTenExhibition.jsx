"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Image,
  Text,
  RoundedBox,
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
   TIERRA VICIO
   RANKING — BRAZO NORTE DE LA CRUCETA

   NUEVA DISTRIBUCIÓN:

   FONDO
   2.º   1.º   3.º

   PARED IZQUIERDA
   4.º 5.º 6.º 7.º 8.º

   PARED DERECHA
   9.º 10.º 11.º 12.º 13.º

   CAMBIO PEDIDO:
   - eliminar los podios/bases anteriores
   - cada Top 3 es una sola pieza:
     pantalla arriba + base integrada abajo
   - laterales: 5 por pared y más grandes
========================================================= */

const NORTH_END_Z =
  -51;

const LEFT_WALL_X =
  -13.7;

const RIGHT_WALL_X =
  13.7;

/* =========================================================
   LATERALES — 5 POR PARED
========================================================= */

const LEFT_Z_POSITIONS = [
  -46.6,
  -40.5,
  -34.4,
  -28.3,
  -22.2,
];

const RIGHT_Z_POSITIONS = [
  -22.2,
  -28.3,
  -34.4,
  -40.5,
  -46.6,
];

const SIDE_CARD_Y =
  4.05;

const SIDE_CARD_WIDTH =
  4.35;

const SIDE_CARD_COVER_HEIGHT =
  5.85;

/* =========================================================
   COLORES
========================================================= */

const COLORS = {
  gold:
    "#d5ad45",

  goldDark:
    "#806520",

  silver:
    "#c5cbd2",

  silverDark:
    "#666d75",

  bronze:
    "#b56e42",

  bronzeDark:
    "#694027",

  panel:
    "#11161b",

  panelInner:
    "#080b0e",

  panelEdge:
    "#343b43",

  text:
    "#ffffff",

  secondary:
    "#b7c1c9",

  score:
    "#79dcff",

  purple:
    "#7656d6",

  purpleDark:
    "#493685",
};

/* =========================================================
   RANK COLOR
========================================================= */

function getRankColor(
  rank
) {
  if (rank === 1) {
    return COLORS.gold;
  }

  if (rank === 2) {
    return COLORS.silver;
  }

  if (rank === 3) {
    return COLORS.bronze;
  }

  return COLORS.panelEdge;
}

function getRankDarkColor(
  rank
) {
  if (rank === 1) {
    return COLORS.goldDark;
  }

  if (rank === 2) {
    return COLORS.silverDark;
  }

  if (rank === 3) {
    return COLORS.bronzeDark;
  }

  return COLORS.panel;
}

/* =========================================================
   SCORE
========================================================= */

function getScore(
  game
) {
  const score =
    Number(
      game?.score ??
        game?.freakyOfficialScore ??
        game?.freaky_official_score ??
        0
    );

  if (
    Number.isFinite(
      score
    ) &&
    score > 0
  ) {
    return score.toFixed(
      1
    );
  }

  return "S/E";
}

/* =========================================================
   COVER
========================================================= */

function GameCover({
  game,
  width,
  height,
}) {
  const cover =
    game?.cover ||
    game?.cover_image ||
    game?.cover_image_url ||
    null;

  if (!cover) {
    return (
      <mesh>
        <planeGeometry
          args={[
            width,
            height,
          ]}
        />

        <meshStandardMaterial
          color="#282e34"
          roughness={0.8}
        />
      </mesh>
    );
  }

  return (
    <Image
      url={cover}
      scale={[
        width,
        height,
      ]}
      transparent={false}
    />
  );
}

/* =========================================================
   TARJETA LATERAL
========================================================= */

function RankingCard({
  game,
  position,
  rotation = [
    0,
    0,
    0,
  ],

  width = 3.2,
  coverHeight = 3.4,
  featured = false,
}) {
  if (!game) {
    return null;
  }

  const frameHeight =
    coverHeight +
    1.1;

  const rank =
    Number(
      game.rank
    );

  return (
    <group
      position={position}
      rotation={rotation}
      userData={{
        game,
      }}
    >
      {/* CUERPO EXTERIOR */}

      <RoundedBox
        args={[
          width,
          frameHeight,
          0.18,
        ]}
        radius={
          featured
            ? 0.17
            : 0.12
        }
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={
            getRankDarkColor(
              rank
            )
          }
          roughness={0.48}
          metalness={
            rank <= 3
              ? 0.28
              : 0.12
          }
        />
      </RoundedBox>

      {/* BORDE */}

      <RoundedBox
        position={[
          0,
          0,
          0.105,
        ]}
        args={[
          width - 0.12,
          frameHeight - 0.12,
          0.055,
        ]}
        radius={0.1}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          roughness={0.34}
          metalness={0.48}
        />
      </RoundedBox>

      {/* INTERIOR */}

      <RoundedBox
        position={[
          0,
          0,
          0.143,
        ]}
        args={[
          width - 0.28,
          frameHeight - 0.28,
          0.025,
        ]}
        radius={0.07}
        smoothness={2}
      >
        <meshStandardMaterial
          color={
            COLORS.panelInner
          }
          roughness={0.8}
        />
      </RoundedBox>

      {/* PORTADA */}

      <group
        position={[
          0,
          0.32,
          0.18,
        ]}
      >
        <GameCover
          game={game}
          width={
            width - 0.52
          }
          height={
            coverHeight
          }
        />
      </group>

      {/* PUESTO */}

      <mesh
        position={[
          -width / 2 +
            0.42,

          frameHeight / 2 -
            0.41,

          0.26,
        ]}
      >
        <circleGeometry
          args={[
            0.3,
            32,
          ]}
        />

        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      <Text
        position={[
          -width / 2 +
            0.42,

          frameHeight / 2 -
            0.41,

          0.29,
        ]}
        fontSize={0.27}
        color={
          rank === 1
            ? "#17120a"
            : "#ffffff"
        }
        anchorX="center"
        anchorY="middle"
      >
        {rank}
      </Text>

      {/* PUNTUACIÓN */}

      <Text
        position={[
          width / 2 -
            0.46,

          frameHeight / 2 -
            0.41,

          0.29,
        ]}
        fontSize={0.21}
        color={
          COLORS.score
        }
        anchorX="center"
        anchorY="middle"
      >
        {getScore(
          game
        )}
      </Text>

      {/* NOMBRE */}

      <Text
        position={[
          0,
          -frameHeight / 2 +
            0.42,

          0.23,
        ]}
        fontSize={
          featured
            ? 0.21
            : 0.19
        }
        maxWidth={
          width - 0.45
        }
        color={
          COLORS.text
        }
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {
          game.name ||
          game.title ||
          ""
        }
      </Text>
    </group>
  );
}

/* =========================================================
   TOP 3 — PIEZA INTEGRADA

   Una sola pieza:
   - rectángulo grande
   - pantalla arriba
   - base abajo con color + número
========================================================= */

function PodiumMonolith({
  game,
  position,
  width = 3.9,
  coverHeight = 4.45,
  baseHeight = 1.55,
}) {
  if (!game) {
    return null;
  }

  const rank =
    Number(
      game.rank
    );

  const totalHeight =
    coverHeight +
    baseHeight +
    0.7;

  const topSectionHeight =
    coverHeight + 0.45;

  const baseY =
    -totalHeight / 2 +
    baseHeight / 2 +
    0.12;

  const screenCenterY =
    baseHeight / 2 +
    0.22;

  return (
    <group
      position={position}
      userData={{
        game,
      }}
    >
      {/* CUERPO GENERAL */}

      <RoundedBox
        args={[
          width,
          totalHeight,
          0.24,
        ]}
        radius={0.18}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={
            getRankDarkColor(
              rank
            )
          }
          roughness={0.4}
          metalness={0.24}
        />
      </RoundedBox>

      {/* MARCO SUPERIOR */}

      <RoundedBox
        position={[
          0,
          screenCenterY,
          0.11,
        ]}
        args={[
          width - 0.16,
          topSectionHeight,
          0.07,
        ]}
        radius={0.12}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          roughness={0.32}
          metalness={0.46}
        />
      </RoundedBox>

      {/* INTERIOR PANTALLA */}

      <RoundedBox
        position={[
          0,
          screenCenterY,
          0.148,
        ]}
        args={[
          width - 0.34,
          topSectionHeight - 0.2,
          0.03,
        ]}
        radius={0.08}
        smoothness={2}
      >
        <meshStandardMaterial
          color={
            COLORS.panelInner
          }
          roughness={0.82}
        />
      </RoundedBox>

      {/* PORTADA */}

      <group
        position={[
          0,
          screenCenterY +
            0.05,
          0.185,
        ]}
      >
        <GameCover
          game={game}
          width={
            width - 0.56
          }
          height={
            coverHeight
          }
        />
      </group>

      {/* SCORE */}

      <Text
        position={[
          width / 2 -
            0.5,
          totalHeight / 2 -
            0.48,
          0.205,
        ]}
        fontSize={0.22}
        color={
          COLORS.score
        }
        anchorX="center"
        anchorY="middle"
      >
        {getScore(
          game
        )}
      </Text>

      {/* NOMBRE */}

      <Text
        position={[
          0,
          -0.36,
          0.205,
        ]}
        fontSize={0.22}
        maxWidth={
          width - 0.48
        }
        color={
          COLORS.text
        }
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {
          game.name ||
          game.title ||
          ""
        }
      </Text>

      {/* BASE INTEGRADA */}

      <RoundedBox
        position={[
          0,
          baseY,
          0.135,
        ]}
        args={[
          width - 0.22,
          baseHeight,
          0.08,
        ]}
        radius={0.08}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            getRankColor(
              rank
            )
          }
          emissive={
            getRankDarkColor(
              rank
            )
          }
          emissiveIntensity={
            0.12
          }
          roughness={0.32}
          metalness={0.42}
        />
      </RoundedBox>

      {/* NÚMERO GRANDE */}

      <Text
        position={[
          0,
          baseY,
          0.19,
        ]}
        fontSize={
          rank === 1
            ? 0.95
            : 0.82
        }
        color={
          rank === 2
            ? "#ffffff"
            : "#fff6d8"
        }
        anchorX="center"
        anchorY="middle"
      >
        {rank}
      </Text>
    </group>
  );
}

/* =========================================================
   TOP 3
========================================================= */

function TopThree({
  games,
}) {
  const first =
    games[0];

  const second =
    games[1];

  const third =
    games[2];

  return (
    <group>
      <PodiumMonolith
        game={second}
        position={[
          -4.35,
          4.38,
          NORTH_END_Z +
            1.95,
        ]}
        width={3.75}
        coverHeight={4.2}
        baseHeight={1.45}
      />

      <PodiumMonolith
        game={first}
        position={[
          0,
          4.8,
          NORTH_END_Z +
            1.75,
        ]}
        width={4.1}
        coverHeight={4.55}
        baseHeight={1.65}
      />

      <PodiumMonolith
        game={third}
        position={[
          4.35,
          4.25,
          NORTH_END_Z +
            1.95,
        ]}
        width={3.75}
        coverHeight={4.2}
        baseHeight={1.4}
      />
    </group>
  );
}

/* =========================================================
   PARED IZQUIERDA
========================================================= */

function LeftRankingWall({
  games,
}) {
  return (
    <group>
      {games
        .slice(
          3,
          8
        )
        .map(
          (
            game,
            index
          ) => (
            <RankingCard
              key={game.id}
              game={game}
              position={[
                LEFT_WALL_X +
                  0.42,

                SIDE_CARD_Y,

                LEFT_Z_POSITIONS[
                  index
                ],
              ]}
              rotation={[
                0,
                Math.PI / 2,
                0,
              ]}
              width={
                SIDE_CARD_WIDTH
              }
              coverHeight={
                SIDE_CARD_COVER_HEIGHT
              }
            />
          )
        )}
    </group>
  );
}

/* =========================================================
   PARED DERECHA
========================================================= */

function RightRankingWall({
  games,
}) {
  return (
    <group>
      {games
        .slice(
          8,
          13
        )
        .map(
          (
            game,
            index
          ) => (
            <RankingCard
              key={game.id}
              game={game}
              position={[
                RIGHT_WALL_X -
                  0.42,

                SIDE_CARD_Y,

                RIGHT_Z_POSITIONS[
                  index
                ],
              ]}
              rotation={[
                0,
                -Math.PI / 2,
                0,
              ]}
              width={
                SIDE_CARD_WIDTH
              }
              coverHeight={
                SIDE_CARD_COVER_HEIGHT
              }
            />
          )
        )}
    </group>
  );
}

/* =========================================================
   TÍTULO
========================================================= */

function RankingHeader() {
  return (
    <group>
      <Text
        position={[
          0,
          8.15,
          NORTH_END_Z +
            0.38,
        ]}
        fontSize={0.58}
        letterSpacing={0.045}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        TIERRA VICIO RANKING
      </Text>

      <mesh
        position={[
          0,
          7.58,
          NORTH_END_Z +
            0.36,
        ]}
      >
        <boxGeometry
          args={[
            10.5,
            0.07,
            0.035,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.purple
          }
          emissive={
            COLORS.purpleDark
          }
          emissiveIntensity={
            0.5
          }
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   POSICIÓN LÓGICA DE CADA JUEGO
========================================================= */

function getGameLocalPosition(
  index
) {
  /* TOP 3 */

  if (index === 0) {
    return [
      0,
      4.8,
      NORTH_END_Z +
        1.75,
    ];
  }

  if (index === 1) {
    return [
      -4.35,
      4.38,
      NORTH_END_Z +
        1.95,
    ];
  }

  if (index === 2) {
    return [
      4.35,
      4.25,
      NORTH_END_Z +
        1.95,
    ];
  }

  /* IZQUIERDA */

  if (
    index >= 3 &&
    index <= 7
  ) {
    return [
      LEFT_WALL_X +
        0.42,
      SIDE_CARD_Y,
      LEFT_Z_POSITIONS[
        index - 3
      ],
    ];
  }

  /* DERECHA */

  if (
    index >= 8 &&
    index <= 12
  ) {
    return [
      RIGHT_WALL_X -
        0.42,
      SIDE_CARD_Y,
      RIGHT_Z_POSITIONS[
        index - 8
      ],
    ];
  }

  return [
    0,
    0,
    0,
  ];
}

/* =========================================================
   COMPONENTE PRINCIPAL
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

  const gameWorld =
    useRef(
      new THREE.Vector3()
    );

  const projected =
    useRef(
      new THREE.Vector3()
    );

  const zoneWorld =
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
            "/api/world-ranking",
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

        if (!active) {
          return;
        }

        const nextGames =
          Array.isArray(
            data?.games
          )
            ? data.games
                .slice(
                  0,
                  13
                )
                .map(
                  (
                    game,
                    index
                  ) => ({
                    ...game,

                    rank:
                      Number(
                        game.rank
                      ) ||
                      index + 1,
                  })
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
          "RANKING ERROR:",
          error
        );

        if (active) {
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

    zoneWorld
      .current
      .set(
        0,
        3,
        -35
      );

    group.current.localToWorld(
      zoneWorld.current
    );

    const dx =
      zoneWorld.current.x -
      player.x;

    const dz =
      zoneWorld.current.z -
      player.z;

    const horizontalDistance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    if (
      horizontalDistance >
      24
    ) {
      if (
        lastGameId.current !==
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

    let selected =
      null;
    let bestScore =
      Infinity;

    games.forEach(
      (
        game,
        index
      ) => {
        const localPosition =
          getGameLocalPosition(
            index
          );

        gameWorld.current.set(
          localPosition[0],
          localPosition[1],
          localPosition[2]
        );

        group.current.localToWorld(
          gameWorld.current
        );

        projected.current
          .copy(
            gameWorld.current
          )
          .project(camera);

        if (
          projected.current.z <
            -1 ||
          projected.current.z > 1
        ) {
          return;
        }

        const screenDistance =
          Math.sqrt(
            projected.current.x *
              projected.current.x +
              projected.current.y *
                projected.current.y
          );

        if (
          screenDistance >
          0.7
        ) {
          return;
        }

        const gameDx =
          gameWorld.current.x -
          player.x;

        const gameDz =
          gameWorld.current.z -
          player.z;

        const physicalDistance =
          Math.sqrt(
            gameDx *
              gameDx +
              gameDz *
                gameDz
          );

        if (
          physicalDistance >
          13
        ) {
          return;
        }

        const score =
          screenDistance +
          physicalDistance *
            0.015;

        if (
          score <
          bestScore
        ) {
          bestScore =
            score;
          selected = game;
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
    >
      <RankingHeader />

      {status ===
        "loading" && (
        <Text
          position={[
            0,
            4,
            -44,
          ]}
          fontSize={0.36}
          color={
            COLORS.secondary
          }
          anchorX="center"
          anchorY="middle"
        >
          Cargando ranking...
        </Text>
      )}

      {status ===
        "error" && (
        <Text
          position={[
            0,
            4,
            -44,
          ]}
          fontSize={0.32}
          color="#ff8e8e"
          anchorX="center"
          anchorY="middle"
        >
          No se pudo cargar el ranking
        </Text>
      )}

      {status ===
        "ready" && (
        <>
          <TopThree
            games={games}
          />

          <LeftRankingWall
            games={games}
          />

          <RightRankingWall
            games={games}
          />
        </>
      )}

      {/* ILUMINACIÓN LOCAL */}

      <pointLight
        position={[
          0,
          6.8,
          -43,
        ]}
        intensity={95}
        distance={24}
        decay={2}
        color="#fff4dc"
      />

      <pointLight
        position={[
          0,
          6.2,
          -32,
        ]}
        intensity={58}
        distance={20}
        decay={2}
        color="#dceeff"
      />
    </group>
  );
}
