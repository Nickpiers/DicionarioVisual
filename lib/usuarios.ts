"use client";

/**
 * Gestão de usuários (rotas /api/admin/users e /api/admin/admins).
 * ADMIN lista e bloqueia contas USER. MASTER também lista ADMIN e MASTER,
 * muda perfis entre USER e ADMIN, e cria ou remove administradores.
 * Ninguém altera o MASTER.
 */
import type {
  AdminUserApi,
  CadastroApi,
  Perfil,
  SituacaoConta,
} from "./api/tipos";
import { requisitarAutenticado } from "./sessao";

export function listarUsuarios(perfil: Perfil) {
  return requisitarAutenticado<AdminUserApi[]>(
    `/api/admin/users?${new URLSearchParams({ role: perfil })}`,
  );
}

export function alterarUsuario(
  userId: string,
  mudanca: { status?: SituacaoConta; role?: "USER" | "ADMIN" },
) {
  return requisitarAutenticado<AdminUserApi>(
    `/api/admin/users/${encodeURIComponent(userId)}`,
    { metodo: "PATCH", corpo: mudanca },
  );
}

export function criarAdministrador(dados: CadastroApi) {
  return requisitarAutenticado<AdminUserApi>("/api/admin/admins", {
    metodo: "POST",
    corpo: { ...dados, name: dados.name.trim(), email: dados.email.trim() },
  });
}

export function removerAdministrador(userId: string) {
  return requisitarAutenticado(
    `/api/admin/admins/${encodeURIComponent(userId)}`,
    { metodo: "DELETE" },
  );
}

export const rotuloPerfil: Record<Perfil, string> = {
  USER: "Comunidade",
  ADMIN: "Administração",
  MASTER: "Master",
};

/** O que a pessoa logada pode fazer com a conta listada. */
export function permissoes(logado: Perfil, alvo: AdminUserApi, proprio: boolean) {
  const master = logado === "MASTER";
  const podeAlterar =
    !proprio &&
    alvo.role !== "MASTER" &&
    (alvo.role === "USER" || master);
  return {
    bloquear: podeAlterar,
    mudarPerfil: podeAlterar && master,
    remover: podeAlterar && master && alvo.role === "ADMIN",
  };
}
