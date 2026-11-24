# Limen

Limen (antes Ekklesia, do latim "soleira"): app de gestão de igrejas evangélicas da Marco Zero Labs. Um único projeto Expo que roda no celular (Expo Go) e na web.

- **Web:** https://marco-zero-labs.github.io/limen/
- **Design de referência:** [marco-zero-labs/ekklesia-design](https://github.com/marco-zero-labs/ekklesia-design) (33 telas; tokens em `telas/design-system.html`)

<img src="docs/inicio-web.png" alt="Início na web" width="640"> <img src="docs/inicio-celular.png" alt="Início no celular" width="200">

Todos os nomes, telefones e dados são fictícios. O texto do termo de consentimento é exemplo e será revisado por advogado.

## Rodar

```bash
npm install
npx expo start            # abre o QR code para o Expo Go (mesma rede Wi-Fi)
npx expo start --tunnel   # se o celular não estiver na mesma rede
npx expo start --web      # web local em http://localhost:8081/limen
```

Na primeira abertura, escolha o perfil em **Entrar como** (Pastor, Secretaria ou Líder). Dá para trocar em **Configurações**.

## Testes e build

```bash
npm test                  # regras de negócio, permissões, dados de exemplo, repositório, importação
npx tsc --noEmit          # TypeScript strict
npx expo lint             # ESLint com eslint-config-expo (eslint.config.js)
npm run build:web         # npx expo export -p web + 404.html e .nojekyll para o GitHub Pages
```

Cada push na `main` roda os testes e o build no GitHub Actions e publica `dist/` no Pages (`.github/workflows/pages.yml`).

## Como está organizado

```
src/app/            rotas (Expo Router)
  (app)/            área logada, com sidebar (≥ 1024px) ou abas embaixo
  (setup)/          configuração inicial, uma página por etapa
  (public)/         ficha do visitante (/ficha), confirmação de escala (/escala/[id]) e termo, sem login
src/components/     componentes base (texto, botões, campos, listas, toast, estados, gráfico)
src/theme/tokens.ts tokens extraídos do design-system.html
src/domain/         regras de negócio puras (próximo contato, visita, etapas, chamada, permissões…)
src/data/           tipos, repositório (interface), implementação local e dados de exemplo
__tests__/          testes unitários
```

### Dados

Não há servidor nesta versão. As telas falam só com a interface `Repository` (`src/data/repository.ts`); a implementação `LocalRepository` guarda tudo no aparelho: AsyncStorage no celular e localStorage na web. Para trocar por Supabase, basta outra implementação da interface, instanciada em `src/data/DataProvider.tsx`.

Consequência importante: **cada aparelho tem os seus dados**. A ficha pública pelo QR code e o link de confirmação de escala funcionam de verdade, mas a resposta fica no aparelho onde foi preenchida. Para ver o fluxo completo nesta versão, use o mesmo aparelho/navegador (ex.: abra o link de confirmação a partir da tela da escala).

Os dados de exemplo (Igreja Batista do Bairro Novo, 538 cadastros, 24 visitantes, 9 ministérios) usam datas relativas ao dia de hoje. Enquanto ninguém alterar nada, eles são recriados a cada dia; depois da primeira alteração, os dados passam a ser seus. **Configurações › Restaurar dados de exemplo** volta ao início.

### Estados

Em **Configurações › Demonstração dos estados** dá para simular conexão lenta (skeleton) e erro (Tentar de novo). **Começar com a igreja vazia** mostra o primeiro uso e a importação de planilha (CSV).
