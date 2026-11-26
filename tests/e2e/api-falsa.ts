import type { Page, Route } from "@playwright/test";
import type {
  AdminUserApi,
  AdminWordApi,
  ContribuicaoApi,
  FilaModeracaoApi,
  MinhaContribuicaoApi,
  SenseApi,
  SessaoApi,
  Usuario,
  WordDetailApi,
} from "../../lib/api/tipos";

/**
 * API falsa para os testes E2E. O navegador só fala com `/api/*` (mesmo
 * domínio), então o Playwright intercepta essas chamadas e responde com os
 * dados abaixo. Assim os testes não dependem do backend estar no ar nem dos
 * dados reais do banco.
 */

const sentido = (parcial: Partial<SenseApi> & Pick<SenseApi, "senseId" | "title">): SenseApi => ({
  explanation: `Explicação de ${parcial.title}.`,
  example: null,
  grammaticalClass: "substantivo",
  youtubeVideoId: null,
  imageUrl: null,
  source: "EQUIPE",
  ...parcial,
});

export const PALAVRAS: WordDetailApi[] = [
  {
    wordId: "banco",
    term: "banco",
    senses: [
      sentido({
        senseId: "banco-1",
        title: "Instituição financeira",
        example: "Eu fui ao banco pagar uma conta.",
        // Com vídeo, para testar o link "Pular vídeo". O player é simulado (ver abaixo).
        youtubeVideoId: "AbCdEfGhIjK",
      }),
      sentido({ senseId: "banco-2", title: "Assento" }),
    ],
  },
  {
    wordId: "manga",
    term: "manga",
    senses: [
      sentido({ senseId: "manga-1", title: "Fruta" }),
      sentido({ senseId: "manga-2", title: "Parte da roupa" }),
    ],
  },
  {
    wordId: "correr",
    term: "correr",
    senses: [sentido({ senseId: "correr-1", title: "Mover-se depressa", grammaticalClass: "verbo" })],
  },
];

export const USUARIO: Usuario = {
  userId: "u-1",
  name: "Ana Souza",
  email: "ana@exemplo.com",
  role: "USER",
  emailVerified: true,
};

export const MODERADOR: Usuario = {
  userId: "u-2",
  name: "Bruno Lima",
  email: "bruno@exemplo.com",
  role: "MASTER",
  emailVerified: true,
};

export const SENHA_CORRETA = "senha-correta";

const MINHAS_CONTRIBUICOES: MinhaContribuicaoApi[] = [
  {
    wordId: "escola",
    term: "escola",
    senseId: "escola-1",
    title: "Lugar de estudo",
    type: "NEW_WORD",
    mode: "RECORDING_REQUEST",
    status: "PENDING",
    submittedAt: "2026-11-20T13:00:00Z",
  },
  {
    wordId: "banco",
    term: "banco",
    senseId: "banco-3",
    title: "Banco de dados",
    type: "NEW_SENSE",
    mode: "VIDEO_UPLOAD",
    status: "REJECTED",
    submittedAt: "2026-11-10T09:30:00Z",
    reviewedAt: "2026-11-12T16:00:00Z",
    reviewNote: "Já existe um sentido parecido.",
  },
];

const PALAVRA_EM_REVISAO: AdminWordApi = {
  wordId: "escola",
  term: "escola",
  publishedCount: 0,
  pendingCount: 1,
  version: 3,
  senses: [
    {
      senseId: "escola-1",
      title: "Lugar de estudo",
      explanation: "Lugar onde as pessoas aprendem.",
      example: "Eu vou à escola de manhã.",
      grammaticalClass: "substantivo",
      youtubeVideoId: null,
      imageKey: null,
      imageUrl: null,
      source: "COLABORADOR",
      order: null,
      status: "PENDING",
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      contribution: {
        submittedBy: USUARIO.userId,
        submitterName: USUARIO.name,
        submittedAt: "2026-11-20T13:00:00Z",
        type: "NEW_WORD",
        mode: "RECORDING_REQUEST",
        contactEmail: USUARIO.email,
      },
    },
  ],
};

const FILA_MODERACAO: FilaModeracaoApi = {
  items: [
    {
      wordId: PALAVRA_EM_REVISAO.wordId,
      term: PALAVRA_EM_REVISAO.term,
      pendingCount: 1,
      lastSubmittedAt: "2026-11-20T13:00:00Z",
    },
  ],
  nextCursor: null,
};

const CONTAS: AdminUserApi[] = [
  { ...USUARIO, status: "ACTIVE", createdAt: "2026-10-01T10:00:00Z" },
  {
    userId: "u-3",
    name: "Carla Dias",
    email: "carla@exemplo.com",
    role: "USER",
    status: "BLOCKED",
    emailVerified: false,
    createdAt: "2026-10-05T10:00:00Z",
  },
  { ...MODERADOR, status: "ACTIVE", createdAt: "2026-09-01T10:00:00Z" },
];

const sessao = (usuario: Usuario): SessaoApi => ({
  accessToken: "token-de-teste",
  tokenType: "Bearer",
  expiresIn: 900,
  user: usuario,
});

const problema = (route: Route, status: number, detail: string) =>
  route.fulfill({
    status,
    contentType: "application/problem+json",
    json: { status, detail },
  });

export type ApiFalsa = {
  /** Corpos recebidos em POST /api/contributions, para conferir no teste. */
  contribuicoes: ContribuicaoApi[];
};

/**
 * Liga a API falsa na página. `logado` define se o cookie de sessão "existe"
 * (POST /api/auth/refresh devolve a sessão ou 401).
 */
export async function usarApiFalsa(
  page: Page,
  { logado = false, usuario = USUARIO }: { logado?: boolean; usuario?: Usuario } = {},
): Promise<ApiFalsa> {
  const estado: ApiFalsa = { contribuicoes: [] };
  let comSessao = logado;

  // O player do YouTube é trocado por uma página vazia: os testes não dependem
  // da internet, e o axe avalia o site, não a interface do YouTube.
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="pt-BR"><title>Player simulado</title><body></body></html>',
    }),
  );

  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const caminho = url.pathname.replace(/\/+$/, "");
    const metodo = req.method();

    if (caminho === "/api/auth/refresh") {
      return comSessao
        ? route.fulfill({ json: sessao(usuario) })
        : problema(route, 401, "Sessão ausente.");
    }
    if (caminho === "/api/auth/login" && metodo === "POST") {
      const { email, password } = req.postDataJSON();
      if (email === usuario.email && password === SENHA_CORRETA) {
        comSessao = true;
        return route.fulfill({ json: sessao(usuario) });
      }
      return problema(route, 401, "E-mail ou senha incorretos.");
    }
    if (caminho === "/api/auth/logout") {
      comSessao = false;
      return route.fulfill({ status: 204 });
    }

    if (caminho === "/api/words/search") {
      const q = (url.searchParams.get("q") ?? "").toLowerCase();
      const items = PALAVRAS.filter((p) => p.term.includes(q)).map((p) => ({
        wordId: p.wordId,
        term: p.term,
        match: "CONTAINS" as const,
      }));
      return route.fulfill({ json: { query: q, items } });
    }
    if (caminho === "/api/words") {
      const letra = url.searchParams.get("letter");
      const items = PALAVRAS.filter((p) => !letra || p.term.startsWith(letra)).map(
        (p) => ({ ...p, senseCount: p.senses.length }),
      );
      return route.fulfill({ json: { items, nextCursor: null } });
    }
    const detalhe = caminho.match(/^\/api\/words\/([^/]+)$/);
    if (detalhe) {
      const palavra = PALAVRAS.find((p) => p.wordId === decodeURIComponent(detalhe[1]));
      return palavra
        ? route.fulfill({ json: palavra })
        : problema(route, 404, "Palavra não encontrada.");
    }

    if (caminho === "/api/contributions" && metodo === "POST") {
      if (!comSessao) return problema(route, 401, "Sessão ausente.");
      const corpo = req.postDataJSON() as ContribuicaoApi;
      estado.contribuicoes.push(corpo);
      return route.fulfill({
        status: 201,
        json: {
          wordId: corpo.term.toLowerCase(),
          senseId: `novo-${estado.contribuicoes.length}`,
          type: "NEW_WORD",
          status: "PENDING",
        },
      });
    }

    if (caminho === "/api/contributions/mine") {
      if (!comSessao) return problema(route, 401, "Sessão ausente.");
      return route.fulfill({ json: { items: MINHAS_CONTRIBUICOES } });
    }
    if (caminho === "/api/auth/verify-email" && metodo === "POST") {
      return route.fulfill({ status: 204 });
    }

    // Moderação e administração (perfis ADMIN e MASTER).
    if (caminho.startsWith("/api/admin/")) {
      if (!comSessao) return problema(route, 401, "Sessão ausente.");
      if (usuario.role === "USER") return problema(route, 403, "Sem permissão.");
      if (caminho === "/api/admin/moderation") {
        return route.fulfill({ json: FILA_MODERACAO });
      }
      if (caminho === `/api/admin/words/${PALAVRA_EM_REVISAO.wordId}`) {
        return route.fulfill({ json: PALAVRA_EM_REVISAO });
      }
      if (caminho === "/api/admin/users") {
        const perfil = url.searchParams.get("role");
        return route.fulfill({ json: CONTAS.filter((c) => c.role === perfil) });
      }
    }

    return problema(route, 404, `Rota não simulada: ${metodo} ${caminho}`);
  });

  return estado;
}
