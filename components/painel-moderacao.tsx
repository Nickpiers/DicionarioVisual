"use client";

import Image from "next/image";
import { useState } from "react";
import {
  categoriasDeModeracao,
  decidir,
  formatarData,
  iniciais,
  porSituacao,
  salvarAjustes,
  situacoes,
  useContribuicoes,
  type CamposEditaveis,
  type Contribuicao,
  type Situacao,
} from "@/lib/contribuicoes";
import { IMAGEM_SINALIZANTE, imagensDeApoio } from "@/lib/palavras";
import { classeCampo, classeControle, classeRotuloCampo } from "./campos";
import { Icone } from "./icone";
import {
  Botao,
  classeBotaoPlay,
  classeControlesVideo,
  classePlayer,
  classeRotuloMidia,
  classeSecao,
  Eyebrow,
} from "./ui";

const coresSituacao: Record<Situacao, string> = {
  Pendente: "bg-[#fff1c7] text-[#884008]",
  Aprovado: "bg-[#e8f8ef] text-[#075d39]",
  Rejeitado: "bg-[#fff0ee] text-red",
};

function EtiquetaSituacao({
  situacao,
  className = "",
}: {
  situacao: Situacao;
  className?: string;
}) {
  return (
    <span
      className={`rounded-[99px] px-2 py-[5px] text-center text-[.72rem] font-extrabold ${coresSituacao[situacao]} ${className}`}
    >
      {situacao}
    </span>
  );
}

const campos = (c: Contribuicao): CamposEditaveis => ({
  termo: c.termo,
  sentido: c.sentido,
  categoria: c.categoria,
  definicao: c.definicao,
  exemplo: c.exemplo,
  fonte: c.fonte,
  arquivoVideo: c.arquivoVideo,
  arquivoImagem: c.arquivoImagem,
});

const classeAcaoArquivo =
  "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-[14px] py-[10px] font-extrabold text-navy hover:border-blue hover:bg-blue-soft";

/** Painel de revisão de uma contribuição (.review-panel). */
function PainelRevisao({ contribuicao }: { contribuicao: Contribuicao }) {
  const [rascunho, setRascunho] = useState(() => campos(contribuicao));
  const [salvo, setSalvo] = useState(false);
  const pendente = contribuicao.situacao === "Pendente";
  const opcoesCategoria = categoriasDeModeracao.includes(rascunho.categoria)
    ? categoriasDeModeracao
    : [...categoriasDeModeracao, rascunho.categoria];

  const mudar = (campo: keyof CamposEditaveis, valor: string) => {
    setSalvo(false);
    setRascunho((r) => ({ ...r, [campo]: valor }));
  };

  return (
    <aside className="col-[1] row-[1] rounded-[14px] border border-line bg-white p-[22px] shadow-card phone:p-4">
      <div className="mb-[18px] flex items-start justify-between gap-[10px]">
        <div>
          <Eyebrow>Revisar submissão</Eyebrow>
          <h2 className="my-[3px] text-navy">
            {rascunho.termo.toLocaleUpperCase("pt-BR")}
          </h2>
          <p className="m-0 text-[.85rem] text-muted">
            Enviado por {contribuicao.pessoa}
          </p>
        </div>
        <EtiquetaSituacao situacao={contribuicao.situacao} />
      </div>

      <aside className="mb-[22px] grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[10px] border border-[#acd0f4] bg-blue-soft p-[14px] phone:grid-cols-[auto_1fr]">
        <span className="block size-[42px] place-items-center rounded-[10px] bg-blue text-white">
          <Icone nome="mail" />
        </span>
        <div>
          <span className="block text-[.76rem] text-muted">
            Contato do solicitante
          </span>
          <strong className="block text-[.88rem] text-navy">
            {contribuicao.email}
          </strong>
        </div>
        <Botao
          variante="secondary"
          className="phone:col-span-full phone:w-full [&>span]:block"
          onClick={() => {
            window.location.href = `mailto:${contribuicao.email}`;
          }}
        >
          Enviar e-mail
        </Botao>
      </aside>

      <div className="mb-1 flex items-end justify-between gap-4 phone:flex-col phone:items-start">
        <div>
          <Eyebrow>Conteúdo editável</Eyebrow>
          <h3 className="mt-[3px] mb-0 text-navy">
            Faça os ajustes necessários
          </h3>
        </div>
        <span className="text-[.76rem] text-muted">
          As alterações serão usadas na publicação.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-[14px] phone:grid-cols-1">
        <label className={classeCampo}>
          <span className={classeRotuloCampo}>Palavra *</span>
          <input
            className={classeControle}
            value={rascunho.termo}
            onChange={(e) => mudar("termo", e.target.value)}
          />
        </label>
        <label className={classeCampo}>
          <span className={classeRotuloCampo}>Nome do sentido *</span>
          <input
            className={classeControle}
            value={rascunho.sentido}
            onChange={(e) => mudar("sentido", e.target.value)}
          />
        </label>
      </div>
      <label className={classeCampo}>
        <span className={classeRotuloCampo}>Categoria *</span>
        <select
          className={classeControle}
          value={rascunho.categoria}
          onChange={(e) => mudar("categoria", e.target.value)}
        >
          {opcoesCategoria.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className={classeCampo}>
        <span className={classeRotuloCampo}>Definição em português *</span>
        <textarea
          rows={4}
          className={`${classeControle} resize-y`}
          value={rascunho.definicao}
          onChange={(e) => mudar("definicao", e.target.value)}
        />
      </label>
      <label className={classeCampo}>
        <span className={classeRotuloCampo}>Frase de exemplo *</span>
        <textarea
          rows={3}
          className={`${classeControle} resize-y`}
          value={rascunho.exemplo}
          onChange={(e) => mudar("exemplo", e.target.value)}
        />
      </label>
      <label className={classeCampo}>
        <span className={classeRotuloCampo}>Fonte ou referência *</span>
        <input
          className={classeControle}
          value={rascunho.fonte}
          onChange={(e) => mudar("fonte", e.target.value)}
        />
      </label>

      <div className="mt-5 grid grid-cols-2 gap-[14px] phone:grid-cols-1">
        <div>
          <span className={classeRotuloMidia}>
            <Icone nome="video" /> Vídeo em Libras
          </span>
          <div
            className={`${classePlayer} mb-[10px] min-h-[240px] phone:min-h-[250px]`}
          >
            <Image
              src={IMAGEM_SINALIZANTE}
              alt="Prévia do vídeo em Libras enviado"
              fill
              unoptimized
              sizes="(max-width: 600px) 100vw, 360px"
              className="object-cover object-[center_30%]"
            />
            <button
              type="button"
              className={classeBotaoPlay}
              aria-label="Reproduzir vídeo"
            >
              <Icone nome="play" />
            </button>
            <div className={classeControlesVideo}>
              <Icone nome="play" />
              <span className="h-1 flex-1 rounded-[99px] bg-white/35">
                <i className="block h-full w-[35%] rounded-[inherit] bg-white" />
              </span>
              <Icone nome="volume" />
              <Icone nome="expand" />
            </div>
          </div>
          <label className={classeAcaoArquivo}>
            <input
              type="file"
              accept="video/*"
              className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)]"
              onChange={(e) =>
                mudar(
                  "arquivoVideo",
                  e.target.files?.[0]?.name || rascunho.arquivoVideo,
                )
              }
            />
            <Icone nome="upload" />
            <span>Substituir vídeo</span>
          </label>
          <small className="mt-[5px] block text-center text-muted">
            {rascunho.arquivoVideo}
          </small>
        </div>
        <div>
          <span className={classeRotuloMidia}>
            <Icone nome="image" /> Imagem de apoio
          </span>
          <Image
            src={imagensDeApoio.escritorio.src}
            alt="Prévia da imagem enviada"
            width={1200}
            height={800}
            unoptimized
            className="mb-[10px] h-[240px] w-full rounded-[10px] object-cover"
          />
          <label className={classeAcaoArquivo}>
            <input
              type="file"
              accept="image/*"
              className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)]"
              onChange={(e) =>
                mudar(
                  "arquivoImagem",
                  e.target.files?.[0]?.name || rascunho.arquivoImagem,
                )
              }
            />
            <Icone nome="upload" />
            <span>Substituir imagem</span>
          </label>
          <small className="mt-[5px] block text-center text-muted">
            {rascunho.arquivoImagem}
          </small>
        </div>
      </div>

      <Botao
        icone="check"
        className="mt-4 w-full"
        onClick={async () => {
          await salvarAjustes(contribuicao.id, rascunho);
          setSalvo(true);
        }}
      >
        Salvar ajustes
      </Botao>
      {salvo && (
        <div
          className="mt-[10px] flex items-center justify-center gap-2 rounded-[9px] bg-[#e8f8ef] p-3 font-extrabold text-[#075d39]"
          role="status"
        >
          <Icone nome="check" />
          <span>Ajustes salvos com sucesso.</span>
        </div>
      )}
      {pendente ? (
        <div className="mt-[18px] grid gap-[9px]">
          <Botao
            variante="success"
            icone="check"
            onClick={() => decidir(contribuicao.id, "Aprovado", rascunho)}
          >
            Aprovar e publicar
          </Botao>
          <Botao
            variante="danger"
            icone="x"
            onClick={() => decidir(contribuicao.id, "Rejeitado", rascunho)}
          >
            Rejeitar
          </Botao>
        </div>
      ) : (
        <div
          role="status"
          className={`mt-[18px] flex min-h-[58px] items-center gap-[10px] rounded-[10px] p-3 ${
            contribuicao.situacao === "Aprovado"
              ? "bg-[#e8f8ef] text-[#075d39]"
              : "bg-[#fff0ee] text-red"
          }`}
        >
          <Icone nome={contribuicao.situacao === "Aprovado" ? "check" : "x"} />
          <strong>
            {contribuicao.situacao === "Aprovado"
              ? "Conteúdo aprovado para publicação"
              : "Conteúdo rejeitado"}
          </strong>
        </div>
      )}
    </aside>
  );
}

export function PainelModeracao() {
  const contribuicoes = useContribuicoes();
  const [aba, setAba] = useState<Situacao>("Pendente");
  const lista = porSituacao(contribuicoes, aba);
  const [selecionada, setSelecionada] = useState<string | null>(
    lista[0]?.id ?? null,
  );
  const atual = contribuicoes.find((c) => c.id === selecionada);
  const pendentes = porSituacao(contribuicoes, "Pendente").length;

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
          </div>
          <div className="flex h-[82px] w-[92px] flex-col items-center justify-center rounded-[14px] bg-orange text-white phone:h-[58px] phone:w-full phone:flex-row phone:gap-2">
            <strong className="text-[1.8rem] leading-none">{pendentes}</strong>
            <span className="text-[.8rem]">
              {pendentes === 1 ? "pendente" : "pendentes"}
            </span>
          </div>
        </div>

        <div
          className="mb-5 flex gap-2 border-b border-line phone:overflow-x-auto"
          role="tablist"
        >
          {situacoes.map(({ situacao, aba: rotulo }) => (
            <button
              key={situacao}
              type="button"
              role="tab"
              aria-selected={aba === situacao}
              onClick={() => {
                setAba(situacao);
                setSelecionada(
                  porSituacao(contribuicoes, situacao)[0]?.id ?? selecionada,
                );
              }}
              className={`flex min-h-[50px] items-center gap-2 border-0 border-b-[3px] bg-transparent px-[18px] font-extrabold phone:px-3 phone:whitespace-nowrap ${
                aba === situacao
                  ? "border-navy text-navy"
                  : "border-transparent"
              }`}
            >
              {rotulo}
              <span className="min-w-6 rounded-[99px] bg-[#e1e8f0] px-[6px] py-[2px] text-[.76rem]">
                {porSituacao(contribuicoes, situacao).length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(380px,.75fr)] items-start gap-5 tablet:mx-auto tablet:max-w-[680px] tablet:grid-cols-1 tablet:gap-10">
          <section className="col-[2] overflow-hidden rounded-[14px] border border-line bg-white shadow-card tablet:col-[1] tablet:row-[2]">
            <div className="flex min-h-[68px] items-center justify-between border-b border-line px-5 py-[15px] phone:flex-col phone:items-start">
              <h2 className="m-0 text-[1.2rem]">
                {situacoes.find((s) => s.situacao === aba)?.aba}
              </h2>
              <span className="text-[.8rem] text-muted">
                Mais recentes primeiro
              </span>
            </div>
            {lista.length === 0 && (
              <p className="m-0 border-b border-line px-5 py-6 text-muted">
                Nenhuma contribuição nesta lista.
              </p>
            )}
            {lista.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-current={selecionada === c.id ? "true" : undefined}
                onClick={() => setSelecionada(c.id)}
                className={`grid min-h-[84px] w-full grid-cols-[44px_1fr_130px_80px_82px] items-center gap-[10px] border-0 border-b border-line px-[18px] py-3 text-left hover:bg-blue-soft phone:grid-cols-[44px_1fr_auto] ${
                  selecionada === c.id ? "bg-blue-soft" : "bg-white"
                }`}
              >
                <span className="grid size-10 place-items-center rounded-full bg-blue font-extrabold text-white">
                  {iniciais(c.pessoa)}
                </span>
                <span>
                  <strong className="block">{c.termo}</strong>
                  <small className="block text-[.8rem] text-muted">
                    {c.pessoa}
                  </small>
                </span>
                <span className="flex items-center gap-[5px] text-[.8rem] text-muted phone:col-[2]">
                  <Icone nome="calendar" />
                  {formatarData(c.data)}
                </span>
                <EtiquetaSituacao
                  situacao={c.situacao}
                  className="phone:col-[3] phone:row-[1]"
                />
                <span className="flex items-center text-[.82rem] font-extrabold text-blue phone:col-[3] phone:row-[2]">
                  Revisar <Icone nome="arrow" />
                </span>
              </button>
            ))}
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

          {atual && <PainelRevisao key={atual.id} contribuicao={atual} />}
        </div>
      </section>
    </main>
  );
}
