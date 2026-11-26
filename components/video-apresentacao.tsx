"use client";

import { useEffect, useRef, useState } from "react";
import { urlEmbedYoutube } from "@/lib/video";
import { Icone } from "./icone";

/** Vídeo de apresentação do site, em Libras (canal do projeto no YouTube). */
const ID_VIDEO = "ZFwaDz87uP0";
const TITULO = "Apresentação do Dicionário Libras";

/*
 * A miniatura do YouTube é 4:3 com faixas pretas em cima e embaixo; a imagem
 * do vídeo (16:9) ocupa só 270 dos 360 px de altura. Ampliada para 134% da
 * altura do círculo, as faixas ficam de fora.
 */
const MINIATURA = `https://i.ytimg.com/vi/${ID_VIDEO}/hqdefault.jpg`;

const urlPlayer = () => `${urlEmbedYoutube(ID_VIDEO)}&autoplay=1`;

/**
 * Vídeo de apresentação em formato redondo, no destaque da página inicial.
 *
 * Antes do clique mostra só a miniatura, para a página não carregar o player do
 * YouTube à toa. Ao clicar, o vídeo toca dentro do próprio círculo (a intérprete
 * fica no centro do quadro, então o corte das laterais não perde a sinalização).
 * Como o círculo esconde parte dos controles do YouTube, o botão "Ampliar" abre
 * o mesmo vídeo inteiro numa janela.
 */
export function VideoApresentacao() {
  const [tocando, setTocando] = useState(false);
  const [ampliado, setAmpliado] = useState(false);
  const janela = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = janela.current;
    if (!dialogo) return;
    if (ampliado && !dialogo.open) dialogo.showModal();
    if (!ampliado && dialogo.open) dialogo.close();
  }, [ampliado]);

  const ampliar = () => {
    // Um vídeo só por vez: o do círculo para quando a janela abre.
    setTocando(false);
    setAmpliado(true);
  };

  return (
    <>
      <figure className="relative m-0 flex flex-col items-center gap-4">
        <div className="relative">
          {/* Anéis de destaque em volta do vídeo */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-7 rounded-full border border-white/15 bg-white/[.035] tablet:-inset-5"
          />
          {!tocando && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#ffb08f]/70 motion-safe:animate-[pulso-video_2.6s_ease-out_infinite]"
            />
          )}

          <div className="relative isolate size-[290px] overflow-hidden rounded-full border-4 border-white/85 bg-[#0b2f5c] shadow-[0_24px_60px_rgba(0,12,34,.45)] [transform:translateZ(0)] tablet:size-[240px]">
            {tocando ? (
              <iframe
                src={urlPlayer()}
                title={TITULO}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                // O próprio vídeo tem faixas pretas em cima e embaixo: o player
                // (16:9) fica 134% maior que o círculo para escondê-las, e as
                // laterais também ficam de fora.
                className="absolute top-1/2 left-1/2 h-[134%] w-[238.2%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setTocando(true)}
                aria-label={`Reproduzir vídeo: ${TITULO}`}
                className="group absolute inset-0 grid size-full cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-offset-[6px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura externa, sem otimização (site estático) */}
                <img
                  src={MINIATURA}
                  alt=""
                  loading="eager"
                  className="absolute top-1/2 left-1/2 h-[134%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-[radial-gradient(circle,transparent_35%,rgba(3,30,66,.55)_100%)]" />
                <span className="relative grid size-[72px] place-items-center rounded-full bg-orange text-white shadow-[0_8px_24px_rgba(0,0,0,.35)] transition-transform duration-200 group-hover:scale-110">
                  <span className="translate-x-[2px]">
                    <Icone nome="play" tamanho={30} />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>

        <figcaption className="relative mt-3 flex items-center gap-3 text-[.95rem] font-bold text-[#e3effc]">
          <span>Conheça o dicionário em Libras</span>
          <button
            type="button"
            onClick={ampliar}
            className="inline-flex items-center gap-[6px] rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[.85rem] font-bold text-white transition-colors hover:bg-white/20"
          >
            <Icone nome="expand" tamanho={16} />
            Ampliar
          </button>
        </figcaption>
      </figure>
      <dialog
        ref={janela}
        onClose={() => setAmpliado(false)}
        onClick={(e) => {
          // Clique no fundo escurecido fecha a janela.
          if (e.target === e.currentTarget) setAmpliado(false);
        }}
        aria-label={TITULO}
        className="m-auto w-[min(960px,calc(100vw-32px))] overflow-visible border-0 bg-transparent p-0 backdrop:bg-[rgba(0,12,34,.82)]"
      >
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <strong className="text-[1.1rem]">{TITULO}</strong>
          <button
            type="button"
            onClick={() => setAmpliado(false)}
            aria-label="Fechar vídeo"
            className="grid size-11 place-items-center rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            <Icone nome="x" />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-black shadow-[0_24px_60px_rgba(0,0,0,.5)]">
          {ampliado && (
            <iframe
              src={urlPlayer()}
              title={TITULO}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
