/** Só aceita caminhos internos como destino depois do login ou cadastro. */
export function destinoSeguro(valor: string | null) {
  return valor && valor.startsWith("/") && !valor.startsWith("//")
    ? valor
    : "/contribuir";
}
