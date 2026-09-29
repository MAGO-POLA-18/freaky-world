"use client";

import {
  useMemo,
  useState,
} from "react";

import * as THREE from "three";

import {
  Html,
  RoundedBox,
  Text,
} from "@react-three/drei";

/* =========================================================
   FREAKY WORLD — MANUFACTURER HALL
========================================================= */

/* =========================================================
   MEDIDAS
========================================================= */

const STAND_WIDTH = 13;
const STAND_DEPTH = 11.5;
const STAND_HEIGHT = 6.2;

/*
  Distribución:

              PANTALLA
                 ↑

  SONY                    XBOX
  NINTENDO                VALVE
  SEGA                    ATARI
  META                    SNK

             PASILLO

              ENTRADA
*/

const BRAND_STANDS = [
  /* IZQUIERDA */

  {
    id: "sony",
    name: "PLAYSTATION",
    x: -21,
    z: -21,
    side: "left",
  },

  {
    id: "nintendo",
    name: "NINTENDO",
    x: -21,
    z: -7,
    side: "left",
  },

  {
    id: "sega",
    name: "SEGA",
    x: -21,
    z: 7,
    side: "left",
  },

  {
    id: "meta",
    name: "META",
    x: -21,
    z: 21,
    side: "left",
  },

  /* DERECHA */

  {
    id: "xbox",
    name: "XBOX",
    x: 21,
    z: -21,
    side: "right",
  },

  {
    id: "valve",
    name: "VALVE",
    x: 21,
    z: -7,
    side: "right",
  },

  {
    id: "atari",
    name: "ATARI",
    x: 21,
    z: 7,
    side: "right",
  },

  {
    id: "snk",
    name: "SNK",
    x: 21,
    z: 21,
    side: "right",
  },
];

/* =========================================================
   PLAYSTATION
========================================================= */

const PLAYSTATION_CONSOLES = [
  {
    id: "ps1",
    name: "PlayStation",
    short: "PS1",
    year: "1994",
    generation: "5ª generación",

    description:
      "La primera consola doméstica de Sony y el inicio de la familia PlayStation.",

    pedestalX: -4.4,
  },

  {
    id: "ps2",
    name: "PlayStation 2",
    short: "PS2",
    year: "2000",
    generation: "6ª generación",

    description:
      "Segunda consola de sobremesa PlayStation y una de las máquinas más importantes de la historia de los videojuegos.",

    pedestalX: -2.2,
  },

  {
    id: "ps3",
    name: "PlayStation 3",
    short: "PS3",
    year: "2006",
    generation: "7ª generación",

    description:
      "La generación que introdujo Blu-ray y consolidó PlayStation Network.",

    pedestalX: 0,
  },

  {
    id: "ps4",
    name: "PlayStation 4",
    short: "PS4",
    year: "2013",
    generation: "8ª generación",

    description:
      "Una generación centrada en arquitectura x86, servicios online y un fuerte catálogo de juegos.",

    pedestalX: 2.2,
  },

  {
    id: "ps5",
    name: "PlayStation 5",
    short: "PS5",
    year: "2020",
    generation: "9ª generación",

    description:
      "La generación actual de sobremesa de PlayStation.",

    pedestalX: 4.4,
  },
];

/* =========================================================
   INFO
========================================================= */

function InfoCell({
  label,
  value,
}) {
  return (
    <div
      style={{
        background:
          "rgba(255,255,255,0.06)",

        borderRadius: 10,

        padding: 10,
      }}
    >
      <div
        style={{
          fontSize: 9,

          textTransform:
            "uppercase",

          letterSpacing: 1,

          opacity: 0.45,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 12,

          fontWeight: 700,

          marginTop: 3,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ConsoleInfoPanel({
  consoleData,
  onClose,
}) {
  if (!consoleData) {
    return null;
  }

  return (
    <Html
      center
      position={[
        0,
        5,
        1,
      ]}
      style={{
        pointerEvents:
          "auto",
      }}
    >
      <div
        style={{
          width: 300,

          background:
            "rgba(8,10,18,0.96)",

          color: "white",

          border:
            "1px solid rgba(255,255,255,0.18)",

          borderRadius: 18,

          boxShadow:
            "0 20px 60px rgba(0,0,0,0.55)",

          padding: 18,

          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

          backdropFilter:
            "blur(14px)",
        }}
      >
        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "flex-start",

            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,

                letterSpacing:
                  1.5,

                opacity: 0.55,

                marginBottom: 5,
              }}
            >
              SONY · PLAYSTATION
            </div>

            <div
              style={{
                fontSize: 21,

                fontWeight: 800,

                lineHeight: 1.1,
              }}
            >
              {consoleData.name}
            </div>
          </div>

          <button
            onClick={
              onClose
            }
            style={{
              border: 0,

              width: 30,

              height: 30,

              borderRadius: 999,

              background:
                "rgba(255,255,255,0.1)",

              color: "white",

              cursor:
                "pointer",

              fontSize: 17,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            marginTop: 16,

            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 8,
          }}
        >
          <InfoCell
            label="Lanzamiento"
            value={
              consoleData.year
            }
          />

          <InfoCell
            label="Generación"
            value={
              consoleData.generation
            }
          />
        </div>

        <div
          style={{
            marginTop: 14,

            fontSize: 13,

            lineHeight: 1.5,

            opacity: 0.8,
          }}
        >
          {
            consoleData.description
          }
        </div>

        <button
          onClick={() => {
            console.log(
              "Abrir ficha completa:",
              consoleData.id
            );
          }}
          style={{
            marginTop: 16,

            width: "100%",

            border: 0,

            borderRadius: 12,

            padding:
              "11px 14px",

            background:
              "#ffffff",

            color:
              "#080a12",

            fontWeight: 800,

            cursor:
              "pointer",
          }}
        >
          Abrir ficha completa
        </button>
      </div>
    </Html>
  );
}

/* =========================================================
   PEDESTAL
========================================================= */

function Pedestal({
  active = false,
}) {
  return (
    <group>
      <RoundedBox
        args={[
          1.55,
          0.7,
          1.55,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          0,
          0.35,
          0,
        ]}
      >
        <meshStandardMaterial
          color={
            active
              ? "#17233c"
              : "#181a20"
          }
          roughness={0.42}
          metalness={0.2}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          0.72,
          0,
        ]}
      >
        <boxGeometry
          args={[
            1.42,
            0.05,
            1.42,
          ]}
        />

        <meshStandardMaterial
          color="#f4f4f4"
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
    <group>
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
          color="#a4a4a0"
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
    <group>
      <mesh>
        <boxGeometry
          args={[
            0.92,
            0.22,
            1.05,
          ]}
        />

        <meshStandardMaterial
          color="#15171d"
          roughness={0.53}
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
                0.015,
                0.035,
              ]}
            />

            <meshStandardMaterial
              color="#272a31"
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   PS3
========================================================= */

function PS3Model() {
  return (
    <group>
      <RoundedBox
        args={[
          1,
          0.28,
          0.88,
        ]}
        radius={0.16}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#101012"
          roughness={0.28}
          metalness={0.18}
        />
      </RoundedBox>
    </group>
  );
}

/* =========================================================
   PS4
========================================================= */

function PS4Model() {
  return (
    <group
      rotation={[
        0,
        -0.12,
        0,
      ]}
    >
      <mesh
        position={[
          0,
          0.07,
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
          0.22,
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
          0.145,
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
      position={[
        0,
        0.48,
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
          color="#f2f2f0"
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
          color="#f2f2f0"
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
   EXHIBIT
========================================================= */

function ConsoleExhibit({
  data,
  selected,
  onSelect,
}) {
  const [
    hovered,
    setHovered,
  ] = useState(false);

  return (
    <group
      position={[
        data.pedestalX,
        0,
        0,
      ]}
      scale={
        hovered ||
        selected
          ? 1.07
          : 1
      }
      onPointerOver={(
        event
      ) => {
        event.stopPropagation();

        setHovered(true);

        document.body.style.cursor =
          "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);

        document.body.style.cursor =
          "default";
      }}
      onClick={(
        event
      ) => {
        event.stopPropagation();

        onSelect(data);
      }}
    >
      <Pedestal
        active={
          hovered ||
          selected
        }
      />

      <group
        position={[
          0,
          1.05,
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
          0.2,
          0.86,
        ]}
        rotation={[
          -0.45,
          0,
          0,
        ]}
        fontSize={0.18}
        color="#ffffff"
      >
        {data.short}
      </Text>

      <Text
        position={[
          0,
          0.06,
          0.88,
        ]}
        rotation={[
          -0.45,
          0,
          0,
        ]}
        fontSize={0.09}
        color="#888b93"
      >
        {data.year}
      </Text>
    </group>
  );
}

/* =========================================================
   ESTRUCTURA EXTERIOR DEL STAND

   Esto es lo que hace que cada stand se sienta
   mucho más importante.
========================================================= */

function StandStructure({
  accent = "#454a55",
}) {
  return (
    <group>
      {/* SUELO */}

      <RoundedBox
        args={[
          STAND_WIDTH,
          0.14,
          STAND_DEPTH,
        ]}
        radius={0.15}
        smoothness={2}
        position={[
          0,
          0.38,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#111318"
          roughness={0.68}
        />
      </RoundedBox>

      {/* PARED TRASERA */}

      <mesh
        position={[
          0,
          STAND_HEIGHT / 2,
          -STAND_DEPTH / 2 +
            0.1,
        ]}
      >
        <boxGeometry
          args={[
            STAND_WIDTH,
            STAND_HEIGHT,
            0.2,
          ]}
        />

        <meshStandardMaterial
          color="#1b1e24"
          roughness={0.65}
        />
      </mesh>

      {/* PILAR IZQUIERDO */}

      <RoundedBox
        args={[
          0.55,
          STAND_HEIGHT,
          0.55,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          -STAND_WIDTH /
            2 +
            0.35,

          STAND_HEIGHT /
            2,

          STAND_DEPTH /
            2 -
            0.35,
        ]}
      >
        <meshStandardMaterial
          color="#252932"
          metalness={0.3}
          roughness={0.38}
        />
      </RoundedBox>

      {/* PILAR DERECHO */}

      <RoundedBox
        args={[
          0.55,
          STAND_HEIGHT,
          0.55,
        ]}
        radius={0.08}
        smoothness={2}
        position={[
          STAND_WIDTH /
            2 -
            0.35,

          STAND_HEIGHT /
            2,

          STAND_DEPTH /
            2 -
            0.35,
        ]}
      >
        <meshStandardMaterial
          color="#252932"
          metalness={0.3}
          roughness={0.38}
        />
      </RoundedBox>

      {/* MARQUESINA SUPERIOR */}

      <RoundedBox
        args={[
          STAND_WIDTH,
          0.55,
          1,
        ]}
        radius={0.12}
        smoothness={2}
        position={[
          0,
          STAND_HEIGHT -
            0.1,
          STAND_DEPTH /
            2 -
            0.45,
        ]}
      >
        <meshStandardMaterial
          color="#20242d"
          metalness={0.25}
          roughness={0.38}
        />
      </RoundedBox>

      {/* FRANJA DE IDENTIDAD */}

      <mesh
        position={[
          0,
          STAND_HEIGHT -
            0.08,

          STAND_DEPTH /
            2 +
            0.07,
        ]}
      >
        <boxGeometry
          args={[
            STAND_WIDTH -
              1.1,

            0.12,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PLAYSTATION SYMBOLS
========================================================= */

function PlayStationSymbols() {
  return (
    <group
      position={[
        0,
        4.25,
        -5.65,
      ]}
    >
      <Text
        position={[
          -1.05,
          0,
          0,
        ]}
        fontSize={0.72}
        color="#5b9dff"
      >
        △
      </Text>

      <Text
        position={[
          -0.35,
          0,
          0,
        ]}
        fontSize={0.72}
        color="#ff5e71"
      >
        ○
      </Text>

      <Text
        position={[
          0.35,
          0,
          0,
        ]}
        fontSize={0.72}
        color="#6bbcff"
      >
        ×
      </Text>

      <Text
        position={[
          1.05,
          0,
          0,
        ]}
        fontSize={0.72}
        color="#df7bff"
      >
        □
      </Text>
    </group>
  );
}

/* =========================================================
   SONY
========================================================= */

function SonyStand() {
  const [
    selectedConsole,
    setSelectedConsole,
  ] = useState(null);

  return (
    <group>
      <StandStructure
        accent="#1768e5"
      />

      {/* PARED INTERIOR BLANCA */}

      <mesh
        position={[
          0,
          3.2,
          -5.62,
        ]}
      >
        <boxGeometry
          args={[
            11.4,
            5.25,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color="#eef0f4"
          roughness={0.68}
        />
      </mesh>

      <Text
        position={[
          0,
          5,
          -5.55,
        ]}
        fontSize={0.76}
        color="#111722"
      >
        PLAYSTATION
      </Text>

      <Text
        position={[
          0,
          4.48,
          -5.54,
        ]}
        fontSize={0.16}
        color="#666d7a"
      >
        SONY · 1994 — HOY
      </Text>

      <PlayStationSymbols />

      {/* CONSOLAS */}

      <group
        position={[
          0,
          0.4,
          -1.3,
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
              selected={
                selectedConsole?.id ===
                consoleData.id
              }
              onSelect={
                setSelectedConsole
              }
            />
          )
        )}
      </group>

      {/* LÍNEA ENTRADA */}

      <mesh
        position={[
          0,
          0.48,
          4.7,
        ]}
      >
        <boxGeometry
          args={[
            10.5,
            0.025,
            0.1,
          ]}
        />

        <meshStandardMaterial
          color="#1768e5"
          emissive="#0d4cbd"
          emissiveIntensity={0.7}
        />
      </mesh>

      {selectedConsole && (
        <ConsoleInfoPanel
          consoleData={
            selectedConsole
          }
          onClose={() =>
            setSelectedConsole(
              null
            )
          }
        />
      )}
    </group>
  );
}

/* =========================================================
   STAND VACÍO
========================================================= */

function EmptyStand({
  name,
}) {
  return (
    <group>
      <StandStructure />

      <Text
        position={[
          0,
          4.1,
          -5.62,
        ]}
        fontSize={0.55}
        color="#9499a3"
      >
        {name}
      </Text>

      <Text
        position={[
          0,
          3.45,
          -5.61,
        ]}
        fontSize={0.16}
        color="#555a64"
      >
        PRÓXIMAMENTE
      </Text>
    </group>
  );
}

/* =========================================================
   BRAND STAND

   IZQUIERDA:
   el frente mira hacia +X

   DERECHA:
   el frente mira hacia -X
========================================================= */

function BrandStand({
  stand,
}) {
  const rotationY =
    stand.side === "left"
      ? Math.PI / 2
      : -Math.PI / 2;

  return (
    <group
      position={[
        stand.x,
        0,
        stand.z,
      ]}
      rotation={[
        0,
        rotationY,
        0,
      ]}
    >
      {stand.id ===
      "sony" ? (
        <SonyStand />
      ) : (
        <EmptyStand
          name={stand.name}
        />
      )}
    </group>
  );
}

/* =========================================================
   PANTALLA DEL FONDO
========================================================= */

function BackVideoWall() {
  return (
    <group
      position={[
        0,
        0,
        -31.8,
      ]}
    >
      {/* ESTRUCTURA */}

      <RoundedBox
        args={[
          22,
          8.4,
          0.65,
        ]}
        radius={0.2}
        smoothness={3}
        position={[
          0,
          4.6,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#181b21"
          metalness={0.3}
          roughness={0.4}
        />
      </RoundedBox>

      {/* PANTALLA */}

      <mesh
        position={[
          0,
          4.6,
          0.36,
        ]}
      >
        <planeGeometry
          args={[
            20.4,
            6.9,
          ]}
        />

        <meshStandardMaterial
          color="#050608"
          emissive="#050608"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* PLACEHOLDER */}

      <Text
        position={[
          0,
          5,
          0.42,
        ]}
        fontSize={0.5}
        color="#636a78"
      >
        FREAKY WORLD
      </Text>

      <Text
        position={[
          0,
          4.25,
          0.42,
        ]}
        fontSize={0.2}
        color="#3f444e"
      >
        PANTALLA DE FABRICANTES
      </Text>

      {/* BASE */}

      <RoundedBox
        args={[
          8,
          0.5,
          1.6,
        ]}
        radius={0.14}
        smoothness={2}
        position={[
          0,
          0.55,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#181b20"
          roughness={0.6}
        />
      </RoundedBox>
    </group>
  );
}

/* =========================================================
   MANUFACTURER HALL
========================================================= */

export default function ManufacturerStand() {
  return (
    <group>
      {/* ===================================================
          TÍTULO DE ENTRADA
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
        CONSOLAS · HISTORIA · ECOSISTEMAS
      </Text>

      {/* ===================================================
          PASILLO CENTRAL
      =================================================== */}

      <RoundedBox
        args={[
          15,
          0.02,
          58,
        ]}
        radius={0.1}
        smoothness={2}
        position={[
          0,
          0.33,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#15181d"
          roughness={0.84}
        />
      </RoundedBox>

      {/* GUÍA CENTRAL */}

      <mesh
        position={[
          0,
          0.35,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.05,
            0.012,
            52,
          ]}
        />

        <meshStandardMaterial
          color="#3b4048"
        />
      </mesh>

      {/* ===================================================
          STANDS
      =================================================== */}

      {BRAND_STANDS.map(
        (stand) => (
          <BrandStand
            key={stand.id}
            stand={stand}
          />
        )
      )}

      {/* ===================================================
          PANTALLA FONDO
      =================================================== */}

      <BackVideoWall />
    </group>
  );
}
