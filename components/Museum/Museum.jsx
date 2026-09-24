import DpadWing from "./DpadWing";

/* =========================================================
   MUSEUM / FREAKY WORLD

   IMPORTANTE:

   - El monumento central vive en WorldEnvironment.
   - La iluminación global vive en DynamicSky.
   - Museum solo contiene las cuatro alas.
========================================================= */

export default function Museum() {
  return (
    <group>
      {/* ===================================================
          NORTE — RETRO
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
        variant="retro"
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
