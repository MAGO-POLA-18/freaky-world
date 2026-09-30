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

/* =========================================================
   AVATAR TIERRA VICIO
========================================================= */

function TierraVicioAvatar({
  visualRef,
  movementAmount,
}) {
  const leftArm =
    useRef(null);

  const rightArm =
    useRef(null);

  const leftLeg =
    useRef(null);

  const rightLeg =
    useRef(null);

  const torso =
    useRef(null);

  const head =
    useRef(null);

  const shirtTexture =
    useMemo(
      () =>
        createShirtTexture(),
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
            leftLeg.current
              .rotation.x,
            targetSwing,
            damping
          );
      }

      if (rightLeg.current) {
        rightLeg.current.rotation.x =
          THREE.MathUtils.lerp(
            rightLeg.current
              .rotation.x,
            inverseSwing,
            damping
          );
      }

      if (leftArm.current) {
        leftArm.current.rotation.x =
          THREE.MathUtils.lerp(
            leftArm.current
              .rotation.x,
            inverseSwing * 0.78,
            damping
          );

        leftArm.current.rotation.z =
          THREE.MathUtils.lerp(
            leftArm.current
              .rotation.z,
            -0.05,
            damping
          );
      }

      if (rightArm.current) {
        rightArm.current.rotation.x =
          THREE.MathUtils.lerp(
            rightArm.current
              .rotation.x,
            targetSwing * 0.78,
            damping
          );

        rightArm.current.rotation.z =
          THREE.MathUtils.lerp(
            rightArm.current
              .rotation.z,
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
            head.current
              .rotation.z,
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
                  time *
                    frequency
                )
              ) *
              (sprinting
                ? 0.04
                : 0.024)
            : 0;

        visualRef.current.position.y =
          -0.96 + bounce;
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
      {/* ===================================================
          CADERA
      =================================================== */}

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

      {/* ===================================================
          TORSO
      =================================================== */}

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

      {/* ===================================================
          CABEZA
      =================================================== */}

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

      {/* ===================================================
          BRAZOS
      =================================================== */}

      <Arm
        side={-1}
        armRef={leftArm}
      />

      <Arm
        side={1}
        armRef={rightArm}
      />

      {/* ===================================================
          PIERNAS
      =================================================== */}

      <Leg
        side={-1}
        legRef={leftLeg}
      />

      <Leg
        side={1}
        legRef={rightLeg}
      />

      {/* ===================================================
          DETALLES PANTALÓN
      =================================================== */}

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

    function onKeyDown(e) {
      setKey(
        e.code,
        true
      );
    }

    function onKeyUp(e) {
      setKey(
        e.code,
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

      if (
        playerInput.uiLocked
      ) {
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

      let inputX =
        playerInput.x || 0;

      let inputY =
        playerInput.y || 0;

      const keyboardX =
        (keyboard.current.right
          ? 1
          : 0) -
        (keyboard.current.left
          ? 1
          : 0);

      const keyboardY =
        (keyboard.current.forward
          ? 1
          : 0) -
        (keyboard.current.backward
          ? 1
          : 0);

      const keyboardActive =
        keyboardX !== 0 ||
        keyboardY !== 0;

      if (keyboardActive) {
        inputX = keyboardX;
        inputY = keyboardY;
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
         VELOCIDAD
      =================================================== */

      let moveSpeed = 0;

      if (
        magnitude >
        0.08
      ) {
        if (
          keyboardActive
        ) {
          moveSpeed =
            keyboard.current
              .sprint
              ? SPRINT_SPEED
              : WALK_SPEED;
        } else if (
          magnitude < 0.38
        ) {
          moveSpeed =
            THREE.MathUtils.lerp(
              SLOW_SPEED * 0.45,
              SLOW_SPEED,
              magnitude / 0.38
            );
        } else if (
          magnitude < 0.78
        ) {
          moveSpeed =
            THREE.MathUtils.lerp(
              SLOW_SPEED,
              WALK_SPEED,
              (magnitude -
                0.38) /
                0.4
            );
        } else {
          moveSpeed =
            THREE.MathUtils.lerp(
              WALK_SPEED,
              SPRINT_SPEED,
              (magnitude -
                0.78) /
                0.22
            );
        }
      }

      /* ===================================================
         DASH
      =================================================== */

      if (
        playerInput
          .dashRequested &&
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

      cameraForward.current.y = 0;

      if (
        cameraForward.current
          .lengthSq() <
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

      cameraForward.current
        .normalize();

      cameraRight.current
        .crossVectors(
          cameraForward.current,
          worldUp.current
        )
        .normalize();

      movementDirection.current
        .set(0, 0, 0);

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
        movementDirection.current
          .lengthSq() >
        0.0001
      ) {
        movementDirection.current
          .normalize();
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

      movementAmount.current =
        THREE.MathUtils.lerp(
          movementAmount.current,
          magnitude,
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
        movementDirection.current
          .lengthSq() >
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
            visual.current
              .rotation.y;

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
