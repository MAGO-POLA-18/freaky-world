import * as THREE from "three";
import { useMemo } from "react";

export default function WingShell({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const geometry = useMemo(() => {
    /*
      =====================================================
      FORMA MAESTRA DPAD — V4

      +Y = extremo exterior
      -Y = extremo hacia el centro de la cruceta

      Cambios respecto a V3:
      - pieza ligeramente más corta
      - diagonales empiezan antes
      - punta interior más estrecha
      - menos tramo recto inferior
      - ancho máximo prácticamente idéntico
      =====================================================
    */

    const shape = new THREE.Shape();

    // =====================================================
    // PUNTA INTERIOR
    // =====================================================

    shape.moveTo(-3.8, -24.5);

    shape.quadraticCurveTo(
      -7.5,
      -24.5,
      -11.5,
      -21.5
    );

    // =====================================================
    // DIAGONAL IZQUIERDA
    // =====================================================

    shape.lineTo(-25.5, -6.5);

    // =====================================================
    // TRANSICIÓN AL LATERAL
    // =====================================================

    shape.quadraticCurveTo(
      -28.5,
      -3,
      -28.5,
      1
    );

    // =====================================================
    // LATERAL IZQUIERDO
    // =====================================================

    shape.lineTo(-28.5, 10);

    // =====================================================
    // ESQUINA EXTERIOR IZQUIERDA
    // =====================================================

    shape.quadraticCurveTo(
      -28.5,
      18,
      -22,
      22.5
    );

    shape.quadraticCurveTo(
      -17,
      26,
      -9,
      26.5
    );

    // =====================================================
    // BORDE EXTERIOR
    // =====================================================

    shape.quadraticCurveTo(
      0,
      27,
      9,
      26.5
    );

    shape.quadraticCurveTo(
      17,
      26,
      22,
      22.5
    );

    // =====================================================
    // ESQUINA EXTERIOR DERECHA
    // =====================================================

    shape.quadraticCurveTo(
      28.5,
      18,
      28.5,
      10
    );

    // =====================================================
    // LATERAL DERECHO
    // =====================================================

    shape.lineTo(28.5, 1);

    // =====================================================
    // TRANSICIÓN A DIAGONAL
    // =====================================================

    shape.quadraticCurveTo(
      28.5,
      -3,
      25.5,
      -6.5
    );

    // =====================================================
    // DIAGONAL DERECHA
    // =====================================================

    shape.lineTo(11.5, -21.5);

    // =====================================================
    // PUNTA INTERIOR DERECHA
    // =====================================================

    shape.quadraticCurveTo(
      7.5,
      -24.5,
      3.8,
      -24.5
    );

    // =====================================================
    // PEQUEÑO BORDE DE LA PUNTA
    // =====================================================

    shape.lineTo(-3.8, -24.5);

    // =====================================================
    // GEOMETRÍA PLANA
    // =====================================================

    const geo = new THREE.ShapeGeometry(
      shape,
      48
    );

    geo.rotateX(-Math.PI / 2);

    return geo;
  }, []);

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* SILUETA */}

      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#d7dbe2"
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>

      {/* CONTORNO */}

      <lineSegments>
        <edgesGeometry args={[geometry]} />

        <lineBasicMaterial
          color="#151922"
          depthTest={false}
        />
      </lineSegments>
    </group>
  );
}
