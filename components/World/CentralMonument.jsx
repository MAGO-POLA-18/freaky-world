"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

/* =========================================================
   FLECHA EN LA CARA FRONTAL
   Visible en cada brazo de la cruceta
========================================================= */

function ArrowMark({
  x = 0,
  y = 0,
  rotationZ = 0,
}) {
  const arrowShape = useMemo(() => {
    const shape = new THREE.Shape();

    // punta
    shape.moveTo(0, 0.78);

    // hombro derecho
    shape.lineTo(0.58, 0.08);

    // entrada derecha
    shape.lineTo(0.27, 0.08);

    // base derecha
    shape.lineTo(0.27, -0.52);

    // base izquierda
    shape.lineTo(-0.27, -0.52);

    // entrada izquierda
    shape.lineTo(-0.27, 0.08);

    // hombro izquierdo
    shape.lineTo(-0.58, 0.08);

    shape.closePath();

    return shape;
  }, []);

  return (
    <mesh
      position={[
        x,
        y,

        // cara frontal real
        0.87,
      ]}
      rotation={[
        0,
        0,
        rotationZ,
      ]}
    >
      <shapeGeometry
        args={[arrowShape]}
      />

      <meshStandardMaterial
        color="#262b2f"
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* =========================================================
   MONUMENTO CENTRAL
========================================================= */

export default function CentralMonument({
  position = [0, 0, 0],
}) {
  const dpadRef =
    useRef(null);

  /* =======================================================
     ROTACIÓN
  ======================================================= */

  useFrame(
    (state, delta) => {
      if (
        !dpadRef.current
      ) {
        return;
      }

      dpadRef.current
        .rotation.y +=
        delta * 0.18;
    }
  );

  /* =======================================================
     FORMA GENERAL DE LA CRUCETA
  ======================================================= */

  const createCrossShape =
    () => {
      const shape =
        new THREE.Shape();

      const arm =
        1.65;

      const length =
        4.25;

      shape.moveTo(
        -arm,
        length
      );

      shape.lineTo(
        arm,
        length
      );

      shape.lineTo(
        arm,
        arm
      );

      shape.lineTo(
        length,
        arm
      );

      shape.lineTo(
        length,
        -arm
      );

      shape.lineTo(
        arm,
        -arm
      );

      shape.lineTo(
        arm,
        -length
      );

      shape.lineTo(
        -arm,
        -length
      );

      shape.lineTo(
        -arm,
        -arm
      );

      shape.lineTo(
        -length,
        -arm
      );

      shape.lineTo(
        -length,
        arm
      );

      shape.lineTo(
        -arm,
        arm
      );

      shape.closePath();

      return shape;
    };

  /* =======================================================
     PARTE TRASERA
     Lisa y cerrada
  ======================================================= */

  const backShape =
    useMemo(() => {
      return createCrossShape();
    }, []);

  /* =======================================================
     PARTE FRONTAL
     Con el hueco circular central
  ======================================================= */

  const frontShape =
    useMemo(() => {
      const shape =
        createCrossShape();

      const hole =
        new THREE.Path();

      hole.absarc(
        0,
        0,
        1.18,
        0,
        Math.PI * 2,
        false
      );

      shape.holes.push(
        hole
      );

      return shape;
    }, []);

  /* =======================================================
     EXTRUSIONES
  ======================================================= */

  const backExtrude =
    useMemo(
      () => ({
        depth: 0.3,

        bevelEnabled:
          true,

        bevelThickness:
          0.08,

        bevelSize:
          0.08,

        bevelSegments:
          3,

        curveSegments:
          24,
      }),
      []
    );

  const frontExtrude =
    useMemo(
      () => ({
        depth: 1.15,

        bevelEnabled:
          true,

        bevelThickness:
          0.13,

        bevelSize:
          0.13,

        bevelSegments:
          4,

        curveSegments:
          32,
      }),
      []
    );

  const glow =
    "#8fd8ff";

  return (
    <group
      position={position}
    >
      {/* ===================================================
          PLATAFORMA — BASE
      =================================================== */}

      <mesh
        position={[
          0,
          0.1,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            9,
            9,
            0.2,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#11161a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* ===================================================
          PLATAFORMA — NIVEL 2
      =================================================== */}

      <mesh
        position={[
          0,
          0.24,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            7.4,
            7.4,
            0.18,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#20272d"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* ===================================================
          PLATAFORMA — CENTRO
      =================================================== */}

      <mesh
        position={[
          0,
          0.38,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            5.6,
            5.6,
            0.16,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#303942"
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>

      {/* ===================================================
          ARO LUMINOSO DE LA BASE
      =================================================== */}

      <mesh
        position={[
          0,
          0.48,
          0,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            4.7,
            0.055,
            10,
            96,
          ]}
        />

        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          CRUCETA
      =================================================== */}

      <group
        ref={dpadRef}
        position={[
          0,
          6.4,
          0,
        ]}
        rotation={[
          -0.12,
          0,
          Math.PI / 4,
        ]}
      >
        {/* ===============================================
            PARTE TRASERA
        =============================================== */}

        <mesh
          position={[
            0,
            0,
            -0.72,
          ]}
          castShadow
        >
          <extrudeGeometry
            args={[
              backShape,
              backExtrude,
            ]}
          />

          <meshStandardMaterial
            color="#07090b"
            roughness={0.5}
            metalness={0.13}
          />
        </mesh>

        {/* ===============================================
            PARTE FRONTAL
        =============================================== */}

        <mesh
          position={[
            0,
            0,
            -0.44,
          ]}
          castShadow
        >
          <extrudeGeometry
            args={[
              frontShape,
              frontExtrude,
            ]}
          />

          <meshStandardMaterial
            color="#07090b"
            roughness={0.5}
            metalness={0.13}
          />
        </mesh>

        {/* ===============================================
            CAVIDAD CENTRAL
            Cóncava hacia adentro
        =============================================== */}

        <mesh
          position={[
            0,
            0,
            0.68,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
        >
          <sphereGeometry
            args={[
              1.12,
              40,
              24,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2,
            ]}
          />

          <meshStandardMaterial
            color="#030405"
            roughness={0.82}
            metalness={0.02}
            side={THREE.BackSide}
          />
        </mesh>

        {/* ===============================================
            FLECHAS EN LAS 4 PUNTAS DE LA CARA FRONTAL
        =============================================== */}

        {/* ARRIBA */}
        <ArrowMark
          x={0}
          y={3.05}
          rotationZ={0}
        />

        {/* ABAJO */}
        <ArrowMark
          x={0}
          y={-3.05}
          rotationZ={Math.PI}
        />

        {/* IZQUIERDA */}
        <ArrowMark
          x={-3.05}
          y={0}
          rotationZ={
            Math.PI / 2
          }
        />

        {/* DERECHA */}
        <ArrowMark
          x={3.05}
          y={0}
          rotationZ={
            -Math.PI / 2
          }
        />
      </group>

      {/* ===================================================
          LUZ INFERIOR
      =================================================== */}

      <pointLight
        position={[
          0,
          2.3,
          0,
        ]}
        intensity={3.5}
        distance={12}
        decay={2}
        color={glow}
      />
    </group>
  );
}
