Owner: Ryan · Status: current · Last reviewed: 2026-11-24

# Changelog

All notable changes to this project are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions will follow [Semantic Versioning](https://semver.org/) from the first release. Nothing has been released yet: the web build on GitHub Pages always shows `main`.

## [Unreleased]

### Added

- House docs: `CLAUDE.md`, `docs/README.md`, the overview (product, roadmap, open decisions, glossary) and this changelog (#4).
- `npx expo lint` with `eslint-config-expo` and the `npm run lint` script (#8).
- GitHub Actions workflow that runs the typecheck and the tests and publishes the web build to GitHub Pages on every push to `main`.
- The prototype, with fictional data stored on the device and simulated login as Pastor, Secretaria or Líder:
  - Home, visitors with stages, person responsible and next contact, contact recording with a WhatsApp message, new visitor and the public visitor form with consent.
  - People and families, attendance by headcount or roll call, ministries and schedules with confirmation by link, calendar, permissions and the initial setup with spreadsheet import.
  - Responsive navigation: sidebar from 1024px wide, bottom tabs below.
  - Loading, error and empty states, a demo of them in settings, and search.

### Changed

- `AGENTS.md` points to `CLAUDE.md` (#4).
- The app is called Limen instead of Ekklesia: app name, web address `/limen` and scheme `limen`.
- Postal code lookup in the initial setup: erasing a digit during a lookup now shows the default help text instead of staying on "Buscando o endereço…" (#8).
- Workflow actions updated to their Node 24 versions.

### Fixed

- `tsc` failed locally once Expo Router generated route types, because of the back route in the person form (#8).
- The screen stays mounted when the window crosses 1024px wide, and the sample birthdays list is limited.
