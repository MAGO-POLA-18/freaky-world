import MainHall from "./MainHall";

/* =========================================================
   FREAKY WORLD — CRUCETA / MAIN HALL

   El mando mide:
   340 x 150

   La cruceta/hall mide aproximadamente:
   102 x 102

   Por lo tanto conserva una proporción lógica
   respecto a un mando real.

   Está:
   - a la izquierda
   - centrada verticalmente
   - ligeramente metida desde el borde
   - con la entrada mirando hacia el centro del mando
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
      <MainHall />
    </group>
  );
}
