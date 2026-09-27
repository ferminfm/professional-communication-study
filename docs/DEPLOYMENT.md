# Cloudflare deployment

## Existing deployment

The Worker is live at `https://professional-communication-study.professional-research.workers.dev`.
Its D1 binding in `wrangler.jsonc` points to the existing `brand-study-db`. Preserve that database ID and the existing `ADMIN_TOKEN` secret.

This repository is the canonical source. Its GitHub workflow runs validation only and does not deploy.

## Validate a change

From the repository root:

```bash
npm install --no-package-lock
npm test
npx wrangler deploy --dry-run --outdir dist
```

An actual deployment is a separate production action. Do not create another D1 database or replace the admin secret during routine builds.

## Health check

After deployment:

```bash
curl https://professional-communication-study.professional-research.workers.dev/api/health
```

Expected JSON contains `ok: true` and the current `studyVersion`.

## Export responses

Use an Authorization header; never put the token in a survey URL:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://professional-communication-study.professional-research.workers.dev/api/export.csv \
  -o responses.csv
```

## Custom domain

Do not use `ensenadaflow.com`, `bcfd...`, or another candidate-bearing hostname while collecting first-impression data. A neutral `workers.dev` URL is preferable until naming is complete.
