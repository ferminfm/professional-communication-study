# Deployment status — 2026-09-24

## Live deployment

Base URL:

https://professional-communication-study.professional-research.workers.dev

Routes:

- https://professional-communication-study.professional-research.workers.dev/es
- https://professional-communication-study.professional-research.workers.dev/en
- https://professional-communication-study.professional-research.workers.dev/ja

Cloudflare D1 database:

`bf4223a1-21b7-4cfb-83c7-e53112f9f5fb`

Deployment commit:

`fbb8c2c0a6c115dbb9e3b56a2757045cc51a0d11`

Study version:

`2026-09-23.v1`

## Hostname correction

The original Workers account subdomain `kumiay-internacional.workers.dev` was replaced with the neutral account subdomain `professional-research.workers.dev`.

Cloudflare account audit at the time of change found:

- one Worker: `professional-communication-study`;
- no other Worker depending on the old workers.dev suffix;
- no attached Worker custom domains;
- no Worker routes in the account's three zones.

The old hostname no longer resolves.

## QA

| Check | ES | EN | JA |
|---|---|---|---|
| Full browser walkthrough + submission | PASS | PASS | PASS |
| Four audio controls load/play | PASS | PASS | PASS |
| Candidate order / delayed recall / final reveal | PASS | PASS | PASS |
| D1 QA response count | 1 | 1 | 1 |

Additional checks:

- `/api/health`: HTTP 200, `{"ok":true,"studyVersion":"2026-09-23.v1"}`
- unauthenticated CSV export: HTTP 401
- authorized CSV export: PASS
- no direct-identifier columns in export
- refresh after completion: no additional row
- 390 px mobile viewport: no horizontal overflow
- three synthetic QA responses are tagged `campaign=deployment-qa` and must be excluded from analysis

## Known limitations

- A participant can intentionally start and complete a fresh survey again, creating another response.
- Free-text fields can contain identifiers if a participant voluntarily types them.
- The three synthetic deployment-QA rows should remain in D1 for auditability but be excluded from substantive analysis.
