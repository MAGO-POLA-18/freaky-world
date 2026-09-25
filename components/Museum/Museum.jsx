import DpadWing from "./DpadWing";
import PopularTodayHall from "./PopularTodayHall";

/* =========================================================
   FREAKY WORLD — MUSEUM

   Las cuatro alas conservan la misma carcasa.

   Solo desarrollamos el ala NORTE por ahora.
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
          SUR — VACÍA
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
          ESTE — VACÍA
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
          OESTE — VACÍA
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
