import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface FunctionInputProps {
  onFunctionSubmit: (func: string) => void;
}

export const FunctionInput = ({ onFunctionSubmit }: FunctionInputProps) => {
  const [functionText, setFunctionText] = useState("x^2 + y^2");

  const handleSubmit = () => {
    if (!functionText.trim()) {
      toast.error("Por favor ingrese una función");
      return;
    }
    onFunctionSubmit(functionText);
    toast.success("Función procesada correctamente");
  };

  const examples = [
    { label: "Paraboloide", func: "x^2 + y^2" },
    { label: "Silla de montar", func: "x^2 - y^2" },
    { label: "Plano inclinado", func: "x + y" },
    { label: "Ondas", func: "sin(x) * cos(y)" },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Función f(x, y)
        </CardTitle>
        <CardDescription>
          Ingrese una función de dos variables para visualizar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="function">Función</Label>
          <Input
            id="function"
            value={functionText}
            onChange={(e) => setFunctionText(e.target.value)}
            placeholder="Ej: x^2 + y^2"
            className="math-input font-mono"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          size="lg"
        >
          Graficar y Calcular
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Ejemplos:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {examples.map((ex) => (
              <Button
                key={ex.func}
                variant="outline"
                size="sm"
                onClick={() => setFunctionText(ex.func)}
                className="text-xs"
              >
                {ex.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
