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
   FLECHA TIPO CRUCETA RETRO
   Contorno grabado, como mando clásico
========================================================= */

function TriangleMark({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const arrowShape = useMemo(() => {
    const outer = new THREE.Shape();

    /* contorno exterior */

    outer.moveTo(0, 0.72);

    outer.lineTo(
      0.55,
      0.12
    );

    outer.lineTo(
      0.28,
      0.12
    );

    outer.lineTo(
      0.28,
      -0.5
    );

    outer.lineTo(
      -0.28,
      -0.5
    );

    outer.lineTo(
      -0.28,
      0.12
    );

    outer.lineTo(
      -0.55,
      0.12
    );

    outer.closePath();

    /* hueco interior */

    const inner =
      new THREE.Path();

    inner.moveTo(
      0,
      0.47
    );

    inner.lineTo(
      0.3,
      0.08
    );

    inner.lineTo(
      0.11,
      0.08
    );

    inner.lineTo(
      0.11,
      -0.3
    );

    inner.lineTo(
      -0.11,
      -0.3
    );

    inner.lineTo(
      -0.11,
      0.08
    );

    inner.lineTo(
      -0.3,
      0.08
    );

    inner.closePath();

    outer.holes.push(inner);

    return outer;
  }, []);

  const extrudeSettings =
    useMemo(
      () => ({
        depth: 0.035,

        bevelEnabled:
          false,
      }),
      []
    );

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <extrudeGeometry
        args={[
          arrowShape,
          extrudeSettings,
        ]}
      />

      <meshStandardMaterial
        color="#2a2f33"
        roughness={0.9}
        metalness={0}
        side={
          THREE.DoubleSide
        }
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
     FORMA BASE DE LA CRUCETA
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

     Completa y cerrada.
  ======================================================= */

  const backShape =
    useMemo(() => {
      return createCrossShape();
    }, []);

  /* =======================================================
     PARTE FRONTAL

     Solo esta parte tiene el hueco circular.
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
     EXTRUSIÓN TRASERA
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

  /* =======================================================
     EXTRUSIÓN FRONTAL
  ======================================================= */

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
          ARO LUMINOSO
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
            Lisa y cerrada
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
            Con el hueco central
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
            MEDIA ESFERA CÓNCAVA

            Queda dentro de la cara frontal.
            No atraviesa la pieza.
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
            side={
              THREE.BackSide
            }
          />
        </mesh>

        {/* ===============================================
            FLECHA ARRIBA
        =============================================== */}

        <TriangleMark
          position={[
            0,
            2.85,
            0.735,
          ]}
        />

        {/* ===============================================
            FLECHA ABAJO
        =============================================== */}

        <TriangleMark
          position={[
            0,
            -2.85,
            0.735,
          ]}
          rotation={[
            0,
            0,
            Math.PI,
          ]}
        />

        {/* ===============================================
            FLECHA IZQUIERDA
        =============================================== */}

        <TriangleMark
          position={[
            -2.85,
            0,
            0.735,
          ]}
          rotation={[
            0,
            0,
            Math.PI / 2,
          ]}
        />

        {/* ===============================================
            FLECHA DERECHA
        =============================================== */}

        <TriangleMark
          position={[
            2.85,
            0,
            0.735,
          ]}
          rotation={[
            0,
            0,
            -Math.PI / 2,
          ]}
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
