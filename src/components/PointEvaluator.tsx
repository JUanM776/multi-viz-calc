import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { evaluateAtPoint, calculateTangentPlane, calculateDoubleIntegral } from "@/utils/mathCalculations";
import type { TangentPlaneResult, DoubleIntegralResult } from "@/utils/mathCalculations";
import { Crosshair, Plane, Sigma } from "lucide-react";

interface PointEvaluatorProps {
  functionString: string;
  onTangentPlane: (tp: TangentPlaneResult | null) => void;
}

export const PointEvaluator = ({ functionString, onTangentPlane }: PointEvaluatorProps) => {
  const [px, setPx] = useState("0");
  const [py, setPy] = useState("0");
  const [evalResult, setEvalResult] = useState<string | null>(null);

  // Integral bounds
  const [ix1, setIx1] = useState("-2");
  const [ix2, setIx2] = useState("2");
  const [iy1, setIy1] = useState("-2");
  const [iy2, setIy2] = useState("2");
  const [integralResult, setIntegralResult] = useState<DoubleIntegralResult | null>(null);

  const handleEvaluate = () => {
    const x = parseFloat(px);
    const y = parseFloat(py);
    if (isNaN(x) || isNaN(y)) return;

    const result = evaluateAtPoint(functionString, x, y);
    if (result) {
      let text = `f(${x}, ${y}) = ${result.z}`;
      if (result.gradient) {
        text += `\n∇f = (${result.gradient[0]}, ${result.gradient[1]})`;
      }
      setEvalResult(text);
    } else {
      setEvalResult("No definida en este punto");
    }
  };

  const handleTangentPlane = () => {
    const x = parseFloat(px);
    const y = parseFloat(py);
    if (isNaN(x) || isNaN(y)) return;

    const tp = calculateTangentPlane(functionString, x, y);
    onTangentPlane(tp);
  };

  const handleClearTangent = () => onTangentPlane(null);

  const handleIntegral = () => {
    const x1 = parseFloat(ix1), x2 = parseFloat(ix2);
    const y1 = parseFloat(iy1), y2 = parseFloat(iy2);
    if ([x1, x2, y1, y2].some(isNaN)) return;

    const result = calculateDoubleIntegral(functionString, x1, x2, y1, y2);
    setIntegralResult(result);
  };

  return (
    <div className="glass-card">
      <div className="px-4 pt-3 pb-2 border-b border-border/30">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Herramientas
        </h2>
      </div>

      <div className="p-3 space-y-4">
        {/* Point evaluator + tangent plane */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
            <Crosshair className="h-3 w-3" /> Evaluar punto
          </span>
          <div className="flex gap-1.5">
            <Input
              value={px} onChange={(e) => setPx(e.target.value)}
              placeholder="x" className="font-mono text-xs h-8 text-center"
            />
            <Input
              value={py} onChange={(e) => setPy(e.target.value)}
              placeholder="y" className="font-mono text-xs h-8 text-center"
            />
          </div>
          <div className="flex gap-1.5">
            <Button onClick={handleEvaluate} variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1">
              <Crosshair className="h-3 w-3" /> Evaluar
            </Button>
            <Button onClick={handleTangentPlane} variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1">
              <Plane className="h-3 w-3" /> Tangente
            </Button>
          </div>
          <Button onClick={handleClearTangent} variant="ghost" size="sm" className="w-full h-6 text-[9px] text-muted-foreground">
            Quitar plano tangente
          </Button>
          {evalResult && (
            <div className="px-2 py-1.5 rounded bg-secondary/60 border border-border/20">
              <code className="text-[10px] font-mono text-foreground/75 whitespace-pre-wrap">{evalResult}</code>
            </div>
          )}
        </div>

        {/* Double integral */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
            <Sigma className="h-3 w-3" /> Integral doble
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-1">
              <label className="text-[9px] text-muted-foreground/50">x min</label>
              <Input value={ix1} onChange={(e) => setIx1(e.target.value)} className="font-mono text-xs h-7 text-center" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-muted-foreground/50">x max</label>
              <Input value={ix2} onChange={(e) => setIx2(e.target.value)} className="font-mono text-xs h-7 text-center" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-muted-foreground/50">y min</label>
              <Input value={iy1} onChange={(e) => setIy1(e.target.value)} className="font-mono text-xs h-7 text-center" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-muted-foreground/50">y max</label>
              <Input value={iy2} onChange={(e) => setIy2(e.target.value)} className="font-mono text-xs h-7 text-center" />
            </div>
          </div>
          <Button onClick={handleIntegral} variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1">
            <Sigma className="h-3 w-3" /> Calcular ∬f dA
          </Button>
          {integralResult && (
            <div className="px-2 py-1.5 rounded bg-secondary/60 border border-border/20">
              <code className="text-[10px] font-mono text-foreground/75">
                ∬f dA ≈ {integralResult.value} ({integralResult.method}, n={integralResult.n})
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
