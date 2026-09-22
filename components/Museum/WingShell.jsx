import * as THREE from "three";
import { useMemo } from "react";

export default function WingShell({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const geometry = useMemo(() => {
    /*
      =====================================================
      FORMA MAESTRA — DPAD

      +Y = extremo EXTERIOR de la cruceta
      -Y = extremo INTERIOR, hacia el patio

      Esta versión busca reproducir las proporciones
      compactas del botón real.

      Todavía es una superficie plana de comprobación.
      =====================================================
    */

    const shape = new THREE.Shape();

    /*
      Empezamos en el pequeño borde interior.
    */

    shape.moveTo(-8.5, -27);

    /*
      ESQUINA INTERIOR IZQUIERDA

      El pequeño borde inferior empieza a abrirse
      rápidamente hacia la diagonal.
    */

    shape.quadraticCurveTo(
      -12.5,
      -27,
      -16,
      -23.5
    );

    /*
      DIAGONAL IZQUIERDA

      En el botón real esta diagonal ocupa una parte
      importante de la silueta.
    */

    shape.lineTo(-25.5, -13);

    /*
      TRANSICIÓN DIAGONAL -> LATERAL
    */

    shape.quadraticCurveTo(
      -29,
      -9,
      -29,
      -4
    );

    /*
      LATERAL IZQUIERDO

      Mucho más corto que en nuestra primera versión.
    */

    shape.lineTo(-29, 14);

    /*
      ESQUINA EXTERIOR IZQUIERDA

      Amplia y redondeada.
    */

    shape.quadraticCurveTo(
      -29,
      23,
      -21,
      26
    );

    /*
      TRANSICIÓN HACIA EL BORDE SUPERIOR
    */

    shape.quadraticCurveTo(
      -13,
      28.5,
      0,
      28.5
    );

    /*
      MITAD DERECHA DEL BORDE EXTERIOR
    */

    shape.quadraticCurveTo(
      13,
      28.5,
      21,
      26
    );

    /*
      ESQUINA EXTERIOR DERECHA
    */

    shape.quadraticCurveTo(
      29,
      23,
      29,
      14
    );

    /*
      LATERAL DERECHO
    */

    shape.lineTo(29, -4);

    /*
      TRANSICIÓN HACIA LA DIAGONAL
    */

    shape.quadraticCurveTo(
      29,
      -9,
      25.5,
      -13
    );

    /*
      DIAGONAL DERECHA
    */

    shape.lineTo(16, -23.5);

    /*
      ESQUINA INTERIOR DERECHA
    */

    shape.quadraticCurveTo(
      12.5,
      -27,
      8.5,
      -27
    );

    /*
      PEQUEÑO BORDE INTERIOR
    */

    shape.lineTo(-8.5, -27);

    /*
      =====================================================
      GEOMETRÍA PLANA

      Todavía NO damos altura.
      Primero aprobamos definitivamente esta silueta.
      =====================================================
    */

    const geo = new THREE.ShapeGeometry(
      shape,
      40
    );

    /*
      ShapeGeometry se crea sobre XY.
      Lo acostamos sobre el suelo XZ.
    */

    geo.rotateX(-Math.PI / 2);

    return geo;
  }, []);

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* SUPERFICIE DE PRUEBA */}

      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#d7dbe2"
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>

      {/* CONTORNO OSCURO */}

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
