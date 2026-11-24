Owner: Ryan · Status: draft · Last reviewed: 2026-11-24

# Limen documentation

Level 1 (prototype). The app runs with fictional data and no server, and no church uses it yet. Unless a page says otherwise, these docs describe the planned design, not running software. If a doc and the code disagree, fix one of them in the same pull request.

Numbers such as #12 are GitHub issues in this repository. Live status is on the [Limen project board](https://github.com/orgs/marco-zero-labs/projects/2).

## Where to start

| You want to | Read |
| --- | --- |
| Understand the product | [overview/product.md](overview/product.md) |
| See the plan and what is undecided | [overview/roadmap.md](overview/roadmap.md), [overview/open-decisions.md](overview/open-decisions.md) |
| Understand a word used in the app or the code | [overview/glossary.md](overview/glossary.md) |
| Run, test and change the code | [../README.md](../README.md), [../CLAUDE.md](../CLAUDE.md) |
| See what changed | [../CHANGELOG.md](../CHANGELOG.md) |
| Build or change a screen | The design reference in [marco-zero-labs/ekklesia-design](https://github.com/marco-zero-labs/ekklesia-design) and `src/theme/tokens.ts` |

Still to come: the business guide in pt-BR (`business/guia-comercial.md`, #42), the first ADRs (`adr/`, #10, #11, #12), privacy and security (`privacy/`, `security/`, #35, #36, before Gate A) and operations (`operations/`, #46, #47, before Gate B).

## Map

| Folder | Question it answers |
| --- | --- |
| [overview/](overview/) | What are we building, in what order, and what is still open? |
| [planning/](planning/) | Which issues, labels, milestones and owners did the GitHub setup start from? |

The README screenshots (`inicio-web.png`, `inicio-celular.png`) also live in this folder.

## Living docs rules

1. Docs change in the same PR as the code they describe.
2. Every doc starts with Owner (one person), Status (draft or current) and Last reviewed.
3. A hard-to-reverse decision gets an ADR. Never rewrite an accepted ADR; supersede it.
4. One source of truth per subject. Link, never copy.
5. Mark anything undecided as `[to decide]` and list it in [open-decisions.md](overview/open-decisions.md). Never invent a figure, customer, certification or date.
6. A decision made in a conversation goes into the repository within a week.
7. Legal drafts are never published before a lawyer reviews them.
8. Each month, look for docs with Last reviewed older than 60 days (#58).
