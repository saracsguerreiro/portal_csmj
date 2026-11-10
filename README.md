# Intranet CSMJ · Protótipo

Protótipo de alta fidelidade da intranet do Conselho Superior da Magistratura Judicial (Projecto JURIS 5.0), construído com Next.js, React, TypeScript, Tailwind CSS e Lucide, segundo o Design System CSMJ v2.0.

## Ver online

https://saracsguerreiro.github.io/portal_csmj/

O site é publicado automaticamente a cada envio para `main` (GitHub Actions). Não tem servidor: as regras de âmbito e permissões correm no browser, e o que cada pessoa faz (aprovações, reservas, comentários) fica guardado no seu próprio browser. "Repor os dados", no painel do protótipo, volta ao início.

## Executar localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:8490. O botão de controlos no canto inferior esquerdo troca o perfil, a unidade e simula falhas de ligação.

## Organização

- `src/design-system` — tokens, componentes e fontes locais
- `src/config/entity.ts` — marca da entidade (nome, logótipo, cores, contactos)
- `src/data` — dados fictícios, um ficheiro por tipo
- `src/lib` — camada de dados com as regras de âmbito e permissões (`handlers.ts` faz o papel da API)
- `src/i18n` — textos em Português (Angola), preparado para Inglês
- `docs/capturas` — capturas de cada fase

Todos os nomes e dados são fictícios.
