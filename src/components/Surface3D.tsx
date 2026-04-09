import { useRef, useMemo, useState, Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { evaluate } from "mathjs";
import type { PaletteId } from "./ColorPalette";
import { Loader2, AlertTriangle, HelpCircle } from "lucide-react";

interface Surface3DProps {
  functionString: string;
  palette?: PaletteId;
}

// --- Palette ---

const PALETTE_STOPS: Record<PaletteId, [number, number, number][]> = {
  ocean: [
    [0.07, 0.15, 0.35],
    [0.23, 0.51, 0.96],
    [0.49, 0.83, 0.99],
  ],
  thermal: [
    [0.07, 0.14, 0.54],
    [0.94, 0.27, 0.27],
    [0.98, 0.75, 0.14],
  ],
  viridis: [
    [0.27, 0.0, 0.33],
    [0.13, 0.57, 0.55],
    [0.99, 0.91, 0.14],
  ],
  plasma: [
    [0.05, 0.03, 0.53],
    [0.8, 0.28, 0.47],
    [0.94, 0.98, 0.13],
  ],
  grayscale: [
    [0.15, 0.15, 0.15],
    [0.42, 0.44, 0.47],
    [0.9, 0.91, 0.92],
  ],
};

function lerpColor(
  stops: [number, number, number][],
  t: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const segment = clamped * (stops.length - 1);
  const idx = Math.floor(segment);
  const frac = segment - idx;
  const a = stops[Math.min(idx, stops.length - 1)];
  const b = stops[Math.min(idx + 1, stops.length - 1)];
  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ];
}

// --- Error boundary ---

interface EBState { hasError: boolean; error: string }

class Surface3DErrorBoundary extends Component<
  { children: ReactNode; functionString: string },
  EBState
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
        <div className="w-full h-full flex items-center justify-center glass-card">
          <div className="text-center p-8 space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive/60 mx-auto" />
            <p className="text-sm font-medium text-destructive/80">Error al renderizar</p>
            <code className="text-[10px] text-muted-foreground block">{this.state.error}</code>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Axes ---

const Axes = () => {
  const len = 6;
  const arr = 0.3;
  return (
    <group>
      <Line points={[[-len, 0, 0], [len, 0, 0]]} color="#6366f1" lineWidth={1.5} />
      <mesh position={[len, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[arr * 0.35, arr, 8]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <Text position={[len + 0.5, 0, 0]} fontSize={0.35} color="#6366f1" anchorX="left">X</Text>

      <Line points={[[0, -len, 0], [0, len, 0]]} color="#10b981" lineWidth={1.5} />
      <mesh position={[0, len, 0]}>
        <coneGeometry args={[arr * 0.35, arr, 8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <Text position={[0, len + 0.5, 0]} fontSize={0.35} color="#10b981" anchorY="bottom">Z</Text>

      <Line points={[[0, 0, -len], [0, 0, len]]} color="#f59e0b" lineWidth={1.5} />
      <mesh position={[0, 0, len]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[arr * 0.35, arr, 8]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <Text position={[0, 0, len + 0.5]} fontSize={0.35} color="#f59e0b" anchorX="left">Y</Text>
    </group>
  );
};

// --- Surface mesh ---

const SurfaceMesh = ({
  functionString,
  palette = "ocean",
}: {
  functionString: string;
  palette?: PaletteId;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const resolution = 64;
    const size = 10;
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];
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
        } catch { /* skip */ }
        zValues[i][j] = z;
      }
    }

    if (zMin === Infinity) return geo;
    const zRange = zMax - zMin || 1;
    const stops = PALETTE_STOPS[palette] ?? PALETTE_STOPS.ocean;

    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = (i / resolution - 0.5) * size;
        const y = (j / resolution - 0.5) * size;
        const z = zValues[i][j] ?? 0;
        positions.push(x, z, y);

        const t = (z - zMin) / zRange;
        const [r, g, b] = lerpColor(stops, t);
        colors.push(r, g, b);

        if (i < resolution && j < resolution) {
          const a = i * (resolution + 1) + j;
          const b2 = (i + 1) * (resolution + 1) + j;
          const c = (i + 1) * (resolution + 1) + (j + 1);
          const d = i * (resolution + 1) + (j + 1);
          const aV = zValues[i][j] !== null;
          const bV = zValues[i + 1]?.[j] !== null;
          const cV = zValues[i + 1]?.[j + 1] !== null;
          const dV = zValues[i]?.[j + 1] !== null;
          if (aV && bV && dV) indices.push(a, b2, d);
          if (bV && cV && dV) indices.push(b2, c, d);
        }
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [functionString, palette]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
};

// --- Main ---

export const Surface3D = ({ functionString, palette = "ocean" }: Surface3DProps) => {
  const [loading, setLoading] = useState(true);

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
      <div className="w-full h-full flex items-center justify-center glass-card">
        <div className="text-center p-8 space-y-3 animate-fade-up">
          <AlertTriangle className="h-8 w-8 text-destructive/50 mx-auto" />
          <p className="text-sm font-medium text-foreground/70">Función inválida</p>
          <p className="text-[11px] text-muted-foreground">
            Verifique la sintaxis de la expresión
          </p>
          <code className="text-[10px] font-mono text-muted-foreground/60 block bg-secondary/50 px-3 py-1.5 rounded-md">
            {functionString}
          </code>
        </div>
      </div>
    );
  }

  return (
    <Surface3DErrorBoundary functionString={functionString}>
      <div className="relative w-full h-full glass-card group">
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
              <span className="text-[11px] text-muted-foreground animate-pulse-soft">
                Renderizando...
              </span>
            </div>
          </div>
        )}

        {/* Function badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/30 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            <code className="text-[10px] font-mono text-foreground/70">
              f(x,y) = {functionString}
            </code>
          </div>
        </div>

        {/* Axis legend */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="flex items-center gap-3 bg-background/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/30 shadow-sm">
            <span className="flex items-center gap-1 text-[9px] font-mono">
              <span className="w-2 h-0.5 rounded-full bg-[#6366f1]" /> X
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono">
              <span className="w-2 h-0.5 rounded-full bg-[#f59e0b]" /> Y
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono">
              <span className="w-2 h-0.5 rounded-full bg-[#10b981]" /> Z
            </span>
          </div>
        </div>

        {/* Controls hint — visible on hover */}
        <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-border/30 shadow-sm">
            <HelpCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            <span className="text-[9px] text-muted-foreground/70">
              Izq: rotar · Der: mover · Scroll: zoom
            </span>
          </div>
        </div>

        <Canvas
          camera={{ position: [8, 8, 8], fov: 50 }}
          onCreated={() => setLoading(false)}
          className="rounded-xl"
        >
          <color attach="background" args={["#0a0a12"]} />
          <fog attach="fog" args={["#0a0a12", 20, 40]} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <directionalLight position={[-10, -10, -5]} intensity={0.2} />
          <pointLight position={[0, 8, 0]} intensity={0.3} color="#6366f1" />

          <SurfaceMesh functionString={functionString} palette={palette} />
          <Axes />

          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.3}
            cellColor="#ffffff08"
            sectionSize={5}
            sectionThickness={0.6}
            sectionColor="#6366f115"
            fadeDistance={25}
            fadeStrength={1.5}
            followCamera={false}
            infiniteGrid={false}
          />

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={4}
            maxDistance={25}
            rotateSpeed={0.7}
          />
        </Canvas>
      </div>
    </Surface3DErrorBoundary>
  );
};
