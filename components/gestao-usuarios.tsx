"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/lib/api/erros";
import type { AdminUserApi, Perfil } from "@/lib/api/tipos";
import { formatarData, iniciais } from "@/lib/contribuicoes";
import { normalizar } from "@/lib/palavras";
import { useSessao } from "@/lib/sessao";
import {
  alterarUsuario,
  criarAdministrador,
  listarUsuarios,
  permissoes,
  removerAdministrador,
  rotuloPerfil,
} from "@/lib/usuarios";
import { Alerta, Campo, classeControle } from "./campos";
import { Botao, classeLinkTexto, classeSecao, Eyebrow } from "./ui";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; usuarios: AdminUserApi[] };

type Aviso = { tipo: "sucesso" | "erro"; texto: string } | null;

const SENHA_VALIDA = /^(?=.*\p{L})(?=.*\d).{8,}$/u;

function Etiqueta({ children, cor }: { children: string; cor: string }) {
  return (
    <span
      className={`inline-block rounded-[99px] px-[9px] py-1 text-[.72rem] font-extrabold whitespace-nowrap ${cor}`}
    >
      {children}
    </span>
  );
}

async function carregarEstado(perfil: Perfil): Promise<Estado> {
  try {
    return { tipo: "pronto", usuarios: await listarUsuarios(perfil) };
  } catch (erro) {
    return { tipo: "erro", mensagem: mensagemDeErro(erro) };
  }
}

export function GestaoUsuarios() {
  const sessao = useSessao();
  const logado = sessao.status === "autenticado" ? sessao.usuario : undefined;
  const master = logado?.role === "MASTER";
  const perfis: Perfil[] = master ? ["USER", "ADMIN", "MASTER"] : ["USER"];

  const [perfil, setPerfil] = useState<Perfil>("USER");
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState<Aviso>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    carregarEstado(perfil).then((novo) => ativo && setEstado(novo));
    return () => {
      ativo = false;
    };
  }, [perfil, tentativa]);

  const trocarPerfil = (novo: Perfil, manterAviso = false) => {
    if (novo === perfil) return;
    setEstado({ tipo: "carregando" });
    if (!manterAviso) setAviso(null);
    setPerfil(novo);
  };

  const usuarios = estado.tipo === "pronto" ? estado.usuarios : [];
  const alvo = normalizar(busca);
  const visiveis = alvo
    ? usuarios.filter(
        (u) =>
          normalizar(u.name).includes(alvo) ||
          normalizar(u.email).includes(alvo),
      )
    : usuarios;

  /** Executa uma ação sobre a conta e atualiza a lista com o resultado. */
  const agir = async (
    usuario: AdminUserApi,
    confirmacao: string,
    acao: () => Promise<AdminUserApi | void>,
    sucesso: string,
  ) => {
    if (!window.confirm(confirmacao)) return;
    setOcupado(usuario.userId);
    setAviso(null);
    try {
      const atualizado = await acao();
      setEstado((atual) => {
        if (atual.tipo !== "pronto") return atual;
        const lista = atual.usuarios
          .map((u) =>
            u.userId === usuario.userId && atualizado ? atualizado : u,
          )
          // Saiu deste perfil (mudou de papel ou foi removido): sai da lista.
          .filter(
            (u) =>
              u.userId !== usuario.userId || (atualizado && u.role === perfil),
          );
        return { tipo: "pronto", usuarios: lista };
      });
      setAviso({ tipo: "sucesso", texto: sucesso });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: mensagemDeErro(erro) });
    } finally {
      setOcupado(null);
    }
  };

  const criar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const senha = String(dados.get("senha") ?? "");
    if (!SENHA_VALIDA.test(senha)) {
      setAviso({
        tipo: "erro",
        texto: "A senha provisória precisa ter pelo menos 8 caracteres, com letras e números.",
      });
      return;
    }
    setOcupado("novo");
    setAviso(null);
    try {
      const novo = await criarAdministrador({
        name: String(dados.get("nome") ?? ""),
        email: String(dados.get("email") ?? ""),
        password: senha,
      });
      formulario.reset();
      setCriando(false);
      setAviso({
        tipo: "sucesso",
        texto: `${novo.name} agora faz parte da administração. Envie a senha provisória por um canal seguro.`,
      });
      if (perfil === "ADMIN") {
        setEstado((atual) =>
          atual.tipo === "pronto"
            ? {
                tipo: "pronto",
                usuarios: [...atual.usuarios, novo].sort((a, b) =>
                  a.name.localeCompare(b.name, "pt-BR"),
                ),
              }
            : atual,
        );
      } else {
        trocarPerfil("ADMIN", true);
      }
    } catch (erro) {
      setAviso({ tipo: "erro", texto: mensagemDeErro(erro) });
    } finally {
      setOcupado(null);
    }
  };

  return (
    <main className="bg-canvas">
      <section className={classeSecao}>
        <Link href="/moderacao" className={`${classeLinkTexto} mb-2`}>
          ← Voltar para a moderação
        </Link>
        <div className="mb-7 flex items-end justify-between gap-6 phone:flex-col phone:items-start">
          <div>
            <Eyebrow>Administração</Eyebrow>
            <h1 className="my-[5px] text-navy">Gestão de usuários</h1>
            <p className="m-0 text-muted">
              {master
                ? "Bloqueie contas, mude perfis e cadastre pessoas da administração."
                : "Bloqueie ou desbloqueie contas da comunidade."}
            </p>
          </div>
          {master && (
            <Botao
              icone={criando ? "x" : "plus"}
              variante={criando ? "secondary" : "primary"}
              className="phone:w-full"
              aria-expanded={criando}
              aria-controls="novo-admin"
              onClick={() => setCriando((c) => !c)}
            >
              {criando ? "Cancelar" : "Novo administrador"}
            </Botao>
          )}
        </div>

        {master && criando && (
          <form
            id="novo-admin"
            onSubmit={criar}
            className="mb-7 rounded-[14px] border border-line bg-white p-6 shadow-card phone:p-4"
          >
            <h2 className="m-0 text-[1.25rem]">Novo administrador</h2>
            <p className="mt-1 mb-0 text-muted">
              A conta nasce com o e-mail já confirmado e a senha provisória
              abaixo.
            </p>
            <div className="grid grid-cols-3 gap-4 tablet:grid-cols-1">
              <Campo rotulo="Nome *" name="nome" required maxLength={100} autoComplete="off" />
              <Campo rotulo="E-mail *" name="email" type="email" required maxLength={254} autoComplete="off" />
              <Campo
                rotulo="Senha provisória *"
                name="senha"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <p className="mt-[6px] mb-0 text-[.8rem] text-muted">
              Pelo menos 8 caracteres, com letras e números.
            </p>
            <Botao
              type="submit"
              icone="check"
              className="mt-4 phone:w-full"
              disabled={ocupado === "novo"}
            >
              {ocupado === "novo" ? "Criando…" : "Criar administrador"}
            </Botao>
          </form>
        )}

        {aviso && (
          <Alerta tipo={aviso.tipo} className="mt-0 mb-5">
            {aviso.texto}
          </Alerta>
        )}

        <div className="mb-5 flex items-end justify-between gap-4 border-b border-line tablet:flex-col tablet:items-stretch tablet:border-0">
          <div
            className="flex gap-2 overflow-x-auto tablet:border-b tablet:border-line"
            role="tablist"
            aria-label="Perfil"
          >
            {perfis.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={perfil === p}
                onClick={() => trocarPerfil(p)}
                className={`flex min-h-[50px] flex-none items-center gap-2 border-0 border-b-[3px] bg-transparent px-[18px] font-extrabold whitespace-nowrap phone:px-3 ${
                  perfil === p ? "border-navy text-navy" : "border-transparent text-muted"
                }`}
              >
                {rotuloPerfil[p]}
                {perfil === p && estado.tipo === "pronto" && (
                  <span className="min-w-6 rounded-[99px] bg-[#e1e8f0] px-[6px] py-[2px] text-[.76rem] text-ink">
                    {usuarios.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <label className="mb-2 block w-[min(100%,320px)] tablet:w-full">
            <span className="sr-only">Buscar por nome ou e-mail</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              className={classeControle}
            />
          </label>
        </div>

        {estado.tipo === "carregando" && (
          <p role="status" className="m-0 py-6 text-muted">
            Carregando contas…
          </p>
        )}

        {estado.tipo === "erro" && (
          <Alerta>
            <span className="block">{estado.mensagem}</span>
            <Botao
              variante="secondary"
              className="mt-3"
              onClick={() => {
                setEstado({ tipo: "carregando" });
                setTentativa((t) => t + 1);
              }}
            >
              Tentar de novo
            </Botao>
          </Alerta>
        )}

        {estado.tipo === "pronto" && visiveis.length === 0 && (
          <p className="m-0 rounded-[14px] border border-line bg-white px-5 py-8 text-center text-muted">
            {usuarios.length === 0
              ? "Nenhuma conta com este perfil."
              : "Nenhuma conta encontrada para esta busca."}
          </p>
        )}

        {visiveis.length > 0 && (
          <ul className="m-0 list-none overflow-hidden rounded-[14px] border border-line bg-white p-0 shadow-card">
            {visiveis.map((u) => {
              const proprio = u.userId === logado?.userId;
              const pode = logado
                ? permissoes(logado.role, u, proprio)
                : { bloquear: false, mudarPerfil: false, remover: false };
              const bloqueada = u.status === "BLOCKED";
              const desabilitado = ocupado !== null;
              return (
                <li
                  key={u.userId}
                  className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-b border-line px-5 py-4 last:border-b-0 tablet:grid-cols-[44px_minmax(0,1fr)]"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-blue font-extrabold text-white">
                    {iniciais(u.name)}
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate">
                      {u.name}
                      {proprio && <span className="font-normal text-muted"> (você)</span>}
                    </strong>
                    <small className="block truncate text-muted">{u.email}</small>
                    <div className="mt-[6px] flex flex-wrap items-center gap-[6px]">
                      <Etiqueta
                        cor={bloqueada ? "bg-[#fff0ee] text-red" : "bg-[#e8f8ef] text-[#075d39]"}
                      >
                        {bloqueada ? "Bloqueada" : "Ativa"}
                      </Etiqueta>
                      <Etiqueta
                        cor={u.emailVerified ? "bg-blue-soft text-navy" : "bg-[#fff1c7] text-[#884008]"}
                      >
                        {u.emailVerified ? "E-mail confirmado" : "E-mail não confirmado"}
                      </Etiqueta>
                      <small className="text-[.76rem] text-muted">
                        Desde {formatarData(u.createdAt)}
                      </small>
                    </div>
                  </div>
                  {(pode.bloquear || pode.mudarPerfil || pode.remover) && (
                    <div className="flex flex-wrap justify-end gap-2 tablet:col-span-full tablet:justify-start phone:grid phone:grid-cols-1">
                      {pode.bloquear && (
                        <Botao
                          compacto
                          variante={bloqueada ? "secondary" : "danger"}
                          icone={bloqueada ? "check" : "x"}
                          disabled={desabilitado}
                          onClick={() =>
                            agir(
                              u,
                              bloqueada
                                ? `Desbloquear a conta de ${u.name}?`
                                : `Bloquear a conta de ${u.name}? A pessoa sai de todas as sessões.`,
                              () =>
                                alterarUsuario(u.userId, {
                                  status: bloqueada ? "ACTIVE" : "BLOCKED",
                                }),
                              bloqueada
                                ? `A conta de ${u.name} foi desbloqueada.`
                                : `A conta de ${u.name} foi bloqueada.`,
                            )
                          }
                        >
                          {bloqueada ? "Desbloquear" : "Bloquear"}
                        </Botao>
                      )}
                      {pode.mudarPerfil && (
                        <Botao
                          compacto
                          variante="secondary"
                          icone={u.role === "USER" ? "shield" : "user"}
                          disabled={desabilitado}
                          onClick={() =>
                            agir(
                              u,
                              u.role === "USER"
                                ? `Dar acesso de administração para ${u.name}?`
                                : `Tirar o acesso de administração de ${u.name}?`,
                              () =>
                                alterarUsuario(u.userId, {
                                  role: u.role === "USER" ? "ADMIN" : "USER",
                                }),
                              u.role === "USER"
                                ? `${u.name} agora faz parte da administração.`
                                : `${u.name} voltou a ser da comunidade.`,
                            )
                          }
                        >
                          {u.role === "USER" ? "Tornar administrador" : "Tornar comunidade"}
                        </Botao>
                      )}
                      {pode.remover && (
                        <Botao
                          compacto
                          variante="danger"
                          icone="x"
                          disabled={desabilitado}
                          onClick={() =>
                            agir(
                              u,
                              `Remover o administrador ${u.name}? Esta ação não pode ser desfeita.`,
                              () => removerAdministrador(u.userId),
                              `${u.name} foi removido da administração.`,
                            )
                          }
                        >
                          Remover
                        </Botao>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
