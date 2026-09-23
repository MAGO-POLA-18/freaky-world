import DpadWing from "./DpadWing";

/* =========================================================
   MUSEUM

   Edificio principal de Freaky World.

   Cuatro alas principales colocadas como una cruceta
   gigante recorrible.
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

    </group>
  );
}
