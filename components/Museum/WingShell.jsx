import * as THREE from "three";
import { useMemo } from "react";

export default function WingShell({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const geometry = useMemo(() => {
    /*
      FORMA MAESTRA DE UNA PIEZA DE LA CRUCETA

      +Z = parte exterior/ancha
      -Z = punta orientada hacia el patio

      Por ahora es SOLO una huella muy fina.
      Cuando aprobemos esta silueta, esta misma
      forma será la base del edificio definitivo.
    */

    const shape = new THREE.Shape();

    // Frente corto: lado que mira al patio
    shape.moveTo(-10, -35);

    // Esquina inferior izquierda redondeada
    shape.quadraticCurveTo(
      -15,
      -35,
      -19,
      -31
    );

    // Diagonal izquierda
    shape.lineTo(-28, -19);

    // Transición hacia lateral
    shape.quadraticCurveTo(
      -30,
      -16,
      -30,
      -11
    );

    // Lateral izquierdo casi recto
    shape.lineTo(-30, 22);

    // Esquina superior izquierda
    shape.quadraticCurveTo(
      -30,
      31,
      -21,
      34
    );

    // Parte superior
    shape.quadraticCurveTo(
      0,
      37,
      21,
      34
    );

    // Esquina superior derecha
    shape.quadraticCurveTo(
      30,
      31,
      30,
      22
    );

    // Lateral derecho
    shape.lineTo(30, -11);

    // Transición hacia diagonal
    shape.quadraticCurveTo(
      30,
      -16,
      28,
      -19
    );

    // Diagonal derecha
    shape.lineTo(19, -31);

    // Esquina inferior derecha
    shape.quadraticCurveTo(
      15,
      -35,
      10,
      -35
    );

    // Frente corto
    shape.lineTo(-10, -35);

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: false,
      curveSegments: 20,
    };

    const result =
      new THREE.ExtrudeGeometry(
        shape,
        extrudeSettings
      );

    /*
      ExtrudeGeometry extruye sobre Z.
      Lo rotamos para que la forma quede
      horizontal sobre el suelo.
    */
    result.rotateX(Math.PI / 2);

    return result;
  }, []);

  return (
    <group
      position={position}
      rotation={rotation}
    >
      <mesh
        geometry={geometry}
        position={[0, 0.07, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#d9dde2"
          roughness={0.82}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Línea oscura para leer mejor el contorno */}
      <lineSegments
        position={[0, 0.14, 0]}
      >
        <edgesGeometry args={[geometry]} />

        <lineBasicMaterial
          color="#20242a"
        />
      </lineSegments>
    </group>
  );
}
