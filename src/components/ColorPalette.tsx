export type PaletteId = "ocean" | "thermal" | "viridis" | "plasma" | "grayscale";

export interface ColorPaletteProps {
  value: PaletteId;
  onChange: (palette: PaletteId) => void;
}

const palettes: { id: PaletteId; label: string; colors: string[] }[] = [
  { id: "ocean", label: "Océano", colors: ["#1e3a5f", "#3b82f6", "#7dd3fc"] },
  { id: "thermal", label: "Térmico", colors: ["#1e3a8a", "#ef4444", "#fbbf24"] },
  { id: "viridis", label: "Viridis", colors: ["#440154", "#21918c", "#fde725"] },
  { id: "plasma", label: "Plasma", colors: ["#0d0887", "#cc4778", "#f0f921"] },
  { id: "grayscale", label: "Mono", colors: ["#1f1f1f", "#6b7280", "#e5e7eb"] },
];

export const ColorPalette = ({ value, onChange }: ColorPaletteProps) => {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        Paleta
      </span>
      <div className="flex gap-1.5">
        {palettes.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            title={p.label}
            className={`group relative flex-1 h-7 rounded-md overflow-hidden transition-all duration-200 ${
              value === p.id
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105"
                : "opacity-60 hover:opacity-90 hover:scale-[1.02]"
            }`}
          >
            <div className="flex w-full h-full">
              {p.colors.map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
