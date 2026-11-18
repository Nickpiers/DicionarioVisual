import type { Metadata } from "next";
import Link from "next/link";
import { Icone } from "@/components/icone";
import { classeBotao, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contribuição enviada",
};

export default function ContribuicaoEnviadaPage() {
  return (
    <main className="grid min-h-[calc(100dvh_-_168px)] place-items-center bg-[radial-gradient(circle_at_50%_16%,#e8f8ef,transparent_30%),var(--canvas)] px-5 py-16 phone:px-[14px] phone:py-9">
      <section
        className="w-[min(100%,700px)] rounded-[20px] border border-line bg-white p-12 text-center shadow-card phone:px-[18px] phone:pt-9 phone:pb-[22px]"
        aria-labelledby="submission-success-title"
      >
        <span className="mx-auto mb-[22px] grid size-[88px] place-items-center rounded-full bg-green text-white shadow-[0_0_0_12px_#e8f8ef]">
          <Icone nome="check" tamanho={40} />
        </span>
        <Eyebrow>Envio concluído</Eyebrow>
        <h1
          id="submission-success-title"
          className="mx-auto mt-2 mb-4 text-[clamp(2rem,4vw,3rem)] text-navy"
        >
          Sua contribuição foi enviada com sucesso!
        </h1>
        <p className="mx-auto my-0 max-w-[580px] text-[1.08rem] text-muted">
          O conteúdo seguirá para análise da equipe responsável antes de ser
          publicado no Dicionário Libras.
        </p>
        <aside className="my-7 flex items-start gap-3 rounded-[14px] border border-[#acd0f4] bg-blue-soft p-[18px] text-left text-navy">
          <Icone nome="info" tamanho={24} className="flex-none" />
          <div>
            <strong>Confira seu e-mail</strong>
            <p className="mt-[3px] mb-0 text-muted">
              Enviaremos uma confirmação do pedido e as próximas atualizações.
              Você também pode acompanhar a revisão em{" "}
              <Link
                href="/contribuir/minhas"
                className="font-extrabold text-blue underline"
              >
                Minhas contribuições
              </Link>
              .
            </p>
          </div>
        </aside>
        <div className="grid grid-cols-2 gap-3 phone:grid-cols-1">
          <Link href="/" className={classeBotao("secondary")}>
            <Icone nome="home" />
            <span>Voltar ao menu inicial</span>
          </Link>
          <Link href="/contribuir" className={classeBotao("primary")}>
            <Icone nome="plus" />
            <span>Fazer novo pedido</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
