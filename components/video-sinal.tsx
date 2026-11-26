import { idDoYoutube, urlEmbedYoutube } from "@/lib/video";
import { Icone } from "./icone";

type Props = {
  video: string | null;
  /** Usado no título do player, para leitores de tela. */
  titulo: string;
};

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
    <div className="flex aspect-video flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#98aec5] bg-white p-4 text-center text-muted">
      <Icone nome="video" tamanho={26} className="text-blue" />
      <strong className="mt-2 text-navy">
        Vídeo em Libras ainda não disponível
      </strong>
      <small className="mt-1 block">
        Este sentido ainda não tem vídeo. Veja a definição e o exemplo em
        português.
      </small>
    </div>
  );
}
