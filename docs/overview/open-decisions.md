Owner: Ryan · Status: draft · Last reviewed: 2026-11-24

# Open decisions

Everything undecided, in one place. When one is settled, record the outcome (as an ADR if it is hard to reverse) and remove it from here.

Figures from the founder work (prices, costs, simulated buyer answers) stay outside this repository while it is public (#22).

## Business and legal

| Decision | Why it matters | Owner | Blocks |
| --- | --- | --- | --- |
| First segment: church size, denomination, region and who signs the purchase | A condition of the founder board; defines the pilot churches and the marketing | Ewerton | #39 |
| Prices and plans | Current prices are hypotheses from a simulated buyer panel and public competitor prices; they must be validated with the pilot | Ewerton | #50, #55 |
| What the pilot churches receive and give in return | Needed before inviting churches: setup by the team, terms, sharing of funnel numbers | Ewerton | #39, #44 |
| Name Limen at INPI, classes 9 and 42 | The name must be free before investing in the brand | Ewerton, Caio | #21, #56 |
| Repository visibility | The template asks for private; the repository is public, and GitHub Pages on a private repository depends on the organization's plan | Caio | #22, founder notes in the repository |
| License | `LICENSE` is still the MIT license that came with the Expo template, with Expo's copyright. The template asks for a proprietary license, and the repository is public | Caio, Ewerton | #22 |
| LGPD roles: is each church the controller and Marco Zero Labs the processor? | Defines the privacy policy, the DPA and who answers data subjects | Caio, lawyer | #35, #49 |
| Legal basis for church data | Religious conviction is sensitive personal data under the LGPD, which narrows the legal bases available | Caio, lawyer | #32, #35, #37 |
| Technology lawyer | Must review terms, privacy policy and consent text before Gate A | Ewerton | #37, #49 |
| Payment provider: Pix, card or both | Recurring billing before the first paying church | Ewerton, Caio | #48 |
| Apple and Google developer accounts | Needed for development builds and the stores | Ewerton | #34, #54 |
| Paid ads and accounting | The two largest fixed costs in the founder estimates; the partners decide | Ewerton | None |

## Product

| Decision | Options or question | Owner |
| --- | --- | --- |
| Pilot success targets | Contacts on time, visitors moving through the funnel, leaders still recording after 30 days: the numbers are set before the pilot (#38) | Issac |
| Reminder and summary channel | Push, e-mail or WhatsApp for the person responsible (#30) and the pastor's summary (#31). Depends on #20 | Issac |
| Product accent color | `petrol600` (#0F4C5C) is too close to Ritmo's petrol; the template requires a color no other Marco Zero Labs product uses (#56) | Ryan |
| Warm background and dark theme | The template sets a warm background (#FBFAF7) and light and dark themes; the prototype has `paper` #F5F3EF and light only (#56) | Ryan |
| UI languages | pt-BR only, or more languages, once text moves to i18n keys (#57) | Ryan |

## Technical

| Decision | Options or question | Owner |
| --- | --- | --- |
| Backend | Supabase is one option; Caio decides and records it in ADR 0003 (#12). Blocks #13 to #18 | Caio |
| Where the data is hosted | Depends on the backend. Until decided, no doc may promise data hosted in Brazil | Caio |
| Push notifications on Expo SDK 58 | expo-notifications, EAS and the limits of web push (#20) | Issac |
| Retention periods | How long visitors, contacts, consent records and the audit log are kept (#33, #35) | Caio, lawyer |

## Marco Zero Labs standard

Decisions of the company standard that change this repository when they are made.

| Decision | Changes here | Owner |
| --- | --- | --- |
| One interface font for all products, or one per product | IBM Plex Sans today | Partners |
| Minimum text size: 13 or 15 px | Type scale in `src/theme/tokens.ts` | Partners |
| Icon library: Lucide or a square-corner set | Icons in `src/components` | Partners |
| Company handbook | `docs/handbook` and the link in CLAUDE.md | Partners |
| Template repository on GitHub | Files copied from it, such as workflows and templates (#5) | Partners |
