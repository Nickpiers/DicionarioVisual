/**
 * Tipos do contrato da API (docs/openapi.yaml, v0.3.0). Os nomes seguem o
 * contrato para facilitar a conferência; a tradução para o domínio do front
 * fica em lib/palavras.ts e nos módulos de cada área.
 */

/* Palavras ------------------------------------------------------------ */

export type FonteSentido = "INES" | "EQUIPE" | "COLABORADOR";

export type SenseApi = {
  senseId: string;
  title: string;
  explanation: string;
  example: string | null;
  grammaticalClass: string | null;
  youtubeVideoId: string | null;
  imageUrl: string | null;
  source: FonteSentido;
};

export type WordListItemApi = {
  wordId: string;
  term: string;
  senseCount: number;
  senses: SenseApi[];
};

export type WordListApi = {
  items: WordListItemApi[];
  nextCursor: string | null;
};

export type WordDetailApi = {
  wordId: string;
  term: string;
  senses: SenseApi[];
};

export type TipoCombinacao = "EXACT" | "PREFIX" | "CONTAINS" | "SIMILAR";

export type SearchResultApi = {
  query: string;
  items: { wordId: string; term: string; match: TipoCombinacao }[];
};

/* Autenticação -------------------------------------------------------- */

export type Perfil = "MASTER" | "ADMIN" | "USER";
export type SituacaoConta = "ACTIVE" | "BLOCKED";

export type Usuario = {
  userId: string;
  name: string;
  email: string;
  role: Perfil;
  emailVerified: boolean;
};

export type SessaoApi = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: Usuario;
};

export type CadastroApi = {
  name: string;
  email: string;
  password: string;
};

/* Contribuições ------------------------------------------------------- */

export type TipoContribuicao = "NEW_WORD" | "NEW_SENSE";
export type ModoContribuicao = "RECORDING_REQUEST" | "VIDEO_UPLOAD";
export type SituacaoSentido =
  | "PENDING"
  | "IN_RECORDING"
  | "APPROVED"
  | "REJECTED";

export type ContribuicaoApi = {
  term: string;
  title: string;
  explanation: string;
  example?: string | null;
  grammaticalClass?: string | null;
  mode: ModoContribuicao;
  /** Com mode VIDEO_UPLOAD: a chave devolvida por POST /api/contributions/uploads. */
  videoKey?: string | null;
  /** Com mode VIDEO_UPLOAD: aceite do termo de autorização de uso de imagem. */
  consentAccepted?: boolean;
  consentVersion?: string | null;
};

/** Resposta de POST /api/contributions/uploads. */
export type EnvioPreparadoApi = {
  key: string;
  uploadUrl: string;
  expiresAt: string;
  headers: Record<string, string>;
};

export type ContribuicaoCriadaApi = {
  wordId: string;
  senseId: string;
  type: TipoContribuicao;
  status: "PENDING";
};

export type MinhaContribuicaoApi = {
  wordId: string;
  term: string;
  senseId: string;
  title: string;
  type: TipoContribuicao;
  mode: ModoContribuicao;
  status: SituacaoSentido;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

/* Moderação ----------------------------------------------------------- */

export type ItemFilaApi = {
  wordId: string;
  term: string;
  pendingCount: number;
  lastSubmittedAt: string;
};

export type FilaModeracaoApi = {
  items: ItemFilaApi[];
  nextCursor: string | null;
};

export type AdminSenseApi = {
  senseId: string;
  title: string;
  explanation: string;
  example: string | null;
  grammaticalClass: string | null;
  youtubeVideoId: string | null;
  imageKey: string | null;
  source: FonteSentido;
  order: number | null;
  status: SituacaoSentido;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  contribution: {
    submittedBy: string;
    submitterName: string;
    submittedAt: string;
    type: TipoContribuicao;
    mode: ModoContribuicao;
    contactEmail: string;
    /** Endereço temporário (5 minutos) do vídeo enviado pelo colaborador. */
    videoUrl?: string | null;
    consentAcceptedAt?: string | null;
    consentVersion?: string | null;
  } | null;
};

export type AdminWordApi = {
  wordId: string;
  term: string;
  publishedCount: number;
  pendingCount: number;
  version: number;
  senses: AdminSenseApi[];
};

export type AprovacaoApi = {
  version: number;
  youtubeVideo: string;
  title?: string;
  explanation?: string;
  example?: string;
  grammaticalClass?: string;
  imageKey?: string;
  reviewNote?: string;
};

/* Administração ------------------------------------------------------- */

export type AdminUserApi = {
  userId: string;
  name: string;
  email: string;
  role: Perfil;
  status: SituacaoConta;
  emailVerified: boolean;
  createdAt: string;
};
