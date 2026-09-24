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
   FLECHA CALADA
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
      0.72
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
     FORMA DE LA CRUCETA

     Una sola pieza.

     El círculo central es un AGUJERO REAL.
  ======================================================= */

  const dpadShape =
    useMemo(() => {
      const shape =
        new THREE.Shape();

      const arm =
        1.65;

      const length =
        4.25;

      /* ===============================================
         CONTORNO DE CRUCETA
      =============================================== */

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

      /* ===============================================
         AGUJERO CIRCULAR CENTRAL
      =============================================== */

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
     EXTRUSIÓN

     El bevel suaviza todos los bordes.
  ======================================================= */

  const extrudeSettings =
    useMemo(
      () => ({
        depth: 1.45,

        bevelEnabled:
          true,

        bevelThickness:
          0.14,

        bevelSize:
          0.14,

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
          PLATAFORMA INFERIOR
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
          SEGUNDO NIVEL
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
          CENTRO PLATAFORMA
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
          LUZ DE PLATAFORMA
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
          emissiveIntensity={
            1
          }
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
            CUERPO

            Está centrado en profundidad:
            frente = +0.725
            atrás  = -0.725
        =============================================== */}

        <mesh
          position={[
            0,
            0,
            -0.725,
          ]}
          castShadow
        >
          <extrudeGeometry
            args={[
              dpadShape,
              extrudeSettings,
            ]}
          />

          <meshStandardMaterial
            color="#07090b"
            roughness={0.5}
            metalness={0.14}
          />
        </mesh>

        {/* =================================================
            MEDIA ESFERA CÓNCAVA

            El borde comienza EXACTAMENTE
            en el plano frontal de la cruceta.

            La esfera entra hacia -Z.

            NO sobresale por detrás.
        ================================================= */}

        <mesh
          position={[
            0,
            0,
            0.70,
          ]}
          rotation={[
            Math.PI / 2,
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

              Math.PI / 2,
              Math.PI / 2,
            ]}
          />

          <meshStandardMaterial
            color="#030405"
            roughness={0.82}
            metalness={0.05}
            side={
              THREE.BackSide
            }
          />
        </mesh>

        {/* =================================================
            FLECHA ARRIBA
        ================================================= */}

        <TriangleMark
          position={[
            0,
            2.9,
            0.755,
          ]}
        />

        {/* =================================================
            FLECHA ABAJO
        ================================================= */}

        <TriangleMark
          position={[
            0,
            -2.9,
            0.755,
          ]}
          rotation={[
            0,
            0,
            Math.PI,
          ]}
        />

        {/* =================================================
            FLECHA IZQUIERDA
        ================================================= */}

        <TriangleMark
          position={[
            -2.9,
            0,
            0.755,
          ]}
          rotation={[
            0,
            0,
            Math.PI / 2,
          ]}
        />

        {/* =================================================
            FLECHA DERECHA
        ================================================= */}

        <TriangleMark
          position={[
            2.9,
            0,
            0.755,
          ]}
          rotation={[
            0,
            0,
            -Math.PI / 2,
          ]}
        />
      </group>

      {/* ===================================================
          LUZ SUAVE DESDE ABAJO
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
