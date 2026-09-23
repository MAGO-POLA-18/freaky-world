import DpadWing from "./DpadWing";
import TopTenExhibition from "./TopTenExhibition";

/* =========================================================
   MUSEUM / FREAKY WORLD

   NORTE = SALA RETRO
========================================================= */

export default function Museum() {
  return (
    <group>
      <ambientLight
        intensity={
          0.65
        }
        color="#dce6f2"
      />

      <hemisphereLight
        intensity={
          1.15
        }
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
          TOP 10 FREAKY RANKING

          Está colocado contra la pared
          posterior de la sala norte.

          La pared posterior del ala está
          aproximadamente en Z -119.8.

          Lo adelantamos unos centímetros
          para evitar parpadeos visuales.
      =================================================== */}

      <TopTenExhibition
        position={[
          0,
          0,
          -119.25,
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
          -Math.PI /
            2,
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
          Math.PI /
            2,
          0,
        ]}
      />
    </group>
  );
}
