import DpadWing from "./DpadWing";

/* =========================================================
   MUSEUM / FREAKY WORLD

   PRUEBA TEMPORAL:
   TOP 10 DESACTIVADO PARA COMPROBAR
   SI LA CARGA DE PORTADAS PROVOCA EL FLASH.
========================================================= */

export default function Museum() {
  return (
    <group>
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
          NORTE — RETRO
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
        variant="retro"
      />

      {/* ===================================================
          TOP 10 DESACTIVADO TEMPORALMENTE

          Antes estaba acá:

          <TopTenExhibition
            position={[
              0,
              0,
              -118.25,
            ]}
          />

          Lo quitamos SOLO para probar
          si las portadas/texturas provocan
          el flash en móvil.
      =================================================== */}

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
