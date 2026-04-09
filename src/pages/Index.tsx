import { useState, useEffect, useCallback } from "react";
import { FunctionInput } from "@/components/FunctionInput";
import { Surface3D } from "@/components/Surface3D";
import { SolutionSteps } from "@/components/SolutionSteps";
import { calculateMathProperties, generateSolutionSteps } from "@/utils/mathCalculations";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

const DEFAULT_FUNCTION = "x^2 + y^2";

const Index = () => {
  const [currentFunction, setCurrentFunction] = useState(DEFAULT_FUNCTION);
  const [solutionSteps, setSolutionSteps] = useState<any[]>([]);

  const handleFunctionSubmit = useCallback((func: string) => {
    setCurrentFunction(func);
    const results = calculateMathProperties(func);
    const steps = generateSolutionSteps(func, results);
    setSolutionSteps(steps);
  }, []);

  // Calculate on initial load
  useEffect(() => {
    handleFunctionSubmit(DEFAULT_FUNCTION);
  }, [handleFunctionSubmit]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                CalcGraf Multivariado
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualización y análisis de funciones de dos variables
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Input Controls */}
          <aside className="lg:col-span-3 space-y-6">
            <FunctionInput onFunctionSubmit={handleFunctionSubmit} />
            
            <div className="hidden lg:block">
              <SolutionSteps steps={solutionSteps} />
            </div>
          </aside>

          {/* Main Visualization Area */}
          <div className="lg:col-span-9 space-y-6">
            <div className="h-[500px] lg:h-[600px]">
              <Surface3D functionString={currentFunction} />
            </div>

            <Separator className="lg:hidden" />

            {/* Mobile Solution Steps */}
            <div className="lg:hidden">
              <SolutionSteps steps={solutionSteps} />
            </div>

            {/* Info Card */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <h3 className="font-semibold mb-2 text-sm">Controles de Navegación 3D</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Clic izquierdo + arrastrar:</strong> Rotar la vista</li>
                <li>• <strong>Clic derecho + arrastrar:</strong> Mover (pan)</li>
                <li>• <strong>Rueda del mouse:</strong> Acercar/Alejar (zoom)</li>
                <li>• <strong>Dos dedos:</strong> Pellizcar para zoom en móvil</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CalcGraf Multivariado - Herramienta de visualización matemática</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
