Owner: Ryan · Status: draft · Last reviewed: 2026-11-24

# Product

Limen is a management app for evangelical churches in Brazil, built first so a church does not lose its visitors. It is a level 1 prototype: it runs on the phone and the web with fictional data and no server, and no church uses it yet.

The name comes from the Latin for "threshold": the door a visitor walks through. One license per church, not per denomination.

## The problem

What we expect to find, to confirm in the pilot:

| Who | What happens today | What it costs |
| --- | --- | --- |
| Pastor | Visitors arrive every week, and their follow-up lives in notebooks, spreadsheets and WhatsApp groups | Nobody knows how many were contacted, came back or became members |
| Person responsible for a visitor | The contact happens on WhatsApp or by phone, and nothing records it | Contacts are late or forgotten, and nobody sees it in time |
| Church office (Secretaria) | The member list is spread across spreadsheets | Duplicate work and outdated records |

## Who it is for

First target, as a hypothesis to validate in the pilot: independent evangelical churches or small denominations, from 50 to 500 members, that receive visitors every week. The exact first segment (size, denomination, region and who signs the purchase) is `[to decide]`.

| Role | Where they use it (hypothesis) | Sees |
| --- | --- | --- |
| Pastor | Phone and computer | Everything, including pastoral notes and prayer requests |
| Secretaria (church office) | Computer | People, visitors, attendance, ministries and calendar; reads pastoral notes |
| Líder (ministry leader) | Phone | Their own ministry and the visitors assigned to them |
| Visitor | Phone, without login | The visitor form by QR code and the consent term |
| Member on a schedule | Phone, without login | The confirmation link for their slot |

The full permission matrix is in `src/domain/permissions.ts`.

## What it does

The pilot build ships only the visitor core (#26). The rest exists in the prototype and returns on the server in Phase 3. Phases are in the [roadmap](roadmap.md).

| Capability | Summary | Phase |
| --- | --- | --- |
| Visitor form | The visitor fills in their details through a QR code at the door, with LGPD consent, without login | 1 |
| Visitor follow-up | Stages from first visit to member, a person responsible, the next contact date and a log of every contact | 1 |
| WhatsApp handoff | Opens the conversation in the user's own WhatsApp with a ready message, then records the result in one tap (#28) | 1 |
| Reminders | The person responsible is reminded when a contact is due (#30); the pastor gets a summary of overdue contacts and new visitors (#31) | 1 |
| People and families | Members, regular attenders and visitors, families, ministries, pastoral notes, prayer requests | 1 |
| Member import | From a spreadsheet (CSV) during the initial setup | 1 |
| Roles and audit | Pastor, Secretaria and Líder with real login (#16); a log of who changed what (#33) | 1 |
| Ministries and schedules | Who serves where, with confirmation by link | 3 |
| Attendance | Headcount per service or roll call per group | 3 |
| Calendar | Services, small groups and one-off events | 3 |
| Plans and billing | Paid plans and recurring billing (#48, #55) | Gate B, 3 |

## What it is not

- Not a system for a whole denomination: each church has its own license and sees only its own data.
- Not an app for members: visitors and members never log in; they use public links (form, schedule confirmation, consent).
- Not a WhatsApp robot: today Limen opens the conversation in the user's WhatsApp and never sends messages on its own.
- It does not store CPF.
