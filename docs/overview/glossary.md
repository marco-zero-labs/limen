Owner: Ryan · Status: draft · Last reviewed: 2026-11-24

# Glossary

The app speaks pt-BR, and some domain values and routes in the code keep the Portuguese word. The code value is shown where it differs from the term.

## Church terms

| Term | Meaning |
| --- | --- |
| Igreja (church) | One customer of Limen. Each church has its own license and sees only its own data |
| Pastor | Profile with full access, including pastoral notes and prayer requests |
| Secretaria | The church office profile: edits people, visitors, attendance, ministries and calendar |
| Líder (`lider`) | Ministry leader profile: sees their own ministry and the visitors assigned to them |
| Membro | A member of the church |
| Congregado | Someone who attends regularly but is not a member |
| Visitante | Someone who visited and is being followed up |
| Família | A household, linking people |
| Ministério | A ministry, such as worship or children, with a leader, members and roles |
| Culto | A worship service. Recurring services become activities every week |
| Célula | A small group meeting, usually in a home |
| Atividade | A service on a given date, or a one-off calendar event |
| Agenda | The calendar of services, small groups and events |
| Escala | A ministry's schedule for one activity: who serves in which role |
| Vaga (`Slot`) | One position in a schedule: confirmed (`confirmado`), waiting (`aguardando`) or declined (`recusou`) |
| Frequência | Attendance. Recorded as a headcount (`contagem`) or a roll call (`chamada`) |
| Turma | The group whose names appear in a roll call |
| Nota pastoral | A pastor's note on a person. The office can read it; leaders cannot |
| Pedido de oração | A prayer request. Sensitive: only the pastor sees it |
| Igreja-piloto | A church in the pilot, using Limen with real data before paying |

## Visitor follow-up

| Term | Meaning |
| --- | --- |
| Ficha | The visitor form, opened by a QR code at the door, without login (`/ficha`) |
| Acompanhamento (`FollowUp`) | The follow-up of one visitor: stage, person responsible, next contact and contact log |
| Etapa (`Stage`) | Primeira visita, Contato feito, Retornou, Em integração, Membro |
| Responsável | The person responsible for contacting a visitor |
| Próximo contato | The date the next contact is due. Suggested after each contact: 2 days after no answer, 7 days after a conversation |
| Contato | One contact: Ligação (call), WhatsApp, Visita (home visit), Mensagem (message) or Recepção (the form at the door, which does not count as an attempt) |
| Resultado | The result of a contact: Conversou (talked), Não atendeu (no answer), Retornou depois (called back later) |

## Technical terms

| Term | Meaning |
| --- | --- |
| Repository | The interface every screen uses for data (`src/data/repository.ts`). Swapping the implementation moves the app from local data to a server |
| LocalRepository | Today's implementation: AsyncStorage on the phone, localStorage on the web. Each device has its own data |
| `useQuery` | The hook that reads from the repository and reloads when the data changes (`src/data/DataProvider.tsx`) |
| Sample data | The fictional church in `src/data/seed.ts`, with dates relative to today until someone changes something |
| Route group | A folder in parentheses in `src/app`, such as `(public)`, that groups routes without changing the URL |
| Typed routes | Expo Router generates route types in `.expo/types`, so `tsc` rejects links to routes that do not exist |
| CNG | Continuous Native Generation: `ios/` and `android/` are generated from `app.json`, never edited by hand |
| EAS | Expo Application Services: cloud builds, store submission and updates |
| Tenant isolation | Each church reads and writes only its own rows: `church_id` on every table, enforced by the backend (#15) |
| ADR | Architecture Decision Record: a short file recording one decision and why |
| Level | The Marco Zero Labs product level: 0 idea, 1 prototype, 2 pilot, 3 paid |
| Gate | A condition that must be met before the next phase, not a date |

## Privacy terms (LGPD)

| Term | Meaning |
| --- | --- |
| LGPD | Lei Geral de Proteção de Dados, Brazil's data protection law |
| Titular | The data subject: the person the data is about |
| Controlador | The controller, who decides why and how data is used |
| Operador | The processor, who handles data on the controller's behalf |
| Dado pessoal sensível | Sensitive personal data. Includes religious conviction and membership of religious organizations, so church data falls here |
| Consentimento | Consent, recorded per person as given (`dado`), pending (`pendente`), verbal (`verbal`) or refused (`recusado`), with how it was given |
| Termo | The consent term shown to the visitor (`/termo`). The current text is an example, pending a lawyer's review |
| Encarregado | The data protection officer named by the controller |
| DPA | Data Processing Agreement between the controller and the processor |
