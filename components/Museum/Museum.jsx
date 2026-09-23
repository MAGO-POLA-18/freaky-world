import DpadWing from "./DpadWing";

import RetroRankingTerminal from "./RetroRankingTerminal";

/* =========================================================
   MUSEUM / FREAKY WORLD

   NORTE = SALA RETRO
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
          TERMINAL RANKING

          Ala Retro:
          centro mundial aproximado -85.

          Terminal unos metros hacia
          el fondo de la nave.
      =================================================== */}

      <RetroRankingTerminal
        position={[
          0,
          0,
          -91,
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
