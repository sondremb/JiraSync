---
status: accepted, not yet implemented (#27)
---

# The backend is served under `/api` routes

The browser talks to the backend through stable `/api/...` routes, not Netlify's `/.netlify/functions/...` paths, and on the same origin as the app so the refresh token cookie works without cross-site rules. The HTTP API is the durable boundary: Netlify functions implement it today, but a Node server or a .NET service could implement the same routes later without changing the frontend. Secrets such as `JIRA_CLIENT_SECRET`, and any shared configuration, stay on the backend.
