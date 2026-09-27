# Layer 2 Cloudflare deployment handoff

## Goal

Deploy the multilingual brand-name study from GitHub branch `brand-study-cloudflare-20260923`, project directory `brand-study-cloudflare/`, to the user's real Cloudflare account at a neutral `workers.dev` hostname, create D1 storage, set the private admin export token, and perform browser QA of `/es`, `/en`, and `/ja`.

## Current verified state

Repository: `ferminfm/ferminfm`
Branch: `brand-study-cloudflare-20260923`
Worker name in `wrangler.jsonc`: `professional-communication-study`

GitHub Actions build/test succeeded on the first deployment attempt. Deployment failed only because the GitHub Actions environment did not contain `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID`.

Do not use the failed GitHub Action as evidence of an application build failure.

## Preferred execution channel

Use the existing local Layer 2 Codex environment because it already has the `cloudflare` MCP configured. If MCP startup says OAuth reauthentication is required, perform:

```bash
codex mcp login cloudflare
```

This OAuth approval is the only human-authentication step that may need the user in the browser.

For the actual Worker deployment, Wrangler OAuth is the simplest supported path. From the project checkout:

```bash
npx wrangler login
```

If this opens Cloudflare OAuth, ask the user only to approve the authorization. Do not ask them to create D1 or edit configuration manually.

## Checkout

Use a clean worktree for branch `brand-study-cloudflare-20260923` or reuse a lineage-compatible existing checkout if one exists.

```bash
git fetch origin
git worktree add ../brand-study-cloudflare-deploy origin/brand-study-cloudflare-20260923
cd ../brand-study-cloudflare-deploy/brand-study-cloudflare
```

## Pre-deployment QA

Run:

```bash
npm install
npm test
npx wrangler deploy --dry-run --outdir dist
```

Stop and repair locally if any of these fail.

## Create D1

First check whether a database named `brand-study-db` already exists:

```bash
npx wrangler d1 list
```

If absent:

```bash
npx wrangler d1 create brand-study-db
```

Capture the returned database ID.

Edit `wrangler.jsonc` and replace:

```text
REPLACE_WITH_D1_DATABASE_ID
```

with the real D1 database ID.

Commit that configuration change to branch `brand-study-cloudflare-20260923`.

Apply migrations:

```bash
npx wrangler d1 migrations apply brand-study-db --remote
```

## Create admin export secret

Generate a high-entropy token locally without printing it to logs:

```bash
ADMIN_TOKEN="$(openssl rand -hex 32)"
printf '%s' "$ADMIN_TOKEN" | npx wrangler secret put ADMIN_TOKEN
```

Store the token in the user's local password manager or secure environment if the runtime offers a safe secret store. Do not commit it and do not paste it into GitHub.

## Deploy

```bash
npx wrangler deploy
```

Capture the actual `https://<name>.<subdomain>.workers.dev` deployment URL.

The URL must remain neutral: do not attach `ensenadaflow`, `bcfd`, or another candidate-bearing custom domain during the study.

## API health check

```bash
curl -fsS https://<workers-host>/api/health
```

Expected result includes:

```json
{"ok":true}
```

and the current study version.

## Browser QA

Open all three routes in a real browser:

- `https://<workers-host>/es`
- `https://<workers-host>/en`
- `https://<workers-host>/ja`

For each route verify:

1. Neutral title; no candidate is shown before the appropriate study stage.
2. Consent page works.
3. Four audio controls load with nonzero duration and play.
4. Audio stage does not reveal candidate spelling.
5. Page 3 pronunciation guidance is understandable to a non-linguist.
6. Candidate order is randomized but internally consistent.
7. Meaning/suggestion and existing-association questions are distinct.
8. Geographic-inference questions do not leak the real company location.
9. Delayed recall cannot see the candidate list.
10. Professional-context blocks have identical services and no geographic line.
11. Final comparison reveals the real company context only at the final stage.
12. Submit succeeds once.
13. Refresh/re-submit behavior does not create an obvious duplicate.
14. Mobile viewport is usable.

## Database verification

After one test submission per language:

```bash
npx wrangler d1 execute brand-study-db --remote --command "SELECT language, COUNT(*) AS n FROM responses GROUP BY language ORDER BY language;"
```

Expect one row for each tested language.

## Export QA

Use the local secret value:

```bash
curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://<workers-host>/api/export.csv \
  -o /tmp/brand-study-export.csv
```

Check that the CSV contains only study IDs, coarse recruitment metadata, timestamps, candidate order, and answer JSON; no direct identifiers.

## GitHub Actions

The workflow is intentionally manual-only until Cloudflare repository secrets are configured. Local Wrangler deployment is preferred for this small pilot.

If later desired, create scoped Cloudflare API credentials and add these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Then trigger the workflow manually.

## Completion report

Return:

- deployed workers.dev URL;
- D1 database ID (safe to record);
- deployment commit SHA;
- migration status;
- browser QA PASS/FAIL for es/en/ja;
- API health result;
- test-submission counts by language;
- export QA result;
- any remaining blocker.

Do not expose the ADMIN_TOKEN or OAuth credentials.
