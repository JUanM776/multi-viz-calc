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
  { label: "Silla de montar", func: "x^2 - y^2" },
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
      {/* Section header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Función
          </h2>
          <span className="text-[10px] text-muted-foreground/60 font-mono">f(x, y)</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="relative group">
            <Input
              value={functionText}
              onChange={(e) => setFunctionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="x^2 + y^2"
              className="font-mono text-sm h-11 pr-10 bg-secondary/50 border-border/50 focus:bg-background focus:border-primary/40 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary/40 transition-colors">
              <CornerDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>

          <Button
            onClick={() => handleSubmit()}
            className="w-full h-9 gap-2 text-xs font-medium btn-glow bg-primary hover:bg-primary/90 transition-all"
          >
            <Play className="h-3 w-3" />
            Graficar
          </Button>
        </div>

        {/* Palette */}
        <div className="pt-1">
          <ColorPalette value={palette} onChange={onPaletteChange} />
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {examples.map((ex) => (
              <button
                key={ex.func}
                onClick={() => handleExampleClick(ex.func)}
                className={`text-left px-2.5 py-2 rounded-lg text-[11px] transition-all border ${
                  activeFunc === ex.func
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-secondary/30 border-transparent hover:bg-secondary/60 hover:border-border/40 text-muted-foreground"
                }`}
              >
                <span className="block font-medium text-foreground/80 text-[11px]">
                  {ex.label}
                </span>
                <span className="block font-mono text-[9px] mt-0.5 opacity-60 truncate">
                  {ex.func}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
