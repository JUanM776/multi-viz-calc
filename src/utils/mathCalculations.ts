import { derivative, parse, evaluate, compile } from "mathjs";

// ─── Types ───

export interface CriticalPointInfo {
  x: number;
  y: number;
  z: number;
  type: "mínimo local" | "máximo local" | "punto silla" | "indeterminado";
}

export interface CalculationResult {
  domain: string;
  range: string;
  partialX: string;
  partialY: string;
  secondPartialXX: string;
  secondPartialYY: string;
  secondPartialXY: string;
  gradient: string;
  hessian: string;
  laplacian: string;
  criticalPoints: CriticalPointInfo[];
}

export interface TangentPlaneResult {
  equation: string;
  fx: number;
  fy: number;
  fz: number;
  dfdx: number;
  dfdy: number;
}

export interface DoubleIntegralResult {
  value: number;
  method: string;
  n: number;
}

// ─── Helpers ───

export const safeEvaluate = (expr: string, x: number, y: number): number | null => {
  try {
    const result = evaluate(expr, { x, y });
    const num = typeof result === "number" ? result : Number(result);
    return isFinite(num) ? num : null;
  } catch {
    return null;
  }
};

const safeDerivative = (expr: string, variable: string): string | null => {
  try {
    return derivative(parse(expr), variable).toString();
  } catch {
    return null;
  }
};

const detectDomain = (fn: string): string => {
  let negX = false, negY = false, zeroIssue = false, allValid = true;

  if (safeEvaluate(fn, -1, 0) === null && safeEvaluate(fn, 1, 0) !== null) { negX = true; allValid = false; }
  if (safeEvaluate(fn, 0, -1) === null && safeEvaluate(fn, 0, 1) !== null) { negY = true; allValid = false; }
  if (safeEvaluate(fn, 0, 0) === null) { zeroIssue = true; allValid = false; }

  if (allValid) return "ℝ²";
  const r: string[] = [];
  if (negX) r.push("x ≥ 0");
  if (negY) r.push("y ≥ 0");
  if (zeroIssue) r.push("(0,0) posiblemente excluido");
  return `ℝ² con restricciones: ${r.join(", ")}`;
};

// ─── Critical point classification via Hessian ───

function classifyCriticalPoints(
  fn: string,
  partialX: string | null,
  partialY: string | null
): CriticalPointInfo[] {
  if (!partialX || !partialY) return [];

  // Second partial derivatives
  const fxx = safeDerivative(partialX, "x");
  const fyy = safeDerivative(partialY, "y");
  const fxy = safeDerivative(partialX, "y");

  // Find approximate critical points with finer grid near zero
  const candidates: { x: number; y: number }[] = [];
  const step = 0.5;

  for (let x = -5; x <= 5; x += step) {
    for (let y = -5; y <= 5; y += step) {
      const dx = safeEvaluate(partialX, x, y);
      const dy = safeEvaluate(partialY, x, y);
      if (dx !== null && dy !== null && Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
        // Refine with smaller steps around this point
        let bestX = x, bestY = y, bestNorm = Math.abs(dx) + Math.abs(dy);
        for (let rx = x - 0.3; rx <= x + 0.3; rx += 0.05) {
          for (let ry = y - 0.3; ry <= y + 0.3; ry += 0.05) {
            const rdx = safeEvaluate(partialX, rx, ry);
            const rdy = safeEvaluate(partialY, rx, ry);
            if (rdx !== null && rdy !== null) {
              const norm = Math.abs(rdx) + Math.abs(rdy);
              if (norm < bestNorm) {
                bestNorm = norm;
                bestX = rx;
                bestY = ry;
              }
            }
          }
        }
        // Deduplicate: skip if too close to existing candidate
        const rounded = { x: Math.round(bestX * 10) / 10, y: Math.round(bestY * 10) / 10 };
        if (!candidates.some(c => Math.abs(c.x - rounded.x) < 0.3 && Math.abs(c.y - rounded.y) < 0.3)) {
          candidates.push(rounded);
        }
      }
    }
  }

  return candidates.slice(0, 8).map(({ x, y }) => {
    const z = safeEvaluate(fn, x, y) ?? 0;
    let type: CriticalPointInfo["type"] = "indeterminado";

    if (fxx && fyy && fxy) {
      const fxxVal = safeEvaluate(fxx, x, y);
      const fyyVal = safeEvaluate(fyy, x, y);
      const fxyVal = safeEvaluate(fxy, x, y);

      if (fxxVal !== null && fyyVal !== null && fxyVal !== null) {
        const D = fxxVal * fyyVal - fxyVal * fxyVal; // Hessian determinant
        if (D > 0.001) {
          type = fxxVal > 0 ? "mínimo local" : "máximo local";
        } else if (D < -0.001) {
          type = "punto silla";
        }
        // D ≈ 0 → indeterminado
      }
    }

    return { x, y, z: Math.round(z * 1000) / 1000, type };
  });
}

// ─── Main calculation ───

export const calculateMathProperties = (fn: string): CalculationResult => {
  const err = (s = "Error"): string => s;
  const errResult: CalculationResult = {
    domain: err(), range: err(), partialX: err(), partialY: err(),
    secondPartialXX: err(), secondPartialYY: err(), secondPartialXY: err(),
    gradient: err(), hessian: err(), laplacian: err(), criticalPoints: [],
  };

  try {
    parse(fn); // validate

    const px = safeDerivative(fn, "x");
    const py = safeDerivative(fn, "y");
    const pxx = px ? safeDerivative(px, "x") : null;
    const pyy = py ? safeDerivative(py, "y") : null;
    const pxy = px ? safeDerivative(px, "y") : null;

    // Range estimation — use compiled expression for speed
    const samples: number[] = [];
    try {
      const compiled = compile(fn);
      for (let x = -5; x <= 5; x += 0.25) {
        for (let y = -5; y <= 5; y += 0.25) {
          try {
            const result = compiled.evaluate({ x, y });
            const num = typeof result === "number" ? result : Number(result);
            if (isFinite(num)) samples.push(num);
          } catch { /* skip */ }
        }
      }
    } catch { /* skip */ }
    const minZ = samples.length > 0 ? Math.min(...samples) : 0;
    const maxZ = samples.length > 0 ? Math.max(...samples) : 0;

    // Laplacian = fxx + fyy
    let laplacian = "No se pudo calcular";
    if (pxx && pyy) {
      try {
        laplacian = `${pxx} + (${pyy})`;
        // Try to simplify
        const simplified = parse(`${pxx} + (${pyy})`).toString();
        if (simplified) laplacian = simplified;
      } catch {
        laplacian = `(${pxx}) + (${pyy})`;
      }
    }

    // Hessian matrix display
    let hessian = "No se pudo calcular";
    if (pxx && pyy && pxy) {
      hessian = `| ${pxx},  ${pxy} |\n| ${pxy},  ${pyy} |`;
    }

    // Critical points with classification
    const criticalPoints = classifyCriticalPoints(fn, px, py);

    return {
      domain: detectDomain(fn),
      range: samples.length > 0
        ? `[${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`
        : "Sin valores válidos en [-5,5]²",
      partialX: px ?? "No se pudo calcular",
      partialY: py ?? "No se pudo calcular",
      secondPartialXX: pxx ?? "No se pudo calcular",
      secondPartialYY: pyy ?? "No se pudo calcular",
      secondPartialXY: pxy ?? "No se pudo calcular",
      gradient: `(${px ?? "?"}, ${py ?? "?"})`,
      hessian,
      laplacian,
      criticalPoints,
    };
  } catch (e) {
    console.error("Calculation error:", e);
    return errResult;
  }
};

// ─── Tangent plane at a point ───

export const calculateTangentPlane = (
  fn: string,
  x0: number,
  y0: number
): TangentPlaneResult | null => {
  const fz = safeEvaluate(fn, x0, y0);
  if (fz === null) return null;

  const px = safeDerivative(fn, "x");
  const py = safeDerivative(fn, "y");
  if (!px || !py) return null;

  const dfdx = safeEvaluate(px, x0, y0);
  const dfdy = safeEvaluate(py, x0, y0);
  if (dfdx === null || dfdy === null) return null;

  // z = f(x0,y0) + fx(x0,y0)(x-x0) + fy(x0,y0)(y-y0)
  const fzR = Math.round(fz * 1000) / 1000;
  const dxR = Math.round(dfdx * 1000) / 1000;
  const dyR = Math.round(dfdy * 1000) / 1000;
  const x0R = Math.round(x0 * 100) / 100;
  const y0R = Math.round(y0 * 100) / 100;

  const equation = `z = ${fzR} + ${dxR}(x - ${x0R}) + ${dyR}(y - ${y0R})`;

  return { equation, fx: x0, fy: y0, fz, dfdx, dfdy };
};

// ─── Double integral (Simpson's rule) ───

export const calculateDoubleIntegral = (
  fn: string,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  n = 50
): DoubleIntegralResult | null => {
  if (xMin >= xMax || yMin >= yMax) return null;

  // Composite Simpson's 1/3 rule in 2D
  const m = n % 2 === 0 ? n : n + 1; // ensure even
  const hx = (xMax - xMin) / m;
  const hy = (yMax - yMin) / m;

  let sum = 0;
  for (let i = 0; i <= m; i++) {
    const x = xMin + i * hx;
    const wx = i === 0 || i === m ? 1 : i % 2 === 0 ? 2 : 4;

    for (let j = 0; j <= m; j++) {
      const y = yMin + j * hy;
      const wy = j === 0 || j === m ? 1 : j % 2 === 0 ? 2 : 4;

      const val = safeEvaluate(fn, x, y);
      if (val !== null) {
        sum += wx * wy * val;
      }
    }
  }

  const value = (hx * hy / 9) * sum;

  return {
    value: Math.round(value * 10000) / 10000,
    method: "Simpson 2D",
    n: m,
  };
};

// ─── Evaluate at point ───

export const evaluateAtPoint = (
  fn: string,
  x: number,
  y: number
): { z: number; gradient: [number, number] | null } | null => {
  const z = safeEvaluate(fn, x, y);
  if (z === null) return null;

  const px = safeDerivative(fn, "x");
  const py = safeDerivative(fn, "y");

  let gradient: [number, number] | null = null;
  if (px && py) {
    const gx = safeEvaluate(px, x, y);
    const gy = safeEvaluate(py, x, y);
    if (gx !== null && gy !== null) {
      gradient = [Math.round(gx * 1000) / 1000, Math.round(gy * 1000) / 1000];
    }
  }

  return { z: Math.round(z * 10000) / 10000, gradient };
};

// ─── Generate contour data ───

export const generateContourData = (
  fn: string,
  resolution = 80,
  range = 5
): { x: number[]; y: number[]; z: number[][] } | null => {
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[][] = [];

  for (let i = 0; i < resolution; i++) {
    const x = -range + (2 * range * i) / (resolution - 1);
    xs.push(Math.round(x * 100) / 100);
  }
  for (let j = 0; j < resolution; j++) {
    const y = -range + (2 * range * j) / (resolution - 1);
    ys.push(Math.round(y * 100) / 100);
  }

  for (let i = 0; i < resolution; i++) {
    zs[i] = [];
    for (let j = 0; j < resolution; j++) {
      const val = safeEvaluate(fn, xs[i], ys[j]);
      zs[i][j] = val ?? NaN;
    }
  }

  return { x: xs, y: ys, z: zs };
};

// ─── Solution steps generator ───

export const generateSolutionSteps = (fn: string, r: CalculationResult) => {
  const steps = [
    { title: "Función", formula: `f(x, y) = ${fn}` },
    { title: "Dominio", formula: r.domain },
    { title: "Rango (estimado)", formula: r.range },
    { title: "∂f/∂x", formula: r.partialX },
    { title: "∂f/∂y", formula: r.partialY },
    { title: "∂²f/∂x²", formula: r.secondPartialXX },
    { title: "∂²f/∂y²", formula: r.secondPartialYY },
    { title: "∂²f/∂x∂y", formula: r.secondPartialXY },
    { title: "Gradiente", formula: `∇f = ${r.gradient}` },
    { title: "Laplaciano", formula: `∇²f = ${r.laplacian}` },
  ];

  // Critical points
  if (r.criticalPoints.length > 0) {
    r.criticalPoints.forEach((cp, i) => {
      steps.push({
        title: `Punto crítico ${i + 1}`,
        formula: `(${cp.x}, ${cp.y}) → f = ${cp.z} — ${cp.type}`,
      });
    });
  } else {
    steps.push({ title: "Puntos críticos", formula: "No encontrados en [-5, 5]²" });
  }

  return steps;
};
