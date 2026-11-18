import type { ComponentProps, ReactNode } from "react";
import { Icone, type NomeIcone } from "./icone";

/* Botão (.button) ----------------------------------------------------- */

const variantesBotao = {
  primary: "border-transparent bg-navy text-white",
  secondary: "border-line bg-white text-navy",
  ghost: "border-transparent bg-transparent text-blue",
  danger: "border-red bg-white text-red",
  success: "border-transparent bg-green text-white",
} as const;

export type VarianteBotao = keyof typeof variantesBotao;

export const classeBotao = (
  variante: keyof typeof variantesBotao = "primary",
  compacto = false,
) =>
  `inline-flex min-h-12 items-center justify-center gap-[9px] rounded-[10px] border-2 py-[10px] font-extrabold transition-all duration-180 ease-[ease] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 ${compacto ? "px-3" : "px-[18px]"} ${variantesBotao[variante]}`;

export function Botao({
  children,
  variante = "primary",
  icone,
  compacto = false,
  className = "",
  type = "button",
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  children: ReactNode;
  variante?: keyof typeof variantesBotao;
  icone?: NomeIcone;
  /** Padding horizontal de 12px (filtros do painel lateral). */
  compacto?: boolean;
}) {
  return (
    <button
      type={type}
      className={`${classeBotao(variante, compacto)} ${className}`}
      {...props}
    >
      {icone && <Icone nome={icone} />}
      <span>{children}</span>
    </button>
  );
}

/* Rótulo em caixa alta (.eyebrow) ------------------------------------- */

export const classeEyebrow =
  "text-[.78rem] font-extrabold tracking-[.08em] uppercase";

export function Eyebrow({
  children,
  claro = false,
  className = "",
}: {
  children: ReactNode;
  claro?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`${classeEyebrow} ${claro ? "text-[#bee0ff]" : "text-blue"} ${className}`}
    >
      {children}
    </span>
  );
}

/* Selo com a quantidade de sentidos (.sense-badge) -------------------- */

export function SeloSentidos({
  children,
  className = "text-[.78rem]",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-[999px] bg-orange-soft px-[9px] py-[5px] font-extrabold tracking-normal whitespace-nowrap text-[#913313] ${className}`}
    >
      {children}
    </span>
  );
}

/* Ícone de sinal em Libras (.sign-icon) ------------------------------- */

export const classeIconeQuadrado =
  "grid flex-none place-items-center rounded-[12px]";

export function IconeSinal({
  tamanho = 20,
  className = "size-11",
}: {
  tamanho?: number;
  className?: string;
}) {
  return (
    <span
      className={`${classeIconeQuadrado} bg-blue-soft text-navy ${className}`}
    >
      <Icone nome="hand" tamanho={tamanho} />
    </span>
  );
}

/* Faixa de busca azul (.search-band) ---------------------------------- */

export const classeFaixaBusca =
  "grid min-h-[210px] grid-cols-[1fr_minmax(360px,560px)] items-center gap-[60px] bg-[linear-gradient(120deg,var(--navy),var(--navy-dark))] px-[max(24px,calc((100%_-_1180px)/2))] py-10 text-white tablet:grid-cols-1 tablet:gap-[22px] tablet:px-8 tablet:py-[34px] phone:px-[18px] phone:py-7";

export const classeTituloFaixa =
  "my-[7px] text-[clamp(2rem,3.8vw,3.25rem)] phone:text-[2rem]";

/* Seção centralizada (.section) --------------------------------------- */

export const classeSecao =
  "mx-auto w-[min(1180px,calc(100%_-_40px))] py-16 tablet:w-[min(100%_-_32px,760px)] tablet:py-[42px] phone:w-[calc(100%_-_28px)] phone:py-8";

/* Cabeçalho de resultados (.results-header) --------------------------- */

export const classeCabecalhoResultados =
  "mb-7 flex items-end justify-between gap-6 phone:flex-col phone:items-start";

/* Link de texto (.text-link) ------------------------------------------ */

export const classeLinkTexto =
  "inline-flex min-h-12 items-center gap-[6px] border-0 bg-transparent p-0 font-extrabold text-blue";

/* Mídia (.media-label, .video-player) --------------------------------- */

export const classeRotuloMidia =
  "mb-2 flex min-h-[34px] items-center gap-[7px] text-[.88rem] font-extrabold text-navy";

/** Moldura do player; a altura mínima fica a cargo de quem usa. */
export const classePlayer =
  "relative overflow-hidden rounded-[12px] bg-[#103963] after:absolute after:inset-[65%_0_0] after:bg-[linear-gradient(transparent,rgba(1,18,40,.85))] after:content-['']";

export const classeBotaoPlay =
  "absolute top-1/2 left-1/2 z-[2] grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[rgba(3,43,93,.72)] text-white";

export const classeControlesVideo =
  "absolute inset-x-3 bottom-3 z-[3] flex h-[38px] items-center gap-[10px] rounded-[8px] bg-[rgba(2,29,62,.88)] px-3 text-[.75rem] text-white";
