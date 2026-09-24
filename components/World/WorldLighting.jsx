"use client";

import {
  useLayoutEffect,
} from "react";

import {
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

export default function WorldLighting() {
  const {
    gl,
    scene,
  } = useThree();

  /* =========================================================
     CONFIGURACIÓN DEL RENDERER

     useLayoutEffect se ejecuta antes de que el navegador
     pinte visualmente el frame.

     Así evitamos:
     frame inicial con configuración por defecto
     +
     cambio posterior de exposición/tone mapping.
  ========================================================= */

  useLayoutEffect(() => {
    gl.toneMapping =
      THREE.ACESFilmicToneMapping;

    gl.toneMappingExposure =
      1.15;

    gl.outputColorSpace =
      THREE.SRGBColorSpace;

    scene.environmentIntensity =
      0.85;
  }, [
    gl,
    scene,
  ]);

  /* =========================================================
     LUZ BASE

     Se mantiene estable desde el montaje.
  ========================================================= */

  return (
    <>
      <ambientLight
        intensity={
          0.28
        }
        color="#dce7f5"
      />

      <hemisphereLight
        intensity={
          0.4
        }
        color="#dce9ff"
        groundColor="#526052"
      />

      <directionalLight
        position={[
          -30,
          55,
          20,
        ]}
        intensity={
          0.45
        }
        color="#d8e5ff"
      />
    </>
  );
}
