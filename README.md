# Dicionário Libras — front

Front em Next.js 16 (App Router, Cache Components) do dicionário de palavras
polissêmicas para a Comunidade Surda.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
```

## Integração com a API

- Contrato: [`docs/openapi.yaml`](docs/openapi.yaml) (v0.5.0).
- Endereço da API: variável `API_URL` (padrão: ambiente dev na AWS,
  `https://doudh9dqt2uk3.cloudfront.net`). Ex.: `API_URL=http://localhost:8080 npm run dev`.
- O navegador fala só com `/api/*` do próprio site; o `next.config.ts` encaminha
  para a API (sem CORS, e o cookie HttpOnly do refresh token fica no domínio do site).
- O site é **estático** (`output: "export"`, pasta `out/`), publicado no S3 atrás
  do mesmo CloudFront da API. Não há servidor Node em produção.
- Consultas públicas (lista, busca, detalhe) rodam no navegador, pelo `/api`
  (`lib/api/publico.ts`), com cache em memória de 2 minutos. O build não chama a API.
- Existe uma única página de palavra, `/palavras/_/`. O CloudFront (uma
  CloudFront Function no template do backend) entrega essa página para qualquer
  `/palavras/<slug>/`, e o componente lê o slug do endereço; no `next dev` um
  rewrite do `next.config.ts` faz o mesmo. Assim, palavras aprovadas depois da
  publicação funcionam sem novo build.
- Sessão (`lib/sessao.ts`): access token só em memória; ao abrir o site chama
  `POST /api/auth/refresh`; num 401 renova uma vez e repete a chamada. As
  renovações são serializadas entre abas (Web Locks), porque reutilizar um
  refresh token antigo encerra todas as sessões.

## Publicação (AWS, ambiente dev)

Com o perfil `tcc` da AWS CLI ativo (`aws login --profile tcc`):

```bash
npm run build
BUCKET=$(aws cloudformation describe-stacks --profile tcc --region us-east-2 --stack-name tcc-dicionario-dev --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
aws s3 sync out/_next/static "s3://$BUCKET/_next/static" --profile tcc --region us-east-2 --cache-control "public,max-age=31536000,immutable"
aws s3 sync out/ "s3://$BUCKET/" --profile tcc --region us-east-2 --delete --exclude "_next/static/*" --cache-control "no-cache"
```

Depois, invalide o cache do CloudFront (`/*`) para as páginas novas aparecerem
na hora. Os arquivos de `_next/static` têm nome único por versão e podem ficar
em cache por um ano.

| Área | Arquivos |
| --- | --- |
| Palavras (público) | `lib/api/publico.ts`, `lib/palavras.ts` |
| Conta | `lib/sessao.ts`, `app/entrar`, `app/cadastrar`, `app/verificar-email` |
| Contribuições | `lib/contribuicoes.ts`, `app/contribuir`, `app/contribuir/minhas` |
| Moderação | `lib/moderacao.ts`, `app/moderacao` |
| Usuários | `lib/usuarios.ts`, `app/moderacao/usuarios` |
