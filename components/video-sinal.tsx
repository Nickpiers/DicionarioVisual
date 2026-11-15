import Image from "next/image";
import { IMAGEM_SINALIZANTE } from "@/lib/palavras";
import { idDoYoutube, urlEmbedYoutube } from "@/lib/video";
import { Icone } from "./icone";
import { classeBotaoPlay, classeControlesVideo, classePlayer } from "./ui";

type Props = {
  /** Link do YouTube do sentido; `null` mostra a imagem estática. */
  video: string | null;
  /** Usado no título do player, para leitores de tela. */
  titulo: string;
};

/** Vídeo do sinal em Libras: player do YouTube ou imagem estática. */
export function VideoSinal({ video, titulo }: Props) {
  const id = idDoYoutube(video);

  if (id) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-[#103963]">
        <iframe
          // A chave reinicia o player quando o sentido muda.
          key={id}
          src={urlEmbedYoutube(id)}
          title={`Sinal em Libras: ${titulo}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return (
    <div className={`${classePlayer} min-h-[320px] phone:min-h-[280px]`}>
      <Image
        src={IMAGEM_SINALIZANTE}
        alt="Intérprete demonstrando o sinal em Libras"
        fill
        unoptimized
        loading="eager"
        sizes="(max-width: 900px) 100vw, 440px"
        className="object-cover object-[center_30%]"
      />
      <button type="button" className={classeBotaoPlay} aria-label="Reproduzir vídeo">
        <Icone nome="play" tamanho={28} />
      </button>
      <div className={classeControlesVideo}>
        <Icone nome="play" />
        <span className="h-1 flex-1 rounded-[99px] bg-white/35">
          <i className="block h-full w-[35%] rounded-[inherit] bg-white" />
        </span>
        <span>0:08</span>
        <Icone nome="volume" />
        <Icone nome="expand" />
      </div>
    </div>
  );
}
