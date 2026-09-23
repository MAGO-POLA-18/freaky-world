import DpadWing from "./DpadWing";

/* =========================================================
   MUSEUM / FREAKY WORLD

   Distribución actual:

   NORTE  = Sala Retro
   SUR    = estándar temporal
   ESTE   = estándar temporal
   OESTE  = estándar temporal
========================================================= */

export default function Museum() {
  return (
    <group>
      <ambientLight
        intensity={0.65}
        color="#dce6f2"
      />

      <hemisphereLight
        intensity={1.15}
        color="#e4eeff"
        groundColor="#596051"
      />

      {/* ===================================================
          NORTE — SALA RETRO
      =================================================== */}

      <DpadWing
        position={[0, 0, -85]}
        rotation={[0, 0, 0]}
        variant="retro"
      />

      {/* ===================================================
          SUR
      =================================================== */}

      <DpadWing
        position={[0, 0, 85]}
        rotation={[0, Math.PI, 0]}
      />

      {/* ===================================================
          ESTE
      =================================================== */}

      <DpadWing
        position={[85, 0, 0]}
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
        position={[-85, 0, 0]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      />
    </group>
  );
}
