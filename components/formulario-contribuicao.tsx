"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { lerSessao } from "@/lib/armazenamento";
import {
  categoriasDeContribuicao,
  enviarContribuicao,
  type NovoSentido,
} from "@/lib/contribuicoes";
import { palavras } from "@/lib/palavras";
import { Campo, CampoSelecao, ZonaUpload } from "./campos";
import { Icone } from "./icone";
import { Botao, classeSecao, Eyebrow } from "./ui";

type TipoContribuicao = "palavra" | "sentido";

type EstadoSentido = {
  id: number;
  video: NovoSentido["video"];
  arquivoVideo: string | null;
  arquivoImagem: string | null;
};

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
  video: "upload",
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

export function FormularioContribuicao() {
  const router = useRouter();
  const parametros = useSearchParams();
  const palavraInicial =
    parametros.get("palavra")?.toLocaleUpperCase("pt-BR") ?? "";
  const [tipo, setTipo] = useState<TipoContribuicao>(
    parametros.get("tipo") === "sentido" ? "sentido" : "palavra",
  );
  const [sentidos, setSentidos] = useState<EstadoSentido[]>(() => [
    novoSentido(),
  ]);
  const [enviando, setEnviando] = useState(false);

  const atualizarSentido = (id: number, mudanca: Partial<EstadoSentido>) =>
    setSentidos((lista) =>
      lista.map((s) => (s.id === id ? { ...s, ...mudanca } : s)),
    );

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const texto = (nome: string) => String(dados.get(nome) ?? "").trim();
    setEnviando(true);
    await enviarContribuicao(
      {
        tipo,
        termo: tipo === "palavra" ? texto("termo") : texto("palavra"),
        categoria: texto("categoria"),
        email: texto("email"),
        sentidos: sentidos.map((s) => ({
          nome: texto(`nome-${s.id}`),
          definicao: texto(`definicao-${s.id}`),
          exemplo: texto(`exemplo-${s.id}`),
          fonte: texto(`fonte-${s.id}`),
          video: s.video,
          arquivoVideo: s.arquivoVideo,
          arquivoImagem: s.arquivoImagem,
        })),
      },
      lerSessao(),
    );
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
                  Selecione uma palavra
                </option>
                {palavras.map((p) => (
                  <option key={p.slug}>{p.titulo}</option>
                ))}
              </CampoSelecao>
            )}
            <CampoSelecao
              rotulo="Categoria *"
              name="categoria"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {categoriasDeContribuicao.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </CampoSelecao>
          </div>
          <Campo
            rotulo="E-mail para contato *"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            required
          />
          <p className="mt-[6px] mb-0 text-[.8rem] text-muted">
            Usaremos este e-mail somente para informar o resultado da revisão.
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
                  <span className="block text-[.8rem] font-extrabold text-orange uppercase">
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
              />
              <Campo
                rotulo="Definição em português *"
                name={`definicao-${sentido.id}`}
                placeholder="Explique com frases curtas e palavras fáceis."
                multilinha
                required
              />
              <Campo
                rotulo="Frase de exemplo"
                name={`exemplo-${sentido.id}`}
                placeholder="Ex.: Eu fui ao banco pagar uma conta."
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
                    aoSelecionar={(nome) =>
                      atualizarSentido(sentido.id, { arquivoVideo: nome })
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
                  aoSelecionar={(nome) =>
                    atualizarSentido(sentido.id, { arquivoImagem: nome })
                  }
                />
              </div>
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
          <Botao
            type="submit"
            icone="check"
            className="mt-4 w-full"
            disabled={enviando}
          >
            Enviar para aprovação
          </Botao>
          <p className="mt-[10px] mb-0 text-center text-[.8rem] text-muted">
            Seu conteúdo será analisado por uma pessoa moderadora antes da
            publicação.
          </p>
        </form>
      </section>
    </main>
  );
}
