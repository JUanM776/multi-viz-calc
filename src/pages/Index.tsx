import { useState, useEffect, useCallback } from "react";
import { FunctionInput } from "@/components/FunctionInput";
import { Surface3D } from "@/components/Surface3D";
import { SolutionSteps } from "@/components/SolutionSteps";
import { PointEvaluator } from "@/components/PointEvaluator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobilePanel } from "@/components/MobilePanel";
import {
  calculateMathProperties,
  generateSolutionSteps,
} from "@/utils/mathCalculations";
import type { PaletteId } from "@/components/ColorPalette";
import type { TangentPlaneResult } from "@/utils/mathCalculations";
import { Activity } from "lucide-react";

const DEFAULT_FUNCTION = "x^2 + y^2";

const Index = () => {
  const [currentFunction, setCurrentFunction] = useState(DEFAULT_FUNCTION);
  const [solutionSteps, setSolutionSteps] = useState<any[]>([]);
  const [palette, setPalette] = useState<PaletteId>("ocean");
  const [tangentPlane, setTangentPlane] = useState<TangentPlaneResult | null>(null);

  const handleFunctionSubmit = useCallback((func: string) => {
    setCurrentFunction(func);
    setTangentPlane(null); // clear tangent when function changes
    const results = calculateMathProperties(func);
    const steps = generateSolutionSteps(func, results);
    setSolutionSteps(steps);
  }, []);

  useEffect(() => {
    handleFunctionSubmit(DEFAULT_FUNCTION);
  }, [handleFunctionSubmit]);

  return (
    <div className="h-screen flex flex-col bg-background transition-colors duration-500 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <header className="shrink-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="px-4 flex items-center justify-between h-11">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight">CalcGraf</span>
              <span className="text-[9px] font-medium text-muted-foreground tracking-wider uppercase">
                Multivariado
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex stat-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              v2.0
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar — single scrollable column */}
        <aside className="hidden lg:flex flex-col w-[320px] xl:w-[350px] shrink-0 border-r border-border/40 overflow-y-auto">
          <div className="p-3 space-y-3">
            <FunctionInput
              onFunctionSubmit={handleFunctionSubmit}
              palette={palette}
              onPaletteChange={setPalette}
            />

            <PointEvaluator
              functionString={currentFunction}
              onTangentPlane={setTangentPlane}
            />

            <SolutionSteps steps={solutionSteps} />
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative min-h-0">
          <Surface3D
            functionString={currentFunction}
            palette={palette}
            tangentPlane={tangentPlane}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <MobilePanel
        onFunctionSubmit={handleFunctionSubmit}
        palette={palette}
        onPaletteChange={setPalette}
        steps={solutionSteps}
        functionString={currentFunction}
        onTangentPlane={setTangentPlane}
      />
    </div>
  );
};

export default Index;
