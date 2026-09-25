import DpadWing from "./DpadWing";
import PopularTodayHall from "./PopularTodayHall";

/* =========================================================
   FREAKY WORLD

   Las cuatro alas comparten la misma carcasa.

   Solo desarrollamos el ala norte por ahora.
========================================================= */

export default function Museum() {
  return (
    <group>
      {/* ===================================================
          NORTE — POPULARES HOY
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
      >
        <PopularTodayHall />
      </DpadWing>

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
