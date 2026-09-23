import DpadWing from "./DpadWing";
import TopTenExhibition from "./TopTenExhibition";

/* =========================================================
   MUSEUM / FREAKY WORLD
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
          TOP 10

          IMPORTANTE:

          Antes estaba en -119.25,
          es decir DETRÁS de la pared
          interior.

          Ahora está delante.
      =================================================== */}

      <TopTenExhibition
        position={[
          0,
          0,
          -118.25,
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
