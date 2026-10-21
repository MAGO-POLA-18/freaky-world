import MainHall from "./MainHall";
import TopTenExhibition from "./TopTenExhibition";

/* =========================================================
   TIERRA VICIO — CRUCETA / MAIN HALL

   Toda la cruceta se apoya sobre la misma cota visual
   utilizada por el mando.

   El suelo físico real pertenece a WorldEnvironment.
========================================================= */

const VISUAL_FLOOR_Y = 0.024;

export default function Museum() {
  return (
    <group
      position={[
        -105,
        VISUAL_FLOOR_Y,
        0,
      ]}
      rotation={[
        0,
        Math.PI / 2,
        0,
      ]}
    >
      <MainHall>
        <TopTenExhibition />
      </MainHall>
    </group>
  );
}
