# Limen: instructions for Claude Code

## Product

Limen is a management app for evangelical churches in Brazil, built first so a church does not lose its visitors: the visitor fills in a form through a QR code at the door, each visitor gets a person responsible for the next contact, and the pastor sees who was contacted, who came back and who became a member. It also covers people and families, attendance, ministries and schedules, and a calendar. Users: the pastor, the church office (Secretaria) and ministry leaders (Líder). One Expo project for iOS, Android and web.

Level 1 (prototype: fictional data, no server). Company: Marco Zero Labs. See [docs/overview/product.md](docs/overview/product.md).

## How to work with us

- Teach as you go: explain the plan before changing code; after, explain what changed, why, and link the docs you used.
- Git: you may create a local branch (`<type>/<issue>-<short-name>`). Do not commit, push, merge or open PRs unless we ask in the conversation; we read the diff first.
- Commits: Conventional Commits in English (`feat(visitors): …`). Branches go to `dev`, then `qa`, then `main` once #9 lands; until then, pull requests go to `main`.
- Ask before adding a dependency, a module or an external service. Add packages with `npx expo install`, never `npm install <package>`.
- Code, identifiers, new comments, commits and technical docs in English. Business docs in pt-BR. Older Portuguese comments stay until the file is touched for another reason.
- Domain values and routes are in Portuguese (`primeira_visita`, `/visitantes`). Keep them; [docs/overview/glossary.md](docs/overview/glossary.md) translates them.
- UI text is pt-BR, written in the screens. It moves to i18n keys with #57.

## Architecture (see docs/adr)

The first ADRs are being written (#10 stack, #11 branches, #12 backend). Until then, these rules hold:

- One Expo SDK 58 project. Expo Router, with routes in `src/app` only: `(app)` behind login, `(setup)` for the initial setup, `(public)` for the visitor form, schedule confirmation and consent, without login. Components, hooks and rules live outside `src/app`.
- Screens never touch storage. They read through `useQuery` and write through `useRepo()` (`src/data/DataProvider.tsx`), which talk only to the `Repository` interface (`src/data/repository.ts`).
- Today the implementation is `LocalRepository`: AsyncStorage on the phone, localStorage on the web. The server implementation replaces it in `DataProvider.tsx` (#17). The backend is `[to decide]` (#12).
- Business rules are pure functions in `src/domain`, covered by tests in `__tests__`.
- No `ios/` or `android/` folders: native projects are generated (Continuous Native Generation). Configure native behavior in `app.json` and config plugins.

## Security and privacy (LGPD)

- No secrets in code, config or logs. No CPF stored. Mask phone and e-mail in logs.
- Validate all input; deny by default on authorization.
- Every screen checks the permission matrix in `src/domain/permissions.ts` (Pastor, Secretaria, Líder). A leader sees only their own ministry and the visitors assigned to them.
- Prayer requests are visible only to the pastor. Pastoral notes: the pastor edits, the office reads, leaders never see them.
- Every person carries a consent status (given, pending, verbal, refused) and how it was given.
- Religious conviction is sensitive personal data under the LGPD, so treat every person record as sensitive.
- This repository is public (#22). All names, phones and data in it are fictional. Never commit real church data or the founder notes.
- With a server: `church_id` on every table, enforced by the backend, with an isolation test for every new data access (#15).

## Design system

- Design reference: [marco-zero-labs/ekklesia-design](https://github.com/marco-zero-labs/ekklesia-design) (`telas/design-system.html`). `docs/design-system` does not exist yet.
- Colors from `src/theme/tokens.ts` only. Do not add hex or rgb values to screens or components; the few left move to tokens with #56. Use `space` and `radius` where they fit.
- Sentence case. No emoji, no exclamation marks, no gradients.
- The accent (`petrol600` today) only on what can be tapped, the focus ring and progress. Amber only for pending, error only for errors. Never color as the only signal.
- Light theme only today; dark theme, the product's own accent color and the door motif come with #56. WCAG 2.2 AA; touch targets 44pt on iOS and 48dp on Android.
- IBM Plex Sans for text. Sidebar from 1024px wide, bottom tabs below (`src/theme/useLayout.ts`).
- Every screen has loading, error and empty states (`src/components/DataState.tsx`). Try them in Configurações › Demonstração dos estados.

## Commands

```bash
npm install
npx expo start              # Expo Go on the phone (same Wi-Fi)
npx expo start --web        # http://localhost:8081/limen
npm test                    # Jest
npx tsc --noEmit            # typecheck
npx expo lint               # ESLint (eslint.config.js)
npm run build:web           # static export for GitHub Pages
npx expo install <package>  # add a package with the SDK-compatible version
```

## Definition of done

- `npx tsc --noEmit`, `npx expo lint` and `npm test` pass with no errors.
- Checked at phone width and at desktop width (1024px and up); loading, error and empty states built.
- Checked with the three profiles (Pastor, Secretaria, Líder).
- Contrast, screen reader labels and touch targets checked.
- Fictional data only.
- Docs or ADR updated in the same PR, or the `no-docs-needed` label with a reason.

## Documentation (living docs)

- Docs live in `docs/` and change in the same PR as the code. New decision, new ADR. See [docs/README.md](docs/README.md).
- Every doc has Owner, Status and Last reviewed; update Last reviewed when you edit.
- Anything undecided is `[to decide]` and listed in [docs/overview/open-decisions.md](docs/overview/open-decisions.md). Never invent a figure, customer, date or certification.
- Add user-visible changes to [CHANGELOG.md](CHANGELOG.md).
- At the end of every task, list the docs you created or updated, or say "no docs needed" and why.

## Team and ownership

| Area | Owner | Backup |
| --- | --- | --- |
| Platform: backend (choice included), auth, tenant isolation, security, LGPD, CI, web build | Caio (CaioLouren) | Ryan |
| App: Expo screens, data model, repository, import, WhatsApp handoff | Ryan (ryramx) | Caio |
| Notifications, reminders and pilot metrics | Issac (issacbarbosa) | Ryan |

- The backup reviews the owner's PRs. Items that depend on Ewerton (accounts, payments, lawyer, pilot churches) carry the `needs-ewerton` label, and Caio follows them up.
- Caio has the final word on architecture.
