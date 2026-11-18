import Link from "next/link";
import { Icone } from "@/components/icone";
import { classeBotao, Eyebrow } from "@/components/ui";

export default function NaoEncontrado() {
  return (
    <main className="grid min-h-[calc(100dvh_-_168px)] place-items-center bg-canvas px-5 py-16 phone:px-[14px] phone:py-9">
      <section
        className="w-[min(100%,560px)] rounded-[18px] border border-line bg-white p-10 text-center shadow-card phone:px-[18px] phone:py-7"
        aria-labelledby="nao-encontrado-titulo"
      >
        <span className="mx-auto mb-4 grid size-[64px] place-items-center rounded-full bg-blue-soft text-blue">
          <Icone nome="search" tamanho={30} />
        </span>
        <Eyebrow>Página não encontrada</Eyebrow>
        <h1
          id="nao-encontrado-titulo"
          className="mt-2 mb-3 text-[2rem] text-navy"
        >
          Não encontramos o que você procurou.
        </h1>
        <p className="text-muted">
          A palavra pode ainda não estar no dicionário. Busque outro termo ou
          sugira esta palavra para a equipe.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 phone:grid-cols-1">
          <Link href="/palavras" className={classeBotao("secondary")}>
            <Icone nome="book" />
            <span>Ver todas as palavras</span>
          </Link>
          <Link href="/contribuir" className={classeBotao("primary")}>
            <Icone nome="plus" />
            <span>Sugerir palavra</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
