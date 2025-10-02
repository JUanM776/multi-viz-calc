import { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { evaluate } from "mathjs";

interface Surface3DProps {
  functionString: string;
}

const SurfaceMesh = ({ functionString }: { functionString: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const resolution = 50;
    const size = 10;
    const geo = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = (i / resolution - 0.5) * size;
        const y = (j / resolution - 0.5) * size;
        
        let z = 0;
        try {
          z = evaluate(functionString, { x, y }) as number;
          if (!isFinite(z)) z = 0;
          z = Math.max(-5, Math.min(5, z)); // Clamp values
        } catch (e) {
          z = 0;
        }

        positions.push(x, z, y);

        // Color based on height
        const normalizedZ = (z + 5) / 10;
        const color = new THREE.Color();
        color.setHSL(0.6 - normalizedZ * 0.3, 0.8, 0.5);
        colors.push(color.r, color.g, color.b);

        if (i < resolution && j < resolution) {
          const a = i * (resolution + 1) + j;
          const b = (i + 1) * (resolution + 1) + j;
          const c = (i + 1) * (resolution + 1) + (j + 1);
          const d = i * (resolution + 1) + (j + 1);

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [functionString]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
};

export const Surface3D = ({ functionString }: Surface3DProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-primary/5 rounded-lg overflow-hidden shadow-elevated">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <SurfaceMesh functionString={functionString} />
        
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3b82f6"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />

        <Text
          position={[6, 0, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.5}
          color="#3b82f6"
        >
          X
        </Text>
        <Text
          position={[0, 6, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.5}
          color="#10b981"
        >
          Z
        </Text>
        <Text
          position={[0, 0, 6]}
          rotation={[0, 0, 0]}
          fontSize={0.5}
          color="#f59e0b"
        >
          Y
        </Text>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
};
