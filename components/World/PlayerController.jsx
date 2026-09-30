"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useFrame } from "@react-three/fiber";

import {
  RigidBody,
  CapsuleCollider,
} from "@react-three/rapier";

import * as THREE from "three";

/* =========================================================
   INPUT GLOBAL
========================================================= */

export const playerInput = {
  x: 0,
  y: 0,

  lookX: 0,
  lookY: 0,

  dashRequested: false,
  uiLocked: false,
};

/* =========================================================
   RUNTIME GLOBAL
========================================================= */

export const playerRuntime = {
  body: null,

  yaw: 0,
  pitch: 0.35,

  spawn: new THREE.Vector3(
    0,
    1.05,
    14
  ),
};

/* =========================================================
   MOVIMIENTO
========================================================= */

const SLOW_SPEED = 2.2;
const WALK_SPEED = 5.2;
const SPRINT_SPEED = 12.5;

const DASH_SPEED = 20;
const DASH_DURATION = 0.16;

const ACCELERATION = 12;
const ROTATION_SPEED = 12;

/* =========================================================
   MATERIALES
========================================================= */

const SKIN = "#d9a077";
const SKIN_SHADOW = "#bd7f5d";

const HAIR = "#251812";
const HAIR_LIGHT = "#3a241a";

const SHIRT = "#f2f2f2";
const SHIRT_DARK = "#d7d7d7";

const PANTS = "#15151b";
const PANTS_LIGHT = "#24242e";

const PURPLE = "#8f46ff";
const PURPLE_DARK = "#5421a4";

const SHOE_BLACK = "#111116";
const SHOE_WHITE = "#eeeeee";

/* =========================================================
   TEXTURA CAMISETA
========================================================= */

function createShirtTexture() {
  if (
    typeof document === "undefined"
  ) {
    return null;
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    512,
    512
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font =
    "900 86px Arial Black, Arial";

  ctx.fillStyle = "#111111";

  ctx.fillText(
    "TIERRA",
    256,
    105
  );

  ctx.font =
    "900 92px Arial Black, Arial";

  ctx.fillStyle = PURPLE;

  ctx.fillText(
    "VICIO",
    256,
    190
  );

  ctx.fillStyle = "#111111";

  ctx.fillRect(
    205,
    260,
    102,
    185
  );

  ctx.fillRect(
    163,
    302,
    186,
    102
  );

  ctx.strokeStyle = PURPLE;
  ctx.lineWidth = 10;

  ctx.strokeRect(
    205,
    260,
    102,
    185
  );

  ctx.strokeRect(
    163,
    302,
    186,
    102
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}

/* =========================================================
   CABEZA
========================================================= */

function Head() {
  return (
    <group>
      <mesh
        position={[0, 0.04, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.115,
            0.13,
            0.24,
            10,
          ]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
          roughness={0.78}
        />
      </mesh>

      <mesh
        position={[0, 0.34, 0]}
        scale={[
          0.92,
          1.08,
          0.88,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.285,
            16,
            12,
          ]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.7}
        />
      </mesh>

      <mesh
        position={[
          -0.265,
          0.34,
          0,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.055,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
        />
      </mesh>

      <mesh
        position={[
          0.265,
          0.34,
          0,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.055,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
        />
      </mesh>

      <mesh
        position={[
          -0.095,
          0.385,
          0.246,
        ]}
      >
        <sphereGeometry
          args={[
            0.036,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color="#17110e"
        />
      </mesh>

      <mesh
        position={[
          0.095,
          0.385,
          0.246,
        ]}
      >
        <sphereGeometry
          args={[
            0.036,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color="#17110e"
        />
      </mesh>

      <mesh
        position={[
          0,
          0.315,
          0.275,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <coneGeometry
          args={[
            0.035,
            0.095,
            7,
          ]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
        />
      </mesh>

      <mesh
        position={[
          0,
          0.245,
          0.269,
        ]}
        scale={[
          1,
          0.2,
          1,
        ]}
      >
        <sphereGeometry
          args={[
            0.07,
            10,
            6,
          ]}
        />

        <meshStandardMaterial
          color="#753f3d"
        />
      </mesh>

      <mesh
        position={[
          0,
          0.54,
          -0.015,
        ]}
        scale={[
          1,
          0.55,
          0.93,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.3,
            14,
            8,
          ]}
        />

        <meshStandardMaterial
          color={HAIR}
          roughness={0.8}
        />
      </mesh>

      <mesh
        position={[
          -0.16,
          0.68,
          0.1,
        ]}
        rotation={[
          0.25,
          0,
          -0.45,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.09,
            0.28,
            7,
          ]}
        />

        <meshStandardMaterial
          color={HAIR_LIGHT}
        />
      </mesh>

      <mesh
        position={[
          -0.02,
          0.72,
          0.11,
        ]}
        rotation={[
          0.3,
          0,
          -0.15,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.095,
            0.31,
            7,
          ]}
        />

        <meshStandardMaterial
          color={HAIR}
        />
      </mesh>

      <mesh
        position={[
          0.13,
          0.68,
          0.1,
        ]}
        rotation={[
          0.25,
          0,
          0.35,
        ]}
        castShadow
      >
        <coneGeometry
          args={[
            0.085,
            0.27,
            7,
          ]}
        />

        <meshStandardMaterial
          color={HAIR_LIGHT}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   BRAZO
========================================================= */

function Arm({
  side = 1,
  armRef,
}) {
  return (
    <group
      ref={armRef}
      position={[
        0.42 * side,
        1.43,
        0,
      ]}
    >
      <mesh
        position={[
          0.03 * side,
          -0.08,
          0,
        ]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.13,
            0.145,
            0.27,
            8,
          ]}
        />

        <meshStandardMaterial
          color={SHIRT}
          roughness={0.85}
        />
      </mesh>

      <mesh
        position={[
          0.045 * side,
          -0.32,
          0,
        ]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.09,
            0.32,
            6,
            8,
          ]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.78}
        />
      </mesh>

      <mesh
        position={[
          0.055 * side,
          -0.65,
          0.01,
        ]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.078,
            0.31,
            6,
            8,
          ]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.78}
        />
      </mesh>

      <mesh
        position={[
          0.058 * side,
          -0.8,
          0.01,
        ]}
      >
        <cylinderGeometry
          args={[
            0.09,
            0.09,
            0.08,
            10,
          ]}
        />

        <meshStandardMaterial
          color={
            side < 0
              ? PURPLE_DARK
              : "#111111"
          }
          roughness={0.6}
        />
      </mesh>

      <mesh
        position={[
          0.06 * side,
          -0.9,
          0.015,
        ]}
        scale={[
          0.82,
          1.08,
          0.7,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.105,
            10,
            8,
          ]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PIERNA
========================================================= */

function Leg({
  side = 1,
  legRef,
}) {
  return (
    <group
      ref={legRef}
      position={[
        0.17 * side,
        0.89,
        0,
      ]}
    >
      <mesh
        position={[
          0,
          -0.29,
          0,
        ]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.14,
            0.38,
            6,
            8,
          ]}
        />

        <meshStandardMaterial
          color={PANTS}
          roughness={0.88}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.55,
          0.015,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.14,
            8,
            6,
          ]}
        />

        <meshStandardMaterial
          color={PANTS_LIGHT}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.79,
          0,
        ]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.12,
            0.34,
            6,
            8,
          ]}
        />

        <meshStandardMaterial
          color={PANTS}
          roughness={0.9}
        />
      </mesh>

      <group
        position={[
          0,
          -1.05,
          0.08,
        ]}
      >
        <mesh
          scale={[
            1,
            0.55,
            1.45,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.27,
              0.2,
              0.38,
            ]}
          />

          <meshStandardMaterial
            color={SHOE_BLACK}
            roughness={0.7}
          />
        </mesh>

        <mesh
          position={[
            0,
            -0.075,
            0.02,
          ]}
          scale={[
            1.06,
            0.35,
            1.5,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.27,
              0.2,
              0.38,
            ]}
          />

          <meshStandardMaterial
            color={SHOE_WHITE}
            roughness={0.8}
          />
        </mesh>

        <mesh
          position={[
            0,
            0,
            0.2,
          ]}
        >
          <boxGeometry
            args={[
              0.21,
              0.055,
              0.018,
            ]}
          />

          <meshStandardMaterial
            color={PURPLE}
          />
        </mesh>
      </group>
    </group>
  );
}
