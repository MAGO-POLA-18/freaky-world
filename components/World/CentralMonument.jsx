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
   TRIÁNGULOS DE DIRECCIÓN
========================================================= */

function TriangleMark({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const shape = useMemo(() => {
    const s =
      new THREE.Shape();

    s.moveTo(
      0,
      0.7
    );

    s.lineTo(
      -0.58,
      -0.48
    );

    s.lineTo(
      0.58,
      -0.48
    );

    s.closePath();

    return s;
  }, []);

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <shapeGeometry
        args={[shape]}
      />

      <meshStandardMaterial
        color="#010203"
        roughness={1}
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
     CONTORNO GENERAL DE LA CRUCETA
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
     CRUCETA TRASERA

     COMPLETA.
     SIN AGUJERO.

     Esto hace que la parte trasera
     quede totalmente lisa.
  ======================================================= */

  const backShape =
    useMemo(() => {
      return createCrossShape();
    }, []);

  /* =======================================================
     PARTE FRONTAL

     SOLO esta capa tiene abertura circular.
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

     Capa fina que CIERRA completamente
     la cruceta por detrás.
  ======================================================= */

  const backExtrude =
    useMemo(
      () => ({
        depth: 0.28,

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

     Esta es la mayor parte del grosor.
     Aquí existe la abertura para la cavidad.
  ======================================================= */

  const frontExtrude =
    useMemo(
      () => ({
        depth: 1.15,

        bevelEnabled:
          true,

        bevelThickness:
          0.12,

        bevelSize:
          0.12,

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
          PLATAFORMA
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
          ARO DE LUZ
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
          CRUCETA COMPLETA
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

            Cruceta completa.
            Totalmente cerrada.
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
            metalness={0.14}
          />
        </mesh>

        {/* ===============================================
            PARTE FRONTAL

            Tiene el hueco SOLO en esta cara.
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
            metalness={0.14}
          />
        </mesh>

        {/* ===============================================
            MEDIA ESFERA CÓNCAVA

            Apertura:
            cara frontal.

            Profundidad:
            hacia DENTRO.

            No atraviesa la parte trasera.
        =============================================== */}

        <mesh
          position={[
            0,
            0,
            0.70,
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
            color="#020304"
            roughness={0.82}
            metalness={0.03}
            side={
              THREE.BackSide
            }
          />
        </mesh>

        {/* ===============================================
            TRIÁNGULO ARRIBA
        =============================================== */}

        <TriangleMark
          position={[
            0,
            2.9,
            0.725,
          ]}
        />

        {/* ===============================================
            TRIÁNGULO ABAJO
        =============================================== */}

        <TriangleMark
          position={[
            0,
            -2.9,
            0.725,
          ]}
          rotation={[
            0,
            0,
            Math.PI,
          ]}
        />

        {/* ===============================================
            TRIÁNGULO IZQUIERDA
        =============================================== */}

        <TriangleMark
          position={[
            -2.9,
            0,
            0.725,
          ]}
          rotation={[
            0,
            0,
            Math.PI / 2,
          ]}
        />

        {/* ===============================================
            TRIÁNGULO DERECHA
        =============================================== */}

        <TriangleMark
          position={[
            2.9,
            0,
            0.725,
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
