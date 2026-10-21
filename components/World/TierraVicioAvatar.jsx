"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   TIERRA VICIO AVATAR
   Robot gamer procedural

   Este archivo contiene SOLO:
   - geometría visual
   - materiales
   - animaciones visuales

   No contiene:
   - físicas
   - Rapier
   - controles
   - cámara
   - velocidad del jugador
========================================================= */

const C = {
  graphite: "#171820",
  graphite2: "#232530",
  graphite3: "#30333f",

  black: "#090a0f",

  metal: "#6f7482",
  metalDark: "#424651",

  white: "#e8e9ed",

  purple: "#8f46ff",
  purpleDark: "#5421a4",
  purpleLight: "#bd8cff",

  cyan: "#67e8f9",
};

/* =========================================================
   MATERIAL HELPERS
========================================================= */

function StandardMaterial({
  color,
  roughness = 0.65,
  metalness = 0.15,
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
    />
  );
}

function GlowMaterial({
  color = C.purple,
  intensity = 2,
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      toneMapped={false}
      roughness={0.35}
    />
  );
}

/* =========================================================
   VISOR / CABEZA
========================================================= */

function RobotHead({
  headRef,
  eyeLeftRef,
  eyeRightRef,
}) {
  return (
    <group ref={headRef}>

      {/* cuello mecánico */}

      <mesh
        position={[0, -0.18, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[0.11, 0.14, 0.19, 16]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.5}
          metalness={0.65}
        />
      </mesh>

      {/* aro del cuello */}

      <mesh
        position={[0, -0.095, 0]}
        castShadow
      >
        <torusGeometry
          args={[0.13, 0.025, 8, 18]}
        />

        <StandardMaterial
          color={C.metal}
          roughness={0.42}
          metalness={0.75}
        />
      </mesh>

      {/* casco principal */}

      <mesh
        scale={[1.05, 0.9, 0.92]}
        castShadow
      >
        <sphereGeometry
          args={[0.31, 24, 18]}
        />

        <StandardMaterial
          color={C.graphite2}
          roughness={0.48}
          metalness={0.32}
        />
      </mesh>

      {/* parte posterior */}

      <mesh
        position={[0, 0.015, -0.18]}
        scale={[0.88, 0.77, 0.5]}
        castShadow
      >
        <sphereGeometry
          args={[0.31, 18, 14]}
        />

        <StandardMaterial
          color={C.graphite}
          roughness={0.55}
          metalness={0.35}
        />
      </mesh>

      {/* placa superior */}

      <mesh
        position={[0, 0.255, -0.01]}
        scale={[1, 0.28, 0.78]}
        castShadow
      >
        <sphereGeometry
          args={[0.25, 18, 12]}
        />

        <StandardMaterial
          color={C.graphite3}
          roughness={0.42}
          metalness={0.38}
        />
      </mesh>

      {/* lateral izquierdo */}

      <mesh
        position={[-0.29, 0, -0.015]}
        rotation={[0, 0, 0.08]}
        castShadow
      >
        <cylinderGeometry
          args={[0.075, 0.085, 0.20, 12]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.45}
          metalness={0.7}
        />
      </mesh>

      {/* lateral derecho */}

      <mesh
        position={[0.29, 0, -0.015]}
        rotation={[0, 0, -0.08]}
        castShadow
      >
        <cylinderGeometry
          args={[0.075, 0.085, 0.20, 12]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.45}
          metalness={0.7}
        />
      </mesh>

      {/* VISOR */}

      <mesh
        position={[0, 0.025, 0.257]}
        scale={[1.38, 0.72, 0.18]}
      >
        <sphereGeometry
          args={[0.205, 24, 14]}
        />

        <meshStandardMaterial
          color="#080910"
          roughness={0.18}
          metalness={0.3}
        />
      </mesh>

      {/* borde superior del visor */}

      <mesh
        position={[0, 0.158, 0.242]}
        scale={[1, 0.18, 1]}
      >
        <capsuleGeometry
          args={[0.025, 0.43, 4, 10]}
        />

        <StandardMaterial
          color={C.graphite3}
          roughness={0.45}
          metalness={0.45}
        />
      </mesh>

      {/* ojo izquierdo */}

      <mesh
        ref={eyeLeftRef}
        position={[-0.105, 0.035, 0.301]}
        scale={[1.35, 0.78, 0.45]}
      >
        <sphereGeometry
          args={[0.052, 16, 10]}
        />

        <GlowMaterial
          color={C.purpleLight}
          intensity={3}
        />
      </mesh>

      {/* ojo derecho */}

      <mesh
        ref={eyeRightRef}
        position={[0.105, 0.035, 0.301]}
        scale={[1.35, 0.78, 0.45]}
      >
        <sphereGeometry
          args={[0.052, 16, 10]}
        />

        <GlowMaterial
          color={C.purpleLight}
          intensity={3}
        />
      </mesh>

      {/* pequeña expresión inferior */}

      <mesh
        position={[0, -0.08, 0.303]}
        scale={[1, 0.35, 0.3]}
      >
        <torusGeometry
          args={[
            0.055,
            0.009,
            6,
            16,
            Math.PI,
          ]}
        />

        <GlowMaterial
          color={C.purple}
          intensity={1.8}
        />
      </mesh>

      {/* antena */}

      <mesh
        position={[0.11, 0.39, -0.03]}
        rotation={[0, 0, -0.18]}
        castShadow
      >
        <cylinderGeometry
          args={[0.014, 0.018, 0.20, 8]}
        />

        <StandardMaterial
          color={C.metal}
          roughness={0.38}
          metalness={0.8}
        />
      </mesh>

      <mesh
        position={[0.128, 0.495, -0.03]}
      >
        <sphereGeometry
          args={[0.035, 12, 8]}
        />

        <GlowMaterial
          color={C.purple}
          intensity={3}
        />
      </mesh>

    </group>
  );
}

/* =========================================================
   BRAZO ROBÓTICO
========================================================= */

function RobotArm({
  side,
  armRef,
}) {
  const s = side;

  return (
    <group
      ref={armRef}
      position={[
        0.42 * s,
        1.42,
        0,
      ]}
    >

      {/* hombro */}

      <mesh
        position={[
          0.015 * s,
          0,
          0,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[0.145, 16, 12]}
        />

        <StandardMaterial
          color={C.graphite3}
          roughness={0.5}
          metalness={0.35}
        />
      </mesh>

      {/* aro hombro */}

      <mesh
        position={[
          0.015 * s,
          -0.02,
          0,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[0.105, 0.018, 8, 16]}
        />

        <StandardMaterial
          color={C.purpleDark}
          roughness={0.45}
          metalness={0.45}
        />
      </mesh>

      {/* brazo superior */}

      <mesh
        position={[
          0.02 * s,
          -0.25,
          0,
        ]}
        castShadow
      >
        <capsuleGeometry
          args={[0.09, 0.26, 8, 12]}
        />

        <StandardMaterial
          color={C.graphite2}
          roughness={0.52}
          metalness={0.32}
        />
      </mesh>

      {/* codo */}

      <mesh
        position={[
          0.025 * s,
          -0.48,
          0,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[0.09, 14, 10]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.42}
          metalness={0.7}
        />
      </mesh>

      {/* núcleo del codo */}

      <mesh
        position={[
          0.025 * s,
          -0.48,
          0.075,
        ]}
      >
        <sphereGeometry
          args={[0.035, 10, 8]}
        />

        <GlowMaterial
          color={C.purple}
          intensity={2}
        />
      </mesh>

      {/* antebrazo */}

      <mesh
        position={[
          0.03 * s,
          -0.68,
          0.01,
        ]}
        scale={[1.05, 1, 0.92]}
        castShadow
      >
        <capsuleGeometry
          args={[0.085, 0.23, 8, 12]}
        />

        <StandardMaterial
          color={C.graphite3}
          roughness={0.5}
          metalness={0.38}
        />
      </mesh>

      {/* muñeca */}

      <mesh
        position={[
          0.032 * s,
          -0.845,
          0.012,
        ]}
      >
        <cylinderGeometry
          args={[0.075, 0.075, 0.07, 12]}
        />

        <StandardMaterial
          color={C.metal}
          roughness={0.4}
          metalness={0.72}
        />
      </mesh>

      {/* mano */}

      <mesh
        position={[
          0.035 * s,
          -0.94,
          0.025,
        ]}
        scale={[0.85, 1, 0.75]}
        castShadow
      >
        <sphereGeometry
          args={[0.105, 14, 10]}
        />

        <StandardMaterial
          color={C.graphite2}
          roughness={0.52}
          metalness={0.3}
        />
      </mesh>

      {/* nudillos */}

      {[-0.045, 0, 0.045].map(
        (x, index) => (
          <mesh
            key={index}
            position={[
              0.035 * s + x,
              -0.955,
              0.105,
            ]}
          >
            <sphereGeometry
              args={[0.025, 8, 6]}
            />

            <StandardMaterial
              color={C.metal}
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
        )
      )}

    </group>
  );
}

/* =========================================================
   PIERNA ROBÓTICA
========================================================= */

function RobotLeg({
  side,
  legRef,
}) {
  const s = side;

  return (
    <group
      ref={legRef}
      position={[
        0.17 * s,
        0.91,
        0,
      ]}
    >

      {/* unión cadera */}

      <mesh
        position={[0, -0.04, 0]}
        castShadow
      >
        <sphereGeometry
          args={[0.115, 14, 10]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.42}
          metalness={0.65}
        />
      </mesh>

      {/* muslo */}

      <mesh
        position={[0, -0.29, 0]}
        scale={[1, 1, 0.92]}
        castShadow
      >
        <capsuleGeometry
          args={[0.13, 0.34, 8, 12]}
        />

        <StandardMaterial
          color={C.graphite2}
          roughness={0.54}
          metalness={0.3}
        />
      </mesh>

      {/* placa frontal muslo */}

      <mesh
        position={[0, -0.27, 0.115]}
        scale={[0.85, 1, 0.3]}
        castShadow
      >
        <capsuleGeometry
          args={[0.085, 0.20, 6, 10]}
        />

        <StandardMaterial
          color={C.graphite3}
          roughness={0.45}
          metalness={0.42}
        />
      </mesh>

      {/* rodilla */}

      <mesh
        position={[0, -0.57, 0.015]}
        castShadow
      >
        <sphereGeometry
          args={[0.12, 14, 10]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.42}
          metalness={0.68}
        />
      </mesh>

      {/* luz rodilla */}

      <mesh
        position={[0, -0.57, 0.112]}
      >
        <sphereGeometry
          args={[0.035, 10, 8]}
        />

        <GlowMaterial
          color={C.purple}
          intensity={2}
        />
      </mesh>

      {/* pantorrilla */}

      <mesh
        position={[0, -0.79, -0.005]}
        scale={[0.92, 1, 0.88]}
        castShadow
      >
        <capsuleGeometry
          args={[0.11, 0.29, 8, 12]}
        />

        <StandardMaterial
          color={C.graphite}
          roughness={0.55}
          metalness={0.32}
        />
      </mesh>

      {/* tobillo */}

      <mesh
        position={[0, -0.98, 0.015]}
        castShadow
      >
        <cylinderGeometry
          args={[0.075, 0.085, 0.10, 12]}
        />

        <StandardMaterial
          color={C.metal}
          roughness={0.4}
          metalness={0.72}
        />
      </mesh>

      {/* ===================================================
          PIE

          Diseñado como una zapatilla/bota futurista.
          No es una caja única.
      =================================================== */}

      <group
        position={[
          0,
          -1.075,
          0.075,
        ]}
      >

        {/* talón */}

        <mesh
          position={[
            0,
            0.035,
            -0.075,
          ]}
          scale={[
            1,
            0.82,
            0.95,
          ]}
          castShadow
        >
          <sphereGeometry
            args={[0.135, 14, 10]}
          />

          <StandardMaterial
            color={C.graphite2}
            roughness={0.5}
            metalness={0.35}
          />
        </mesh>

        {/* cuerpo central */}

        <mesh
          position={[
            0,
            0.015,
            0.055,
          ]}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
          scale={[
            1,
            1.35,
            0.68,
          ]}
          castShadow
        >
          <capsuleGeometry
            args={[0.125, 0.14, 8, 12]}
          />

          <StandardMaterial
            color={C.graphite3}
            roughness={0.48}
            metalness={0.36}
          />
        </mesh>

        {/* puntera */}

        <mesh
          position={[
            0,
            -0.005,
            0.20,
          ]}
          scale={[
            1.08,
            0.68,
            1.25,
          ]}
          castShadow
        >
          <sphereGeometry
            args={[0.135, 16, 10]}
          />

          <StandardMaterial
            color={C.graphite2}
            roughness={0.5}
            metalness={0.35}
          />
        </mesh>

        {/* suela trasera */}

        <mesh
          position={[
            0,
            -0.085,
            -0.045,
          ]}
          scale={[
            1.04,
            0.32,
            1,
          ]}
          castShadow
        >
          <sphereGeometry
            args={[0.14, 14, 8]}
          />

          <StandardMaterial
            color={C.black}
            roughness={0.72}
            metalness={0.08}
          />
        </mesh>

        {/* suela delantera */}

        <mesh
          position={[
            0,
            -0.09,
            0.17,
          ]}
          scale={[
            1.10,
            0.30,
            1.35,
          ]}
          castShadow
        >
          <sphereGeometry
            args={[0.14, 14, 8]}
          />

          <StandardMaterial
            color={C.black}
            roughness={0.72}
            metalness={0.08}
          />
        </mesh>

        {/* línea violeta */}

        <mesh
          position={[
            0,
            -0.035,
            0.286,
          ]}
          scale={[
            1.3,
            0.45,
            0.3,
          ]}
        >
          <sphereGeometry
            args={[0.075, 12, 8]}
          />

          <GlowMaterial
            color={C.purple}
            intensity={1.8}
          />
        </mesh>

        {/* placa superior */}

        <mesh
          position={[
            0,
            0.10,
            0.075,
          ]}
          rotation={[
            -0.30,
            0,
            0,
          ]}
          scale={[
            1,
            0.55,
            1.2,
          ]}
        >
          <sphereGeometry
            args={[0.10, 12, 8]}
          />

          <StandardMaterial
            color={C.metalDark}
            roughness={0.45}
            metalness={0.6}
          />
        </mesh>

      </group>
    </group>
  );
}

/* =========================================================
   CUERPO
========================================================= */

function RobotBody({
  torsoRef,
}) {
  return (
    <group
      ref={torsoRef}
      position={[0, 1.34, 0]}
    >

      {/* núcleo interior */}

      <mesh
        scale={[
          0.88,
          1,
          0.78,
        ]}
        castShadow
      >
        <capsuleGeometry
          args={[0.29, 0.37, 8, 14]}
        />

        <StandardMaterial
          color={C.graphite}
          roughness={0.55}
          metalness={0.34}
        />
      </mesh>

      {/* pecho superior */}

      <mesh
        position={[0, 0.13, 0.015]}
        scale={[
          1.05,
          0.68,
          0.78,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[0.33, 18, 12]}
        />

        <StandardMaterial
          color={C.graphite2}
          roughness={0.48}
          metalness={0.4}
        />
      </mesh>

      {/* placa pecho */}

      <mesh
        position={[0, 0.075, 0.275]}
        scale={[
          1.25,
          0.9,
          0.30,
        ]}
      >
        <sphereGeometry
          args={[0.19, 16, 10]}
        />

        <StandardMaterial
          color={C.graphite3}
          roughness={0.42}
          metalness={0.45}
        />
      </mesh>

      {/* núcleo Tierra Vicio */}

      <mesh
        position={[0, 0.07, 0.34]}
      >
        <ringGeometry
          args={[
            0.055,
            0.082,
            20,
          ]}
        />

        <GlowMaterial
          color={C.purple}
          intensity={2.5}
        />
      </mesh>

      <mesh
        position={[0, 0.07, 0.342]}
      >
        <circleGeometry
          args={[0.038, 18]}
        />

        <meshStandardMaterial
          color="#0c0d13"
          roughness={0.3}
        />
      </mesh>

      {/* cruceta central */}

      <mesh
        position={[0, 0.07, 0.348]}
      >
        <boxGeometry
          args={[
            0.055,
            0.018,
            0.012,
          ]}
        />

        <GlowMaterial
          color={C.purpleLight}
          intensity={2}
        />
      </mesh>

      <mesh
        position={[0, 0.07, 0.349]}
      >
        <boxGeometry
          args={[
            0.018,
            0.055,
            0.012,
          ]}
        />

        <GlowMaterial
          color={C.purpleLight}
          intensity={2}
        />
      </mesh>

      {/* cintura */}

      <mesh
        position={[0, -0.37, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.22,
            0.25,
            0.18,
            16,
          ]}
        />

        <StandardMaterial
          color={C.metalDark}
          roughness={0.45}
          metalness={0.62}
        />
      </mesh>

      {/* aro cintura */}

      <mesh
        position={[0, -0.31, 0]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            0.22,
            0.018,
            8,
            18,
          ]}
        />

        <GlowMaterial
          color={C.purpleDark}
          intensity={1.2}
        />
      </mesh>

    </group>
  );
}

/* =========================================================
   AVATAR COMPLETO
========================================================= */

export default function TierraVicioAvatar({
  visualRef,
  movementAmount,
}) {
  const torsoRef =
    useRef(null);

  const headRef =
    useRef(null);

  const leftArmRef =
    useRef(null);

  const rightArmRef =
    useRef(null);

  const leftLegRef =
    useRef(null);

  const rightLegRef =
    useRef(null);

  const eyeLeftRef =
    useRef(null);

  const eyeRightRef =
    useRef(null);

  const blinkTimer =
    useRef(0);

  const nextBlink =
    useRef(2.5);

  useFrame(
    ({ clock }, delta) => {
      const t =
        clock.elapsedTime;

      const movement =
        movementAmount?.current ?? 0;

      const moving =
        movement > 0.05;

      const sprinting =
        movement > 0.72;

      const frequency =
        sprinting
          ? 12.5
          : 7.8;

      const amplitude =
        sprinting
          ? 0.72
          : 0.48;

      const damping =
        1 -
        Math.exp(
          -delta * 11
        );

      const swing =
        moving
          ? Math.sin(
              t * frequency
            ) * amplitude
          : 0;

      /* piernas */

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x =
          THREE.MathUtils.lerp(
            leftLegRef.current.rotation.x,
            swing,
            damping
          );
      }

      if (rightLegRef.current) {
        rightLegRef.current.rotation.x =
          THREE.MathUtils.lerp(
            rightLegRef.current.rotation.x,
            -swing,
            damping
          );
      }

      /* brazos */

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x =
          THREE.MathUtils.lerp(
            leftArmRef.current.rotation.x,
            -swing * 0.72,
            damping
          );

        leftArmRef.current.rotation.z =
          THREE.MathUtils.lerp(
            leftArmRef.current.rotation.z,
            -0.04,
            damping
          );
      }

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          THREE.MathUtils.lerp(
            rightArmRef.current.rotation.x,
            swing * 0.72,
            damping
          );

        rightArmRef.current.rotation.z =
          THREE.MathUtils.lerp(
            rightArmRef.current.rotation.z,
            0.04,
            damping
          );
      }

      /* torso */

      if (torsoRef.current) {
        torsoRef.current.rotation.x =
          THREE.MathUtils.lerp(
            torsoRef.current.rotation.x,
            sprinting
              ? -0.10
              : moving
                ? -0.025
                : 0,
            damping
          );

        torsoRef.current.rotation.z =
          moving
            ? Math.sin(
                t *
                  frequency *
                  0.5
              ) * 0.022
            : Math.sin(
                t * 0.8
              ) * 0.005;
      }

      /* cabeza */

      if (headRef.current) {
        headRef.current.rotation.z =
          THREE.MathUtils.lerp(
            headRef.current.rotation.z,
            moving
              ? Math.sin(
                  t *
                    frequency *
                    0.5
                ) * 0.018
              : Math.sin(
                  t * 0.65
                ) * 0.018,
            damping
          );

        headRef.current.rotation.y =
          moving
            ? 0
            : Math.sin(
                t * 0.42
              ) * 0.055;
      }

      /* rebote */

      if (visualRef?.current) {
        const bounce =
          moving
            ? Math.abs(
                Math.sin(
                  t * frequency
                )
              ) *
              (
                sprinting
                  ? 0.038
                  : 0.022
              )
            : Math.sin(
                t * 1.8
              ) * 0.004;

        visualRef.current.position.y =
          -0.96 +
          bounce;
      }

      /* parpadeo */

      blinkTimer.current += delta;

      if (
        blinkTimer.current >
        nextBlink.current
      ) {
        const blinkPhase =
          blinkTimer.current -
          nextBlink.current;

        let scaleY = 1;

        if (
          blinkPhase < 0.08
        ) {
          scaleY =
            THREE.MathUtils.lerp(
              1,
              0.08,
              blinkPhase / 0.08
            );
        } else if (
          blinkPhase < 0.16
        ) {
          scaleY =
            THREE.MathUtils.lerp(
              0.08,
              1,
              (
                blinkPhase -
                0.08
              ) / 0.08
            );
        } else {
          blinkTimer.current = 0;

          nextBlink.current =
            2.2 +
            Math.random() * 3.2;
        }

        if (eyeLeftRef.current) {
          eyeLeftRef.current.scale.y =
            scaleY * 0.78;
        }

        if (eyeRightRef.current) {
          eyeRightRef.current.scale.y =
            scaleY * 0.78;
        }
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

      {/* pelvis */}

      <mesh
        position={[
          0,
          0.93,
          0,
        ]}
        scale={[
          1,
          0.72,
          0.82,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.30,
            16,
            10,
          ]}
        />

        <StandardMaterial
          color={C.graphite2}
          roughness={0.52}
          metalness={0.38}
        />
      </mesh>

      {/* núcleo pelvis */}

      <mesh
        position={[
          0,
          0.93,
          0.245,
        ]}
      >
        <sphereGeometry
          args={[
            0.055,
            12,
            8,
          ]}
        />

        <GlowMaterial
          color={C.purpleDark}
          intensity={1.4}
        />
      </mesh>

      <RobotBody
        torsoRef={torsoRef}
      />

      <group
        position={[
          0,
          1.94,
          0,
        ]}
      >
        <RobotHead
          headRef={headRef}
          eyeLeftRef={eyeLeftRef}
          eyeRightRef={eyeRightRef}
        />
      </group>

      <RobotArm
        side={-1}
        armRef={leftArmRef}
      />

      <RobotArm
        side={1}
        armRef={rightArmRef}
      />

      <RobotLeg
        side={-1}
        legRef={leftLegRef}
      />

      <RobotLeg
        side={1}
        legRef={rightLegRef}
      />

    </group>
  );
}
