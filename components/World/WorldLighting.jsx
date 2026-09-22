"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function WorldLighting() {
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.toneMapping =
      THREE.ACESFilmicToneMapping;

    gl.toneMappingExposure = 1.15;

    scene.environmentIntensity = 0.85;
  }, [gl, scene]);

  return (
    <group>
      <ambientLight
        intensity={0.28}
        color="#dce7f5"
      />

      <hemisphereLight
        intensity={0.4}
        color="#dce9ff"
        groundColor="#526052"
      />

      <directionalLight
        position={[-30, 55, 20]}
        intensity={0.45}
        color="#d8e5ff"
      />
    </group>
  );
}
