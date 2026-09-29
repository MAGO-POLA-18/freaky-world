"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";

import {
  RoundedBox,
  Text,
  Html,
} from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   CONFIG
========================================================= */

const STAND_WIDTH = 12;
const STAND_DEPTH = 10;

const BRAND_STANDS = [
  {
    id: "sony",
    name: "PLAYSTATION",
    x: -21,
    z: -18,
    side: "north",
    active: true,
  },
  {
    id: "nintendo",
    name: "NINTENDO",
    x: -7,
    z: -18,
    side: "north",
  },
  {
    id: "sega",
    name: "SEGA",
    x: 7,
    z: -18,
    side: "north",
  },
  {
    id: "meta",
    name: "META",
    x: 21,
    z: -18,
    side: "north",
  },

  {
    id: "xbox",
    name: "XBOX",
    x: -21,
    z: 18,
    side: "south",
  },
  {
    id: "valve",
    name: "VALVE",
    x: -7,
    z: 18,
    side: "south",
  },
  {
    id: "atari",
    name: "ATARI",
    x: 7,
    z: 18,
    side: "south",
  },
  {
    id: "snk",
    name: "SNK",
    x: 21,
    z: 18,
    side: "south",
  },
];

/* =========================================================
   DATOS PLAYSTATION
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
      "Segunda generación PlayStation y una de las consolas más importantes de la historia.",
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
      "Una generación centrada en arquitectura x86, servicios online y fuerte catálogo first-party.",
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
   PANEL DE INFORMACIÓN
========================================================= */

function ConsoleInfoPanel({
  consoleData,
  onClose,
}) {
  if (!consoleData) return null;

  return (
    <Html
      center
      position={[0, 3.5, 0]}
      style={{
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          width: 300,
          background:
            "rgba(8, 10, 18, 0.96)",
          color: "white",
          border:
            "1px solid rgba(255,255,255,0.18)",
          borderRadius: 18,
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.55)",
          padding: 18,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backdropFilter: "blur(14px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.6,
                opacity: 0.55,
                marginBottom: 4,
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
            onClick={onClose}
            style={{
              border: 0,
              width: 30,
              height: 30,
              borderRadius: 999,
              background:
                "rgba(255,255,255,0.1)",
              color: "white",
              cursor: "pointer",
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
            value={consoleData.year}
          />

          <InfoCell
            label="Generación"
            value={consoleData.generation}
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
          {consoleData.description}
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
            padding: "11px 14px",
            background: "#ffffff",
            color: "#080a12",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Abrir ficha completa
        </button>
      </div>
    </Html>
  );
}

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
          textTransform: "uppercase",
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
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   PEDESTAL
========================================================= */

function Pedestal({
  position,
  active = false,
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[1.55, 0.65, 1.55]}
        radius={0.08}
        smoothness={2}
      >
        <meshStandardMaterial
          color={
            active
              ? "#151c2d"
              : "#181818"
          }
          roughness={0.42}
          metalness={0.25}
        />
      </RoundedBox>

      <mesh position={[0, 0.36, 0]}>
        <boxGeometry
          args={[1.42, 0.05, 1.42]}
        />
        <meshStandardMaterial
          color="#fafafa"
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   MODELOS 3D SIMPLIFICADOS
========================================================= */

function PS1Model() {
  return (
    <group>
      <RoundedBox
        args={[1.1, 0.26, 0.85]}
        radius={0.08}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#b8b8b5"
          roughness={0.6}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.145, 0]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <cylinderGeometry
          args={[0.28, 0.28, 0.015, 32]}
        />
        <meshStandardMaterial
          color="#a4a4a0"
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
          color="#8d8d89"
        />
      </mesh>
    </group>
  );
}

function PS2Model() {
  return (
    <group>
      <mesh>
        <boxGeometry
          args={[0.92, 0.22, 1.05]}
        />
        <meshStandardMaterial
          color="#15171d"
          roughness={0.53}
        />
      </mesh>

      {[0.18, 0.06, -0.06, -0.18].map(
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

function PS3Model() {
  return (
    <group>
      <RoundedBox
        args={[1.0, 0.28, 0.88]}
        radius={0.16}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#101012"
          roughness={0.28}
          metalness={0.18}
        />
      </RoundedBox>

      <mesh
        position={[0, 0.145, 0.18]}
      >
        <boxGeometry
          args={[
            0.82,
            0.012,
            0.025,
          ]}
        />
        <meshStandardMaterial
          color="#48484b"
        />
      </mesh>
    </group>
  );
}

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
        position={[0, 0.07, 0]}
        rotation={[
          0,
          0,
          -0.035,
        ]}
      >
        <boxGeometry
          args={[1.05, 0.14, 0.9]}
        />
        <meshStandardMaterial
          color="#161719"
          roughness={0.48}
        />
      </mesh>

      <mesh
        position={[0, 0.22, 0]}
        rotation={[
          0,
          0,
          0.035,
        ]}
      >
        <boxGeometry
          args={[1.02, 0.14, 0.87]}
        />
        <meshStandardMaterial
          color="#202124"
          roughness={0.45}
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

function PS5Model() {
  const shellShape =
    useMemo(() => {
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
    }, []);

  return (
    <group
      position={[0, 0.48, 0]}
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
          roughness={0.33}
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
              bevelEnabled: false,
            },
          ]}
        />
        <meshStandardMaterial
          color="#f2f2f0"
          roughness={0.5}
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
              bevelEnabled: false,
            },
          ]}
        />
        <meshStandardMaterial
          color="#f2f2f0"
          roughness={0.5}
        />
      </mesh>

      <pointLight
        position={[
          0,
          0.15,
          0.3,
        ]}
        color="#2876ff"
        intensity={0.4}
        distance={2}
      />
    </group>
  );
}

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
   CONSOLA INTERACTIVA
========================================================= */

function ConsoleExhibit({
  data,
  selected,
  onSelect,
}) {
  const [hovered, setHovered] =
    useState(false);

  const scale =
    hovered || selected
      ? 1.08
      : 1;

  return (
    <group
      position={[
        data.pedestalX,
        0,
        0.15,
      ]}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();

        setHovered(true);

        document.body.style.cursor =
          "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);

        document.body.style.cursor =
          "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
    >
      <Pedestal
        position={[0, 0.33, 0]}
        active={
          hovered || selected
        }
      />

      <group
        position={[
          0,
          0.95,
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
          0.18,
          0.82,
        ]}
        rotation={[
          -0.45,
          0,
          0,
        ]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {data.short}
      </Text>

      <Text
        position={[
          0,
          0.04,
          0.84,
        ]}
        rotation={[
          -0.45,
          0,
          0,
        ]}
        fontSize={0.09}
        color="#888b93"
        anchorX="center"
        anchorY="middle"
      >
        {data.year}
      </Text>
    </group>
  );
}

/* =========================================================
   SÍMBOLOS PLAYSTATION
========================================================= */

function PlayStationSymbols() {
  return (
    <group
      position={[0, 4.1, -4.75]}
    >
      <Text
        position={[
          -1.05,
          0,
          0,
        ]}
        fontSize={0.7}
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
        fontSize={0.7}
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
        fontSize={0.7}
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
        fontSize={0.7}
        color="#df7bff"
      >
        □
      </Text>
    </group>
  );
}

/* =========================================================
   SONY / PLAYSTATION
========================================================= */

function SonyStand() {
  const [
    selectedConsole,
    setSelectedConsole,
  ] = useState(null);

  return (
    <group>
      {/* suelo */}
      <RoundedBox
        args={[
          STAND_WIDTH,
          0.16,
          STAND_DEPTH,
        ]}
        radius={0.18}
        smoothness={2}
        position={[
          0,
          0.08,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#10131a"
          roughness={0.62}
        />
      </RoundedBox>

      {/* pared trasera */}
      <mesh
        position={[
          0,
          2.4,
          -4.85,
        ]}
      >
        <boxGeometry
          args={[
            STAND_WIDTH,
            4.8,
            0.22,
          ]}
        />
        <meshStandardMaterial
          color="#f2f3f5"
          roughness={0.65}
        />
      </mesh>

      {/* franja superior */}
      <mesh
        position={[
          0,
          4.55,
          -4.7,
        ]}
      >
        <boxGeometry
          args={[
            10.5,
            0.14,
            0.18,
          ]}
        />
        <meshStandardMaterial
          color="#1768e5"
          emissive="#0d3f91"
          emissiveIntensity={0.65}
        />
      </mesh>

      <Text
        position={[
          0,
          3.2,
          -4.7,
        ]}
        fontSize={0.75}
        color="#121722"
        anchorX="center"
      >
        PLAYSTATION
      </Text>

      <Text
        position={[
          0,
          2.58,
          -4.69,
        ]}
        fontSize={0.18}
        color="#6c7180"
        anchorX="center"
      >
        1994 — HOY
      </Text>

      <PlayStationSymbols />

      {/* consolas */}
      <group
        position={[
          0,
          0,
          -1.25,
        ]}
      >
        {PLAYSTATION_CONSOLES.map(
          (consoleData) => (
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

      {/* línea azul */}
      <mesh
        position={[
          0,
          0.15,
          3.4,
        ]}
      >
        <boxGeometry
          args={[
            9.2,
            0.025,
            0.08,
          ]}
        />
        <meshStandardMaterial
          color="#1673ff"
          emissive="#0b4fd5"
          emissiveIntensity={1}
        />
      </mesh>

      <Text
        position={[
          0,
          0.18,
          3.1,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        fontSize={0.13}
        color="#8c94a4"
      >
        ACÉRCATE · EXPLORA · DESCUBRE
      </Text>

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
      <RoundedBox
        args={[
          STAND_WIDTH,
          0.12,
          STAND_DEPTH,
        ]}
        radius={0.16}
        smoothness={2}
        position={[
          0,
          0.06,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#17191e"
          roughness={0.7}
        />
      </RoundedBox>

      <mesh
        position={[
          0,
          2.05,
          -4.85,
        ]}
      >
        <boxGeometry
          args={[
            STAND_WIDTH,
            4.1,
            0.18,
          ]}
        />
        <meshStandardMaterial
          color="#202228"
          roughness={0.72}
        />
      </mesh>

      <Text
        position={[
          0,
          2.65,
          -4.72,
        ]}
        fontSize={0.55}
        color="#777b84"
        anchorX="center"
      >
        {name}
      </Text>

      <Text
        position={[
          0,
          2.05,
          -4.71,
        ]}
        fontSize={0.17}
        color="#4f5259"
        anchorX="center"
      >
        PRÓXIMAMENTE
      </Text>

      <mesh
        position={[
          0,
          0.14,
          2.8,
        ]}
      >
        <boxGeometry
          args={[
            5,
            0.025,
            0.04,
          ]}
        />
        <meshStandardMaterial
          color="#34363d"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   STAND WRAPPER
========================================================= */

function ManufacturerStand({
  stand,
}) {
  const isSouth =
    stand.side === "south";

  return (
    <group
      position={[
        stand.x,
        0,
        stand.z,
      ]}
      rotation={[
        0,
        isSouth
          ? Math.PI
          : 0,
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
   SALA
========================================================= */

export default function ManufacturerHall({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* suelo general */}
      <RigidBody
        type="fixed"
        colliders={false}
      >
        <mesh
          position={[
            0,
            -0.11,
            0,
          ]}
          receiveShadow
        >
          <boxGeometry
            args={[
              60,
              0.2,
              54,
            ]}
          />

          <meshStandardMaterial
            color="#0b0c0f"
            roughness={0.85}
          />
        </mesh>

        <CuboidCollider
          args={[
            30,
            0.1,
            27,
          ]}
          position={[
            0,
            -0.11,
            0,
          ]}
        />
      </RigidBody>

      {/* corredor */}
      <RoundedBox
        args={[
          54,
          0.025,
          10,
        ]}
        radius={0.1}
        smoothness={2}
        position={[
          0,
          0.015,
          0,
        ]}
      >
        <meshStandardMaterial
          color="#15171b"
          roughness={0.74}
        />
      </RoundedBox>

      {/* línea central */}
      <mesh
        position={[
          0,
          0.035,
          0,
        ]}
      >
        <boxGeometry
          args={[
            48,
            0.012,
            0.035,
          ]}
        />

        <meshStandardMaterial
          color="#31343b"
        />
      </mesh>

      {/* título sala */}
      <Text
        position={[
          0,
          5.4,
          -26,
        ]}
        fontSize={1.15}
        color="#ffffff"
        anchorX="center"
      >
        FABRICANTES
      </Text>

      <Text
        position={[
          0,
          4.45,
          -25.98,
        ]}
        fontSize={0.25}
        color="#767b85"
        anchorX="center"
      >
        HISTORIA · CONSOLAS · ECOSISTEMAS
      </Text>

      {/* ocho stands */}
      {BRAND_STANDS.map(
        (stand) => (
          <ManufacturerStand
            key={stand.id}
            stand={stand}
          />
        )
      )}

      {/* iluminación muy ligera */}
      <ambientLight
        intensity={0.3}
      />

      <directionalLight
        position={[
          0,
          12,
          4,
        ]}
        intensity={0.5}
      />
    </group>
  );
}
