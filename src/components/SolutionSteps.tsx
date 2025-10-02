import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle } from "lucide-react";

interface SolutionStep {
  title: string;
  content: string;
  formula?: string;
}

interface SolutionStepsProps {
  steps: SolutionStep[];
}

export const SolutionSteps = ({ steps }: SolutionStepsProps) => {
  if (steps.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Solución Paso a Paso</CardTitle>
          <CardDescription>
            Ingrese una función para ver los cálculos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <p>Esperando función...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Solución Paso a Paso</CardTitle>
        <CardDescription>
          Análisis matemático de la función
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {index === steps.length - 1 ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.content}</p>
                {step.formula && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <code className="text-sm font-mono">{step.formula}</code>
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && <Separator className="my-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
