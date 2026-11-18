# Dicionário Libras — front

Front em Next.js 16 (App Router, Cache Components) do dicionário de palavras
polissêmicas para a Comunidade Surda.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
```

## Integração com a API

- Contrato: [`docs/openapi.yaml`](docs/openapi.yaml) (v0.3.0).
- Endereço da API: variável `API_URL` (padrão: ambiente dev na AWS,
  `https://doudh9dqt2uk3.cloudfront.net`). Ex.: `API_URL=http://localhost:8080 npm run dev`.
- O navegador fala só com `/api/*` do próprio site; o `next.config.ts` encaminha
  para a API (sem CORS, e o cookie HttpOnly do refresh token fica no domínio do site).
- Consultas públicas (lista, busca, detalhe) rodam no servidor, com cache de
  alguns minutos (`lib/api/servidor.ts`). O build pré-renderiza as palavras,
  então precisa da API no ar.
- Sessão (`lib/sessao.ts`): access token só em memória; ao abrir o site chama
  `POST /api/auth/refresh`; num 401 renova uma vez e repete a chamada. As
  renovações são serializadas entre abas (Web Locks), porque reutilizar um
  refresh token antigo encerra todas as sessões.

| Área | Arquivos |
| --- | --- |
| Palavras (público) | `lib/api/servidor.ts`, `lib/palavras.ts` |
| Conta | `lib/sessao.ts`, `app/entrar`, `app/cadastrar`, `app/verificar-email` |
| Contribuições | `lib/contribuicoes.ts`, `app/contribuir`, `app/contribuir/minhas` |
| Moderação | `lib/moderacao.ts`, `app/moderacao` |
| Usuários | `lib/usuarios.ts`, `app/moderacao/usuarios` |
