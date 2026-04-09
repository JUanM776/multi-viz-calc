interface SolutionStep {
  title: string;
  formula?: string;
}

interface SolutionStepsProps {
  steps: SolutionStep[];
}

export const SolutionSteps = ({ steps }: SolutionStepsProps) => {
  if (steps.length === 0) {
    return (
      <div className="glass-card p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Análisis
        </h2>
        <p className="text-xs text-muted-foreground/60 text-center py-6">
          Ingrese una función para ver los cálculos
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="px-4 pt-3 pb-2 border-b border-border/30 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Análisis
        </h2>
        <span className="stat-pill">{steps.length} pasos</span>
      </div>

      <div className="p-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group rounded-md px-2.5 py-2 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/8 text-primary text-[9px] font-bold mt-0.5 shrink-0 group-hover:bg-primary/15 transition-colors">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-semibold text-foreground/90 leading-snug">
                  {step.title}
                </h4>
                {step.formula && (
                  <div className="mt-1 px-2 py-1 rounded bg-secondary/60 border border-border/20">
                    <code className="text-[10px] font-mono text-foreground/75 break-all leading-relaxed whitespace-pre-wrap">
                      {step.formula}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
