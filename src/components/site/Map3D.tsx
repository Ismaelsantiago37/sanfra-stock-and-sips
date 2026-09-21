import { useState } from "react";

type Bloco = {
  x: number;
  y: number;
  w: number;
  h: number;
  altura: number;
  rotulo?: string;
  destaque?: boolean;
};

const blocos: Bloco[] = [
  { x: 4, y: 6, w: 26, h: 20, altura: 26, rotulo: "Padaria" },
  { x: 4, y: 32, w: 26, h: 24, altura: 18 },
  { x: 4, y: 62, w: 26, h: 30, altura: 34, rotulo: "Praça" },
  { x: 40, y: 6, w: 30, h: 20, altura: 20 },
  { x: 40, y: 34, w: 30, h: 22, altura: 44, rotulo: "Adega do Sanfra", destaque: true },
  { x: 40, y: 64, w: 30, h: 28, altura: 22, rotulo: "Mercado" },
  { x: 78, y: 6, w: 18, h: 26, altura: 30 },
  { x: 78, y: 38, w: 18, h: 22, altura: 16 },
  { x: 78, y: 66, w: 18, h: 26, altura: 38 },
];

export function Map3D() {
  const [girar, setGirar] = useState(false);

  return (
    <div
      className="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_50%_20%,hsl(var(--card))_0%,hsl(var(--background))_75%)] sm:h-80"
      style={{ perspective: "900px" }}
      onMouseEnter={() => setGirar(true)}
      onMouseLeave={() => setGirar(false)}
      role="img"
      aria-label="Maquete 3D ilustrativa do quarteirão da Adega do Sanfra"
    >
      <div
        className="absolute left-1/2 top-1/2 h-[78%] w-[86%] transition-transform duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) rotateX(58deg) rotateZ(${girar ? -38 : -28}deg)`,
        }}
      >
        {/* asfalto */}
        <div className="absolute inset-0 rounded-lg border border-border/70 bg-muted/30" />

        {/* ruas */}
        <div className="absolute left-0 right-0 top-[29%] h-[4%] bg-foreground/10" />
        <div className="absolute left-0 right-0 top-[59%] h-[4%] bg-foreground/10" />
        <div className="absolute bottom-0 left-[33%] top-0 w-[6%] bg-foreground/10" />
        <div className="absolute bottom-0 left-[71%] top-0 w-[6%] bg-foreground/10" />

        {blocos.map((b, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              transformStyle: "preserve-3d",
              transform: `translateZ(${b.altura}px)`,
            }}
          >
            {/* topo do prédio */}
            <div
              className={
                b.destaque
                  ? "h-full w-full rounded-[3px] border border-primary bg-primary shadow-[0_0_28px_hsl(var(--primary)/0.55)]"
                  : "h-full w-full rounded-[3px] border border-border bg-card"
              }
            />
            {/* laterais simuladas */}
            <div
              className={b.destaque ? "absolute inset-0 bg-primary/70" : "absolute inset-0 bg-muted"}
              style={{
                transform: `translateZ(-${b.altura}px)`,
                filter: "brightness(0.55)",
                borderRadius: 3,
              }}
            />
            {b.destaque && (
              <div
                className="absolute -top-8 left-1/2 whitespace-nowrap rounded-full border border-primary bg-background px-2 py-1 font-display text-[10px] uppercase tracking-wide text-primary"
                style={{ transform: "translateX(-50%) rotateZ(28deg) rotateX(-58deg)" }}
              >
                Estamos aqui
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-2 left-3 text-[10px] uppercase tracking-wide text-muted-foreground">
        Vila Sanfra · maquete ilustrativa
      </div>
    </div>
  );
}
