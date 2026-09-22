import type { ReactNode } from "react";
import { useState } from "react";
import { Coffee, Croissant, Scissors, ShoppingBasket, Store, TreePine } from "lucide-react";

const ROT_X = 56;
const ROT_Z = -30;

/** contra-rotação para elementos que devem "olhar" para a câmera */
const faceCamera = `rotateZ(${-ROT_Z}deg) rotateX(${-ROT_X}deg)`;

type BoxProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  z: number;
  /** 0 = concreto escuro, 1 = destaque amarelo */
  glow?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
};

function Box({ x, y, w, d, z, glow = false, icon, children }: BoxProps) {
  const topClass = glow
    ? "bg-[linear-gradient(140deg,var(--primary),color-mix(in_oklab,var(--primary)_72%,black))]"
    : "bg-[linear-gradient(140deg,#494949,#303030)]";
  const sideBase = glow
    ? "bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_70%,black),color-mix(in_oklab,var(--primary)_35%,black))]"
    : "bg-[linear-gradient(to_bottom,#4d4d4d,#242424)]";
  const sideDark = glow
    ? "bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_45%,black),color-mix(in_oklab,var(--primary)_18%,black))]"
    : "bg-[linear-gradient(to_bottom,#383838,#171717)]";

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: d,
        transformStyle: "preserve-3d",
      }}
    >
      {/* sombra projetada no solo */}
      <div
        className="absolute inset-0 rounded-[4px] bg-black/70 blur-[5px]"
        style={{ transform: "translate3d(10px, 12px, 0.2px)" }}
      />


      {/* topo */}
      <div
        className={`absolute inset-0 rounded-[3px] border border-border/60 ${topClass} ${
          glow
            ? "shadow-[0_0_60px_color-mix(in_oklab,var(--primary)_60%,transparent)] border-primary"
            : ""
        }`}
        style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}
      >
        {icon ? (
          <div
            className="absolute left-1/2 top-1/2 text-primary/80"
            style={{ transform: `translate(-50%,-50%) ${faceCamera}` }}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {/* parede frontal (sul) */}
      <div
        className={`absolute left-0 overflow-hidden ${sideBase}`}
        style={{
          top: d,
          width: w,
          height: z,
          transform: "rotateX(90deg)",
          transformOrigin: "top",
          transformStyle: "preserve-3d",
        }}
      >
        {!glow && (
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right,transparent 0 8px,rgba(255,255,255,0.07) 8px 16px,transparent 16px 24px), repeating-linear-gradient(to bottom,transparent 0 10px,rgba(255,255,255,0.05) 10px 17px,transparent 17px 26px)",
            }}
          />
        )}
        {children}
      </div>

      {/* parede lateral (leste) */}
      <div
        className={`absolute top-0 overflow-hidden ${sideDark}`}
        style={{
          left: w,
          width: z,
          height: d,
          transform: "rotateY(-90deg)",
          transformOrigin: "left",
        }}
      >
        {!glow && (
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom,transparent 0 8px,rgba(255,255,255,0.06) 8px 15px,transparent 15px 24px)",
            }}
          />
        )}
      </div>

    </div>
  );
}

export function Map3D() {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative h-72 w-full overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_50%_30%,color-mix(in_oklab,var(--card)_85%,black)_0%,#0b0b0b_70%)] sm:h-96"
      style={{ perspective: "1100px" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="img"
      aria-label="Maquete isométrica 3D da Vila Sanfra com a Adega do Sanfra em destaque"
    >
      <div
        className="absolute left-1/2 top-1/2 scale-[0.52] transition-transform duration-700 ease-out sm:scale-[0.78] lg:scale-[0.92]"
        style={{
          width: 640,
          height: 440,
          marginLeft: -320,
          marginTop: -220,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="h-full w-full transition-transform duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${ROT_X}deg) rotateZ(${hover ? ROT_Z - 8 : ROT_Z}deg)`,
          }}
        >
          {/* terreno com leve relevo */}
          <div
            className="absolute inset-0 rounded-xl border border-border/70 bg-[linear-gradient(160deg,#1a1a1a,#0d0d0d)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
            style={{ transform: "translateZ(-10px)" }}
          />
          <div
            className="absolute inset-x-2 inset-y-2 rounded-lg bg-[radial-gradient(ellipse_at_45%_40%,#232323_0%,#141414_60%,#101010_100%)]"
            style={{ transform: "translateZ(-2px)" }}
          />

          {/* ruas */}
          <div
            className="absolute left-0 right-0 bg-[#1d1d1d]"
            style={{ top: 132, height: 26, transform: "translateZ(0px)" }}
          />
          <div
            className="absolute left-0 right-0 bg-[#1d1d1d]"
            style={{ top: 292, height: 26, transform: "translateZ(0px)" }}
          />
          <div
            className="absolute bottom-0 top-0 bg-[#1d1d1d]"
            style={{ left: 214, width: 26, transform: "translateZ(0px)" }}
          />
          <div
            className="absolute bottom-0 top-0 bg-[#1d1d1d]"
            style={{ left: 446, width: 26, transform: "translateZ(0px)" }}
          />

          {/* faixas centrais */}
          <div
            className="absolute left-0 right-0 opacity-30"
            style={{
              top: 144,
              height: 2,
              transform: "translateZ(0.6px)",
              backgroundImage:
                "repeating-linear-gradient(to right,#6b6b6b 0 14px,transparent 14px 30px)",
            }}
          />
          <div
            className="absolute bottom-0 top-0 opacity-30"
            style={{
              left: 226,
              width: 2,
              transform: "translateZ(0.6px)",
              backgroundImage:
                "repeating-linear-gradient(to bottom,#6b6b6b 0 14px,transparent 14px 30px)",
            }}
          />

          {/* calçada iluminada: rota de acesso até a adega */}
          <div
            className="absolute rounded-full bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--primary)_75%,transparent))] blur-[1px]"
            style={{
              left: 40,
              top: 214,
              width: 214,
              height: 10,
              transform: "translateZ(1px)",
              boxShadow: "0 0 22px color-mix(in oklab, var(--primary) 55%, transparent)",
            }}
          />
          <div
            className="absolute rounded-full bg-[color-mix(in_oklab,var(--primary)_80%,transparent)] blur-[1px]"
            style={{
              left: 248,
              top: 218,
              width: 10,
              height: 66,
              transform: "translateZ(1px)",
              boxShadow: "0 0 22px color-mix(in oklab, var(--primary) 55%, transparent)",
            }}
          />

          {/* quarteirão superior esquerdo */}
          <Box x={30} y={26} w={150} d={86} z={54} icon={<Coffee className="h-5 w-5" />} />
          <Box x={262} y={20} w={82} d={92} z={78} icon={<Croissant className="h-5 w-5" />} />
          <Box x={360} y={30} w={70} d={82} z={46} icon={<Scissors className="h-5 w-5" />} />
          <Box x={492} y={24} w={116} d={88} z={92} icon={<Store className="h-5 w-5" />} />

          {/* quarteirão central */}
          <Box x={30} y={178} w={150} d={96} z={40} icon={<TreePine className="h-5 w-5" />} />

          {/* bloco em destaque: a adega */}
          <Box x={262} y={182} w={168} d={92} z={86} glow>
            {/* vitrine e porta no nível do solo */}
            <div className="absolute inset-0 flex items-end gap-3 px-4 pb-1">
              <div className="mb-1 h-10 w-20 rounded-[2px] border border-primary-foreground/40 bg-[color-mix(in_oklab,var(--primary)_35%,black)] shadow-[inset_0_0_14px_color-mix(in_oklab,var(--primary)_75%,transparent)]" />
              <div className="h-14 w-8 rounded-t-[3px] border border-primary-foreground/50 bg-[color-mix(in_oklab,var(--primary)_18%,black)]" />
              <div className="mb-1 h-10 w-20 rounded-[2px] border border-primary-foreground/40 bg-[color-mix(in_oklab,var(--primary)_35%,black)] shadow-[inset_0_0_14px_color-mix(in_oklab,var(--primary)_75%,transparent)]" />
            </div>
            {/* toldo */}
            <div className="absolute inset-x-3 top-1 h-2 rounded-full bg-[color-mix(in_oklab,var(--primary)_95%,white)] opacity-80" />
          </Box>

          <Box x={492} y={176} w={116} d={100} z={62} icon={<ShoppingBasket className="h-5 w-5" />} />

          {/* quarteirão inferior */}
          <Box x={30} y={334} w={150} d={82} z={58} icon={<Store className="h-5 w-5" />} />
          <Box x={262} y={340} w={168} d={76} z={44} icon={<Coffee className="h-5 w-5" />} />
          <Box x={492} y={330} w={116} d={86} z={70} icon={<TreePine className="h-5 w-5" />} />

          {/* letreiro neon "ESTAMOS AQUI" sobre o bloco iluminado */}
          <div
            className="absolute"
            style={{
              left: 346,
              top: 214,
              transform: "translateZ(86px)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* haste */}
            <div
              className="absolute left-0 w-[2px] bg-[color-mix(in_oklab,var(--primary)_70%,black)]"
              style={{ height: 74, bottom: 0, transform: `rotateX(${-ROT_X}deg)` }}
            />
            <div
              className="absolute -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-primary bg-[color-mix(in_oklab,black_78%,var(--primary))] px-3 py-1.5 font-display text-[13px] uppercase tracking-[0.18em] text-primary"
              style={{
                bottom: 74,
                transform: `translateX(-50%) ${faceCamera}`,
                textShadow:
                  "0 0 8px color-mix(in oklab, var(--primary) 85%, transparent), 0 0 20px color-mix(in oklab, var(--primary) 55%, transparent)",
                boxShadow:
                  "0 0 18px color-mix(in oklab, var(--primary) 45%, transparent), inset 0 0 12px color-mix(in oklab, var(--primary) 25%, transparent)",
              }}
            >
              Estamos aqui
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Vila Sanfra — maquete ilustrativa
      </div>
    </div>
  );
}
