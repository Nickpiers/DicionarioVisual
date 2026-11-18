"use client";

import { useState } from "react";
import { mensagemDeErro } from "@/lib/api/erros";
import { reenviarVerificacao, useSessao } from "@/lib/sessao";
import { Alerta } from "./campos";

/**
 * Aviso para quem ainda não confirmou o e-mail (só assim é possível enviar
 * sugestões), com o botão para reenviar o link (no máximo 3 por hora).
 */
export function AvisoVerificacao({ className = "" }: { className?: string }) {
  const sessao = useSessao();
  const [estado, setEstado] = useState<
    { tipo: "parado" } | { tipo: "enviando" } | { tipo: "enviado" } | { tipo: "erro"; mensagem: string }
  >({ tipo: "parado" });

  if (sessao.status !== "autenticado" || sessao.usuario.emailVerified) {
    return null;
  }

  return (
    <Alerta tipo="aviso" className={className}>
      <strong className="block">Confirme seu e-mail para enviar sugestões.</strong>
      <span className="block">
        Enviamos um link para <strong>{sessao.usuario.email}</strong>. Abra o
        e-mail e clique no link para liberar o envio.
      </span>
      {estado.tipo === "enviado" ? (
        <span role="status" className="mt-2 block font-extrabold">
          Pronto! Enviamos um novo link. Confira também a caixa de spam.
        </span>
      ) : (
        <button
          type="button"
          className="mt-2 min-h-11 rounded-[9px] border-2 border-current bg-white px-3 font-extrabold disabled:opacity-60"
          disabled={estado.tipo === "enviando"}
          onClick={async () => {
            setEstado({ tipo: "enviando" });
            try {
              await reenviarVerificacao();
              setEstado({ tipo: "enviado" });
            } catch (erro) {
              setEstado({ tipo: "erro", mensagem: mensagemDeErro(erro) });
            }
          }}
        >
          {estado.tipo === "enviando" ? "Enviando…" : "Reenviar e-mail de confirmação"}
        </button>
      )}
      {estado.tipo === "erro" && (
        <span role="alert" className="mt-2 block text-red">
          {estado.mensagem}
        </span>
      )}
    </Alerta>
  );
}
