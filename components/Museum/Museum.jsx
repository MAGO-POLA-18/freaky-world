import MainHall from "./MainHall";

/* =========================================================
   FREAKY WORLD — D-PAD / MAIN HALL

   El hall representa físicamente la cruceta del mando.

   Posición:
   - lado izquierdo
   - centrado verticalmente
   - separado de los bordes
========================================================= */

export default function Museum() {
  return (
    <group
      position={[
        -90,
        0,
        0,
      ]}
      rotation={[
        0,
        Math.PI / 2,
        0,
      ]}
    >
      <MainHall />
    </group>
  );
}
