Owner: Ryan · Status: draft · Last reviewed: 2026-11-24

# Issues plan

Every planned issue, by milestone. This is the plan the GitHub setup and the issues were created from; the [project board](https://github.com/orgs/marco-zero-labs/projects/2) holds the live status. Numbers are the GitHub issue numbers.

It follows the Ritmo standard (`marco-zero-labs/ritmo`, `docs/handbook/github-workflow.md`) and the "Modelo de novo produto Marco Zero Labs". Phases come from the founder board's conditions (in the founder notes, kept outside this repository while it is public): backend, real login and LGPD end to end before any real data; launch with the visitor core only; 5 to 10 pilot churches with targets set in advance.

Sizes: S up to 2 days, M up to a week, L more than a week. Rough guides, not commitments. Priorities: p0 needed for the milestone, p1 important, p2 later. Nothing here has a date.

## 1. GitHub setup (created once, before the issues)

### Ownership

Same split as Ritmo. Caio has the final word on architecture, including which backend Limen uses (#12); no backend is chosen yet.

| Area | Owner | Backup |
| --- | --- | --- |
| Platform: backend (choice included), auth, tenant isolation, security, LGPD, CI, web build | Caio | Ryan |
| App: Expo screens, data model, repository, import, WhatsApp handoff | Ryan | Caio |
| Notifications, reminders and pilot metrics | Issac | Ryan |

Items that depend on Ewerton (accounts, payments, lawyer, pilot churches) carry `needs-ewerton`, and Caio follows them up.

### Labels

The prefixed set Ritmo uses on its issues, adapted to Limen. Ritmo's older unprefixed labels (`api`, `web`, `phase-0`…) are not copied: phase lives in the milestone and in the board's Phase field.

| Group | Labels |
| --- | --- |
| Area | `area:platform`, `area:data`, `area:mobile`, `area:web`, `area:notifications`, `area:privacy`, `area:infra`, `area:docs` |
| Type | `type:feature`, `type:bug`, `type:chore`, `type:research`, `type:security` |
| Priority | `priority:p0`, `priority:p1`, `priority:p2` |
| Flow | `epic`, `blocked`, `needs-ewerton`, `no-docs-needed`, `good-first-issue` |

GitHub's defaults (`bug`, `enhancement`, `documentation`, `accessibility`…) stay, because the issue templates and Dependabot use them.

### Milestones

1. Phase 0 · Foundation
2. Phase 1 · Visitor core
3. Gate A · Pilot starts
4. Phase 2 · Pilot
5. Gate B · First paying church
6. Phase 3 · Full product
7. Backlog · After pilot

### Project board

A new organization project, **Limen**, alongside project 1 (Ritmo), with the same fields:

| Field | Options |
| --- | --- |
| Status | Backlog, Next, In progress, In review, Done |
| Phase | 0, 1, Gate A, 2, Gate B, 3, Backlog |
| Area | platform, data, mobile, web, notifications, privacy, infra, docs |
| Priority | p0, p1, p2 |
| Size | S, M, L |
| Owner | Caio, Ryan, Issac |

### Branches and rulesets

`dev` → `qa` → `main`, the same three rulesets as Ritmo (`protect-dev`, `protect-qa`, `protect-main`):

| Branch | Rules |
| --- | --- |
| `dev` | No deletion, no force push. No review. Squash merge |
| `qa` | 1 approval, conversations resolved, merge commit, required checks |
| `main` | 2 approvals, conversations resolved, merge commit, required checks |

Required checks: `app` and `docs` (see #6, #7). Org admins can bypass, for emergencies only. GitHub Pages keeps publishing from `main`.

Work branches: `<type>/<issue>-<short-name>` from `dev`. Commits from now on: Conventional Commits in English (`feat(visitors): …`). Earlier commits stay as they are.

## 2. Issues

### Phase 0 · Foundation

Epics: #1 platform foundation (Caio); #2 app on a real backend (Ryan); #3 reminders foundation (Issac).

| # | Title | Area | Owner | Size | Priority | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| #4 | House docs: CLAUDE.md, AGENTS.md, docs/README, product, roadmap, open-decisions, glossary, CHANGELOG | docs | Ryan | M | p0 | none |
| #5 | Handbook: GitHub workflow, CODEOWNERS, issue and PR templates | docs | Caio | S | p0 | none |
| #6 | CI on pull requests: `app` job with typecheck, lint and tests; Pages deploy only from `main` | infra | Caio | S | p0 | #8 |
| #7 | Docs workflow: markdownlint, link check and docs guard (`docs` job) | infra | Caio | S | p1 | #4 |
| #8 | Set up `npx expo lint` and fix what it finds | mobile | Ryan | S | p0 | none |
| #9 | `dev` and `qa` branches and the three rulesets | infra | Caio | S | p0 | #6 |
| #10 | ADR 0001: stack and architecture of the prototype (Expo, Expo Router, Repository interface) | docs | Caio | S | p0 | none |
| #11 | ADR 0002: dev, qa and main branches | docs | Caio | S | p1 | #9 |
| #12 | Choose the backend and record it in ADR 0003 (Supabase is one option; Caio decides) | platform | Caio | M | p0 | none |
| #13 | Backend accounts and environments for dev and prod (needs Ewerton) | infra | Caio | S | p0 | #12 |
| #14 | Data model as migrations in the chosen backend, from `src/data/types.ts` | data | Ryan | L | p0 | #12, #13 |
| #15 | Tenant isolation: `church_id` on every table, enforced by the backend (row-level security or equivalent), and an isolation test | platform | Caio | L | p0 | #14 |
| #16 | Real login: e-mail sign-in, invitations and the Pastor, Secretaria and Líder roles | platform | Caio | L | p0 | #15 |
| #17 | Server repository implementing `Repository`, switched in `DataProvider.tsx` | data | Ryan | L | p0 | #14, #16 |
| #18 | Public routes (visitor form, schedule confirmation, consent) write to the server without login | platform | Caio | M | p0 | #15, #17 |
| #19 | Secrets and environment variables: EAS and GitHub secrets, nothing in the repository | infra | Caio | S | p0 | #13 |
| #20 | Research: push notifications on Expo SDK 58 (expo-notifications, EAS, web push limits) | notifications | Issac | S | p1 | none |
| #21 | Check the name Limen at INPI in the software classes (needs Ewerton) | docs | Caio | S | p1 | none |
| #22 | Decide repository visibility (the template asks for private; Pages depends on the org plan) | infra | Caio | S | p1 | none |

### Phase 1 · Visitor core

The launch scope from the board: visitors, QR form, person responsible, next-contact reminder and member import. Schedules, attendance and calendar wait.

Epics: #23 visitor core (Ryan); #24 reminders (Issac); #25 LGPD end to end (Caio).

| # | Title | Area | Owner | Size | Priority | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| #26 | Pilot build: hide schedules, attendance and calendar behind a flag | mobile | Ryan | S | p0 | #17 |
| #27 | Visitor funnel on the server: stages, person responsible, next contact | data | Ryan | M | p0 | #17 |
| #28 | WhatsApp handoff: open the chat from the visitor and record the result in one tap | mobile | Ryan | M | p0 | #27 |
| #29 | Member import (CSV) writing to the server | data | Ryan | M | p1 | #17 |
| #30 | Reminder to the person responsible when a contact is due | notifications | Issac | L | p0 | #20, #27 |
| #31 | Daily summary for the pastor: overdue contacts and new visitors | notifications | Issac | M | p1 | #30 |
| #32 | Consent end to end: record, revoke and show status; prayer requests visible only to the pastor | privacy | Caio | M | p0 | #18 |
| #33 | Audit log of who changed what, without personal data in logs | platform | Caio | M | p1 | #15 |
| #34 | Development build with EAS for Android and iOS (needs Ewerton for the Apple account) | infra | Ryan | M | p1 | #19 |

### Gate A · Pilot starts

The template's level 2. Nothing real enters the system before all of these are done.

| # | Title | Area | Owner | Size | Priority | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| #35 | docs/privacy: LGPD roles, data map, retention, data subject rights, subprocessors | privacy | Caio | M | p0 | #32 |
| #36 | docs/security: threat model, secrets, incident response | privacy | Caio | M | p0 | #15 |
| #37 | Terms, privacy policy and consent text reviewed by a lawyer (needs Ewerton) | privacy | Caio | M | p0 | #35 |
| #38 | Pilot success criteria written before the pilot (contacts on time, funnel progress, leaders still recording after 30 days) | docs | Issac | S | p0 | none |
| #39 | Choose 5 to 10 pilot churches (needs Ewerton) | docs | Caio | M | p0 | #38 |
| #40 | Usability test with pilot leaders, using fictional names and phones | mobile | Ryan | M | p1 | #28 |
| #41 | "Um produto da Marco Zero Labs" endorsement on the entry screen | mobile | Ryan | S | p2 | none |
| #42 | Commercial guide for Ewerton (docs/business/guia-comercial.md) | docs | Ryan | S | p1 | #4 |

### Phase 2 · Pilot

| # | Title | Area | Owner | Size | Priority | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| #43 | Pilot metrics: the success criteria measured from the data, per church | notifications | Issac | M | p0 | #38 |
| #44 | Onboarding run by the team: setup checklist, printable QR, message scripts | docs | Ryan | S | p1 | #39 |
| #45 | Weekly pilot review and the issues it opens | docs | Issac | S | p1 | #43 |

### Gate B · First paying church

The template's level 3.

| # | Title | Area | Owner | Size | Priority | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| #46 | docs/operations: environments, CI/CD, observability | infra | Caio | M | p0 | #6 |
| #47 | Runbooks: incident, backup and restore, rotating secrets | infra | Caio | M | p0 | #46 |
| #48 | Payment provider and recurring billing (Pix or card) (needs Ewerton) | platform | Caio | L | p0 | none |
| #49 | DPA template for churches (needs Ewerton) | privacy | Caio | S | p0 | #37 |
| #50 | Price validated with the pilot and recorded in an ADR | docs | Issac | S | p0 | #43 |

### Phase 3 · Full product

| # | Title | Area | Owner | Size | Priority | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| #51 | Bring back schedules and confirmation by link, on the server | mobile | Ryan | M | p1 | #26 |
| #52 | Bring back attendance and headcount, on the server | mobile | Ryan | M | p1 | #26 |
| #53 | Bring back the calendar, on the server | mobile | Ryan | S | p2 | #26 |
| #54 | Store builds and submission with EAS | infra | Ryan | M | p1 | #34 |
| #55 | Ampliado plan (large churches) and plan limits | platform | Caio | M | p2 | #48 |

### Backlog · After pilot

| # | Title | Area | Owner | Size | Priority |
| --- | --- | --- | --- | --- | --- |
| #56 | Visual identity per the template: own accent color, warm background, dark theme, `packages/tokens` | mobile | Ryan | L | p2 |
| #57 | i18n package: UI text through keys | mobile | Ryan | M | p2 |
| #58 | Monthly docs review (recurring, from the template) | docs | Ryan | S | p2 |

## 3. Still to do

- Branches and rulesets (#9), after the CI job `app` exists (#6), so the required checks can be found.
