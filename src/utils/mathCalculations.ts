import { derivative, parse, evaluate } from "mathjs";

export interface CalculationResult {
  domain: string;
  range: string;
  partialX: string;
  partialY: string;
  gradient: string;
  criticalPoints: string;
}

/**
 * Safely evaluate a function string at given x, y values.
 * Returns null if the evaluation fails or produces non-finite results.
 */
const safeEvaluate = (functionString: string, x: number, y: number): number | null => {
  try {
    const result = evaluate(functionString, { x, y });
    const num = typeof result === "number" ? result : Number(result);
    return isFinite(num) ? num : null;
  } catch {
    return null;
  }
};

/**
 * Detect domain restrictions by sampling points and checking where the function is undefined.
 */
const detectDomain = (functionString: string): string => {
  let hasNegativeXIssue = false;
  let hasNegativeYIssue = false;
  let hasZeroIssue = false;
  let allValid = true;

  // Test negative values
  if (safeEvaluate(functionString, -1, 0) === null && safeEvaluate(functionString, 1, 0) !== null) {
    hasNegativeXIssue = true;
    allValid = false;
  }
  if (safeEvaluate(functionString, 0, -1) === null && safeEvaluate(functionString, 0, 1) !== null) {
    hasNegativeYIssue = true;
    allValid = false;
  }
  // Test origin
  if (safeEvaluate(functionString, 0, 0) === null) {
    hasZeroIssue = true;
    allValid = false;
  }

  if (allValid) return "ℝ² (todos los pares (x, y) reales)";

  const restrictions: string[] = [];
  if (hasNegativeXIssue) restrictions.push("x ≥ 0");
  if (hasNegativeYIssue) restrictions.push("y ≥ 0");
  if (hasZeroIssue) restrictions.push("(x, y) ≠ (0, 0) posiblemente");

  return `ℝ² con restricciones: ${restrictions.join(", ")}`;
};

export const calculateMathProperties = (functionString: string): CalculationResult => {
  const errorResult: CalculationResult = {
    domain: "Error al calcular",
    range: "Error al calcular",
    partialX: "Error al calcular",
    partialY: "Error al calcular",
    gradient: "Error al calcular",
    criticalPoints: "Error al calcular",
  };

  try {
    const node = parse(functionString);

    // Calculate partial derivatives
    let partialX = "No se pudo calcular";
    let partialY = "No se pudo calcular";

    try {
      partialX = derivative(node, "x").toString();
    } catch {
      // Some functions don't support symbolic differentiation
    }

    try {
      partialY = derivative(node, "y").toString();
    } catch {
      // Some functions don't support symbolic differentiation
    }

    // Sample points to estimate range with better coverage
    const samples: number[] = [];
    for (let x = -5; x <= 5; x += 0.25) {
      for (let y = -5; y <= 5; y += 0.25) {
        const z = safeEvaluate(functionString, x, y);
        if (z !== null) {
          samples.push(z);
        }
      }
    }

    const minZ = samples.length > 0 ? Math.min(...samples) : 0;
    const maxZ = samples.length > 0 ? Math.max(...samples) : 0;

    // Detect domain
    const domain = detectDomain(functionString);

    // Find critical points (where both partial derivatives are zero)
    let criticalPoints = "No se encontraron en el rango analizado";
    if (partialX !== "No se pudo calcular" && partialY !== "No se pudo calcular") {
      try {
        const criticals: string[] = [];
        for (let x = -5; x <= 5; x += 0.5) {
          for (let y = -5; y <= 5; y += 0.5) {
            try {
              const dxVal = evaluate(partialX, { x, y });
              const dyVal = evaluate(partialY, { x, y });
              const dxNum = typeof dxVal === "number" ? dxVal : Number(dxVal);
              const dyNum = typeof dyVal === "number" ? dyVal : Number(dyVal);
              if (isFinite(dxNum) && isFinite(dyNum) && Math.abs(dxNum) < 0.1 && Math.abs(dyNum) < 0.1) {
                const point = `(${x}, ${y})`;
                if (!criticals.includes(point)) {
                  criticals.push(point);
                }
              }
            } catch {
              // skip
            }
          }
        }
        if (criticals.length > 0) {
          criticalPoints = criticals.slice(0, 5).join(", ");
          if (criticals.length > 5) criticalPoints += " ...";
        }
      } catch {
        // skip critical point detection
      }
    }

    return {
      domain,
      range: samples.length > 0
        ? `[${minZ.toFixed(4)}, ${maxZ.toFixed(4)}] (estimado en [-5, 5]²)`
        : "No se pudo estimar (función sin valores válidos en el rango)",
      partialX: `∂f/∂x = ${partialX}`,
      partialY: `∂f/∂y = ${partialY}`,
      gradient: `∇f = (${partialX}, ${partialY})`,
      criticalPoints,
    };
  } catch (error) {
    console.error("Error in calculations:", error);
    return errorResult;
  }
};

export const generateSolutionSteps = (
  functionString: string,
  results: CalculationResult
) => {
  return [
    {
      title: "Función Original",
      content: "Se analiza la función de dos variables ingresada",
      formula: `f(x, y) = ${functionString}`,
    },
    {
      title: "Dominio",
      content: "Conjunto de pares (x, y) donde la función está definida",
      formula: results.domain,
    },
    {
      title: "Rango (Estimado)",
      content: "Valores de z que la función toma en el rango [-5, 5]²",
      formula: results.range,
    },
    {
      title: "Derivada Parcial respecto a X",
      content: "Se deriva manteniendo y como constante",
      formula: results.partialX,
    },
    {
      title: "Derivada Parcial respecto a Y",
      content: "Se deriva manteniendo x como constante",
      formula: results.partialY,
    },
    {
      title: "Gradiente",
      content: "Vector que indica la dirección de mayor crecimiento",
      formula: results.gradient,
    },
    {
      title: "Puntos Críticos (Aproximados)",
      content: "Puntos donde el gradiente es cero (posibles máximos, mínimos o puntos silla)",
      formula: results.criticalPoints,
    },
  ];
};
