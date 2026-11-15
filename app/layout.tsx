import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { BarraInferior } from "@/components/barra-inferior";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import "./globals.css";

// Mesmos arquivos (latin, v12, com hinting) que o design carrega do Google Fonts.
const atkinson = localFont({
  variable: "--font-atkinson",
  display: "swap",
  // Sem fonte de reserva com métricas ajustadas: glifos ausentes na Atkinson
  // (ex.: "←") caem em Arial pura, exatamente como no design.
  adjustFontFallback: false,
  fallback: ["Arial", "sans-serif"],
  src: [
    {
      path: "./fontes/atkinson-hyperlegible-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fontes/atkinson-hyperlegible-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Dicionário Libras",
    template: "%s · Dicionário Libras",
  },
  description:
    "Dicionário visual, acessível e feito com a comunidade Surda. Uma palavra, vários sentidos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${atkinson.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body>
        <div className="min-h-dvh bg-canvas">
          <Cabecalho />
          {children}
          <Rodape />
          <BarraInferior />
        </div>
      </body>
    </html>
  );
}
