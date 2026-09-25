import DpadWing from "./DpadWing";

/* =========================================================
   MUSEUM / FREAKY WORLD

   ESTRUCTURA MAESTRA

   Cuatro alas idénticas alrededor del patio.

   A partir de este punto:
   - cada ala parte de una carcasa limpia
   - todas tienen las mismas dimensiones
   - no existen interiores heredados
   - no existen escaleras heredadas
   - no existen terrazas heredadas

   Primero desarrollaremos el ALA NORTE.
========================================================= */

export default function Museum() {
  return (
    <group>
      {/* ===================================================
          NORTE

          Será la primera ala que construiremos
          interiormente.
      =================================================== */}

      <DpadWing
        position={[
          0,
          0,
          -85,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
      />

      {/* ===================================================
          SUR
      =================================================== */}

      <DpadWing
        position={[
          0,
          0,
          85,
        ]}
        rotation={[
          0,
          Math.PI,
          0,
        ]}
      />

      {/* ===================================================
          ESTE
      =================================================== */}

      <DpadWing
        position={[
          85,
          0,
          0,
        ]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
      />

      {/* ===================================================
          OESTE
      =================================================== */}

      <DpadWing
        position={[
          -85,
          0,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      />
    </group>
  );
}
