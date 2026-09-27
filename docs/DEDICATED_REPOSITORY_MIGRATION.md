# Migrate the brand study to a dedicated GitHub repository

## Objective

Create the standalone repository:

`ferminfm/professional-communication-study`

and make it the sole development source for the Cloudflare Worker currently live at:

`https://professional-communication-study.professional-research.workers.dev`

Do not change the Worker name, workers.dev URL, D1 database, ADMIN_TOKEN, or response data.

## Current source

Repository: `ferminfm/ferminfm`

Branch: `brand-study-cloudflare-20260923`

Directory: `brand-study-cloudflare/`

The current D1 binding in `wrangler.jsonc` is intentionally preserved.

## Safety gates

Before writing anything:

1. Verify the live Worker health endpoint still returns `ok: true`.
2. Verify D1 database ID is:
   `bf4223a1-21b7-4cfb-83c7-e53112f9f5fb`
3. Verify the source directory does not contain the ADMIN_TOKEN or any OAuth/API credential.
4. Do not touch `ferminfm/personal-ai-scientific-computing-site`; its erroneous survey branch has already been reset to main.

## Preferred local procedure

Use an authenticated GitHub CLI session on the user's machine.

Check:

```bash
gh auth status
```

Create a temporary export of the source directory without carrying the profile repository history:

```bash
tmp="$(mktemp -d)"
git clone --branch brand-study-cloudflare-20260923 --single-branch \
  https://github.com/ferminfm/ferminfm.git "$tmp/source"
mkdir -p "$tmp/new"
git -C "$tmp/source" archive HEAD:brand-study-cloudflare | tar -x -C "$tmp/new"
cd "$tmp/new"
```

Remove/adapt any workflow paths that assumed the old parent repository. The dedicated repository root should contain:

- `README.md`
- `package.json`
- `wrangler.jsonc`
- `src/`
- `public/`
- `migrations/`
- `test/`
- `docs/`
- optionally `.github/workflows/`

For the dedicated repository, any GitHub Action must use the repository root as the working directory and must not refer to `brand-study-cloudflare/` as a path prefix.

Initialize:

```bash
git init -b main
git add .
git commit -m "Initialize professional communication study"
```

Create the repository:

```bash
gh repo create ferminfm/professional-communication-study \
  --public \
  --description "Multilingual professional communication and company-name study" \
  --source . \
  --remote origin \
  --push
```

## Validation

After push:

1. Confirm GitHub `main` contains only the survey application and its documentation.
2. Run:
   ```bash
   npm install
   npm test
   npx wrangler deploy --dry-run --outdir dist
   ```
3. Do **not** make a production deployment merely to prove repository creation if the source is unchanged.
4. Confirm the live Worker remains unchanged and healthy.
5. Record the new repository URL and initial commit SHA.

## Cloudflare linkage

For this pilot, local Wrangler deployment is sufficient. Do not create a new Worker.

If GitHub-based Cloudflare deployment is later enabled, connect only the new repository. Never connect the personal portfolio repository.

## Old-source cleanup

Only after the dedicated repository is verified:

- treat `ferminfm/professional-communication-study:main` as canonical;
- the old survey branch `ferminfm/ferminfm:brand-study-cloudflare-20260923` may remain temporarily as an archival fallback;
- do not delete the old source until at least one clean checkout/build from the new repository passes.

The old personal-website survey branch has already been neutralized and points to the website's normal `main` commit.

## Completion report

Return:

- new repository URL;
- initial commit SHA;
- test/dry-run result;
- confirmation that the personal website repository contains no survey source at its current survey-branch tip;
- confirmation that the live Cloudflare Worker/D1 were unchanged;
- any remaining historical Vercel previews that are archival only.
