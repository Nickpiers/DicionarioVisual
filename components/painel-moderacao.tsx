"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErroApi, mensagemDeErro } from "@/lib/api/erros";
import type {
  AdminSenseApi,
  AdminWordApi,
  AprovacaoApi,
  ItemFilaApi,
} from "@/lib/api/tipos";
import {
  classesGramaticais,
  formatarData,
  formatarDataCurta,
} from "@/lib/contribuicoes";
import {
  aprovar,
  carregarFila,
  carregarPalavraAdmin,
  enviarImagem,
  marcarParaGravacao,
  rejeitar,
} from "@/lib/moderacao";
import { idDoYoutube } from "@/lib/video";
import {
  Alerta,
  classeCampo,
  classeControle,
  classeRotuloCampo,
  ZonaUpload,
} from "./campos";
import { Icone } from "./icone";
import { EtiquetaSituacao } from "./minhas-contribuicoes";
import { Botao, classeBotao, classeRotuloMidia, classeSecao, Eyebrow } from "./ui";
import { VideoSinal } from "./video-sinal";

const emAberto = (s: AdminSenseApi) =>
  s.status === "PENDING" || s.status === "IN_RECORDING";

const rotuloFonte = { INES: "INES", EQUIPE: "Equipe", COLABORADOR: "Comunidade" };

/* Fila ---------------------------------------------------------------- */

type EstadoFila = {
  itens: ItemFilaApi[];
  proximo: string | null;
  carregando: boolean;
  erro: string | null;
};

export function PainelModeracao() {
  const [fila, setFila] = useState<EstadoFila>({
    itens: [],
    proximo: null,
    carregando: true,
    erro: null,
  });
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const carregar = useCallback(async (cursor: string | null) => {
    setFila((f) => ({ ...f, carregando: true, erro: null }));
    try {
      const pagina = await carregarFila(cursor);
      setFila((f) => ({
        itens: cursor ? [...f.itens, ...pagina.items] : pagina.items,
        proximo: pagina.nextCursor,
        carregando: false,
        erro: null,
      }));
      if (!cursor) {
        setSelecionada((atual) => atual ?? pagina.items[0]?.wordId ?? null);
      }
    } catch (erro) {
      setFila((f) => ({ ...f, carregando: false, erro: mensagemDeErro(erro) }));
    }
  }, []);

  useEffect(() => {
    void carregar(null);
  }, [carregar]);

  /** Depois de uma decisão, atualiza a contagem (ou tira a palavra da fila). */
  const aoAtualizar = useCallback((palavra: AdminWordApi) => {
    setFila((f) => ({
      ...f,
      itens: f.itens
        .map((i) =>
          i.wordId === palavra.wordId
            ? { ...i, pendingCount: palavra.pendingCount }
            : i,
        )
        .filter((i) => i.pendingCount > 0 || i.wordId === palavra.wordId),
    }));
  }, []);

  const pendentes = fila.itens.reduce((total, i) => total + i.pendingCount, 0);
  const atual = fila.itens.find((i) => i.wordId === selecionada);

  return (
    <main className="bg-canvas">
      <section className={classeSecao}>
        <div className="mb-7 flex items-center justify-between gap-6 phone:flex-col phone:items-start">
          <div>
            <Eyebrow>Painel de moderação</Eyebrow>
            <h1 className="my-[5px] text-navy">Contribuições para revisar</h1>
            <p className="m-0 text-muted">
              Analise cada envio com atenção antes de publicar no dicionário.
            </p>
            <Link
              href="/moderacao/usuarios"
              className={`${classeBotao("secondary", true)} mt-4`}
            >
              <Icone nome="user" />
              <span>Gestão de usuários</span>
            </Link>
          </div>
          <div
            className="flex h-[82px] w-[92px] flex-none flex-col items-center justify-center rounded-[14px] bg-orange-strong text-white phone:h-[58px] phone:w-full phone:flex-row phone:gap-2"
            aria-live="polite"
          >
            <strong className="text-[1.8rem] leading-none">
              {pendentes}
              {fila.proximo ? "+" : ""}
            </strong>
            <span className="text-[.8rem]">em aberto</span>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(380px,.75fr)] items-start gap-5 tablet:mx-auto tablet:max-w-[680px] tablet:grid-cols-1 tablet:gap-10">
          <section
            className="col-[2] overflow-hidden rounded-[14px] border border-line bg-white shadow-card tablet:col-[1] tablet:row-[2]"
            aria-labelledby="fila-titulo"
          >
            <div className="flex min-h-[68px] items-center justify-between border-b border-line px-5 py-[15px] phone:flex-col phone:items-start">
              <h2 id="fila-titulo" className="m-0 text-[1.2rem]">
                Fila de moderação
              </h2>
              <span className="text-[.8rem] text-muted">
                Mais antigas primeiro
              </span>
            </div>
            {fila.erro && (
              <div className="border-b border-line px-5 pb-5">
                <Alerta>
                  <span className="block">{fila.erro}</span>
                  <Botao
                    variante="secondary"
                    className="mt-3"
                    onClick={() => carregar(null)}
                  >
                    Tentar de novo
                  </Botao>
                </Alerta>
              </div>
            )}
            {!fila.carregando && !fila.erro && fila.itens.length === 0 && (
              <p className="m-0 border-b border-line px-5 py-6 text-muted">
                Nenhuma contribuição aguardando revisão. Bom trabalho!
              </p>
            )}
            {fila.itens.map((item) => (
              <button
                key={item.wordId}
                type="button"
                aria-current={selecionada === item.wordId ? "true" : undefined}
                onClick={() => setSelecionada(item.wordId)}
                className={`grid min-h-[84px] w-full grid-cols-[44px_1fr_auto_82px] items-center gap-[10px] border-0 border-b border-line px-[18px] py-3 text-left hover:bg-blue-soft phone:grid-cols-[44px_1fr_auto] ${
                  selecionada === item.wordId ? "bg-blue-soft" : "bg-white"
                }`}
              >
                <span className="grid size-10 place-items-center rounded-full bg-blue font-extrabold text-white">
                  {item.term.charAt(0).toLocaleUpperCase("pt-BR")}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate">{item.term}</strong>
                  <small className="block text-[.8rem] text-muted">
                    {item.pendingCount === 0
                      ? "Revisão concluída"
                      : `${item.pendingCount} ${item.pendingCount === 1 ? "sentido em aberto" : "sentidos em aberto"}`}
                  </small>
                </span>
                <span className="flex items-center gap-[5px] text-[.8rem] text-muted phone:col-[2]">
                  <Icone nome="calendar" />
                  <span className="whitespace-nowrap">
                    {formatarDataCurta(item.lastSubmittedAt)}
                  </span>
                </span>
                <span className="flex items-center text-[.82rem] font-extrabold text-blue phone:col-[3] phone:row-[1]">
                  Revisar <Icone nome="arrow" />
                </span>
              </button>
            ))}
            {fila.carregando && (
              <p role="status" className="m-0 border-b border-line px-5 py-6 text-muted">
                Carregando a fila…
              </p>
            )}
            {fila.proximo && !fila.carregando && (
              <div className="border-b border-line p-4">
                <Botao
                  variante="secondary"
                  className="w-full"
                  onClick={() => carregar(fila.proximo)}
                >
                  Carregar mais
                </Botao>
              </div>
            )}
            <aside className="m-5 flex gap-3 rounded-[10px] bg-blue-soft p-[17px]">
              <Icone nome="shield" />
              <div>
                <strong>Uma revisão, três cuidados</strong>
                <p className="mt-[2px] mb-0 text-[.85rem] text-muted">
                  Confira o sinal, a clareza do texto e se a imagem ajuda a
                  entender.
                </p>
              </div>
            </aside>
          </section>

          {atual && (
            <PainelRevisao
              key={atual.wordId}
              wordId={atual.wordId}
              aoAtualizar={aoAtualizar}
            />
          )}
        </div>
      </section>
    </main>
  );
}

/* Revisão de uma palavra --------------------------------------------- */

type EstadoPalavra =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; palavra: AdminWordApi };

async function carregarEstadoPalavra(wordId: string): Promise<EstadoPalavra> {
  try {
    return { tipo: "pronto", palavra: await carregarPalavraAdmin(wordId) };
  } catch (erro) {
    return { tipo: "erro", mensagem: mensagemDeErro(erro) };
  }
}

function PainelRevisao({
  wordId,
  aoAtualizar,
}: {
  wordId: string;
  aoAtualizar: (palavra: AdminWordApi) => void;
}) {
  const [estado, setEstado] = useState<EstadoPalavra>({ tipo: "carregando" });
  const [sentidoId, setSentidoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "sucesso" | "aviso"; texto: string } | null>(null);

  /** Aplica o resultado de uma carga, mantendo o sentido escolhido se existir. */
  const aplicar = useCallback((novo: EstadoPalavra) => {
    setEstado(novo);
    if (novo.tipo !== "pronto") return;
    const { senses } = novo.palavra;
    setSentidoId(
      (atual) =>
        (atual && senses.some((s) => s.senseId === atual) ? atual : null) ??
        senses.find(emAberto)?.senseId ??
        senses[0]?.senseId ??
        null,
    );
  }, []);

  const recarregar = useCallback(async () => {
    const novo = await carregarEstadoPalavra(wordId);
    aplicar(novo);
    return novo.tipo === "pronto" ? novo.palavra : null;
  }, [wordId, aplicar]);

  useEffect(() => {
    let ativo = true;
    carregarEstadoPalavra(wordId).then((novo) => ativo && aplicar(novo));
    return () => {
      ativo = false;
    };
  }, [wordId, aplicar]);

  const aoDecidir = (palavra: AdminWordApi, texto: string) => {
    setEstado({ tipo: "pronto", palavra });
    aoAtualizar(palavra);
    setAviso({ tipo: "sucesso", texto });
    // Segue para o próximo sentido em aberto, se houver.
    const proximo = palavra.senses.find(emAberto);
    if (proximo) setSentidoId(proximo.senseId);
  };

  const aoConflito = async () => {
    const palavra = await recarregar();
    if (palavra) aoAtualizar(palavra);
    setAviso({
      tipo: "aviso",
      texto:
        "Esta palavra mudou enquanto você revisava (outra pessoa pode ter decidido). Recarregamos os dados: confira e tente de novo.",
    });
  };

  const classePainel =
    "col-[1] row-[1] rounded-[14px] border border-line bg-white p-[22px] shadow-card phone:p-4";

  if (estado.tipo === "carregando") {
    return (
      <aside className={classePainel}>
        <p role="status" className="m-0 text-muted">
          Carregando a palavra…
        </p>
      </aside>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <aside className={classePainel}>
        <Alerta className="mt-0">
          <span className="block">{estado.mensagem}</span>
          <Botao
            variante="secondary"
            className="mt-3"
            onClick={() => {
              setEstado({ tipo: "carregando" });
              void recarregar();
            }}
          >
            Tentar de novo
          </Botao>
        </Alerta>
      </aside>
    );
  }

  const { palavra } = estado;
  const sentido = palavra.senses.find((s) => s.senseId === sentidoId);

  return (
    <aside className={classePainel} aria-labelledby="revisao-titulo">
      <div className="mb-[18px] flex items-start justify-between gap-[10px]">
        <div className="min-w-0">
          <Eyebrow>Revisar submissão</Eyebrow>
          <h2 id="revisao-titulo" className="my-[3px] break-words text-navy">
            {palavra.term.toLocaleUpperCase("pt-BR")}
          </h2>
          <p className="m-0 text-[.85rem] text-muted">
            {palavra.publishedCount}{" "}
            {palavra.publishedCount === 1 ? "sentido publicado" : "sentidos publicados"}{" "}
            • {palavra.pendingCount} em aberto
          </p>
        </div>
        {palavra.publishedCount > 0 && (
          <Link
            href={`/palavras/${palavra.wordId}`}
            target="_blank"
            className="flex min-h-11 flex-none items-center gap-1 text-[.85rem] font-extrabold text-blue"
          >
            Ver no site <Icone nome="arrow" tamanho={16} />
          </Link>
        )}
      </div>

      {aviso && (
        <Alerta tipo={aviso.tipo} className="mt-0 mb-4">
          {aviso.texto}
        </Alerta>
      )}

      <div className="mb-5" role="tablist" aria-label="Sentidos da palavra">
        <span className={classeRotuloCampo}>Sentidos</span>
        <div className="grid grid-cols-1 gap-2">
          {palavra.senses.map((s, indice) => (
            <button
              key={s.senseId}
              type="button"
              role="tab"
              aria-selected={s.senseId === sentidoId}
              onClick={() => {
                setSentidoId(s.senseId);
                setAviso(null);
              }}
              className={`flex min-h-12 min-w-0 items-center justify-between gap-3 rounded-[10px] border-2 px-3 py-2 text-left ${
                s.senseId === sentidoId
                  ? "border-blue bg-blue-soft"
                  : "border-line bg-white hover:border-blue"
              }`}
            >
              <span className="min-w-0">
                <small className="block text-[.72rem] font-extrabold text-orange-strong uppercase">
                  Sentido {indice + 1}
                </small>
                <strong className="block truncate text-navy">{s.title}</strong>
              </span>
              <EtiquetaSituacao situacao={s.status} />
            </button>
          ))}
        </div>
      </div>

      {sentido && (
        <RevisaoSentido
          key={`${sentido.senseId}:${palavra.version}`}
          palavra={palavra}
          sentido={sentido}
          aoDecidir={aoDecidir}
          aoConflito={aoConflito}
        />
      )}
    </aside>
  );
}

/* Revisão de um sentido ---------------------------------------------- */

type Rascunho = {
  titulo: string;
  classe: string;
  definicao: string;
  exemplo: string;
  video: string;
  observacao: string;
};

function RevisaoSentido({
  palavra,
  sentido,
  aoDecidir,
  aoConflito,
}: {
  palavra: AdminWordApi;
  sentido: AdminSenseApi;
  aoDecidir: (palavra: AdminWordApi, texto: string) => void;
  aoConflito: () => void;
}) {
  const original: Rascunho = {
    titulo: sentido.title,
    classe: sentido.grammaticalClass ?? "",
    definicao: sentido.explanation,
    exemplo: sentido.example ?? "",
    video: sentido.youtubeVideoId ?? "",
    observacao: "",
  };
  const [rascunho, setRascunho] = useState(original);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  /** Imagem nova escolhida; só é enviada ao aprovar. */
  const [imagem, setImagem] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [progressoImagem, setProgressoImagem] = useState<number | null>(null);
  const aberto = emAberto(sentido);
  const idVideo = idDoYoutube(rascunho.video);
  const contribuicao = sentido.contribution;

  // Prévia local da imagem escolhida; o endereço é liberado ao trocar ou sair.
  const escolherImagem = (arquivo: File | null) => {
    setImagem(arquivo);
    setPrevia(arquivo ? URL.createObjectURL(arquivo) : null);
  };
  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);
  const imagemExibida = previa ?? sentido.imageUrl;

  const mudar = (campo: keyof Rascunho, valor: string) =>
    setRascunho((r) => ({ ...r, [campo]: valor }));

  /** Executa a decisão; 409 recarrega a palavra. */
  const decidir = async (
    nome: string,
    acao: () => Promise<AdminWordApi>,
    sucesso: string,
  ) => {
    setOcupado(nome);
    setErro(null);
    try {
      aoDecidir(await acao(), sucesso);
    } catch (e) {
      if (e instanceof ErroApi && e.status === 409) {
        aoConflito();
      } else {
        setErro(mensagemDeErro(e));
        setOcupado(null);
      }
    }
  };

  const aprovarSentido = () => {
    if (!idVideo) {
      setErro("Informe o link ou o id do vídeo em Libras no YouTube. Nenhum sentido é publicado sem vídeo.");
      return;
    }
    const titulo = rascunho.titulo.trim();
    const definicao = rascunho.definicao.trim();
    if (titulo.length < 3 || titulo.length > 80) {
      setErro("O nome do sentido precisa ter de 3 a 80 caracteres.");
      return;
    }
    if (definicao.length < 10 || definicao.length > 500) {
      setErro("A definição precisa ter de 10 a 500 caracteres.");
      return;
    }
    // Só envia os textos alterados: os enviados substituem os do colaborador.
    const dados: AprovacaoApi = { version: palavra.version, youtubeVideo: idVideo };
    if (titulo !== original.titulo) dados.title = titulo;
    if (definicao !== original.definicao) dados.explanation = definicao;
    if (rascunho.exemplo.trim() !== original.exemplo) dados.example = rascunho.exemplo.trim();
    if (rascunho.classe.trim() !== original.classe) dados.grammaticalClass = rascunho.classe.trim();
    if (rascunho.observacao.trim()) dados.reviewNote = rascunho.observacao.trim();
    void decidir(
      "aprovar",
      async () => {
        // A imagem vai primeiro ao armazenamento; a API a publica junto com o sentido.
        if (imagem) {
          setProgressoImagem(0);
          dados.imageKey = await enviarImagem(imagem, setProgressoImagem);
          setProgressoImagem(null);
        }
        return aprovar(palavra.wordId, sentido.senseId, dados);
      },
      `Sentido “${titulo}” aprovado e publicado.`,
    );
  };

  const rejeitarSentido = () => {
    const motivo = rascunho.observacao.trim();
    if (motivo.length < 5) {
      setErro("Escreva o motivo da rejeição (pelo menos 5 caracteres). O colaborador vai ler esta mensagem.");
      return;
    }
    void decidir(
      "rejeitar",
      () => rejeitar(palavra.wordId, sentido.senseId, palavra.version, motivo),
      `Sentido “${sentido.title}” rejeitado.`,
    );
  };

  const marcarGravacao = () =>
    decidir(
      "gravacao",
      () =>
        marcarParaGravacao(
          palavra.wordId,
          sentido.senseId,
          palavra.version,
          rascunho.observacao.trim() || undefined,
        ),
      `Sentido “${sentido.title}” marcado para gravação.`,
    );

  return (
    <div>
      {contribuicao ? (
        <aside className="mb-[22px] grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[10px] border border-[#acd0f4] bg-blue-soft p-[14px] phone:grid-cols-[auto_1fr]">
          <span className="grid size-[42px] place-items-center rounded-[10px] bg-blue text-white">
            <Icone nome="mail" />
          </span>
          <div className="min-w-0">
            <span className="block text-[.76rem] text-muted">
              Enviado por {contribuicao.submitterName} em{" "}
              {formatarData(contribuicao.submittedAt)}
            </span>
            <strong className="block truncate text-[.88rem] text-navy">
              {contribuicao.contactEmail}
            </strong>
            <span className="block text-[.76rem] text-muted">
              {contribuicao.type === "NEW_WORD" ? "Nova palavra" : "Novo sentido"} •{" "}
              {contribuicao.mode === "RECORDING_REQUEST"
                ? "Pediu gravação à equipe"
                : "Enviou vídeo"}
            </span>
            {contribuicao.mode === "VIDEO_UPLOAD" && (
              <div className="mt-3">
                {contribuicao.videoUrl ? (
                  <>
                    {/* Endereço temporário (5 minutos), gerado ao abrir a palavra. */}
                    <video
                      key={contribuicao.videoUrl}
                      src={contribuicao.videoUrl}
                      controls
                      preload="metadata"
                      className="aspect-video w-full rounded-[10px] bg-ink"
                    >
                      Seu navegador não reproduz este vídeo.
                    </video>
                    <small className="mt-1 block text-[.72rem] text-muted">
                      Vídeo enviado pela pessoa, só para análise. Se não
                      carregar, abra a palavra de novo (o link vale 5 minutos).
                      {contribuicao.consentAcceptedAt &&
                        ` Termo de imagem aceito em ${formatarData(contribuicao.consentAcceptedAt)}.`}
                    </small>
                  </>
                ) : (
                  <small className="block text-[.76rem] text-muted">
                    O vídeo enviado já foi apagado depois da decisão.
                    {contribuicao.consentAcceptedAt &&
                      ` Termo de imagem aceito em ${formatarData(contribuicao.consentAcceptedAt)}.`}
                  </small>
                )}
              </div>
            )}
          </div>
          <a
            href={`mailto:${contribuicao.contactEmail}`}
            className={`${classeBotao("secondary")} phone:col-span-full phone:w-full`}
          >
            <span>Enviar e-mail</span>
          </a>
        </aside>
      ) : (
        <p className="mt-0 mb-[22px] rounded-[10px] bg-blue-soft p-[14px] text-[.88rem] text-muted">
          Sentido cadastrado pela equipe • Fonte: {rotuloFonte[sentido.source]}
        </p>
      )}

      {!aberto && (
        <div
          role="status"
          className={`mb-4 flex min-h-[58px] items-start gap-[10px] rounded-[10px] p-3 ${
            sentido.status === "APPROVED"
              ? "bg-[#e8f8ef] text-[#075d39]"
              : "bg-[#fff0ee] text-red"
          }`}
        >
          <Icone nome={sentido.status === "APPROVED" ? "check" : "x"} className="mt-[2px] flex-none" />
          <div>
            <strong className="block">
              {sentido.status === "APPROVED"
                ? "Conteúdo aprovado e publicado"
                : "Conteúdo rejeitado"}
              {sentido.reviewedAt && ` em ${formatarData(sentido.reviewedAt)}`}
            </strong>
            {sentido.reviewNote && (
              <span className="block text-[.88rem]">Observação: {sentido.reviewNote}</span>
            )}
          </div>
        </div>
      )}

      <div className="mb-1 flex items-end justify-between gap-4 phone:flex-col phone:items-start">
        <div>
          <Eyebrow>{aberto ? "Conteúdo editável" : "Conteúdo"}</Eyebrow>
          <h3 className="mt-[3px] mb-0 text-navy">
            {aberto ? "Faça os ajustes necessários" : "Dados do sentido"}
          </h3>
        </div>
        {aberto && (
          <span className="text-[.76rem] text-muted">
            As alterações serão usadas na publicação.
          </span>
        )}
      </div>

      <fieldset disabled={!aberto || ocupado !== null} className="m-0 min-w-0 border-0 p-0">
        <div className="grid grid-cols-2 gap-[14px] phone:grid-cols-1">
          <label className={classeCampo}>
            <span className={classeRotuloCampo}>Nome do sentido *</span>
            <input
              className={classeControle}
              value={rascunho.titulo}
              minLength={3}
              maxLength={80}
              onChange={(e) => mudar("titulo", e.target.value)}
            />
          </label>
          <label className={classeCampo}>
            <span className={classeRotuloCampo}>Classe gramatical</span>
            <input
              className={classeControle}
              value={rascunho.classe}
              maxLength={30}
              list="classes-gramaticais"
              onChange={(e) => mudar("classe", e.target.value)}
            />
            <datalist id="classes-gramaticais">
              {classesGramaticais.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <label className={classeCampo}>
          <span className={classeRotuloCampo}>Definição em português *</span>
          <textarea
            rows={4}
            className={`${classeControle} resize-y`}
            value={rascunho.definicao}
            maxLength={500}
            onChange={(e) => mudar("definicao", e.target.value)}
          />
        </label>
        <label className={classeCampo}>
          <span className={classeRotuloCampo}>Frase de exemplo</span>
          <textarea
            rows={3}
            className={`${classeControle} resize-y`}
            value={rascunho.exemplo}
            maxLength={300}
            onChange={(e) => mudar("exemplo", e.target.value)}
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-[14px] phone:grid-cols-1">
          <div>
            <span className={classeRotuloMidia}>
              <Icone nome="video" /> Vídeo em Libras
            </span>
            {idVideo ? (
              <VideoSinal video={idVideo} titulo={rascunho.titulo} />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#98aec5] bg-white p-4 text-center text-muted">
                <Icone nome="video" tamanho={26} className="text-blue" />
                <strong className="mt-2 text-navy">Sem vídeo</strong>
                <small className="mt-1 block">
                  Cole o link do YouTube abaixo para ver a prévia.
                </small>
              </div>
            )}
            <label className={classeCampo}>
              <span className={classeRotuloCampo}>
                Link do YouTube {aberto && "*"}
              </span>
              <input
                className={classeControle}
                value={rascunho.video}
                placeholder="https://youtu.be/…"
                onChange={(e) => mudar("video", e.target.value)}
                aria-describedby="dica-video"
              />
            </label>
            <small id="dica-video" className="mt-[5px] block text-muted">
              {rascunho.video && !idVideo
                ? "Link não reconhecido. Use um link do YouTube ou o id de 11 caracteres."
                : "Obrigatório para aprovar: nenhum sentido é publicado sem vídeo."}
            </small>
          </div>
          <div>
            <span className={classeRotuloMidia}>
              <Icone nome="image" /> Imagem de apoio
            </span>
            {imagemExibida ? (
              <Image
                src={imagemExibida}
                alt={`Imagem de apoio: ${rascunho.titulo}`}
                width={1200}
                height={800}
                unoptimized
                className="aspect-video w-full rounded-[12px] border border-[#d8e2ee] bg-white object-cover"
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#98aec5] bg-white p-4 text-center text-muted">
                <Icone nome="image" tamanho={26} className="text-blue" />
                <strong className="mt-2 text-navy">Sem imagem</strong>
                {sentido.imageKey && (
                  <small className="mt-1 block break-all">{sentido.imageKey}</small>
                )}
              </div>
            )}
            {aberto && (
              <div className="mt-3 grid">
                <ZonaUpload tipo="image" aoSelecionar={escolherImagem} />
              </div>
            )}
            <small className="mt-[5px] block text-muted" aria-live="polite">
              {!aberto
                ? sentido.imageUrl
                  ? "Imagem publicada com o sentido."
                  : "Sentido sem imagem de apoio."
                : imagem
                  ? "Nova imagem: será publicada junto com o sentido."
                  : sentido.imageUrl
                    ? "Opcional. Escolha outra imagem para trocar."
                    : "Opcional. A imagem é publicada junto com o sentido."}
            </small>
          </div>
        </div>

        {aberto && (
          <label className={classeCampo}>
            <span className={classeRotuloCampo}>
              Observação para o colaborador{" "}
              <span className="font-normal text-muted">(obrigatória para rejeitar)</span>
            </span>
            <textarea
              rows={3}
              className={`${classeControle} resize-y`}
              value={rascunho.observacao}
              maxLength={300}
              placeholder="Ex.: Ajustamos a definição para ficar mais simples."
              onChange={(e) => mudar("observacao", e.target.value)}
            />
          </label>
        )}
      </fieldset>

      {erro && <Alerta>{erro}</Alerta>}

      {aberto && (
        <div className="mt-[18px] grid gap-[9px]">
          {sentido.status === "PENDING" && (
            <Botao
              variante="secondary"
              icone="video"
              disabled={ocupado !== null}
              onClick={marcarGravacao}
            >
              {ocupado === "gravacao" ? "Salvando…" : "Aceitar e marcar para gravação"}
            </Botao>
          )}
          <Botao
            variante="success"
            icone="check"
            disabled={ocupado !== null}
            onClick={aprovarSentido}
          >
            {ocupado !== "aprovar"
              ? "Aprovar e publicar"
              : progressoImagem !== null
                ? `Enviando imagem… ${Math.round(progressoImagem * 100)}%`
                : "Publicando…"}
          </Botao>
          <Botao
            variante="danger"
            icone="x"
            disabled={ocupado !== null}
            onClick={rejeitarSentido}
          >
            {ocupado === "rejeitar" ? "Rejeitando…" : "Rejeitar"}
          </Botao>
        </div>
      )}
    </div>
  );
}
