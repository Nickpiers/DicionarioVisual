"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Icone } from "./icone";

/* Campo com rótulo (.field) ------------------------------------------- */

export const classeCampo = "mt-4 block";
export const classeRotuloCampo = "mb-[7px] block font-extrabold";
export const classeControle =
  "min-h-[50px] w-full rounded-[9px] border border-[#9eb1c6] bg-white px-[14px] py-3 text-ink";

export function Campo({
  rotulo,
  multilinha = false,
  linhas = 4,
  className = "",
  ...props
}: {
  rotulo: ReactNode;
  multilinha?: boolean;
  linhas?: number;
} & ComponentProps<"input"> &
  Pick<ComponentProps<"textarea">, "rows">) {
  return (
    <label className={`${classeCampo} ${className}`}>
      <span className={classeRotuloCampo}>{rotulo}</span>
      {multilinha ? (
        <textarea
          rows={linhas}
          className={`${classeControle} resize-y`}
          {...(props as ComponentProps<"textarea">)}
        />
      ) : (
        <input className={classeControle} {...props} />
      )}
    </label>
  );
}

export function CampoSelecao({
  rotulo,
  children,
  ...props
}: { rotulo: ReactNode; children: ReactNode } & ComponentProps<"select">) {
  return (
    <label className={classeCampo}>
      <span className={classeRotuloCampo}>{rotulo}</span>
      <select className={classeControle} {...props}>
        {children}
      </select>
    </label>
  );
}

/* Mensagem de erro ou sucesso ------------------------------------------ */

const estilosAlerta = {
  erro: { classe: "border-[#f3b8ae] bg-[#fff0ee] text-red", icone: "x" },
  sucesso: { classe: "border-[#8ac9a9] bg-[#e8f8ef] text-[#075d39]", icone: "check" },
  aviso: { classe: "border-[#f1d58a] bg-[#fff8e1] text-[#6b4300]", icone: "info" },
  info: { classe: "border-[#acd0f4] bg-blue-soft text-navy", icone: "info" },
} as const;

/** Faixa de mensagem. Erros são anunciados na hora pelos leitores de tela. */
export function Alerta({
  tipo = "erro",
  children,
  className = "",
}: {
  tipo?: keyof typeof estilosAlerta;
  children: ReactNode;
  className?: string;
}) {
  const estilo = estilosAlerta[tipo];
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={`mt-4 flex items-start gap-[10px] rounded-[10px] border p-[14px] text-[.92rem] ${estilo.classe} ${className}`}
    >
      <Icone nome={estilo.icone} className="mt-[2px] flex-none" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* Área de upload (.upload-zone) --------------------------------------- */

const configuracaoUpload = {
  video: {
    icone: "video",
    titulo: "Upload Vídeo Libras",
    formatos: "MP4 ou MOV • até 100 MB",
    aceita: "video/mp4,video/quicktime,.mp4,.mov",
    limite: 100 * 1024 * 1024,
  },
  image: {
    icone: "image",
    titulo: "Upload Imagem",
    formatos: "JPG ou PNG • até 10 MB",
    aceita: "image/jpeg,image/png,.jpg,.jpeg,.png",
    limite: 10 * 1024 * 1024,
  },
} as const;

export function ZonaUpload({
  tipo,
  aoSelecionar,
}: {
  tipo: "video" | "image";
  aoSelecionar: (nome: string | null) => void;
}) {
  const config = configuracaoUpload[tipo];
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const escolher = (lista: FileList | null) => {
    const selecionado = lista?.[0];
    if (!selecionado) return;
    const extensoes = config.aceita.split(",").filter((e) => e.startsWith("."));
    const valido =
      config.aceita.split(",").includes(selecionado.type) ||
      extensoes.some((e) => selecionado.name.toLowerCase().endsWith(e));
    if (!valido) {
      setErro(`Formato não aceito. Use ${config.formatos.split(" •")[0]}.`);
      return;
    }
    if (selecionado.size > config.limite) {
      setErro(`Arquivo maior que ${config.formatos.split("até ")[1]}.`);
      return;
    }
    setErro(null);
    setArquivo(selecionado.name);
    aoSelecionar(selecionado.name);
  };

  return (
    <>
      <button
        type="button"
        className="flex min-h-[170px] flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#98aec5] bg-white p-4 text-muted phone:min-h-[150px]"
        onClick={() => entrada.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          escolher(e.dataTransfer.files);
        }}
      >
        <span className="mb-2 grid size-12 place-items-center rounded-full bg-blue-soft text-blue">
          <Icone nome={config.icone} tamanho={26} />
        </span>
        <strong className="text-navy">{config.titulo}</strong>
        <small
          className={`text-[.76rem] ${erro ? "text-red" : ""}`}
          aria-live="polite"
        >
          {erro ??
            (arquivo
              ? `Selecionado: ${arquivo}`
              : "Arraste o arquivo ou clique para selecionar")}
        </small>
        <em className="mt-[5px] text-[.76rem] not-italic">{config.formatos}</em>
      </button>
      <input
        ref={entrada}
        type="file"
        accept={config.aceita}
        className="hidden"
        onChange={(e) => escolher(e.target.files)}
        tabIndex={-1}
      />
    </>
  );
}
