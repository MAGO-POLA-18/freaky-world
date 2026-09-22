import DpadWing from "./DpadWing";
import WingShell from "./WingShell";

/* =========================================================
   MUSEUM

   Edificio principal de Freaky World.

   TEST ACTUAL:
   - mantenemos las cuatro alas existentes
   - mostramos WingShell en el patio
   - comprobamos únicamente su silueta
========================================================= */

export default function Museum() {
  return (
    <group>

      {/* ===================================================
          ILUMINACIÓN BASE DEL EDIFICIO
      =================================================== */}

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
          ALA NORTE
      =================================================== */}

      <DpadWing
        position={[0, 0, -85]}
        rotation={[0, 0, 0]}
      />

      {/* ===================================================
          ALA SUR
      =================================================== */}

      <DpadWing
        position={[0, 0, 85]}
        rotation={[0, Math.PI, 0]}
      />

      {/* ===================================================
          ALA ESTE
      =================================================== */}

      <DpadWing
        position={[85, 0, 0]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
      />

      {/* ===================================================
          ALA OESTE
      =================================================== */}

      <DpadWing
        position={[-85, 0, 0]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      />

      {/* ===================================================
          TEST DE LA NUEVA FORMA

          Pieza temporal colocada en el patio.

          Está elevada 0.25 m para evitar que se mezcle
          visualmente con el suelo.

          NO forma parte todavía del edificio definitivo.
      =================================================== */}

      <WingShell
        position={[0, 0.25, 0]}
      />

    </group>
  );
}
