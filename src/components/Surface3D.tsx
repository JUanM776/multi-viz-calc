import { useRef, useMemo, Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { evaluate } from "mathjs";

interface Surface3DProps {
  functionString: string;
}

// Error boundary to catch Three.js / WebGL crashes
interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

class Surface3DErrorBoundary extends Component<
  { children: ReactNode; functionString: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; functionString: string }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidUpdate(prevProps: { functionString: string }) {
    if (prevProps.functionString !== this.props.functionString) {
      this.setState({ hasError: false, error: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center p-6 space-y-2">
            <p className="text-destructive font-semibold">Error al renderizar la superficie</p>
            <p className="text-sm text-muted-foreground">
              La función ingresada no se pudo graficar. Verifique la sintaxis.
            </p>
            <code className="text-xs block mt-2 text-muted-foreground">{this.state.error}</code>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
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

    // First pass: evaluate all z values to find actual min/max for coloring
    const zValues: (number | null)[][] = [];
    let zMin = Infinity;
    let zMax = -Infinity;

    for (let i = 0; i <= resolution; i++) {
      zValues[i] = [];
      for (let j = 0; j <= resolution; j++) {
        const x = (i / resolution - 0.5) * size;
        const y = (j / resolution - 0.5) * size;

        let z: number | null = null;
        try {
          const result = evaluate(functionString, { x, y });
          const num = typeof result === "number" ? result : Number(result);
          if (isFinite(num)) {
            z = Math.max(-10, Math.min(10, num));
            if (z < zMin) zMin = z;
            if (z > zMax) zMax = z;
          }
        } catch {
          // invalid point
        }
        zValues[i][j] = z;
      }
    }

    // If no valid points, return empty geometry
    if (zMin === Infinity) {
      return geo;
    }

    // Ensure we have a range for coloring
    const zRange = zMax - zMin || 1;

    // Second pass: build geometry
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = (i / resolution - 0.5) * size;
        const y = (j / resolution - 0.5) * size;
        const z = zValues[i][j] ?? 0;

        positions.push(x, z, y);

        // Color based on actual height range
        const normalizedZ = (z - zMin) / zRange;
        const color = new THREE.Color();
        color.setHSL(0.6 - normalizedZ * 0.4, 0.8, 0.5);
        colors.push(color.r, color.g, color.b);

        if (i < resolution && j < resolution) {
          const a = i * (resolution + 1) + j;
          const b = (i + 1) * (resolution + 1) + j;
          const c = (i + 1) * (resolution + 1) + (j + 1);
          const d = i * (resolution + 1) + (j + 1);

          // Only create triangles if all 4 corners have valid values
          const aValid = zValues[i][j] !== null;
          const bValid = zValues[i + 1]?.[j] !== null;
          const cValid = zValues[i + 1]?.[j + 1] !== null;
          const dValid = zValues[i]?.[j + 1] !== null;

          if (aValid && bValid && dValid) {
            indices.push(a, b, d);
          }
          if (bValid && cValid && dValid) {
            indices.push(b, c, d);
          }
        }
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
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
  // Quick validation: try evaluating at one point to catch syntax errors early
  const isValid = useMemo(() => {
    try {
      const result = evaluate(functionString, { x: 1, y: 1 });
      return typeof result === "number" || typeof result === "object";
    } catch {
      return false;
    }
  }, [functionString]);

  if (!isValid) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg shadow-elevated">
        <div className="text-center p-6 space-y-2">
          <p className="text-destructive font-semibold">Función inválida</p>
          <p className="text-sm text-muted-foreground">
            No se pudo interpretar la función. Verifique la sintaxis.
          </p>
          <code className="text-xs block mt-2 font-mono bg-background p-2 rounded">
            {functionString}
          </code>
        </div>
      </div>
    );
  }

  return (
    <Surface3DErrorBoundary functionString={functionString}>
      <div className="w-full h-full bg-gradient-to-b from-background to-primary/5 rounded-lg overflow-hidden shadow-elevated">
        <Canvas
          camera={{ position: [8, 8, 8], fov: 50 }}
          style={{ background: "transparent" }}
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

          <Text position={[6, 0, 0]} fontSize={0.5} color="#3b82f6">
            X
          </Text>
          <Text position={[0, 6, 0]} fontSize={0.5} color="#10b981">
            Z
          </Text>
          <Text position={[0, 0, 6]} fontSize={0.5} color="#f59e0b">
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
    </Surface3DErrorBoundary>
  );
};
