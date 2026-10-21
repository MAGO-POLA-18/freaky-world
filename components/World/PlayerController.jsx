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

  /* B móvil */
  sprint: false,

  /* se mantiene por compatibilidad */
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

const SPRINT_SPEED = 40;

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
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 512, 512);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "900 86px Arial Black, Arial";
  ctx.fillStyle = "#111111";
  ctx.fillText("TIERRA", 256, 105);

  ctx.font = "900 92px Arial Black, Arial";
  ctx.fillStyle = PURPLE;
  ctx.fillText("VICIO", 256, 190);

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
    new THREE.CanvasTexture(canvas);

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
  const eyes = [-1, 1];

  const locks = [
    [-0.20, 0.61, 0.105, -0.52, 0.070, 0.22],
    [-0.11, 0.68, 0.125, -0.28, 0.078, 0.25],
    [-0.01, 0.71, 0.135, -0.05, 0.082, 0.27],
    [0.10, 0.69, 0.125, 0.25, 0.078, 0.25],
    [0.20, 0.62, 0.095, 0.50, 0.068, 0.21],
  ];

  return (
    <group>

      {/* CUELLO */}
      <mesh
        position={[0, 0.03, -0.01]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.105,
            0.125,
            0.22,
            16,
          ]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
          roughness={0.8}
        />
      </mesh>

      {/* CRÁNEO */}
      <mesh
        position={[0, 0.355, -0.008]}
        scale={[0.92, 1.04, 0.88]}
        castShadow
      >
        <sphereGeometry
          args={[0.285, 24, 18]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.72}
        />
      </mesh>

      {/* MANDÍBULA */}
      <mesh
        position={[0, 0.205, 0.035]}
        scale={[0.78, 0.56, 0.80]}
        castShadow
      >
        <sphereGeometry
          args={[0.245, 20, 14]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.74}
        />
      </mesh>

      {/* OREJAS */}
      {eyes.map((side) => (
        <group
          key={`ear-${side}`}
          position={[
            0.267 * side,
            0.35,
            -0.006,
          ]}
        >
          <mesh
            scale={[0.72, 1, 0.55]}
            castShadow
          >
            <sphereGeometry
              args={[0.058, 12, 8]}
            />

            <meshStandardMaterial
              color={SKIN_SHADOW}
              roughness={0.8}
            />
          </mesh>

          <mesh
            position={[
              0.008 * -side,
              0,
              0.025,
            ]}
            scale={[0.5, 0.62, 0.35]}
          >
            <sphereGeometry
              args={[0.042, 10, 8]}
            />

            <meshStandardMaterial
              color={SKIN}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* OJOS */}
      {eyes.map((side) => (
        <group
          key={`eye-${side}`}
          position={[
            0.092 * side,
            0.392,
            0.246,
          ]}
        >
          <mesh
            scale={[1.05, 1.15, 0.52]}
          >
            <sphereGeometry
              args={[0.046, 16, 12]}
            />

            <meshStandardMaterial
              color="#f6f2ed"
              roughness={0.38}
            />
          </mesh>

          <mesh
            position={[0, 0, 0.026]}
          >
            <sphereGeometry
              args={[0.027, 14, 10]}
            />

            <meshStandardMaterial
              color="#5b3828"
              roughness={0.35}
            />
          </mesh>

          <mesh
            position={[0, 0, 0.046]}
          >
            <sphereGeometry
              args={[0.014, 12, 8]}
            />

            <meshStandardMaterial
              color="#17110e"
              roughness={0.25}
            />
          </mesh>

          <mesh
            position={[
              -0.007,
              0.009,
              0.058,
            ]}
          >
            <sphereGeometry
              args={[0.0055, 8, 6]}
            />

            <meshBasicMaterial
              color="#ffffff"
            />
          </mesh>
        </group>
      ))}

      {/* CEJAS */}
      {eyes.map((side) => (
        <mesh
          key={`brow-${side}`}
          position={[
            0.094 * side,
            0.475,
            0.252,
          ]}
          rotation={[
            0,
            0,
            0.08 * side,
          ]}
          scale={[1, 0.42, 0.45]}
        >
          <capsuleGeometry
            args={[
              0.018,
              0.075,
              4,
              8,
            ]}
          />

          <meshStandardMaterial
            color={HAIR}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* NARIZ */}
      <mesh
        position={[0, 0.323, 0.273]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.78, 1, 0.82]}
        castShadow
      >
        <coneGeometry
          args={[0.034, 0.086, 12]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
          roughness={0.78}
        />
      </mesh>

      {/* BOCA */}
      <mesh
        position={[0, 0.238, 0.267]}
        rotation={[0, 0, Math.PI]}
        scale={[1, 0.55, 0.55]}
      >
        <torusGeometry
          args={[
            0.052,
            0.010,
            8,
            20,
            Math.PI,
          ]}
        />

        <meshStandardMaterial
          color="#7d4143"
          roughness={0.72}
        />
      </mesh>

      {/* MENTÓN */}
      <mesh
        position={[0, 0.175, 0.222]}
        scale={[0.85, 0.42, 0.65]}
      >
        <sphereGeometry
          args={[0.08, 12, 8]}
        />

        <meshStandardMaterial
          color={SKIN_SHADOW}
          roughness={0.78}
        />
      </mesh>

      {/* PELO PRINCIPAL */}
      <mesh
        position={[0, 0.555, -0.025]}
        scale={[1.03, 0.62, 0.97]}
        castShadow
      >
        <sphereGeometry
          args={[0.295, 22, 14]}
        />

        <meshStandardMaterial
          color={HAIR}
          roughness={0.86}
        />
      </mesh>

      {/* LATERALES */}
      <mesh
        position={[-0.245, 0.47, -0.005]}
        scale={[0.42, 1, 0.6]}
        castShadow
      >
        <sphereGeometry
          args={[0.15, 14, 10]}
        />

        <meshStandardMaterial
          color={HAIR}
          roughness={0.88}
        />
      </mesh>

      <mesh
        position={[0.245, 0.47, -0.005]}
        scale={[0.42, 1, 0.6]}
        castShadow
      >
        <sphereGeometry
          args={[0.15, 14, 10]}
        />

        <meshStandardMaterial
          color={HAIR}
          roughness={0.88}
        />
      </mesh>

      {/* MECHONES */}
      {locks.map((v, i) => (
        <mesh
          key={`lock-${i}`}
          position={[
            v[0],
            v[1],
            v[2],
          ]}
          rotation={[
            0.30,
            0,
            v[3],
          ]}
          castShadow
        >
          <coneGeometry
            args={[
              v[4],
              v[5],
              9,
            ]}
          />

          <meshStandardMaterial
            color={
              i % 2
                ? HAIR_LIGHT
                : HAIR
            }
            roughness={0.86}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================
   BRAZOS
========================================================= */

function Arm({
  side = 1,
  armRef,
}) {
  return (
    <group
      ref={armRef}
      position={[
        0.405 * side,
        1.45,
        0,
      ]}
      rotation={[
        0,
        0,
        -0.035 * side,
      ]}
    >
      {/* HOMBRO / MANGA */}
      <mesh
        position={[
          0.012 * side,
          -0.075,
          0,
        ]}
        scale={[1, 1, 0.94]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.132,
            0.20,
            8,
            14,
          ]}
        />

        <meshStandardMaterial
          color={SHIRT}
          roughness={0.88}
        />
      </mesh>

      {/* BRAZO */}
      <mesh
        position={[
          0.026 * side,
          -0.34,
          0,
        ]}
        scale={[0.95, 1, 0.92]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.086,
            0.29,
            8,
            12,
          ]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.76}
        />
      </mesh>

      {/* ANTEBRAZO */}
      <mesh
        position={[
          0.031 * side,
          -0.635,
          0.008,
        ]}
        scale={[0.90, 1, 0.88]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.080,
            0.27,
            8,
            12,
          ]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.76}
        />
      </mesh>

      {/* PULSERA */}
      <mesh
        position={[
          0.032 * side,
          -0.79,
          0.008,
        ]}
      >
        <cylinderGeometry
          args={[
            0.087,
            0.087,
            0.06,
            14,
          ]}
        />

        <meshStandardMaterial
          color={
            side < 0
              ? PURPLE_DARK
              : "#15151b"
          }
          roughness={0.55}
        />
      </mesh>

      {/* MANO */}
      <mesh
        position={[
          0.035 * side,
          -0.885,
          0.025,
        ]}
        scale={[0.76, 1.02, 0.64]}
        castShadow
      >
        <sphereGeometry
          args={[0.105, 14, 10]}
        />

        <meshStandardMaterial
          color={SKIN}
          roughness={0.74}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PIERNAS
========================================================= */

function Leg({
  side = 1,
  legRef,
}) {
  return (
    <group
      ref={legRef}
      position={[
        0.165 * side,
        0.90,
        0,
      ]}
    >
      <mesh
        position={[0, -0.285, 0]}
        scale={[1, 1, 0.94]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.138,
            0.37,
            8,
            12,
          ]}
        />

        <meshStandardMaterial
          color={PANTS}
          roughness={0.9}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.55,
          0.012,
        ]}
        scale={[1, 0.9, 0.95]}
        castShadow
      >
        <sphereGeometry
          args={[0.134, 12, 9]}
        />

        <meshStandardMaterial
          color={PANTS_LIGHT}
          roughness={0.9}
        />
      </mesh>

      <mesh
        position={[
          0,
          -0.785,
          -0.005,
        ]}
        scale={[0.90, 1, 0.88]}
        castShadow
      >
        <capsuleGeometry
          args={[
            0.118,
            0.33,
            8,
            12,
          ]}
        />

        <meshStandardMaterial
          color={PANTS}
          roughness={0.92}
        />
      </mesh>

      {/* ZAPATILLA */}
      <group
        position={[
          0,
          -1.045,
          0.09,
        ]}
      >
        <mesh
          position={[
            0,
            0.01,
            0.025,
          ]}
          scale={[1, 0.62, 1.42]}
          castShadow
        >
          <capsuleGeometry
            args={[
              0.135,
              0.10,
              6,
              12,
            ]}
          />

          <meshStandardMaterial
            color={SHOE_BLACK}
            roughness={0.68}
          />
        </mesh>

        <mesh
          position={[
            0,
            -0.075,
            0.035,
          ]}
          scale={[1.08, 0.32, 1.48]}
          castShadow
        >
          <boxGeometry
            args={[
              0.27,
              0.18,
              0.37,
            ]}
          />

          <meshStandardMaterial
            color={SHOE_WHITE}
            roughness={0.82}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.018,
            0.215,
          ]}
        >
          <boxGeometry
            args={[
              0.18,
              0.065,
              0.024,
            ]}
          />

          <meshStandardMaterial
            color={PURPLE}
            roughness={0.55}
          />
        </mesh>

        {[-0.045, 0, 0.045].map(
          (x, i) => (
            <mesh
              key={i}
              position={[
                x,
                0.072,
                0.115 + i * 0.018,
              ]}
              rotation={[
                0,
                0,
                Math.PI / 2,
              ]}
            >
              <cylinderGeometry
                args={[
                  0.008,
                  0.008,
                  0.13,
                  6,
                ]}
              />

              <meshStandardMaterial
                color="#d8d8dd"
                roughness={0.8}
              />
            </mesh>
          )
        )}
      </group>
    </group>
  );
}

/* =========================================================
   AVATAR TIERRA VICIO
========================================================= */

function TierraVicioAvatar({
  visualRef,
  movementAmount,
}) {
  const leftArm = useRef(null);
  const rightArm = useRef(null);

  const leftLeg = useRef(null);
  const rightLeg = useRef(null);

  const torso = useRef(null);
  const head = useRef(null);

  const shirtTexture =
    useMemo(
      () => createShirtTexture(),
      []
    );

  useEffect(() => {
    return () => {
      shirtTexture?.dispose();
    };
  }, [shirtTexture]);

  useFrame(
    ({ clock }, delta) => {
      const movement =
        movementAmount.current;

      const moving =
        movement > 0.05;

      const sprinting =
        movement > 0.72;

      const frequency =
        sprinting
          ? 13
          : 8.5;

      const amplitude =
        sprinting
          ? 0.82
          : 0.56;

      const time =
        clock.elapsedTime;

      const targetSwing =
        moving
          ? Math.sin(
              time * frequency
            ) * amplitude
          : 0;

      const inverseSwing =
        -targetSwing;

      const damping =
        1 -
        Math.exp(
          -delta * 12
        );

      if (leftLeg.current) {
        leftLeg.current.rotation.x =
          THREE.MathUtils.lerp(
            leftLeg.current.rotation.x,
            targetSwing,
            damping
          );
      }

      if (rightLeg.current) {
        rightLeg.current.rotation.x =
          THREE.MathUtils.lerp(
            rightLeg.current.rotation.x,
            inverseSwing,
            damping
          );
      }

      if (leftArm.current) {
        leftArm.current.rotation.x =
          THREE.MathUtils.lerp(
            leftArm.current.rotation.x,
            inverseSwing * 0.78,
            damping
          );

        leftArm.current.rotation.z =
          THREE.MathUtils.lerp(
            leftArm.current.rotation.z,
            -0.05,
            damping
          );
      }

      if (rightArm.current) {
        rightArm.current.rotation.x =
          THREE.MathUtils.lerp(
            rightArm.current.rotation.x,
            targetSwing * 0.78,
            damping
          );

        rightArm.current.rotation.z =
          THREE.MathUtils.lerp(
            rightArm.current.rotation.z,
            0.05,
            damping
          );
      }

      if (torso.current) {
        const idleBreath =
          Math.sin(
            time * 2.2
          ) * 0.008;

        torso.current.position.y =
          1.33 +
          idleBreath;

        torso.current.rotation.z =
          moving
            ? Math.sin(
                time *
                  frequency *
                  0.5
              ) * 0.025
            : 0;
      }

      if (head.current) {
        head.current.rotation.z =
          THREE.MathUtils.lerp(
            head.current.rotation.z,

            moving
              ? Math.sin(
                  time *
                    frequency *
                    0.5
                ) * 0.018
              : Math.sin(
                  time * 0.75
                ) * 0.012,

            damping
          );
      }

      if (visualRef.current) {
        const bounce =
          moving
            ? Math.abs(
                Math.sin(
                  time * frequency
                )
              ) *
              (
                sprinting
                  ? 0.04
                  : 0.024
              )
            : 0;

        visualRef.current.position.y =
          -0.96 +
          bounce;
      }
    }
  );

  return (
    <group
      ref={visualRef}
      position={[
        0,
        -0.96,
        0,
      ]}
    >
      {/* CADERA */}

      <mesh
        position={[
          0,
          0.91,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.62,
            0.28,
            0.34,
          ]}
        />

        <meshStandardMaterial
          color={PANTS}
          roughness={0.88}
        />
      </mesh>

      {/* CINTURÓN */}

      <mesh
        position={[
          0,
          1.045,
          0.005,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.64,
            0.075,
            0.35,
          ]}
        />

        <meshStandardMaterial
          color="#09090c"
          roughness={0.7}
        />
      </mesh>

      {/* HEBILLA */}

      <mesh
        position={[
          0,
          1.045,
          0.185,
        ]}
      >
        <boxGeometry
          args={[
            0.11,
            0.065,
            0.025,
          ]}
        />

        <meshStandardMaterial
          color={PURPLE}
          metalness={0.25}
          roughness={0.45}
        />
      </mesh>

      {/* TORSO */}

      <group ref={torso}>
        <mesh
          scale={[
            1,
            1,
            0.82,
          ]}
          castShadow
        >
          <capsuleGeometry
            args={[
              0.31,
              0.47,
              8,
              12,
            ]}
          />

          <meshStandardMaterial
            color={SHIRT}
            roughness={0.86}
          />
        </mesh>

        {/* HOMBROS */}

        <mesh
          position={[
            0,
            0.14,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.76,
              0.23,
              0.4,
            ]}
          />

          <meshStandardMaterial
            color={SHIRT}
            roughness={0.86}
          />
        </mesh>

        {/* PARTE INFERIOR */}

        <mesh
          position={[
            0,
            -0.25,
            0.01,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.57,
              0.16,
              0.34,
            ]}
          />

          <meshStandardMaterial
            color={SHIRT_DARK}
            roughness={0.9}
          />
        </mesh>

        {/* LOGO TIERRA VICIO */}

        {shirtTexture && (
          <mesh
            position={[
              0,
              0.03,
              0.343,
            ]}
          >
            <planeGeometry
              args={[
                0.49,
                0.49,
              ]}
            />

            <meshBasicMaterial
              map={shirtTexture}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* COLLAR / ACCESORIO */}

        <mesh
          position={[
            0,
            0.3,
            0.32,
          ]}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >
          <torusGeometry
            args={[
              0.115,
              0.012,
              6,
              16,
            ]}
          />

          <meshStandardMaterial
            color="#707078"
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>

        <mesh
          position={[
            0,
            0.195,
            0.347,
          ]}
        >
          <boxGeometry
            args={[
              0.055,
              0.065,
              0.018,
            ]}
          />

          <meshStandardMaterial
            color="#222228"
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* CABEZA */}

      <group
        ref={head}
        position={[
          0,
          1.69,
          0,
        ]}
      >
        <Head />
      </group>

      {/* BRAZOS */}

      <Arm
        side={-1}
        armRef={leftArm}
      />

      <Arm
        side={1}
        armRef={rightArm}
      />

      {/* PIERNAS */}

      <Leg
        side={-1}
        legRef={leftLeg}
      />

      <Leg
        side={1}
        legRef={rightLeg}
      />

      {/* BOLSILLOS CARGO */}

      <mesh
        position={[
          -0.315,
          0.71,
          0.05,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.12,
            0.25,
            0.22,
          ]}
        />

        <meshStandardMaterial
          color={PANTS_LIGHT}
          roughness={0.88}
        />
      </mesh>

      <mesh
        position={[
          0.315,
          0.69,
          0.05,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.12,
            0.23,
            0.22,
          ]}
        />

        <meshStandardMaterial
          color={PANTS_LIGHT}
          roughness={0.88}
        />
      </mesh>

      {/* DETALLE VIOLETA */}

      <mesh
        position={[
          0.33,
          0.48,
          0.05,
        ]}
        rotation={[
          0,
          0,
          -0.05,
        ]}
      >
        <boxGeometry
          args={[
            0.045,
            0.36,
            0.025,
          ]}
        />

        <meshStandardMaterial
          color={PURPLE}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PLAYER CONTROLLER
========================================================= */

export default function PlayerController() {
  const body =
    useRef(null);

  const visual =
    useRef(null);

  const movementAmount =
    useRef(0);

  const targetRotation =
    useRef(0);

  const dashTimer =
    useRef(0);

  const keyboard =
    useRef({
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    });

  const cameraForward =
    useRef(
      new THREE.Vector3()
    );

  const cameraRight =
    useRef(
      new THREE.Vector3()
    );

  const worldUp =
    useRef(
      new THREE.Vector3(
        0,
        1,
        0
      )
    );

  const movementDirection =
    useRef(
      new THREE.Vector3()
    );

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    function setKey(
      code,
      pressed
    ) {
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          keyboard.current.forward =
            pressed;
          break;

        case "KeyS":
        case "ArrowDown":
          keyboard.current.backward =
            pressed;
          break;

        case "KeyA":
        case "ArrowLeft":
          keyboard.current.left =
            pressed;
          break;

        case "KeyD":
        case "ArrowRight":
          keyboard.current.right =
            pressed;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          keyboard.current.sprint =
            pressed;
          break;

        default:
          break;
      }
    }

    function resetKeyboard() {
      keyboard.current.forward = false;
      keyboard.current.backward = false;
      keyboard.current.left = false;
      keyboard.current.right = false;
      keyboard.current.sprint = false;
    }

    function onKeyDown(event) {
      if (playerInput.uiLocked) {
        resetKeyboard();
        return;
      }

      setKey(
        event.code,
        true
      );
    }

    function onKeyUp(event) {
      if (playerInput.uiLocked) {
        resetKeyboard();
        return;
      }

      setKey(
        event.code,
        false
      );
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    window.addEventListener(
      "keyup",
      onKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      window.removeEventListener(
        "keyup",
        onKeyUp
      );
    };
  }, []);

  /* =======================================================
     LOOP PRINCIPAL
  ======================================================= */

  useFrame(
    ({ camera }, delta) => {
      if (!body.current) {
        return;
      }

      playerRuntime.body =
        body.current;

      /* UI ABIERTA */

      if (playerInput.uiLocked) {
        const velocity =
          body.current.linvel();

        body.current.setLinvel(
          {
            x: 0,
            y: velocity.y,
            z: 0,
          },
          true
        );

        movementAmount.current =
          THREE.MathUtils.lerp(
            movementAmount.current,
            0,
            0.18
          );

        return;
      }

      /* INPUT MÓVIL */

      let inputX =
        playerInput.x || 0;

      let inputY =
        playerInput.y || 0;

      /* INPUT TECLADO */

      const keyboardX =
        (
          keyboard.current.right
            ? 1
            : 0
        ) -
        (
          keyboard.current.left
            ? 1
            : 0
        );

      const keyboardY =
        (
          keyboard.current.forward
            ? 1
            : 0
        ) -
        (
          keyboard.current.backward
            ? 1
            : 0
        );

      const keyboardActive =
        keyboardX !== 0 ||
        keyboardY !== 0;

      if (keyboardActive) {
        inputX =
          keyboardX;

        inputY =
          keyboardY;
      }

      const rawMagnitude =
        Math.sqrt(
          inputX * inputX +
          inputY * inputY
        );

      const magnitude =
        Math.min(
          rawMagnitude,
          1
        );

      if (rawMagnitude > 1) {
        inputX /=
          rawMagnitude;

        inputY /=
          rawMagnitude;
      }

      /* ===================================================
         SPRINT

         Escritorio: Shift
         Móvil: mantener B
      =================================================== */

      const sprinting =
        keyboardActive
          ? keyboard.current.sprint
          : Boolean(
              playerInput.sprint
            );

      /* VELOCIDAD */

      let moveSpeed = 0;

      if (magnitude > 0.08) {
        if (sprinting) {
          moveSpeed =
            SPRINT_SPEED;
        } else if (
          magnitude < 0.38
        ) {
          moveSpeed =
            THREE.MathUtils.lerp(
              SLOW_SPEED * 0.45,
              SLOW_SPEED,
              magnitude / 0.38
            );
        } else {
          moveSpeed =
            THREE.MathUtils.lerp(
              SLOW_SPEED,
              WALK_SPEED,

              Math.min(
                1,

                (
                  magnitude -
                  0.38
                ) /
                  0.62
              )
            );
        }
      }

            /* ===================================================
         DASH ANTIGUO
      =================================================== */

      if (
        playerInput.dashRequested &&
        magnitude > 0.1
      ) {
        dashTimer.current =
          DASH_DURATION;

        playerInput.dashRequested =
          false;
      }

      if (
        dashTimer.current > 0
      ) {
        dashTimer.current -=
          delta;

        moveSpeed =
          DASH_SPEED;
      }

      /* ===================================================
         DIRECCIÓN REAL DE CÁMARA
      =================================================== */

      camera.getWorldDirection(
        cameraForward.current
      );

      cameraForward.current.y =
        0;

      if (
        cameraForward.current.lengthSq() <
        0.0001
      ) {
        cameraForward.current.set(
          -Math.sin(
            playerRuntime.yaw
          ),

          0,

          -Math.cos(
            playerRuntime.yaw
          )
        );
      }

      cameraForward.current.normalize();

      cameraRight.current
        .crossVectors(
          cameraForward.current,
          worldUp.current
        )
        .normalize();

      movementDirection.current.set(
        0,
        0,
        0
      );

      movementDirection.current
        .addScaledVector(
          cameraForward.current,
          inputY
        );

      movementDirection.current
        .addScaledVector(
          cameraRight.current,
          inputX
        );

      if (
        movementDirection.current.lengthSq() >
        0.0001
      ) {
        movementDirection.current.normalize();
      }

      const directionX =
        movementDirection.current.x;

      const directionZ =
        movementDirection.current.z;

      /* ===================================================
         VELOCIDAD FÍSICA
      =================================================== */

      const currentVelocity =
        body.current.linvel();

      const desiredX =
        directionX *
        moveSpeed;

      const desiredZ =
        directionZ *
        moveSpeed;

      const smoothing =
        1 -
        Math.exp(
          -ACCELERATION *
            delta
        );

      const nextX =
        THREE.MathUtils.lerp(
          currentVelocity.x,
          desiredX,
          smoothing
        );

      const nextZ =
        THREE.MathUtils.lerp(
          currentVelocity.z,
          desiredZ,
          smoothing
        );

      body.current.setLinvel(
        {
          x: nextX,
          y: currentVelocity.y,
          z: nextZ,
        },
        true
      );

      /* ===================================================
         ANIMACIÓN
      =================================================== */

      const animationMovement =
        sprinting &&
        magnitude > 0.08
          ? 1
          : magnitude;

      movementAmount.current =
        THREE.MathUtils.lerp(
          movementAmount.current,
          animationMovement,

          1 -
            Math.exp(
              -delta * 8
            )
        );

      /* ===================================================
         ROTACIÓN DEL AVATAR
      =================================================== */

      if (
        magnitude > 0.08 &&
        movementDirection.current.lengthSq() >
          0.0001
      ) {
        targetRotation.current =
          Math.atan2(
            directionX,
            directionZ
          );

        if (visual.current) {
          let difference =
            targetRotation.current -
            visual.current.rotation.y;

          difference =
            Math.atan2(
              Math.sin(
                difference
              ),

              Math.cos(
                difference
              )
            );

          visual.current.rotation.y +=
            difference *
            Math.min(
              ROTATION_SPEED *
                delta,
              1
            );
        }
      }
    }
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <RigidBody
      ref={body}
      colliders={false}

      enabledRotations={[
        false,
        false,
        false,
      ]}

      position={[
        playerRuntime.spawn.x,
        playerRuntime.spawn.y,
        playerRuntime.spawn.z,
      ]}

      linearDamping={5}
      angularDamping={10}
      canSleep={false}
    >
      <CapsuleCollider
        args={[
          0.7,
          0.35,
        ]}
      />

      <TierraVicioAvatar
        visualRef={visual}
        movementAmount={
          movementAmount
        }
      />
    </RigidBody>
  );
}
      
