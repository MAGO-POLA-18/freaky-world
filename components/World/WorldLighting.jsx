"use client";

import {
  useLayoutEffect,
} from "react";

import {
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

/* =========================================================
   WORLD LIGHTING

   Este componente ahora SOLO configura el renderer.

   Las luces reales vienen de DynamicSky.

   Antes estábamos sumando:
   - ambient
   - hemisphere
   - directional

   encima de las luces del cielo.
========================================================= */

export default function WorldLighting() {
  const {
    gl,
    scene,
  } = useThree();

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

  return null;
}
