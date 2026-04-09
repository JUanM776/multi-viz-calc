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
      <div className="glass-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
      <div className="px-4 pt-4 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Análisis
          </h2>
          <span className="stat-pill">
            {steps.length} pasos
          </span>
        </div>
      </div>

      <div className="p-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group p-3 rounded-lg hover:bg-secondary/40 transition-colors cursor-default"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Step number */}
              <div className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/8 text-primary text-[10px] font-bold mt-0.5 shrink-0 group-hover:bg-primary/15 transition-colors">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-semibold text-foreground/90 leading-tight">
                  {step.title}
                </h4>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-relaxed">
                  {step.content}
                </p>
                {step.formula && (
                  <div className="mt-2 px-2.5 py-1.5 rounded-md bg-secondary/60 border border-border/20">
                    <code className="text-[10px] font-mono text-foreground/80 break-all leading-relaxed">
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
