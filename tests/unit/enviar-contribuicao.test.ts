import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErroApi } from "@/lib/api/erros";

// A sessão e o envio de arquivo são simulados: aqui só interessa a regra de
// transformar cada sentido do formulário numa sugestão separada.
const requisitarAutenticado = vi.fn();
const enviarArquivo = vi.fn();

vi.mock("@/lib/sessao", () => ({
  requisitarAutenticado: (...args: unknown[]) => requisitarAutenticado(...args),
}));
vi.mock("@/lib/envio-arquivo", async (original) => ({
  ...(await original<typeof import("@/lib/envio-arquivo")>()),
  enviarArquivo: (...args: unknown[]) => enviarArquivo(...args),
}));

const { enviarContribuicao, VERSAO_TERMO_IMAGEM } = await import(
  "@/lib/contribuicoes"
);

const sentido = (nome: string, video: File | null = null) => ({
  nome: ` ${nome} `,
  definicao: "Uma definição qualquer.",
  exemplo: "",
  video,
});

beforeEach(() => {
  requisitarAutenticado.mockReset();
  enviarArquivo.mockReset();
});

describe("enviarContribuicao", () => {
  it("envia um pedido de gravação por sentido", async () => {
    requisitarAutenticado.mockImplementation(async (_rota, { corpo }) => ({
      senseId: corpo.title,
    }));
    const resultado = await enviarContribuicao({
      termo: " Banco ",
      classeGramatical: "substantivo",
      sentidos: [sentido("Assento"), sentido("Instituição")],
    });

    expect(resultado.falha).toBeNull();
    expect(resultado.enviados).toHaveLength(2);
    expect(requisitarAutenticado).toHaveBeenNthCalledWith(1, "/api/contributions", {
      metodo: "POST",
      corpo: {
        term: "Banco",
        title: "Assento",
        explanation: "Uma definição qualquer.",
        example: null,
        grammaticalClass: "substantivo",
        mode: "RECORDING_REQUEST",
      },
    });
  });

  it("envia o vídeo antes e manda a chave com o aceite do termo", async () => {
    enviarArquivo.mockResolvedValue("videos/abc.mp4");
    requisitarAutenticado.mockResolvedValue({});
    const video = new File(["x"], "sinal.mp4", { type: "video/mp4" });

    await enviarContribuicao({
      termo: "Banco",
      classeGramatical: "",
      sentidos: [sentido("Assento", video)],
    });

    expect(enviarArquivo.mock.calls[0][0]).toBe("/api/contributions/uploads");
    expect(enviarArquivo.mock.calls[0][1]).toEqual({
      kind: "VIDEO",
      contentType: "video/mp4",
      sizeBytes: 1,
    });
    expect(requisitarAutenticado.mock.calls[0][1].corpo).toMatchObject({
      mode: "VIDEO_UPLOAD",
      videoKey: "videos/abc.mp4",
      consentAccepted: true,
      consentVersion: VERSAO_TERMO_IMAGEM,
      grammaticalClass: null,
    });
  });

  it("para no primeiro sentido que falhar e informa qual foi", async () => {
    requisitarAutenticado
      .mockResolvedValueOnce({ senseId: "1" })
      .mockRejectedValueOnce(new ErroApi(409, "Sentido repetido."));

    const resultado = await enviarContribuicao({
      termo: "Banco",
      classeGramatical: "",
      sentidos: [sentido("A"), sentido("B"), sentido("C")],
    });

    expect(resultado.enviados).toHaveLength(1);
    expect(resultado.falha?.indice).toBe(1);
    expect(resultado.falha?.erro.detail).toBe("Sentido repetido.");
    expect(requisitarAutenticado).toHaveBeenCalledTimes(2);
  });
});
