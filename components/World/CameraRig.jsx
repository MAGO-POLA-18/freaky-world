"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   CAMERA RIG — MODO CENITAL TEMPORAL

   SOLO PARA COMPROBAR LA FORMA MAESTRA DEL DPAD.

   - Cámara fija sobre el centro del mundo
   - Vista completamente vertical
   - Sin perspectiva oblicua
   - No sigue al jugador

   Después de aprobar la silueta volveremos al CameraRig
   normal.
========================================================= */

export default function CameraRig() {
  useFrame(({ camera }) => {
    /*
      Centro exacto de la prueba.

      WingShell está actualmente en:
      [0, 0.25, 0]
    */

    const targetX = 0;
    const targetZ = 0;

    /*
      Altura de cámara.

      90 metros nos permite ver cómodamente
      la pieza completa.
    */

    const cameraHeight = 300;

    camera.position.set(
      targetX,
      cameraHeight,
      targetZ
    );

    /*
      IMPORTANTE:

      Una cámara mirando exactamente hacia abajo puede
      tener problemas de orientación si su vector UP
      coincide con la dirección de visión.

      Definimos Z como "arriba" de la imagen.
    */

    camera.up.set(0, 0, -1);

    camera.lookAt(
      new THREE.Vector3(
        targetX,
        0,
        targetZ
      )
    );

    /*
      FOV moderado para reducir deformación
      de perspectiva.
    */

    camera.fov = 45;

    camera.near = 0.1;
    camera.far = 1000;

    camera.updateProjectionMatrix();
  });

  return null;
}
