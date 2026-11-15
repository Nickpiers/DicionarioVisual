import type { NomeIcone } from "./icone";

export type ItemNavegacao = {
  rotulo: string;
  icone: NomeIcone;
  href: string;
};

export const itensNavegacao: ItemNavegacao[] = [
  { rotulo: "Início", icone: "home", href: "/" },
  { rotulo: "Palavras", icone: "book", href: "/palavras" },
  { rotulo: "Contribuir", icone: "plus", href: "/contribuir" },
  { rotulo: "Moderação", icone: "shield", href: "/moderacao" },
];

/** Item ativo na navegação do topo (desktop). */
export function ativoNoTopo(item: ItemNavegacao, rota: string) {
  return item.href === rota;
}

/** Item ativo na navegação inferior (celular): busca e detalhe contam como Início. */
export function ativoNaBarraInferior(item: ItemNavegacao, rota: string) {
  if (item.href === "/") {
    return rota === "/" || rota === "/busca" || rota.startsWith("/palavras/");
  }
  return ativoNoTopo(item, rota);
}
