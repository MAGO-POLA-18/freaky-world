"use client";

import { useMemo } from "react";

/* =========================================================
   CONFIGURACIÓN

   FASE 1:
   Jardín limpio y continuo.
   Sin árboles, sin arbustos, sin césped roto.

   Solo 4 zonas de césped bien definidas alrededor
   de la plaza central.
========================================================= */

const LAWN_PATCHES = [
  {
    position: [-30, 0.43, -30],
    scale: [29.5, 0.08, 29.5],
  },
  {
    position: [30, 0.43, -30],
    scale: [29.5, 0.08, 29.5],
  },
  {
    position: [-30, 0.43, 30],
    scale: [29.5, 0.08, 29.5],
  },
  {
    position: [30, 0.43, 30],
    scale: [29.5, 0.08, 29.5],
  },
];

/* =========================================================
   COMPONENTE DE PARCHE DE CÉSPED

   Tiene:
   - base oscura
   - césped principal
   - una ligera capa de variación
   - bordes discretos para que se lea mejor
========================================================= */

function LawnPatch({ position, scale }) {
  const [x, y, z] = position;
  const [sx, sy, sz] = scale;

  return (
    <group position={[x, y, z]}>
      {/* ===============================================
          BASE OSCURA
      =============================================== */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial
          color="#3f5a36"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* ===============================================
          CAPA PRINCIPAL DE CÉSPED
      =============================================== */}
      <mesh receiveShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[sx - 0.5, 0.03, sz - 0.5]} />
        <meshStandardMaterial
          color="#587645"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* ===============================================
          CAPA SUAVE DE VARIACIÓN

          Apenas levanta un poco el centro para que no
          se vea tan plano y artificial.
      =============================================== */}
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[sx - 2.8, 0.015, sz - 2.8]} />
        <meshStandardMaterial
          color="#648451"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* ===============================================
          BORDE SUPERIOR SUAVE
      =============================================== */}
      <mesh receiveShadow position={[0, 0.025, 0]}>
        <boxGeometry args={[sx - 1.4, 0.01, sz - 1.4]} />
        <meshStandardMaterial
          color="#6d8d57"
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   DETALLE SUTIL DE SUPERFICIE

   Esto NO es el césped "AAA" todavía.
   Solo genera ligeras placas internas de color
   para que la zona verde no quede como una baldosa plana.

   Seguimos muy livianos.
========================================================= */

function GrassToneVariation() {
  const details = useMemo(() => {
    return [
      [-36, 0.49, -36, 8, 0.01, 7, "#5d7c49"],
      [-24, 0.49, -23, 7, 0.01, 6, "#537041"],
      [-35, 0.49, 24, 8, 0.01, 7, "#5d7c49"],
      [-22, 0.49, 36, 6, 0.01, 8, "#537041"],

      [36, 0.49, -36, 7, 0.01, 8, "#5d7c49"],
      [23, 0.49, -24, 6, 0.01, 7, "#537041"],
      [35, 0.49, 24, 8, 0.01, 6, "#5d7c49"],
      [23, 0.49, 36, 7, 0.01, 8, "#537041"],

      [-30, 0.49, -34, 10, 0.01, 4, "#6a8c54"],
      [30, 0.49, -34, 10, 0.01, 4, "#6a8c54"],
      [-30, 0.49, 34, 10, 0.01, 4, "#6a8c54"],
      [30, 0.49, 34, 10, 0.01, 4, "#6a8c54"],
    ];
  }, []);

  return (
    <group>
      {details.map((item, index) => {
        const [x, y, z, sx, sy, sz, color] = item;

        return (
          <mesh
            key={index}
            position={[x, y, z]}
            receiveShadow
          >
            <boxGeometry args={[sx, sy, sz]} />
            <meshStandardMaterial
              color={color}
              roughness={1}
              metalness={0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* =========================================================
   CENTRAL GARDEN
========================================================= */

export default function CentralGarden() {
  return (
    <group>
      {/* ===================================================
          4 ZONAS DE CÉSPED CONTINUO
      =================================================== */}
      {LAWN_PATCHES.map((patch, index) => (
        <LawnPatch
          key={index}
          position={patch.position}
          scale={patch.scale}
        />
      ))}

      {/* ===================================================
          VARIACIÓN SUTIL DEL TONO DEL PASTO
      =================================================== */}
      <GrassToneVariation />
    </group>
  );
}
