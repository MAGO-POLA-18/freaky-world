import MainHall from "./MainHall";
import TopTenExhibition from "./TopTenExhibition";

/* =========================================================
   TIERRA VICIO — CRUCETA / MAIN HALL
========================================================= */

export default function Museum() {
  return (
    <group
      position={[
        -105,
        0,
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
