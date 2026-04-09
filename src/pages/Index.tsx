import { useState, useEffect, useCallback } from "react";
import { FunctionInput } from "@/components/FunctionInput";
import { Surface3D } from "@/components/Surface3D";
import { SolutionSteps } from "@/components/SolutionSteps";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  calculateMathProperties,
  generateSolutionSteps,
} from "@/utils/mathCalculations";
import type { PaletteId } from "@/components/ColorPalette";
import { Activity } from "lucide-react";

const DEFAULT_FUNCTION = "x^2 + y^2";

const Index = () => {
  const [currentFunction, setCurrentFunction] = useState(DEFAULT_FUNCTION);
  const [solutionSteps, setSolutionSteps] = useState<any[]>([]);
  const [palette, setPalette] = useState<PaletteId>("ocean");

  const handleFunctionSubmit = useCallback((func: string) => {
    setCurrentFunction(func);
    const results = calculateMathProperties(func);
    const steps = generateSolutionSteps(func, results);
    setSolutionSteps(steps);
  }, []);

  useEffect(() => {
    handleFunctionSubmit(DEFAULT_FUNCTION);
  }, [handleFunctionSubmit]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight">CalcGraf</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                  Multivariado
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="hidden sm:flex items-center mr-2">
                <span className="stat-pill">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  v2.0
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative container mx-auto px-4 py-5 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <FunctionInput
              onFunctionSubmit={handleFunctionSubmit}
              palette={palette}
              onPaletteChange={setPalette}
            />
            <div className="hidden lg:block">
              <SolutionSteps steps={solutionSteps} />
            </div>
          </aside>

          {/* Canvas area */}
          <div className="lg:col-span-9 space-y-4">
            <div className="h-[420px] sm:h-[500px] lg:h-[620px]">
              <Surface3D functionString={currentFunction} palette={palette} />
            </div>

            {/* Mobile steps */}
            <div className="lg:hidden">
              <SolutionSteps steps={solutionSteps} />
            </div>

            {/* Controls hint bar */}
            <div className="glass-card px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/70 uppercase tracking-wider text-[10px]">
                Controles
              </span>
              <span>🖱️ Izq + arrastrar → Rotar</span>
              <span>🖱️ Der + arrastrar → Mover</span>
              <span>⚙️ Scroll → Zoom</span>
              <span className="hidden sm:inline">📱 Pellizcar → Zoom táctil</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/60">
            CalcGraf Multivariado
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            Visualización matemática interactiva
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
