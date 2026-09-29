import DpadWing from "./DpadWing";
import PopularTodayHall from "./PopularTodayHall";
import ManufacturerStand from "../ManufacturerHall/ManufacturerStand";

/* =========================================================
   FREAKY WORLD — MUSEUM

   Las cuatro alas conservan la misma carcasa.

   NORTE → Populares hoy
   SUR   → Fabricantes
   ESTE  → Vacía
   OESTE → Vacía
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
          SUR — FABRICANTES
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
      >
        <ManufacturerStand />
      </DpadWing>

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
