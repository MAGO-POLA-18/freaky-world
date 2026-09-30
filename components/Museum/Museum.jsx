import MainHall from "./MainHall";

/* =========================================================
   FREAKY WORLD — MUSEUM

   NUEVA ESTRUCTURA

   Antes:
   - 4 edificios separados
   - norte / sur / este / oeste

   Ahora:
   - 1 único edificio
   - planta completa en forma de cruceta
   - interior continuo
   - preparada para distribuir contenidos después

   IMPORTANTE:
   por ahora dejamos el interior vacío a propósito.
   Primero validamos:
   - escala
   - circulación
   - cámara
   - suelo
   - rendimiento
========================================================= */

export default function Museum() {
  return (
    <group>
      <MainHall />
    </group>
  );
}
