"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { registrarRecente } from "@/lib/armazenamento";
import {
  IMAGEM_APOIO_PADRAO,
  textoDaFonte,
  type Palavra,
} from "@/lib/palavras";
import { Icone } from "./icone";
import { classeBotao, classeRotuloMidia, Eyebrow } from "./ui";
import { VideoSinal } from "./video-sinal";

const classeSeta =
  "flex min-h-[76px] items-center justify-center gap-2 border-0 bg-orange-soft px-[18px] py-[10px] font-extrabold text-navy enabled:hover:bg-orange enabled:hover:text-white disabled:cursor-not-allowed disabled:bg-[#f1f3f6] disabled:text-[#788696] phone:min-h-[68px] phone:p-2";

/** Navegação entre sentidos e cartão do sentido ativo. */
export function ConsultaSentidos({ palavra }: { palavra: Palavra }) {
  const [ativo, setAtivo] = useState(0);
  const sentido = palavra.sentidos[ativo];
  const total = palavra.sentidos.length;
  const imagem = sentido.imagem
    ? { src: sentido.imagem, alt: `Imagem de apoio: ${sentido.curto}` }
    : IMAGEM_APOIO_PADRAO;

  useEffect(() => {
    registrarRecente({
      slug: palavra.slug,
      titulo: palavra.titulo,
      sentidos: palavra.sentidos.length,
    });
  }, [palavra.slug, palavra.titulo, palavra.sentidos.length]);

  return (
    <>
      <div
        className="mb-[18px] grid min-h-[76px] grid-cols-[minmax(132px,auto)_1fr_minmax(132px,auto)] items-stretch overflow-hidden rounded-[12px] border border-[#efc6b6] bg-white phone:min-h-[68px] phone:grid-cols-[64px_1fr_64px]"
        aria-label="Navegação entre os sentidos"
      >
        <button
          type="button"
          className={`${classeSeta} border-r border-[#efc6b6]`}
          onClick={() => setAtivo(ativo - 1)}
          disabled={ativo === 0}
          aria-label="Ver sentido anterior"
        >
          <Icone nome="arrow" tamanho={26} className="rotate-180" />
          <span className="phone:sr-only">Anterior</span>
        </button>
        <div
          className="flex min-w-0 flex-col items-center justify-center px-[18px] py-[10px] text-center phone:px-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-[.76rem] font-extrabold tracking-[.06em] text-orange uppercase">
            Sentido {ativo + 1} de {total}
          </span>
          <strong className="text-[1.08rem] text-navy">{sentido.curto}</strong>
        </div>
        <button
          type="button"
          className={`${classeSeta} border-l border-[#efc6b6]`}
          onClick={() => setAtivo(ativo + 1)}
          disabled={ativo === total - 1}
          aria-label="Ver próximo sentido"
        >
          <span className="phone:sr-only">Próximo</span>
          <Icone nome="arrow" tamanho={26} />
        </button>
      </div>

      <section className="rounded-[14px] border border-[#efc6b6] bg-white p-6 shadow-card phone:p-[14px]">
        <div className="mb-[18px] flex items-center gap-[14px] border-b border-[#f0d8cf] pb-4 phone:flex-col phone:items-start">
          <span className="rounded-[8px] bg-orange px-3 py-2 font-extrabold text-white">
            Sentido {ativo + 1}
          </span>
          <div>
            {sentido.categoria && <Eyebrow>{sentido.categoria}</Eyebrow>}
            <h2 className="mt-[2px] mb-0">{sentido.titulo}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 tablet:grid-cols-1">
          <div>
            <span className={classeRotuloMidia}>
              <Icone nome="video" /> Sinal em Libras
            </span>
            <VideoSinal video={sentido.video} titulo={sentido.titulo} />
            <p className="mt-2 mb-0 flex gap-[7px] text-[.8rem] text-muted">
              <Icone nome="info" />O vídeo apresenta primeiro a representação do
              sinal e em seguida o sinal em uma frase.
            </p>
          </div>

          <div>
            <span className={classeRotuloMidia}>
              <Icone nome="image" /> Imagem de apoio
            </span>
            <Image
              src={imagem.src}
              alt={imagem.alt}
              width={1200}
              height={800}
              unoptimized
              loading="eager"
              sizes="(max-width: 900px) 100vw, 440px"
              className="h-[190px] w-full rounded-[12px] object-cover tablet:h-[300px] phone:h-[190px]"
            />
            <div className="p-[18px]">
              <Eyebrow>O que significa?</Eyebrow>
              <p className="text-[1.06rem]">{sentido.definicao}</p>
              {sentido.exemplo && (
                <div className="rounded-[10px] bg-orange-soft p-[14px]">
                  <strong>Exemplo em português</strong>
                  <p className="mt-1 mb-0">“{sentido.exemplo}”</p>
                </div>
              )}
              <p className="mt-[14px] mb-0 flex items-center gap-[7px] border-t border-line pt-3 text-[1.06rem] text-muted">
                <Icone nome="shield" className="flex-none" />
                {textoDaFonte[sentido.fonte]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[14px] border border-[#acd0f4] bg-blue-soft p-[18px] phone:grid-cols-[auto_1fr]">
        <span className="grid size-12 place-items-center rounded-full bg-blue text-white">
          <Icone nome="plus" tamanho={26} />
        </span>
        <div>
          <strong>{`Conhece outro significado para ${palavra.titulo}?`}</strong>
          <p className="mt-[2px] mb-0 text-muted">
            Envie um novo sentido para ampliar esta palavra no dicionário.
          </p>
        </div>
        <Link
          href={`/contribuir?tipo=sentido&palavra=${encodeURIComponent(palavra.titulo)}`}
          className={`${classeBotao("primary")} phone:col-span-full phone:w-full`}
        >
          <Icone nome="plus" />
          <span>Adicionar novo sentido</span>
        </Link>
      </aside>

      <aside className="mt-4 flex gap-[14px] rounded-[14px] bg-blue-soft p-[18px]">
        <Icone nome="info" />
        <div>
          <strong>Qual sentido faz mais sentido?</strong>
          <p className="mt-[2px] mb-0 text-muted">
            Observe o contexto da frase. A mesma palavra pode mudar de
            significado.
          </p>
        </div>
      </aside>
    </>
  );
}
