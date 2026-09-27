# Source isolation repair — 2026-09-27

## Incident

An early version of the professional communication / brand-name study was created on branch `brand-name-study-cloudflare-v1` inside the unrelated repository:

`ferminfm/personal-ai-scientific-computing-site`

Because that repository is connected to the Vercel project `personal-ai-scientific-computing-site`, commits on that survey branch generated Vercel Preview deployments under the personal website project.

The survey was never merged into the personal website's `main` branch and the affected deployments were Preview deployments, not production.

## Repair applied

On 2026-09-27 the branch:

`ferminfm/personal-ai-scientific-computing-site:brand-name-study-cloudflare-v1`

was force-reset to the exact current `main` commit:

`b0b149a9d1b404020a8cf80bbb276a9c6ffe128f`

Verification after the reset:

- survey branch SHA == personal-site main SHA;
- no `brand-name-study/` directory remains on the branch;
- no survey source remains reachable from that branch tip;
- Vercel generated one final Preview deployment from the reset branch at the normal personal-site commit;
- historical Vercel Preview deployments from the old survey commits remain only as deployment history and are not a source of future survey changes.

## Current live study

The live study remains independent on Cloudflare Workers:

`https://professional-communication-study.professional-research.workers.dev`

Current D1 database:

`bf4223a1-21b7-4cfb-83c7-e53112f9f5fb`

The Cloudflare deployment and D1 data were not modified by this repair.

## Current source-of-truth boundary

Until a dedicated standalone repository is created, the active source is isolated from the personal website in:

Repository: `ferminfm/ferminfm`
Branch: `brand-study-cloudflare-20260923`
Directory: `brand-study-cloudflare/`

This repository is not the Vercel-connected personal website repository.

A future dedicated repository such as `ferminfm/professional-communication-study` would be cleaner, but is a repository-management improvement rather than a blocker for the live study or GHL work.

## Rule going forward

Do not add survey, startup CRM, or Ensenada-company application code to `ferminfm/personal-ai-scientific-computing-site`.

That repository is reserved for the personal portfolio website and its own website-development branches.
