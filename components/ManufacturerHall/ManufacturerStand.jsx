"use client";

import {
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import {
  RoundedBox,
  Text,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   FREAKY WORLD
   MANUFACTURER HALL
========================================================= */

/* =========================================================
   MEDIDAS
========================================================= */

const SIDE_STAND_WIDTH = 20;
const SIDE_STAND_DEPTH = 13;
const SIDE_STAND_HEIGHT = 7.2;

const HISTORY_WIDTH = 31;
const HISTORY_DEPTH = 9;
const HISTORY_HEIGHT = 7.6;

/*
  Distancia desde la que aparece
  el botón lateral ↗.
*/

const CONSOLE_INTERACTION_DISTANCE = 4.6;

/*
  Un poco más de distancia para
  desaparecer.

  Esto evita que el botón parpadee
  si estamos justo en el límite.
*/

const CONSOLE_EXIT_DISTANCE = 5.2;

/* =========================================================
   PLAYSTATION DATA
========================================================= */

const PLAYSTATION_CONSOLES = [
  {
    id: "ps1",

    platformId: 7,

    name: "PlayStation",
    short: "PS1",

    manufacturer: "Sony",

    year: "1994",
    generation: "5ª generación",

    x: -7,

    imageUrl: null,

    videos: [],
  },

  {
    id: "ps2",

    platformId: 8,

    name: "PlayStation 2",
    short: "PS2",

    manufacturer: "Sony",

    year: "2000",
    generation: "6ª generación",

    x: -3.5,

    imageUrl: null,

    videos: [],
  },

  {
    id: "ps3",

    platformId: 9,

    name: "PlayStation 3",
    short: "PS3",

    manufacturer: "Sony",

    year: "2006",
    generation: "7ª generación",

    x: 0,

    imageUrl: null,

    videos: [],
  },

  {
    id: "ps4",

    platformId: 48,

    name: "PlayStation 4",
    short: "PS4",

    manufacturer: "Sony",

    year: "2013",
    generation: "8ª generación",

    x: 3.5,

    imageUrl: null,

    videos: [],
  },

  {
    id: "ps5",

    platformId: 167,

    name: "PlayStation 5",
    short: "PS5",

    manufacturer: "Sony",

    year: "2020",
    generation: "9ª generación",

    x: 7,

    imageUrl: null,

    videos: [],
  },
];

/* =========================================================
   COLORES
========================================================= */

const COLORS = {
  floor: "#111318",

  wall: "#1c2027",

  structure: "#262b34",

  text: "#ffffff",

  muted: "#777e8b",

  playstation: "#1673ff",

  nintendo: "#e60012",

  xbox: "#107c10",

  vr: "#7b61ff",

  history: "#d68a27",
};

/* =========================================================
   PEDESTAL
========================================================= */

function Pedestal() {
  return (
    <group>
      <RoundedBox
        args={[
          2.15,
          0.9,
          2.15,
        ]}
        radius={0.12}
        smoothness={3}
        position={[
          0,
          0.45,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#171a20"
          roughness={0.42}
          metalness={0.22}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.92,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.95,
            0.07,
            1.95,
          ]}
        />

        <meshStandardMaterial
          color="#f5f5f5"
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PS1
========================================================= */

function PS1Model() {
  return (
    <group scale={1.35}>
      <RoundedBox
        args={[
          1.1,
          0.26,
          0.85,
        ]}
        radius={0.08}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#b8b8b5"
          roughness={0.6}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.145,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.28,
            0.28,
            0.015,
            32,
          ]}
        />

        <meshStandardMaterial
          color="#999996"
        />
      </mesh>

      <mesh
        position={[
          -0.38,
          0.15,
          0.23,
        ]}
      >
        <cylinderGeometry
          args={[
            0.045,
            0.045,
            0.04,
            20,
          ]}
        />

        <meshStandardMaterial
          color="#888885"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PS2
========================================================= */

function PS2Model() {
  return (
    <group scale={1.35}>
      <mesh>
        <boxGeometry
          args={[
            0.92,
            0.22,
            1.05,
          ]}
        />

        <meshStandardMaterial
          color="#111318"
          roughness={0.52}
        />
      </mesh>

      {[
        0.18,
        0.06,
        -0.06,
        -0.18,
      ].map(
        (z) => (
          <mesh
            key={z}
            position={[
              0,
              0.118,
              z,
            ]}
          >
            <boxGeometry
              args={[
                0.86,
                0.014,
                0.035,
              ]}
            />

            <meshStandardMaterial
              color="#292c34"
            />
          </mesh>
        )
      )}

      <mesh
        position={[
          0,
          0.135,
          -0.38,
        ]}
      >
        <boxGeometry
          args={[
            0.45,
            0.015,
            0.04,
          ]}
        />

        <meshStandardMaterial
          color="#3155aa"
          emissive="#162d74"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PS3
========================================================= */

function PS3Model() {
  return (
    <group scale={1.35}>
      <RoundedBox
        args={[
          1.05,
          0.31,
          0.88,
        ]}
        radius={0.17}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#101012"
          roughness={0.26}
          metalness={0.2}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.165,
          0.18,
        ]}
      >
        <boxGeometry
          args={[
            0.84,
            0.012,
            0.025,
          ]}
        />

        <meshStandardMaterial
          color="#55575c"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PS4
========================================================= */

function PS4Model() {
  return (
    <group
      scale={1.35}
      rotation={[
        0,
        -0.12,
        0,
      ]}
    >
      <mesh
        position={[
          0,
          0.08,
          0,
        ]}
        rotation={[
          0,
          0,
          -0.035,
        ]}
      >
        <boxGeometry
          args={[
            1.05,
            0.14,
            0.9,
          ]}
        />

        <meshStandardMaterial
          color="#161719"
        />
      </mesh>

      <mesh
        position={[
          0,
          0.23,
          0,
        ]}
        rotation={[
          0,
          0,
          0.035,
        ]}
      >
        <boxGeometry
          args={[
            1.02,
            0.14,
            0.87,
          ]}
        />

        <meshStandardMaterial
          color="#202124"
        />
      </mesh>

      <mesh
        position={[
          0,
          0.15,
          0.452,
        ]}
      >
        <boxGeometry
          args={[
            0.92,
            0.018,
            0.012,
          ]}
        />

        <meshStandardMaterial
          color="#437cff"
          emissive="#2346aa"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PS5
========================================================= */

function PS5Model() {
  const shellShape =
    useMemo(
      () => {
        const shape =
          new THREE.Shape();

        shape.moveTo(
          -0.22,
          -0.5
        );

        shape.quadraticCurveTo(
          -0.34,
          0,
          -0.24,
          0.52
        );

        shape.quadraticCurveTo(
          0,
          0.62,
          0.24,
          0.52
        );

        shape.quadraticCurveTo(
          0.34,
          0,
          0.22,
          -0.5
        );

        return shape;
      },
      []
    );

  return (
    <group
      scale={1.3}
      position={[
        0,
        0.55,
        0,
      ]}
    >
      <mesh>
        <boxGeometry
          args={[
            0.28,
            0.92,
            0.52,
          ]}
        />

        <meshStandardMaterial
          color="#111218"
        />
      </mesh>

      <mesh
        position={[
          -0.2,
          0,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >
        <extrudeGeometry
          args={[
            shellShape,
            {
              depth: 0.035,
              bevelEnabled:
                false,
            },
          ]}
        />

        <meshStandardMaterial
          color="#f1f2f4"
        />
      </mesh>

      <mesh
        position={[
          0.2,
          0,
          0,
        ]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
      >
        <extrudeGeometry
          args={[
            shellShape,
            {
              depth: 0.035,
              bevelEnabled:
                false,
            },
          ]}
        />

        <meshStandardMaterial
          color="#f1f2f4"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   CONSOLE MODEL
========================================================= */

function ConsoleModel({
  type,
}) {
  switch (type) {
    case "ps1":
      return <PS1Model />;

    case "ps2":
      return <PS2Model />;

    case "ps3":
      return <PS3Model />;

    case "ps4":
      return <PS4Model />;

    case "ps5":
      return <PS5Model />;

    default:
      return null;
  }
}

/* =========================================================
   CONSOLE EXHIBIT

   Ya NO tiene:
   - onClick
   - hover
   - ficha propia

   Solo registra su posición 3D real.
========================================================= */

function ConsoleExhibit({
  data,
  registerRef,
}) {
  return (
    <group
      ref={(node) => {
        registerRef(
          data.id,
          node
        );
      }}
      position={[
        data.x,
        0,
        -0.7,
      ]}
    >
      <Pedestal />

      <group
        position={[
          0,
          1.3,
          0,
        ]}
      >
        <ConsoleModel
          type={data.id}
        />
      </group>

      <Text
        position={[
          0,
          0.28,
          1.08,
        ]}
        rotation={[
          -0.5,
          0,
          0,
        ]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
      >
        {data.short}
      </Text>

      <Text
        position={[
          0,
          0.1,
          1.1,
        ]}
        rotation={[
          -0.5,
          0,
          0,
        ]}
        fontSize={0.11}
        color="#888e9b"
        anchorX="center"
      >
        {data.year}
      </Text>
    </group>
  );
}

/* =========================================================
   ESTRUCTURA DE STAND
========================================================= */

function LargeStandShell({
  title,
  subtitle,
  accent,
}) {
  return (
    <group>
      {/* BASE */}

      <RoundedBox
        args={[
          SIDE_STAND_WIDTH,
          0.15,
          SIDE_STAND_DEPTH,
        ]}
        radius={0.18}
        smoothness={3}
        position={[
          0,
          0.39,
          0,
        ]}
      >
        <meshStandardMaterial
          color={COLORS.floor}
          roughness={0.66}
        />
      </RoundedBox>

      {/* PARED */}

      <mesh
        position={[
          0,

          SIDE_STAND_HEIGHT /
            2,

          -SIDE_STAND_DEPTH /
              2 +
            0.12,
        ]}
      >
        <boxGeometry
          args={[
            SIDE_STAND_WIDTH,
            SIDE_STAND_HEIGHT,
            0.24,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.wall}
          roughness={0.62}
        />
      </mesh>

      {/* PILAR IZQUIERDO */}

      <RoundedBox
        args={[
          0.75,
          SIDE_STAND_HEIGHT,
          0.75,
        ]}
        radius={0.1}
        smoothness={3}
        position={[
          -SIDE_STAND_WIDTH /
              2 +
            0.45,

          SIDE_STAND_HEIGHT /
            2,

          SIDE_STAND_DEPTH /
              2 -
            0.45,
        ]}
      >
        <meshStandardMaterial
          color={
            COLORS.structure
          }
          metalness={0.32}
          roughness={0.35}
        />
      </RoundedBox>

      {/* PILAR DERECHO */}

      <RoundedBox
        args={[
          0.75,
          SIDE_STAND_HEIGHT,
          0.75,
        ]}
        radius={0.1}
        smoothness={3}
        position={[
          SIDE_STAND_WIDTH /
              2 -
            0.45,

          SIDE_STAND_HEIGHT /
            2,

          SIDE_STAND_DEPTH /
              2 -
            0.45,
        ]}
      >
        <meshStandardMaterial
          color={
            COLORS.structure
          }
          metalness={0.32}
          roughness={0.35}
        />
      </RoundedBox>

      {/* VIGA */}

      <RoundedBox
        args={[
          SIDE_STAND_WIDTH,
          0.8,
          1.15,
        ]}
        radius={0.14}
        smoothness={3}
        position={[
          0,

          SIDE_STAND_HEIGHT -
            0.2,

          SIDE_STAND_DEPTH /
              2 -
            0.5,
        ]}
      >
        <meshStandardMaterial
          color={
            COLORS.structure
          }
          metalness={0.28}
          roughness={0.36}
        />
      </RoundedBox>

      {/* COLOR */}

      <mesh
        position={[
          0,

          SIDE_STAND_HEIGHT -
            0.18,

          SIDE_STAND_DEPTH /
              2 +
            0.1,
        ]}
      >
        <boxGeometry
          args={[
            SIDE_STAND_WIDTH -
              1.3,

            0.16,

            0.09,
          ]}
        />

        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.4}
        />
      </mesh>

      <Text
        position={[
          0,

          5.55,

          -SIDE_STAND_DEPTH /
              2 +
            0.28,
        ]}
        fontSize={0.78}
        color="#ffffff"
        anchorX="center"
      >
        {title}
      </Text>

      <Text
        position={[
          0,

          4.85,

          -SIDE_STAND_DEPTH /
              2 +
            0.28,
        ]}
        fontSize={0.19}
        color="#8e95a1"
        anchorX="center"
      >
        {subtitle}
      </Text>
    </group>
  );
}

/* =========================================================
   PLAYSTATION
========================================================= */

function PlayStationStand() {
  /*
    Guardamos referencias reales de Three.js
    para PS1, PS2, PS3, PS4 y PS5.
  */

  const consoleRefs =
    useRef({});

  /*
    Consola que actualmente está enviándose
    a WorldScene.
  */

  const activeConsoleId =
    useRef(null);

  /*
    Reutilizamos Vector3 para evitar generar
    objetos nuevos 60 veces por segundo.
  */

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  /* =======================================================
     REGISTRAR CONSOLAS
  ======================================================= */

  function registerConsoleRef(
    id,
    node
  ) {
    if (node) {
      consoleRefs.current[
        id
      ] = node;
    } else {
      delete consoleRefs
        .current[id];
    }
  }

  /* =======================================================
     PROXIMIDAD

     Se ejecuta dentro del Canvas.

     IMPORTANTE:
     usamos getWorldPosition(), no las coordenadas locales,
     porque todo ManufacturerHall está dentro de grupos
     rotados y trasladados.
  ======================================================= */

  useFrame(() => {
    const body =
      playerRuntime.body;

    if (!body) {
      return;
    }

    const player =
      body.translation();

    if (!player) {
      return;
    }

    let nearestConsole =
      null;

    let nearestDistance =
      Infinity;

    for (
      const consoleData of
      PLAYSTATION_CONSOLES
    ) {
      const node =
        consoleRefs.current[
          consoleData.id
        ];

      if (!node) {
        continue;
      }

      node.getWorldPosition(
        worldPosition
      );

      /*
        Distancia horizontal.

        Ignoramos Y porque el jugador
        y la consola pueden tener alturas
        diferentes.
      */

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

      if (
        distance <
        nearestDistance
      ) {
        nearestDistance =
          distance;

        nearestConsole =
          consoleData;
      }
    }

    /* =====================================================
       YA HAY UNA CONSOLA ACTIVA
    ===================================================== */

    if (
      activeConsoleId.current
    ) {
      /*
        Buscamos específicamente la consola
        que estaba activa.

        Le damos un radio de salida algo mayor
        para evitar parpadeos.
      */

      const activeData =
        PLAYSTATION_CONSOLES.find(
          (item) =>
            item.id ===
            activeConsoleId.current
        );

      const activeNode =
        activeData
          ? consoleRefs.current[
              activeData.id
            ]
          : null;

      if (
        activeData &&
        activeNode
      ) {
        activeNode.getWorldPosition(
          worldPosition
        );

        const activeDx =
          player.x -
          worldPosition.x;

        const activeDz =
          player.z -
          worldPosition.z;

        const activeDistance =
          Math.sqrt(
            activeDx *
              activeDx +
            activeDz *
              activeDz
          );

        /*
          Seguimos dentro del radio de esa consola.
        */

        if (
          activeDistance <=
          CONSOLE_EXIT_DISTANCE
        ) {
          /*
            Pero si otra consola está claramente
            más cerca y ya entró en su radio,
            cambiamos de consola.
          */

          if (
            nearestConsole &&
            nearestConsole.id !==
              activeData.id &&
            nearestDistance <=
              CONSOLE_INTERACTION_DISTANCE
          ) {
            activeConsoleId.current =
              nearestConsole.id;

            window.dispatchEvent(
              new CustomEvent(
                "freaky:console-near",
                {
                  detail: {
                    near: true,

                    console:
                      nearestConsole,
                  },
                }
              )
            );
          }

          return;
        }
      }
    }

    /* =====================================================
       ENTRAMOS EN UNA CONSOLA
    ===================================================== */

    if (
      nearestConsole &&
      nearestDistance <=
        CONSOLE_INTERACTION_DISTANCE
    ) {
      if (
        activeConsoleId.current !==
        nearestConsole.id
      ) {
        activeConsoleId.current =
          nearestConsole.id;

        window.dispatchEvent(
          new CustomEvent(
            "freaky:console-near",
            {
              detail: {
                near: true,

                console:
                  nearestConsole,
              },
            }
          )
        );
      }

      return;
    }

    /* =====================================================
       SALIMOS DE TODAS
    ===================================================== */

    if (
      activeConsoleId.current
    ) {
      activeConsoleId.current =
        null;

      window.dispatchEvent(
        new CustomEvent(
          "freaky:console-near",
          {
            detail: {
              near: false,
              console: null,
            },
          }
        )
      );
    }
  });

  return (
    <group>
      <LargeStandShell
        title="PLAYSTATION"
        subtitle="SONY · 1994 — HOY"
        accent={
          COLORS.playstation
        }
      />

      {/* ===================================================
          PANEL BLANCO
      =================================================== */}

      <RoundedBox
        args={[
          17.8,
          3.3,
          0.12,
        ]}
        radius={0.15}
        smoothness={3}
        position={[
          0,
          3.05,
          -6.32,
        ]}
      >
        <meshStandardMaterial
          color="#eceef2"
          roughness={0.7}
        />
      </RoundedBox>

      {/* ===================================================
          SÍMBOLOS
      =================================================== */}

      <Text
        position={[
          -1.6,
          3.9,
          -6.23,
        ]}
        fontSize={0.75}
        color="#5b9dff"
      >
        △
      </Text>

      <Text
        position={[
          -0.55,
          3.9,
          -6.23,
        ]}
        fontSize={0.75}
        color="#ff5e71"
      >
        ○
      </Text>

      <Text
        position={[
          0.55,
          3.9,
          -6.23,
        ]}
        fontSize={0.75}
        color="#65aaff"
      >
        ×
      </Text>

      <Text
        position={[
          1.6,
          3.9,
          -6.23,
        ]}
        fontSize={0.75}
        color="#d27cff"
      >
        □
      </Text>

      {/* ===================================================
          CONSOLAS
      =================================================== */}

      <group
        position={[
          0,
          0.4,
          -0.4,
        ]}
      >
        {PLAYSTATION_CONSOLES.map(
          (
            consoleData
          ) => (
            <ConsoleExhibit
              key={
                consoleData.id
              }
              data={
                consoleData
              }
              registerRef={
                registerConsoleRef
              }
            />
          )
        )}
      </group>

      {/* ===================================================
          LÍNEA ENTRADA
      =================================================== */}

      <mesh
        position={[
          0,
          0.5,
          5.3,
        ]}
      >
        <boxGeometry
          args={[
            17.5,
            0.025,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.playstation
          }
          emissive={
            COLORS.playstation
          }
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   NINTENDO
========================================================= */

function NintendoStand() {
  return (
    <group>
      <LargeStandShell
        title="NINTENDO"
        subtitle="CONSOLAS · PORTÁTILES · JUEGOS"
        accent={
          COLORS.nintendo
        }
      />

      <Text
        position={[
          0,
          2.5,
          -6.25,
        ]}
        fontSize={0.32}
        color="#727985"
      >
        PRÓXIMAMENTE
      </Text>
    </group>
  );
}

/* =========================================================
   XBOX
========================================================= */

function XboxStand() {
  return (
    <group>
      <LargeStandShell
        title="XBOX"
        subtitle="MICROSOFT · CONSOLAS · ECOSISTEMA"
        accent={
          COLORS.xbox
        }
      />

      <Text
        position={[
          0,
          2.5,
          -6.25,
        ]}
        fontSize={0.32}
        color="#727985"
      >
        PRÓXIMAMENTE
      </Text>
    </group>
  );
}

/* =========================================================
   VR — META + VALVE
========================================================= */

function VRStand() {
  return (
    <group>
      <LargeStandShell
        title="REALIDAD VIRTUAL"
        subtitle="META · VALVE · PC VR"
        accent={
          COLORS.vr
        }
      />

      <RoundedBox
        args={[
          7.5,
          2.8,
          0.12,
        ]}
        radius={0.12}
        smoothness={3}
        position={[
          -4.4,
          2.8,
          -6.25,
        ]}
      >
        <meshStandardMaterial
          color="#20232b"
        />
      </RoundedBox>

      <RoundedBox
        args={[
          7.5,
          2.8,
          0.12,
        ]}
        radius={0.12}
        smoothness={3}
        position={[
          4.4,
          2.8,
          -6.25,
        ]}
      >
        <meshStandardMaterial
          color="#20232b"
        />
      </RoundedBox>

      <Text
        position={[
          -4.4,
          3.1,
          -6.15,
        ]}
        fontSize={0.45}
        color="#ffffff"
      >
        META
      </Text>

      <Text
        position={[
          4.4,
          3.1,
          -6.15,
        ]}
        fontSize={0.45}
        color="#ffffff"
      >
        VALVE
      </Text>

      <Text
        position={[
          -4.4,
          2.45,
          -6.14,
        ]}
        fontSize={0.17}
        color="#777e8b"
      >
        QUEST
      </Text>

      <Text
        position={[
          4.4,
          2.45,
          -6.14,
        ]}
        fontSize={0.17}
        color="#777e8b"
      >
        STEAMVR
      </Text>
    </group>
  );
}

/* =========================================================
   EXPOSICIÓN HISTÓRICA
========================================================= */

function HistoricPedestal({
  x,
  label,
  subtitle,
  type,
}) {
  return (
    <group
      position={[
        x,
        0,
        0.8,
      ]}
    >
      <RoundedBox
        args={[
          4.2,
          1,
          3.3,
        ]}
        radius={0.14}
        smoothness={3}
        position={[
          0,
          0.5,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#171a20"
          metalness={0.12}
          roughness={0.5}
        />
      </RoundedBox>

      {type ===
      "arcade" ? (
        <group
          position={[
            0,
            2.15,
            0,
          ]}
        >
          <mesh>
            <boxGeometry
              args={[
                1.7,
                3.2,
                1.4,
              ]}
            />

            <meshStandardMaterial
              color="#202329"
            />
          </mesh>

          <mesh
            position={[
              0,
              0.55,
              0.72,
            ]}
          >
            <planeGeometry
              args={[
                1.35,
                1,
              ]}
            />

            <meshStandardMaterial
              color="#050608"
              emissive="#17375e"
              emissiveIntensity={0.7}
            />
          </mesh>
        </group>
      ) : (
        <RoundedBox
          args={[
            2.3,
            0.55,
            1.65,
          ]}
          radius={0.12}
          smoothness={3}
          position={[
            0,
            1.55,
            0,
          ]}
        >
          <meshStandardMaterial
            color="#262930"
            roughness={0.45}
          />
        </RoundedBox>
      )}

      <Text
        position={[
          0,
          0.42,
          1.72,
        ]}
        fontSize={0.22}
        color="#ffffff"
      >
        {label}
      </Text>

      <Text
        position={[
          0,
          0.18,
          1.74,
        ]}
        fontSize={0.11}
        color="#858b96"
      >
        {subtitle}
      </Text>
    </group>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryStand() {
  return (
    <group>
      <RoundedBox
        args={[
          HISTORY_WIDTH,
          0.16,
          HISTORY_DEPTH,
        ]}
        radius={0.2}
        smoothness={3}
        position={[
          0,
          0.4,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#111318"
        />
      </RoundedBox>

      <mesh
        position={[
          0,

          HISTORY_HEIGHT /
            2,

          -HISTORY_DEPTH /
              2 +
            0.1,
        ]}
      >
        <boxGeometry
          args={[
            HISTORY_WIDTH,
            HISTORY_HEIGHT,
            0.24,
          ]}
        />

        <meshStandardMaterial
          color="#202229"
          roughness={0.62}
        />
      </mesh>

      <RoundedBox
        args={[
          HISTORY_WIDTH,
          0.9,
          1.1,
        ]}
        radius={0.15}
        smoothness={3}
        position={[
          0,

          HISTORY_HEIGHT -
            0.25,

          3.95,
        ]}
      >
        <meshStandardMaterial
          color="#292c33"
          metalness={0.2}
        />
      </RoundedBox>

      <mesh
        position={[
          0,

          HISTORY_HEIGHT -
            0.22,

          4.54,
        ]}
      >
        <boxGeometry
          args={[
            HISTORY_WIDTH -
              1.5,

            0.16,

            0.08,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.history
          }
          emissive={
            COLORS.history
          }
          emissiveIntensity={0.35}
        />
      </mesh>

      <Text
        position={[
          0,
          6,
          -4.32,
        ]}
        fontSize={0.72}
        color="#ffffff"
      >
        HISTORIA DEL HARDWARE
      </Text>

      <Text
        position={[
          0,
          5.35,
          -4.3,
        ]}
        fontSize={0.2}
        color="#9297a0"
      >
        CONSOLAS Y MÁQUINAS QUE DEJARON HUELLA
      </Text>

      <HistoricPedestal
        x={-10}
        label="ATARI"
        subtitle="2600"
      />

      <HistoricPedestal
        x={-3.4}
        label="SEGA"
        subtitle="MEGA DRIVE / DREAMCAST"
      />

      <HistoricPedestal
        x={3.4}
        label="SNK"
        subtitle="NEO GEO"
      />

      <HistoricPedestal
        x={10}
        label="NEO GEO"
        subtitle="ARCADE"
        type="arcade"
      />
    </group>
  );
}

/* =========================================================
   SALA COMPLETA
========================================================= */

export default function ManufacturerStand() {
  return (
    <group>
      {/* ===================================================
          CARTEL
      =================================================== */}

      <Text
        position={[
          0,
          6.2,
          31.5,
        ]}
        rotation={[
          0,
          Math.PI,
          0,
        ]}
        fontSize={1}
        color="#ffffff"
      >
        FABRICANTES
      </Text>

      <Text
        position={[
          0,
          5.35,
          31.45,
        ]}
        rotation={[
          0,
          Math.PI,
          0,
        ]}
        fontSize={0.22}
        color="#808692"
      >
        CONSOLAS · REALIDAD VIRTUAL · HISTORIA
      </Text>

      {/* ===================================================
          PASILLO
      =================================================== */}

      <RoundedBox
        args={[
          14,
          0.02,
          57,
        ]}
        radius={0.1}
        smoothness={2}
        position={[
          0,
          0.33,
          1,
        ]}
      >
        <meshStandardMaterial
          color="#15181d"
          roughness={0.84}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.35,
          2,
        ]}
      >
        <boxGeometry
          args={[
            0.045,
            0.012,
            50,
          ]}
        />

        <meshStandardMaterial
          color="#383d45"
        />
      </mesh>

      {/* ===================================================
          PLAYSTATION
      =================================================== */}

      <group
        position={[
          -21,
          0,
          15,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >
        <PlayStationStand />
      </group>

      {/* ===================================================
          XBOX
      =================================================== */}

      <group
        position={[
          21,
          0,
          15,
        ]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
      >
        <XboxStand />
      </group>

      {/* ===================================================
          NINTENDO
      =================================================== */}

      <group
        position={[
          -21,
          0,
          -8,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >
        <NintendoStand />
      </group>

      {/* ===================================================
          VR
      =================================================== */}

      <group
        position={[
          21,
          0,
          -8,
        ]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
      >
        <VRStand />
      </group>

      {/* ===================================================
          HISTORIA
      =================================================== */}

      <group
        position={[
          0,
          0,
          -27.5,
        ]}
      >
        <HistoryStand />
      </group>
    </group>
  );
}
