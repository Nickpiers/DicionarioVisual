"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/lib/api/erros";
import { destinoSeguro } from "@/lib/destino";
import { entrar, useSessao } from "@/lib/sessao";
import { Alerta, Campo } from "./campos";
import { Icone } from "./icone";
import { Botao, classeLinkTexto, Eyebrow } from "./ui";


export function FormularioEntrada() {
  const router = useRouter();
  const destino = destinoSeguro(useSearchParams().get("para"));
  const ehModeracao = destino.startsWith("/moderacao");
  const sessao = useSessao();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const jaEntrou = sessao.status === "autenticado" && !enviando;

  // Quem já tem sessão segue direto para o destino.
  useEffect(() => {
    if (jaEntrou) router.replace(destino);
  }, [jaEntrou, destino, router]);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    setEnviando(true);
    setErro(null);
    try {
      await entrar(String(dados.get("email")), String(dados.get("senha")));
      formulario.reset();
      router.replace(destino);
    } catch (e) {
      setErro(mensagemDeErro(e));
      setEnviando(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100dvh_-_168px)] place-items-center bg-[radial-gradient(circle_at_20%_20%,#e7f3ff,transparent_34%),var(--canvas)] px-5 py-16 phone:px-[14px] phone:py-9">
      <section className="w-[min(100%,490px)] rounded-[18px] border border-line bg-white p-[34px] shadow-card phone:px-[18px] phone:py-6">
        <span className="mb-4 grid size-[58px] place-items-center rounded-[16px] bg-navy text-white">
          <Icone nome={ehModeracao ? "shield" : "user"} tamanho={30} />
        </span>
        <Eyebrow>
          {ehModeracao ? "Área restrita" : "Área da comunidade"}
        </Eyebrow>
        <h1 className="mt-[6px] mb-3 text-[2rem] text-navy">
          {ehModeracao ? "Acesso à moderação" : "Entre para contribuir"}
        </h1>
        <p className="text-muted">
          {ehModeracao
            ? "Use as credenciais fornecidas pela administração. Novos moderadores não podem ser cadastrados nesta tela."
            : "O acesso identifica sua contribuição e permite receber atualizações da revisão."}
        </p>
        <form onSubmit={enviar}>
          {erro && <Alerta>{erro}</Alerta>}
          <Campo
            rotulo="E-mail *"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={
              ehModeracao ? "moderador@instituicao.br" : "voce@exemplo.com"
            }
          />
          <Campo
            rotulo="Senha *"
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Digite sua senha"
          />
          <Botao
            type="submit"
            icone={ehModeracao ? "shield" : "user"}
            className="mt-4 w-full"
            disabled={enviando}
          >
            {enviando
              ? "Entrando…"
              : ehModeracao
                ? "Entrar na moderação"
                : "Entrar e continuar"}
          </Botao>
        </form>
        <Link href="/" className={`${classeLinkTexto} mt-[14px]`}>
          ← Voltar para o início
        </Link>
        <aside className="mt-[18px] flex items-start gap-[10px] rounded-[10px] bg-blue-soft p-[14px] text-[.82rem] text-muted">
          <Icone nome="info" />
          {ehModeracao ? (
            <span>
              Cadastro de moderadores é realizado somente pela administração do
              sistema.
            </span>
          ) : (
            <span>
              Ainda não tem conta?{" "}
              <Link
                href={`/cadastrar?para=${encodeURIComponent(destino)}`}
                className="font-extrabold text-blue underline"
              >
                Crie sua conta
              </Link>{" "}
              para enviar palavras e sentidos.
            </span>
          )}
        </aside>
      </section>
    </main>
  );
}
