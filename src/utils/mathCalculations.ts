import { derivative, parse, evaluate } from "mathjs";

export interface CalculationResult {
  domain: string;
  range: string;
  partialX: string;
  partialY: string;
  gradient: string;
}

export const calculateMathProperties = (functionString: string): CalculationResult => {
  try {
    // Parse the function
    const node = parse(functionString);

    // Calculate partial derivatives
    let partialX = "No definida";
    let partialY = "No definida";
    
    try {
      const dfdx = derivative(node, "x");
      partialX = dfdx.toString();
    } catch (e) {
      console.error("Error calculating ∂f/∂x:", e);
    }

    try {
      const dfdy = derivative(node, "y");
      partialY = dfdy.toString();
    } catch (e) {
      console.error("Error calculating ∂f/∂y:", e);
    }

    // Sample some points to estimate range
    const samples: number[] = [];
    for (let x = -5; x <= 5; x += 0.5) {
      for (let y = -5; y <= 5; y += 0.5) {
        try {
          const z = evaluate(functionString, { x, y }) as number;
          if (isFinite(z)) {
            samples.push(z);
          }
        } catch (e) {
          // Skip invalid points
        }
      }
    }

    const minZ = samples.length > 0 ? Math.min(...samples) : 0;
    const maxZ = samples.length > 0 ? Math.max(...samples) : 0;

    return {
      domain: "ℝ² (todos los números reales)",
      range: `[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}] (aproximado)`,
      partialX: `∂f/∂x = ${partialX}`,
      partialY: `∂f/∂y = ${partialY}`,
      gradient: `∇f = (${partialX}, ${partialY})`,
    };
  } catch (error) {
    console.error("Error in calculations:", error);
    return {
      domain: "Error al calcular",
      range: "Error al calcular",
      partialX: "Error al calcular",
      partialY: "Error al calcular",
      gradient: "Error al calcular",
    };
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
      content: "El dominio es el conjunto de todos los pares ordenados (x, y) para los cuales la función está definida",
      formula: results.domain,
    },
    {
      title: "Rango (Estimado)",
      content: "El rango es el conjunto de todos los valores z que la función puede tomar",
      formula: results.range,
    },
    {
      title: "Derivada Parcial respecto a X",
      content: "Derivada manteniendo y constante",
      formula: results.partialX,
    },
    {
      title: "Derivada Parcial respecto a Y",
      content: "Derivada manteniendo x constante",
      formula: results.partialY,
    },
    {
      title: "Gradiente",
      content: "Vector de derivadas parciales que indica la dirección de mayor crecimiento",
      formula: results.gradient,
    },
  ];
};
