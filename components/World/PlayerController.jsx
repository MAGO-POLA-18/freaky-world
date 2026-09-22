"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
} from "@react-three/rapier";
import * as THREE from "three";

export const playerInput = {
  x: 0,
  y: 0,
  lookX: 0,
  lookY: 0,
};

export const playerRuntime = {
  body: null,
  yaw: 0,
  pitch: 0.35,
  spawn: new THREE.Vector3(0, 1.35, 14),
};

export default function PlayerController() {
  const body = useRef();
  const visual = useRef();

  const keys = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
  });

  const movement = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useEffect(() => {
    const keyDown = (event) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") {
        keys.current.w = true;
      }

      if (event.code === "KeyS" || event.code === "ArrowDown") {
        keys.current.s = true;
      }

      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        keys.current.a = true;
      }

      if (event.code === "KeyD" || event.code === "ArrowRight") {
        keys.current.d = true;
      }
    };

    const keyUp = (event) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") {
        keys.current.w = false;
      }

      if (event.code === "KeyS" || event.code === "ArrowDown") {
        keys.current.s = false;
      }

      if (event.code === "KeyA" || event.code === "ArrowLeft") {
        keys.current.a = false;
      }

      if (event.code === "KeyD" || event.code === "ArrowRight") {
        keys.current.d = false;
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!body.current) return;

    playerRuntime.body = body.current;

    const rigidBody = body.current;
    const position = rigidBody.translation();

    /* FALLBACK SI CAE FUERA DEL MUNDO */
    if (position.y < -8) {
      rigidBody.setTranslation(
        {
          x: playerRuntime.spawn.x,
          y: playerRuntime.spawn.y,
          z: playerRuntime.spawn.z,
        },
        true
      );

      rigidBody.setLinvel(
        {
          x: 0,
          y: 0,
          z: 0,
        },
        true
      );

      rigidBody.setAngvel(
        {
          x: 0,
          y: 0,
          z: 0,
        },
        true
      );

      return;
    }

    const yaw = playerRuntime.yaw;

    forward.current.set(
      -Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );

    right.current.set(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );

    movement.current.set(0, 0, 0);

    if (keys.current.w) {
      movement.current.add(forward.current);
    }

    if (keys.current.s) {
      movement.current.sub(forward.current);
    }

    if (keys.current.d) {
      movement.current.add(right.current);
    }

    if (keys.current.a) {
      movement.current.sub(right.current);
    }

    if (playerInput.y !== 0) {
      movement.current.addScaledVector(
        forward.current,
        playerInput.y
      );
    }

    if (playerInput.x !== 0) {
      movement.current.addScaledVector(
        right.current,
        playerInput.x
      );
    }

    const currentVelocity = rigidBody.linvel();

    let targetX = 0;
    let targetZ = 0;

    if (movement.current.lengthSq() > 0.0001) {
      const strength = Math.min(
        movement.current.length(),
        1
      );

      movement.current.normalize();

      const walkSpeed = 2;
      const runSpeed = 6.5;

      const speed =
        walkSpeed +
        (runSpeed - walkSpeed) *
          strength;

      targetX = movement.current.x * speed;
      targetZ = movement.current.z * speed;

      if (visual.current) {
        const targetRotation = Math.atan2(
          movement.current.x,
          movement.current.z
        );

        let difference =
          targetRotation -
          visual.current.rotation.y;

        difference = Math.atan2(
          Math.sin(difference),
          Math.cos(difference)
        );

        const rotationSmoothing =
          1 - Math.exp(-12 * delta);

        visual.current.rotation.y +=
          difference * rotationSmoothing;
      }
    }

    const movementSmoothing =
      1 - Math.exp(-10 * delta);

    const velocityX = THREE.MathUtils.lerp(
      currentVelocity.x,
      targetX,
      movementSmoothing
    );

    const velocityZ = THREE.MathUtils.lerp(
      currentVelocity.z,
      targetZ,
      movementSmoothing
    );

    rigidBody.setLinvel(
      {
        x: velocityX,
        y: currentVelocity.y,
        z: velocityZ,
      },
      true
    );
  });

  return (
    <RigidBody
      ref={body}
      position={[
        playerRuntime.spawn.x,
        playerRuntime.spawn.y,
        playerRuntime.spawn.z,
      ]}
      colliders={false}
      enabledRotations={[false, false, false]}
      friction={0.45}
      restitution={0}
      linearDamping={1}
      angularDamping={1}
      ccd
      canSleep={false}
    >
      <CapsuleCollider
        args={[0.6, 0.35]}
        friction={0.45}
        restitution={0}
      />

      <group
        ref={visual}
        position={[0, -0.95, 0]}
      >
        <mesh
          position={[0, 1.15, 0]}
          castShadow
        >
          <boxGeometry args={[0.7, 1.1, 0.4]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        <mesh
          position={[0, 2, 0]}
          castShadow
        >
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color="#d8a47f" />
        </mesh>

        <mesh
          position={[-0.2, 0.45, 0]}
          castShadow
        >
          <boxGeometry args={[0.25, 0.9, 0.3]} />
          <meshStandardMaterial color="#222222" />
        </mesh>

        <mesh
          position={[0.2, 0.45, 0]}
          castShadow
        >
          <boxGeometry args={[0.25, 0.9, 0.3]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      </group>
    </RigidBody>
  );
}
