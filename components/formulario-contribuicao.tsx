"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { classesGramaticais, enviarContribuicao } from "@/lib/contribuicoes";
import { capitalizar } from "@/lib/palavras";
import { useSessao } from "@/lib/sessao";
import { AvisoVerificacao } from "./aviso-verificacao";
import { Alerta, Campo, CampoSelecao, ZonaUpload } from "./campos";
import { Icone } from "./icone";
import { Botao, classeLinkTexto, classeSecao, Eyebrow } from "./ui";

type TipoContribuicao = "palavra" | "sentido";

/** Palavra publicada, para escolher ao sugerir um novo sentido. */
export type OpcaoPalavra = { slug: string; titulo: string };

type EstadoSentido = {
  id: number;
  /**
   * "upload": a pessoa envia o vídeo (direto ao armazenamento, com o aceite do
   * termo de imagem). "comissao": pede que a equipe grave o sinal. A imagem
   * ainda não é enviada pela API.
   */
  video: "upload" | "comissao";
  arquivoVideo: File | null;
  arquivoImagem: File | null;
};

/** Só letras, espaços e hífens (regra da API). */
const TERMO_VALIDO = "[\\p{L}][\\p{L} \\-]*";
/** No máximo 5 palavras (regra da API). */
const termoTemMaisDe5Palavras = (termo: string) =>
  termo.trim().split(/[\s-]+/).filter(Boolean).length > 5;

const passos = [
  "Envie a palavra e os significados",
  "Nossa equipe revisa o conteúdo",
  "A palavra é publicada para todos",
];

const classeNumeroSecao =
  "grid size-8 flex-none place-items-center rounded-full font-extrabold";

const classeOpcao = (ativa: boolean) =>
  `flex min-h-[82px] cursor-pointer items-center gap-[10px] rounded-[10px] border-2 p-3 ${
    ativa
      ? "border-blue bg-blue-soft text-navy"
      : "border-line bg-white text-muted"
  }`;

let proximoId = 1;
const novoSentido = (): EstadoSentido => ({
  id: proximoId++,
  video: "comissao",
  arquivoVideo: null,
  arquivoImagem: null,
});

function SecaoFormulario({
  numero,
  titulo,
  descricao,
}: {
  numero: number;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`${classeNumeroSecao} bg-navy text-white`}>
        {numero}
      </span>
      <div>
        <h2 className="m-0 text-[1.25rem]">{titulo}</h2>
        <p className="mt-[2px] mb-0 text-muted">{descricao}</p>
      </div>
    </div>
  );
}

export function FormularioContribuicao({
  palavras,
}: {
  palavras: OpcaoPalavra[];
}) {
  const router = useRouter();
  const parametros = useSearchParams();
  const sessao = useSessao();
  const usuario = sessao.status === "autenticado" ? sessao.usuario : undefined;
  const podeEnviar = usuario?.emailVerified === true;
  const palavraInicial =
    parametros.get("palavra")?.toLocaleUpperCase("pt-BR") ?? "";
  const [tipo, setTipo] = useState<TipoContribuicao>(
    parametros.get("tipo") === "sentido" ? "sentido" : "palavra",
  );
  const [sentidos, setSentidos] = useState<EstadoSentido[]>(() => [
    novoSentido(),
  ]);
  const [enviando, setEnviando] = useState(false);
  /** Progresso do vídeo sendo enviado agora (sentido e porcentagem), para o botão. */
  const [progresso, setProgresso] = useState<{ sentido: number; porcento: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const atualizarSentido = (id: number, mudanca: Partial<EstadoSentido>) =>
    setSentidos((lista) =>
      lista.map((s) => (s.id === id ? { ...s, ...mudanca } : s)),
    );

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const texto = (nome: string) => String(dados.get(nome) ?? "").trim();
    const termo = tipo === "palavra" ? texto("termo") : texto("palavra");
    if (termoTemMaisDe5Palavras(termo)) {
      setErro("A palavra ou expressão pode ter no máximo 5 palavras.");
      return;
    }
    if (sentidos.some((s) => s.video === "upload" && !s.arquivoVideo)) {
      setErro(
        "Selecione o vídeo em Libras de cada sentido marcado como “Vou enviar o vídeo”, ou escolha “Solicitar gravação”.",
      );
      return;
    }
    setEnviando(true);
    setErro(null);
    const { enviados, falha } = await enviarContribuicao(
      {
        termo,
        classeGramatical: texto("categoria"),
        // Fonte, e-mail de contato e imagem ainda não existem na API.
        sentidos: sentidos.map((s) => ({
          nome: texto(`nome-${s.id}`),
          definicao: texto(`definicao-${s.id}`),
          exemplo: texto(`exemplo-${s.id}`),
          video: s.video === "upload" ? s.arquivoVideo : null,
        })),
      },
      (indice, fracao) =>
        setProgresso(
          fracao < 1 ? { sentido: indice + 1, porcento: Math.round(fracao * 100) } : null,
        ),
    );
    setProgresso(null);

    if (falha) {
      // Tira da tela o que já foi enviado, para tentar de novo só o resto.
      setSentidos(sentidos.slice(falha.indice));
      setErro(
        enviados.length > 0
          ? `${enviados.length} ${enviados.length === 1 ? "sentido foi enviado" : "sentidos foram enviados"}, mas o seguinte não: ${falha.erro.detail}`
          : falha.erro.detail,
      );
      setEnviando(false);
      return;
    }

    // A rota fica preservada em segundo plano (Activity): volta limpa no próximo pedido.
    formulario.reset();
    setSentidos([novoSentido()]);
    setTipo("palavra");
    setEnviando(false);
    router.push("/contribuir/enviado");
  };

  return (
    <main className="bg-canvas">
      <section
        className={`${classeSecao} grid grid-cols-[minmax(240px,.65fr)_minmax(500px,1.35fr)] items-start gap-12 tablet:grid-cols-1 phone:gap-6`}
      >
        <div className="sticky top-[108px] tablet:static">
          <Eyebrow>Contribua com a comunidade</Eyebrow>
          <h1 className="mt-2 mb-4 text-[clamp(2.2rem,4vw,3.7rem)] text-navy">
            Compartilhe uma palavra e seus sentidos.
          </h1>
          <p className="text-[1.1rem] text-muted">
            Sua contribuição será revisada antes de entrar no dicionário.
          </p>
          <Link href="/contribuir/minhas" className={classeLinkTexto}>
            <Icone nome="book" />
            Acompanhar minhas contribuições
          </Link>
          <div className="mt-7 rounded-[14px] bg-navy p-5 text-white tablet:grid tablet:grid-cols-3 tablet:gap-3 phone:block">
            <strong className="mb-[14px] block tablet:col-span-full">
              Como funciona
            </strong>
            {passos.map((passo, indice) => (
              <div
                key={passo}
                className="flex items-center gap-3 tablet:items-start"
              >
                <span className={`${classeNumeroSecao} bg-white text-navy`}>
                  {indice + 1}
                </span>
                <p className="my-2 text-[#dbeaff]">{passo}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          className="rounded-[14px] border border-line bg-white p-[30px] shadow-card phone:px-[14px] phone:py-[18px]"
          onSubmit={enviar}
        >
          <AvisoVerificacao className="mt-0 mb-6" />
          <div
            className="mb-7 grid grid-cols-2 gap-[10px] phone:grid-cols-1"
            role="tablist"
            aria-label="Tipo de contribuição"
          >
            {(
              [
                ["palavra", "plus", "Nova palavra", "Cadastrar um termo novo"],
                [
                  "sentido",
                  "book",
                  "Novo significado",
                  "Ampliar uma palavra existente",
                ],
              ] as const
            ).map(([valor, icone, titulo, descricao]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={tipo === valor}
                onClick={() => setTipo(valor)}
                className={`flex min-h-[78px] items-center gap-3 rounded-[11px] border-2 px-[14px] py-3 text-left ${
                  tipo === valor
                    ? "border-blue bg-blue-soft text-navy"
                    : "border-line bg-white text-muted"
                }`}
              >
                <Icone nome={icone} />
                <span>
                  <strong className="block">{titulo}</strong>
                  <small className="mt-[2px] block text-[.76rem] text-muted">
                    {descricao}
                  </small>
                </span>
              </button>
            ))}
          </div>

          <SecaoFormulario
            numero={1}
            titulo={
              tipo === "palavra"
                ? "Sobre a palavra"
                : "Escolha a palavra existente"
            }
            descricao={
              tipo === "palavra"
                ? "Comece com as informações principais."
                : "O novo significado será associado a este termo."
            }
          />
          <div className="mt-5 grid grid-cols-2 gap-4 phone:grid-cols-1">
            {tipo === "palavra" ? (
              <Campo
                rotulo="Termo ou palavra *"
                name="termo"
                placeholder="Ex.: Banco"
                required
                maxLength={60}
                pattern={TERMO_VALIDO}
                title="Use só letras, espaços e hífens (no máximo 5 palavras)."
              />
            ) : (
              <CampoSelecao
                rotulo="Palavra cadastrada *"
                name="palavra"
                required
                defaultValue={
                  palavras.some((p) => p.titulo === palavraInicial)
                    ? palavraInicial
                    : ""
                }
              >
                <option value="" disabled>
                  {palavras.length > 0
                    ? "Selecione uma palavra"
                    : "Não foi possível carregar as palavras"}
                </option>
                {palavras.map((p) => (
                  <option key={p.slug} value={p.titulo}>
                    {capitalizar(p.titulo)}
                  </option>
                ))}
              </CampoSelecao>
            )}
            <CampoSelecao
              rotulo="Classe gramatical *"
              name="categoria"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Selecione uma classe
              </option>
              {classesGramaticais.map((c) => (
                <option key={c} value={c}>
                  {capitalizar(c)}
                </option>
              ))}
            </CampoSelecao>
          </div>
          <Campo
            key={usuario?.email}
            rotulo="E-mail para contato *"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            defaultValue={usuario?.email}
            readOnly
            required
          />
          <p className="mt-[6px] mb-0 text-[.8rem] text-muted">
            Usaremos o e-mail da sua conta somente para informar o resultado da
            revisão.
          </p>
          <div className="my-7 h-px bg-line" />

          <SecaoFormulario
            numero={2}
            titulo="Sentidos da palavra"
            descricao="Adicione cada significado com Libras, imagem e texto simples."
          />
          {sentidos.map((sentido, indice) => (
            <section
              key={sentido.id}
              className="mt-5 rounded-[14px] border border-[#efc6b6] bg-[#fffaf8] p-5"
            >
              <div className="flex justify-between">
                <div>
                  <span className="block text-[.8rem] font-extrabold text-orange-strong uppercase">
                    Sentido {indice + 1}
                  </span>
                  <strong className="block">Qual é este significado?</strong>
                </div>
                {indice > 0 && (
                  <button
                    type="button"
                    aria-label={`Remover sentido ${indice + 1}`}
                    className="grid size-12 place-items-center rounded-[8px] border-0 bg-orange-soft text-red"
                    onClick={() =>
                      setSentidos((lista) =>
                        lista.filter((s) => s.id !== sentido.id),
                      )
                    }
                  >
                    <Icone nome="x" />
                  </button>
                )}
              </div>
              <Campo
                rotulo="Nome do sentido *"
                name={`nome-${sentido.id}`}
                placeholder="Ex.: Instituição financeira"
                required
                minLength={3}
                maxLength={80}
              />
              <Campo
                rotulo="Definição em português *"
                name={`definicao-${sentido.id}`}
                placeholder="Explique com frases curtas e palavras fáceis."
                multilinha
                required
                minLength={10}
                maxLength={500}
              />
              <Campo
                rotulo="Frase de exemplo"
                name={`exemplo-${sentido.id}`}
                placeholder="Ex.: Eu fui ao banco pagar uma conta."
                maxLength={300}
              />
              <Campo
                rotulo="Fonte ou referência"
                name={`fonte-${sentido.id}`}
                placeholder="Ex.: INES, material didático ou autoria própria"
              />
              <fieldset className="mx-0 mt-[18px] mb-0 grid grid-cols-2 gap-[10px] border-0 p-0 phone:grid-cols-1">
                <legend className="mb-2 font-extrabold">
                  Como o vídeo em Libras será produzido? *
                </legend>
                <label className={classeOpcao(sentido.video === "upload")}>
                  <input
                    type="radio"
                    name={`video-option-${sentido.id}`}
                    checked={sentido.video === "upload"}
                    onChange={() =>
                      atualizarSentido(sentido.id, { video: "upload" })
                    }
                    className="size-5 flex-none accent-blue"
                  />
                  <Icone nome="upload" />
                  <span>
                    <strong className="block">Vou enviar o vídeo</strong>
                    <small className="block text-[.75rem] leading-[1.35] text-muted">
                      Envie uma gravação com sinalização humana.
                    </small>
                  </span>
                </label>
                <label className={classeOpcao(sentido.video === "comissao")}>
                  <input
                    type="radio"
                    name={`video-option-${sentido.id}`}
                    checked={sentido.video === "comissao"}
                    onChange={() =>
                      atualizarSentido(sentido.id, { video: "comissao" })
                    }
                    className="size-5 flex-none accent-blue"
                  />
                  <Icone nome="video" />
                  <span>
                    <strong className="block">Solicitar gravação</strong>
                    <small className="block text-[.75rem] leading-[1.35] text-muted">
                      A comissão produzirá o vídeo após aprovar o pedido.
                    </small>
                  </span>
                </label>
              </fieldset>
              <div className="mt-[18px] grid grid-cols-2 gap-[14px] phone:grid-cols-1">
                {sentido.video === "upload" ? (
                  <ZonaUpload
                    tipo="video"
                    aoSelecionar={(arquivo) =>
                      atualizarSentido(sentido.id, { arquivoVideo: arquivo })
                    }
                  />
                ) : (
                  <div className="flex min-h-[170px] flex-col items-center justify-center rounded-[12px] border border-[#8ac9a9] bg-[#e8f8ef] p-[18px] text-center text-[#075d39]">
                    <Icone nome="check" tamanho={26} />
                    <strong>Gravação pela comissão</strong>
                    <p className="mt-1 mb-0 text-[.8rem]">
                      Você não precisa enviar um vídeo agora.
                    </p>
                  </div>
                )}
                <ZonaUpload
                  tipo="image"
                  aoSelecionar={(arquivo) =>
                    atualizarSentido(sentido.id, { arquivoImagem: arquivo })
                  }
                />
              </div>
              {sentido.arquivoImagem && (
                <Alerta tipo="info">
                  O envio de imagem pelo site ainda não está disponível: a
                  imagem escolhida não será enviada. A equipe escolhe a imagem
                  ao publicar.
                </Alerta>
              )}
              {sentido.video === "upload" && (
                <label className="mt-[22px] flex items-start gap-[10px] rounded-[9px] bg-orange-soft p-3 text-[.88rem]">
                  <input
                    type="checkbox"
                    required
                    className="size-[22px] flex-none accent-navy"
                  />
                  <span>
                    Autorizo o uso da minha imagem e voz, quando houver, para
                    publicação deste vídeo no Dicionário Libras.
                  </span>
                </label>
              )}
            </section>
          ))}
          <Botao
            variante="secondary"
            icone="plus"
            className="mt-4 w-full"
            onClick={() => setSentidos((lista) => [...lista, novoSentido()])}
          >
            Adicionar outro sentido
          </Botao>
          <label className="mt-[22px] flex items-start gap-[10px] text-[.88rem]">
            <input
              type="checkbox"
              required
              className="size-[22px] flex-none accent-navy"
            />
            <span>
              Confirmo que as informações são verdadeiras e que o conteúdo
              enviado pode ser usado no Dicionário Libras.
            </span>
          </label>
          {erro && <Alerta>{erro}</Alerta>}
          <Botao
            type="submit"
            icone="check"
            className="mt-4 w-full"
            disabled={enviando || !podeEnviar}
          >
            {progresso
              ? `Enviando vídeo${sentidos.length > 1 ? ` do sentido ${progresso.sentido}` : ""}… ${progresso.porcento}%`
              : enviando
                ? "Enviando…"
                : "Enviar para aprovação"}
          </Botao>
          {!podeEnviar && usuario && (
            <p className="mt-[10px] mb-0 text-center text-[.8rem] font-extrabold text-[#6b4300]">
              Confirme seu e-mail para liberar o envio.
            </p>
          )}
          <p className="mt-[10px] mb-0 text-center text-[.8rem] text-muted">
            Seu conteúdo será analisado por uma pessoa moderadora antes da
            publicação.
          </p>
        </form>
      </section>
    </main>
  );
}
