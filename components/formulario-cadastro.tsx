"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/lib/api/erros";
import { destinoSeguro } from "@/lib/destino";
import { cadastrar, entrar, useSessao } from "@/lib/sessao";
import { Alerta, Campo } from "./campos";
import { Icone } from "./icone";
import { Botao, classeBotao, classeLinkTexto, Eyebrow } from "./ui";

/** Pelo menos 8 caracteres, com letras e números (regra da API). */
const SENHA_VALIDA = /^(?=.*\p{L})(?=.*\d).{8,}$/u;

const classeFundo =
  "grid min-h-[calc(100dvh_-_168px)] place-items-center bg-[radial-gradient(circle_at_20%_20%,#e7f3ff,transparent_34%),var(--canvas)] px-5 py-16 phone:px-[14px] phone:py-9";
const classeCartao =
  "w-[min(100%,520px)] rounded-[18px] border border-line bg-white p-[34px] shadow-card phone:px-[18px] phone:py-6";

export function FormularioCadastro() {
  const router = useRouter();
  const destino = destinoSeguro(useSearchParams().get("para"));
  const sessao = useSessao();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criada, setCriada] = useState<string | null>(null);
  const jaEntrou = sessao.status === "autenticado" && !enviando && !criada;

  // Quem já tem conta e sessão não precisa se cadastrar.
  useEffect(() => {
    if (jaEntrou) router.replace(destino);
  }, [jaEntrou, destino, router]);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") ?? "").trim();
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");
    const confirmacao = String(dados.get("confirmacao") ?? "");

    if (!SENHA_VALIDA.test(senha)) {
      setErro("A senha precisa ter pelo menos 8 caracteres, com letras e números.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As duas senhas não são iguais. Digite a mesma senha nos dois campos.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await cadastrar({ name: nome, email, password: senha });
      setCriada(email);
      // A conta já pode entrar; só o envio de sugestões espera a verificação.
      await entrar(email, senha).catch(() => undefined);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  };

  if (criada) {
    return (
      <main className={classeFundo}>
        <section className={`${classeCartao} text-center`} aria-labelledby="cadastro-criado-titulo">
          <span className="mx-auto mb-[22px] grid size-[76px] place-items-center rounded-full bg-green text-white shadow-[0_0_0_12px_#e8f8ef]">
            <Icone nome="check" tamanho={36} />
          </span>
          <Eyebrow>Conta criada</Eyebrow>
          <h1
            id="cadastro-criado-titulo"
            className="mt-2 mb-3 text-[2rem] text-navy"
          >
            Agora, confirme seu e-mail.
          </h1>
          <p className="text-muted">
            Enviamos um link para <strong className="text-ink">{criada}</strong>.
            O link vale por 24 horas. Depois de confirmar, você já pode enviar
            palavras e sentidos.
          </p>
          <aside className="my-6 flex items-start gap-3 rounded-[14px] border border-[#acd0f4] bg-blue-soft p-[18px] text-left text-navy">
            <Icone nome="mail" tamanho={24} className="flex-none" />
            <p className="m-0 text-muted">
              Não chegou? Confira a caixa de spam. Você pode pedir um novo link
              na tela de contribuição.
            </p>
          </aside>
          <Link href={destino} className={`${classeBotao("primary")} w-full`}>
            <Icone nome="arrow" />
            <span>Continuar</span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={classeFundo}>
      <section className={classeCartao} aria-labelledby="cadastro-titulo">
        <span className="mb-4 grid size-[58px] place-items-center rounded-[16px] bg-navy text-white">
          <Icone nome="user" tamanho={30} />
        </span>
        <Eyebrow>Área da comunidade</Eyebrow>
        <h1 id="cadastro-titulo" className="mt-[6px] mb-3 text-[2rem] text-navy">
          Crie sua conta
        </h1>
        <p className="text-muted">
          Com uma conta, você envia palavras e sentidos e acompanha a revisão
          de cada sugestão.
        </p>
        <form onSubmit={enviar}>
          {erro && <Alerta>{erro}</Alerta>}
          <Campo
            rotulo="Nome completo *"
            name="nome"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Ex.: Maria Silva"
          />
          <Campo
            rotulo="E-mail *"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
          <Campo
            rotulo="Senha *"
            name="senha"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Crie uma senha"
            aria-describedby="dica-senha"
          />
          <p id="dica-senha" className="mt-[6px] mb-0 text-[.8rem] text-muted">
            Pelo menos 8 caracteres, com letras e números.
          </p>
          <Campo
            rotulo="Confirme a senha *"
            name="confirmacao"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Digite a senha de novo"
          />
          <Botao
            type="submit"
            icone="check"
            className="mt-5 w-full"
            disabled={enviando}
          >
            {enviando ? "Criando conta…" : "Criar conta"}
          </Botao>
        </form>
        <p className="mt-[14px] mb-0 text-muted">
          Já tem conta?{" "}
          <Link
            href={`/entrar?para=${encodeURIComponent(destino)}`}
            className="font-extrabold text-blue underline"
          >
            Entre aqui
          </Link>
        </p>
        <Link href="/" className={`${classeLinkTexto} mt-[6px]`}>
          ← Voltar para o início
        </Link>
      </section>
    </main>
  );
}
