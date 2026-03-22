# JiraSync

React/TypeScript-app som synkroniserer timeføring mellom Jira og Bekk Timekeeper. Appen henter worklogs fra Jira og timeføringer fra Bekk, mapper Jira-saker til Bekk-timekoder, og lar brukeren pushe timer inn i Bekks ukentlige timeark.

## Forutsetninger

- Node.js 20+
- pnpm (`corepack enable` aktiverer riktig versjon)
- Tilgang til Jira (Atlassian) og Bekk Timekeeper
- Environment-variabler (se [Konfigurasjon](#konfigurasjon))

## Kom i gang

Sett opp nødvendige konfigurasjoner først  (se [Konfigurasjon](#konfigurasjon))

```bash
pnpm install
pnpm start
```

## Begreper

| Begrep | Betydning |
|-|-|
| Atlassian | Leverandør av Jira, Confluence, mm. Brukes også for å betegne hele det "økosystemet". |
| Ansatt-id, employee id | Unik numerisk id for en ansatt i Bekk, f.eks. `1545` |
| Timer, Timekeeper | Bekks timeføringsløsning. Den vanlige klient-løsningen ligger bak URLene timer.bekk.no og timekeeper.bekk.no |
| Timekode | En kode i Bekk Timekeeper som representerer et prosjekt eller en aktivitet man fører timer på. |
| Timekode id | En unik numerisk ID for en timekode |
| Timekode-kode | Unik tekstlig kode for en timekode. Prefikset med forkortelse for prosjekt eller kunde. F.eks. `KOM1000` for kompetansebygging. |
| Issue | En sak i Jira. Kalles også ticket, lapp, oppgave. |
| Issue Id | Unik numerisk id for et issue, f.eks. `123`. |
| Issue Key | Unik betegnelse for et issue. Består av en Project Key og et løpenummer, f.eks. `ITOPS-42`. |
| Project | En samling issues i Jira, typisk knyttet til et team eller et produkt. Tilgang begrenses ofte på prosjekt-nivå, så man kun kan se issues i prosjekter man er med i. |
| Project Key | Unik forkortelse som betegner et Jira-prosjekt, f.eks. `ITOPS` for "IT Operations Helpdesk". |
| Worklog | En enkelt timeføring på et enkelt Jira-issue. Merk forskjell mot Bekk: Jira støtter flere worklogs per issue per dag, mens Bekk har ett antall timer per timekode per dag. |

## Scripts

| Script | Beskrivelse |
|---|---|
| `pnpm start` | Start Vite dev-server |
| `pnpm build` | Generer API-typer og bygg for produksjon |
| `pnpm test` | Kjør tester (Vitest) |
| `pnpm generate` | Regenerer API-typer fra OpenAPI-skjemaer |
| `pnpm generate:bekk` | Regenerer kun Bekk-typer |
| `pnpm generate:jira` | Regenerer kun Jira-typer |

## Arkitektur

* Autentiserer mot Bekk og Atlassian, se [docs/authentication.md](docs/authentication.md)
* Gjør kall mot Bekk Timekeeper og Jira rett fra nettleser
* Finner ut hvilken Bekk timekode en Jira issue tilhører
* Samler sammen alle Jira issues for en gitt timekode
* Sammenligner faktisk Bekk-timeføring med forventet (basert på Jira-timeføring)




### Sentrale deler

- **`src/timecode-map.ts`** — Kjernelogikk som mapper Jira-prosjekter, komponenter og epics til Bekk-timekoder. Oppdateres når Jira-prosjekter endrer struktur.
- **`src/data/useWeek.ts`** — Henter data fra begge systemer for en gitt ISO-uke.
- **`src/Utils/stateUtils.ts`** — Slår sammen Jira- og Bekk-data til en samlet visning.
- **`src/components/TimeTable/`** — Ukentlig rutenett som viser og synkroniserer timer.
- **`src/backend/`** — Netlify-funksjoner som håndterer Jira OAuth-flyten server-side.

### Teknologivalg

- **Vite** — Bundler og dev-server
- **TanStack React Query** — Server-state for alle API-kall
- **TanStack Router** — Filbasert routing med code splitting
- **openapi-typescript + openapi-fetch** — Typesikre API-klienter generert fra OpenAPI-skjemaer
- **styled-components** + **Lisa** (Udirs designsystem) — Styling
- **MSAL React** — Bekk-autentisering (Azure Entra ID)

### Autentisering

Se [docs/authentication.md](docs/authentication.md) for detaljer om autentiseringsflyten mot Jira og Bekk.

## Konfigurasjon

Appen konfigureres med environment-variabler. Opprett en `.env`-fil i roten for lokal utvikling.
Kopier [.env.example](.env.example), renamer til `.env` og fyll inn med mangelnde verdier.

| Variabel | Beskrivelse | Kontekst |
|---|---|---|
| `NPM_TOKEN` | En NPM-token med tilgang til `@utdanningsdirektoratet` | Bygg av Klient | 
| `VITE_BEKK_BASE_URL` | Bekk API-endepunkt | Klient |
| `VITE_BEKK_ENTRA_TENANT_ID` | Azure Entra tenant ID | Klient |
| `VITE_BEKK_ENTRA_CLIENT_ID` | Azure Entra client ID | Klient |
| `VITE_BEKK_ENTRA_SCOPE` | Azure Entra scope | Klient |
| `VITE_ATLASSIAN_CLOUD_ID` | Jira Cloud tenant ID | Klient |
| `JIRA_CLIENT_ID` | Jira OAuth client ID | Server |
| `JIRA_CLIENT_SECRET` | Jira OAuth client secret | Server |
| `VITE_DEBUG` | Aktiver devtools-overlay | Klient |

`NPM_TOKEN` må settes som en miljøvariabel på "vanlig vis", det hjelper ikke å ha den i .env-fila da pnpm ikke leser .env når den gjør install.
Server-variablene brukes kun av Netlify Functions og eksponeres ikke til nettleseren.

## Deploy

Appen deployes automatisk til Netlify. `netlify.toml` definerer build-kommando, publish-mappe (`dist/`) og plassering av serverless-funksjoner (`src/backend/`).

CI kjører tester via GitHub Actions på pull requests.
