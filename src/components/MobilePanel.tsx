import { useState } from "react";
import { FunctionInput } from "./FunctionInput";
import { SolutionSteps } from "./SolutionSteps";
import { PointEvaluator } from "./PointEvaluator";
import type { PaletteId } from "./ColorPalette";
import type { TangentPlaneResult } from "@/utils/mathCalculations";
import { ChevronUp, ChevronDown } from "lucide-react";

interface MobilePanelProps {
  onFunctionSubmit: (func: string) => void;
  palette: PaletteId;
  onPaletteChange: (p: PaletteId) => void;
  steps: any[];
  functionString: string;
  onTangentPlane: (tp: TangentPlaneResult | null) => void;
}

export const MobilePanel = ({
  onFunctionSubmit,
  palette,
  onPaletteChange,
  steps,
  functionString,
  onTangentPlane,
}: MobilePanelProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out ${
        expanded ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
      }`}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-center gap-2 h-12 bg-card/90 backdrop-blur-xl border-t border-border/40 rounded-t-xl pointer-events-auto"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {expanded ? "Cerrar" : "Controles y análisis"}
        </span>
      </button>

      <div className="bg-card/95 backdrop-blur-xl border-t border-border/20 max-h-[70vh] overflow-y-auto p-4 space-y-4 pointer-events-auto">
        <FunctionInput
          onFunctionSubmit={onFunctionSubmit}
          palette={palette}
          onPaletteChange={onPaletteChange}
        />
        <PointEvaluator
          functionString={functionString}
          onTangentPlane={onTangentPlane}
        />
        <SolutionSteps steps={steps} />
      </div>
    </div>
  );
};
