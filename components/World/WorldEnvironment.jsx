"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  RigidBody,
} from "@react-three/rapier";

import * as THREE from "three";

import Museum from "../Museum/Museum";
import CentralMonument from "./CentralMonument";
import CentralGarden from "./CentralGarden";

/* =========================================================
   CAJAS INSTANCIADAS

   Todos los objetos del mismo tipo
   se renderizan en una sola draw call.
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 1,
  metalness = 0,
}) {
  const meshRef =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (
      !meshRef.current
    ) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        dummy.position.set(
          ...item.position
        );

        dummy.scale.set(
          ...item.scale
        );

        dummy.updateMatrix();

        meshRef.current
          .setMatrixAt(
            index,
            dummy.matrix
          );
      }
    );

    meshRef.current
      .instanceMatrix
      .needsUpdate =
      true;

    meshRef.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        null,
        null,
        items.length,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          1,
          1,
          1,
        ]}
      />

      <meshStandardMaterial
        color={color}
        roughness={
          roughness
        }
        metalness={
          metalness
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   WORLD ENVIRONMENT
========================================================= */

export default function WorldEnvironment() {
  /* =======================================================
     AGUA
  ======================================================= */

  const waterItems =
    useMemo(
      () => [
        {
          position: [
            -88,
            -0.01,
            -88,
          ],
          scale: [
            72,
            0.08,
            72,
          ],
        },

        {
          position: [
            88,
            -0.01,
            -88,
          ],
          scale: [
            72,
            0.08,
            72,
          ],
        },

        {
          position: [
            -88,
            -0.01,
            88,
          ],
          scale: [
            72,
            0.08,
            72,
          ],
        },

        {
          position: [
            88,
            -0.01,
            88,
          ],
          scale: [
            72,
            0.08,
            72,
          ],
        },
      ],
      []
    );

  /* =======================================================
     FRANJAS VERDES
  ======================================================= */

  const gardenItems =
    useMemo(
      () => [
        {
          position: [
            -32,
            0.3,
            -76,
          ],
          scale: [
            12,
            0.12,
            96,
          ],
        },

        {
          position: [
            32,
            0.3,
            -76,
          ],
          scale: [
            12,
            0.12,
            96,
          ],
        },

        {
          position: [
            -32,
            0.3,
            76,
          ],
          scale: [
            12,
            0.12,
            96,
          ],
        },

        {
          position: [
            32,
            0.3,
            76,
          ],
          scale: [
            12,
            0.12,
            96,
          ],
        },

        {
          position: [
            76,
            0.3,
            -32,
          ],
          scale: [
            96,
            0.12,
            12,
          ],
        },

        {
          position: [
            76,
            0.3,
            32,
          ],
          scale: [
            96,
            0.12,
            12,
          ],
        },

        {
          position: [
            -76,
            0.3,
            -32,
          ],
          scale: [
            96,
            0.12,
            12,
          ],
        },

        {
          position: [
            -76,
            0.3,
            32,
          ],
          scale: [
            96,
            0.12,
            12,
          ],
        },
      ],
      []
    );

  /* =======================================================
     CAMINOS
  ======================================================= */

  const pathItems =
    useMemo(
      () => [
        {
          position: [
            0,
            0.36,
            -52,
          ],
          scale: [
            12,
            0.09,
            78,
          ],
        },

        {
          position: [
            0,
            0.36,
            52,
          ],
          scale: [
            12,
            0.09,
            78,
          ],
        },

        {
          position: [
            52,
            0.36,
            0,
          ],
          scale: [
            78,
            0.09,
            12,
          ],
        },

        {
          position: [
            -52,
            0.36,
            0,
          ],
          scale: [
            78,
            0.09,
            12,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          TERRENO GENERAL
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            -0.3,
            0,
          ]}
          receiveShadow
        >
          <boxGeometry
            args={[
              280,
              0.5,
              280,
            ]}
          />

          <meshStandardMaterial
            color="#3f493e"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          AGUA
      =================================================== */}

      <InstancedBoxes
        items={
          waterItems
        }
        color="#315d65"
        roughness={0.28}
        metalness={0.05}
      />

      {/* ===================================================
          BASE OSCURA DE LA GRAN CRUZ
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          <mesh
            position={[
              0,
              0.01,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                94,
                0.32,
                244,
              ]}
            />

            <meshStandardMaterial
              color="#596253"
              roughness={1}
            />
          </mesh>

          <mesh
            position={[
              0,
              0.01,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                244,
                0.32,
                94,
              ]}
            />

            <meshStandardMaterial
              color="#596253"
              roughness={1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ===================================================
          GRAN CRUZ VERDE
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          <mesh
            position={[
              0,
              0.18,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                88,
                0.18,
                238,
              ]}
            />

            <meshStandardMaterial
              color="#63745b"
              roughness={1}
            />
          </mesh>

          <mesh
            position={[
              0,
              0.18,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                238,
                0.18,
                88,
              ]}
            />

            <meshStandardMaterial
              color="#63745b"
              roughness={1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ===================================================
          FRANJAS VERDES
      =================================================== */}

      <InstancedBoxes
        items={
          gardenItems
        }
        color="#43583e"
      />

      {/* ===================================================
          CAMINOS
      =================================================== */}

      <InstancedBoxes
        items={
          pathItems
        }
        color="#b9b09d"
        roughness={0.95}
      />

      {/* ===================================================
          PLAZA CENTRAL
      =================================================== */}

      <group
        position={[
          0,
          0.4,
          0,
        ]}
      >
        <mesh
          receiveShadow
        >
          <boxGeometry
            args={[
              18,
              0.12,
              46,
            ]}
          />

          <meshStandardMaterial
            color="#c7bfad"
            roughness={0.9}
          />
        </mesh>

        <mesh
          receiveShadow
        >
          <boxGeometry
            args={[
              46,
              0.12,
              18,
            ]}
          />

          <meshStandardMaterial
            color="#c7bfad"
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* ===================================================
          JARDÍN Y VEGETACIÓN

          Todo el sistema vegetal queda aislado aquí.
      =================================================== */}

      <CentralGarden />

      {/* ===================================================
          PLATAFORMA DEL MONUMENTO
      =================================================== */}

      <mesh
        position={[
          0,
          0.53,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            7.3,
            7.8,
            0.16,
            32,
          ]}
        />

        <meshStandardMaterial
          color="#3c453d"
          roughness={0.82}
        />
      </mesh>

      <mesh
        position={[
          0,
          0.63,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            4.8,
            5.2,
            0.16,
            32,
          ]}
        />

        <meshStandardMaterial
          color="#24292d"
          roughness={0.6}
          metalness={0.12}
        />
      </mesh>

      {/* ===================================================
          MONUMENTO
      =================================================== */}

      <CentralMonument />

      {/* ===================================================
          EDIFICIOS
      =================================================== */}

      <Museum />
    </group>
  );
}
