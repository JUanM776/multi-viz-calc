import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPalette, type PaletteId } from "./ColorPalette";
import { Play, CornerDownLeft } from "lucide-react";
import { toast } from "sonner";

interface FunctionInputProps {
  onFunctionSubmit: (func: string) => void;
  palette: PaletteId;
  onPaletteChange: (p: PaletteId) => void;
}

const examples = [
  { label: "Paraboloide", func: "x^2 + y^2" },
  { label: "Silla", func: "x^2 - y^2" },
  { label: "Plano", func: "x + y" },
  { label: "Ondas", func: "sin(x) * cos(y)" },
  { label: "Gaussiana", func: "exp(-x^2 - y^2)" },
  { label: "Cono", func: "sqrt(x^2 + y^2)" },
];

export const FunctionInput = ({
  onFunctionSubmit,
  palette,
  onPaletteChange,
}: FunctionInputProps) => {
  const [functionText, setFunctionText] = useState("x^2 + y^2");
  const [activeFunc, setActiveFunc] = useState("x^2 + y^2");

  const handleSubmit = (funcOverride?: string) => {
    const func = funcOverride ?? functionText;
    if (!func.trim()) {
      toast.error("Ingrese una función");
      return;
    }
    setActiveFunc(func);
    onFunctionSubmit(func);
    toast.success("Función procesada");
  };

  const handleExampleClick = (func: string) => {
    setFunctionText(func);
    handleSubmit(func);
  };

  return (
    <div className="glass-card">
      <div className="p-4 space-y-4">
        {/* Input row */}
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <Input
              value={functionText}
              onChange={(e) => setFunctionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="x^2 + y^2"
              className="font-mono text-sm h-9 pr-8 bg-secondary/50 border-border/50 focus:bg-background focus:border-primary/40 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary/40 transition-colors">
              <CornerDownLeft className="h-3 w-3" />
            </div>
          </div>
          <Button
            onClick={() => handleSubmit()}
            size="sm"
            className="h-9 px-4 gap-1.5 text-xs font-medium btn-glow bg-primary hover:bg-primary/90 shrink-0"
          >
            <Play className="h-3 w-3" />
            Graficar
          </Button>
        </div>

        {/* Presets — horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {examples.map((ex) => (
            <button
              key={ex.func}
              onClick={() => handleExampleClick(ex.func)}
              className={`shrink-0 px-2.5 py-1.5 rounded-md text-[11px] transition-all border whitespace-nowrap ${
                activeFunc === ex.func
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "bg-secondary/30 border-transparent hover:bg-secondary/60 text-muted-foreground"
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Palette */}
        <ColorPalette value={palette} onChange={onPaletteChange} />
      </div>
    </div>
  );
};
