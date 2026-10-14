# Autentisering

JiraSync autentiserer mot to systemer: Jira (Atlassian) og Bekk Timekeeper (Azure Entra ID). De to flytene er helt uavhengige av hverandre.

## Jira (Atlassian OAuth 2.0 med PKCE)

Jira-autentisering bruker OAuth 2.0 Authorization Code Grant med PKCE. Hele OAuth-flyten kjører server-side via Netlify Functions for å holde `JIRA_CLIENT_SECRET` utenfor nettleseren.

Se Atlassian-dokumentasjon om [OAuth 2.0 (3LO) apps](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/).

### Flyt


```mermaid
---
title: Atlassian auth flyt
config:
       subGraphTitleMargin:
              bottom: 12
---
flowchart TB
       init((bruker treffer /))
       finish((rendre innhold))

       subgraph getAccessToken [funksjon getAccessToken]
              accessTokenCheck{Har gyldig access token i session storage?}
              save[lagre access token i session storage]
       end
       init --> accessTokenCheck
       accessTokenCheck -->|ja| finish
       subgraph auth-session [be /jira-auth-session]
              refreshTokenCheck{Har gyldig refresh token i cookie?}
              refreshTokenCheck -->|ja| fetchAccessToken[gjør kall for å hente access token og ny refresh token]
              fetchAccessToken --> setRefreshToken1[Set-Cookie med ny refresh token]
              setRefreshToken1 --> returnAccessToken[returnerer access token i response body]
       end
       subgraph login [fe /login]
              button[bruker trykker lenke for å starte flyt]
       end
       subgraph auth-init [be /jira-auth-init]
              createChallenge[lager codeChallenge og codeVerifier]
              createChallenge --> setVerifier[Set-Cookie codeVerifier]
       end
       subgraph atlassian
              consent[Bruker gir samtykke]
       end
       subgraph auth-callback [be /jira-auth-callback]
              verify[sjekker codeChallenge i URL mot codeVerifier fra cookie]
              verify --> setRefreshToken2[Set-Cookie med refresh token]
       end
       refreshTokenCheck -->|nei| r([redirect]) --> login
       button -->|redirect| createChallenge
       setVerifier -->|redirect| consent
       consent -->|redirect| verify
       returnAccessToken --> save
       save --> finish
       accessTokenCheck -->|nei| x([API-kall]) --> refreshTokenCheck
       setRefreshToken2 -->|redirect| init
```

### Token-håndtering i nettleseren

Klienten (`src/login/jira/authContext.ts`) håndterer token-livssyklusen:

1. **Hent token**: Sjekker om det finnes et gyldig access token i `sessionStorage`
2. **Bruk cached token**: Hvis tokenet er gyldig i mer enn 60 sekunder til, returneres det direkte. Marginen hindrer at tokenet utløper mens forespørselen er underveis
3. **Refresh**: Hvis tokenet er utløpt (eller nær utløp), kaller `/.netlify/functions/jira-auth-session` som bruker refresh token-cookien til å hente nytt access token + refresh token. Parallelle kall deler én refresh-request, siden refresh tokens roteres og samtidige refreshes ellers ville ugyldiggjort hverandre
4. **Lagre**: Nytt access token og utløpstid lagres i `sessionStorage`

#### 401 fra Jira

Et token som ser gyldig ut lokalt kan likevel være avvist av Jira (f.eks. tilbakekalt, eller et gammelt token i `sessionStorage` etter endret klient-ID/miljø). Hvis Jira svarer 401, kaller Jira-klienten (`src/data/jira/jiraclient.ts`) `invalidate()` for å slette det cachede tokenet, henter et nytt og prøver request én gang til. Feiler den igjen, returneres feilen til kalleren; det skjer ingen automatisk redirect til `/login`.

Access tokens i `sessionStorage` er kortlevde (1 time). Refresh tokens er langvarige (90 dager), lagres kun i httpOnly cookies, og er ikke tilgjengelige fra JavaScript.

### Logout

`/.netlify/functions/jira-auth-logout` sletter refresh token-cookien. Klienten sletter access token fra `sessionStorage`.

### Scopes

- `read:jira-work` — Lese worklogs
- `read:jira-user` — Lese brukerinfo
- `offline_access` — Få refresh token

### Serverless-funksjoner

| Funksjon | Fil | Beskrivelse |
|---|---|---|
| `jira-auth-init` | `src/backend/jira-auth-init.ts` | Starter OAuth-flyten, genererer PKCE, redirecter til Atlassian |
| `jira-auth-callback` | `src/backend/jira-auth-callback.ts` | Mottar callback fra Atlassian, bytter code mot tokens |
| `jira-auth-session` | `src/backend/jira-auth-session.ts` | Refresher access token via refresh token cookie |
| `jira-auth-logout` | `src/backend/jira-auth-logout.ts` | Sletter refresh token cookie |

### Konfigurasjon

- `JIRA_CLIENT_ID` og `JIRA_CLIENT_SECRET` - Må tilhøre en app med relevante scopes konfigurert. Settes som environment-variabler i Netlify.
- `VITE_ATLASSIAN_CLOUD_ID` - Cloud Id til den aktuelle Jira Cloud-instansen.

## Bekk (Azure Entra ID via MSAL)

Bekk-autentisering bruker Azure Entra ID med MSAL (Microsoft Authentication Library). Hele flyten kjører i nettleseren — ingen server-side komponenter.

### Flyt

```
Bruker åpner appen
       │
       ▼
MsalAuthenticationTemplate sjekker innlogging
       │  Ikke innlogget? → Redirect til Azure login
       ▼
Azure Entra ID login-side
       │  Bruker logger inn med Bekk-konto
       ▼
Redirect tilbake til appen
       │  MSAL lagrer tokens i localStorage
       │  Setter aktiv konto
       ▼
Appen er klar
```

### Oppsett (`src/login/bekk/bekkLogin.tsx`)

MSAL-instansen er en modul-singleton (`msalInstance`) konfigurert med:
- `clientId` — App registration client ID fra Azure
- `authority` — `https://login.microsoftonline.com/{tenantId}`
- `cacheLocation` — `localStorage`

`BekkEntraLogin`-komponenten wrapper appen og håndterer automatisk redirect til innlogging.

### Employee ID

`getEmployeeId()` leser `employeeId`-claimet fra ID-tokenet til den aktive MSAL-kontoen. Denne brukes for å hente riktig brukers data fra Bekk Timekeeper API.

Viktig: Kall `getEmployeeId()` inne i `queryFn`, ikke på hook-nivå — MSAL-instansen må være ferdig initialisert.

### Token-refresh

MSAL håndterer token-refresh automatisk via `acquireTokenSilent()`. Bekk API-klienten (`src/data/bekkclient.ts`) kaller dette i middleware før hvert API-kall.

### Azure-registreringer

| Miljø | App registration |
|---|---|
| Prod | [97690193-50da-4eda-b961-519d047cc8ce](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/97690193-50da-4eda-b961-519d047cc8ce) |
| Dev | [05d0e69d-bb21-43b6-bdd0-5eed364561c0](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/05d0e69d-bb21-43b6-bdd0-5eed364561c0) |

### Konfigurasjon

- `VITE_BEKK_ENTRA_TENANT_ID` — Azure tenant ID
- `VITE_BEKK_ENTRA_CLIENT_ID` — App registration client ID
- `VITE_BEKK_ENTRA_SCOPE` — API scope for Bekk Timekeeper
