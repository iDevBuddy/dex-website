# Netlify cloud drafts — decision and operations

Authorized task: restore cloud generation, three drafts per week, with manual approval before publication. This task is independent of the HVAC product gates. No new paid service or production dependency is introduced.

## Decision

Keep the existing Node research/writer/critic/fact-check modules. A Netlify scheduled function invokes an authenticated background function. Its 15-minute runtime accommodates generation. Temporary covers use the platform temporary directory. Python/edge-tts audio is omitted in this cloud path and explicitly reported in each PR.

Netlify triggers Monday, Wednesday and Friday at 09:30 UTC (14:30 Pakistan), with a fallback at 11:30 UTC. The current due slot is the most recent Mon/Wed/Fri after 09:00 UTC. A manual test consumes that slot too. Slots have at most two generation attempts. No article is committed to main automatically.

Existing GitHub schedules invoke run-auto.mjs, now using the same coordinator. Both providers share blog-drafts/YYYY-MM-DD. A 30-minute lease is acquired atomically through a Git ref; non-force updates fence stale workers. A saved draft whose PR creation fails is recovered without another AI generation. Closed/merged review PRs are terminal, even after branch deletion. Do not delete closed PR history or edit reservation-only branches.

GitHub Actions remains subject to the account billing lock. Its existing job token has Contents write but not Pull requests write: it can preserve a draft branch; Netlify subsequently creates the PR using the dedicated PAT. Independent GitHub PR creation needs a future workflow change to grant Pull requests write (and allow Actions-created PRs), or inject a dedicated PAT. Netlify can create PRs independently. Existing ClickUp approval polling is a no-op unless explicitly re-enabled; old pending files remain intact.

## Configuration

- GITHUB_TOKEN: fine-grained PAT, only iDevBuddy/dex-website, Contents read/write and Pull requests read/write. Required in production Functions. Renew before expiry.
- NVIDIA_API_KEY: existing generation provider. GitHub Models/OpenRouter keys are optional fallbacks.
- BLOG_CLOUD_SECRET: random bearer secret of at least 32 characters, Functions scope. Never expose to browser code or logs.
- BLOG_CLOUD_ENABLED=true: activation switch. Set false and redeploy to stop.
- Netlify's built-in URL supplies the scheduler's production destination.

The linked repository integration continues deploying main. Replacing the application GITHUB_TOKEN does not relink it. Netlify API masks secrets: validate credentials inside the deployed function, never by testing the masked placeholder.

## Review and publish

1. Open Pull requests in the repository and find Blog draft: ...
2. Review Files changed and the research/fact-check report. AI checks are not independent proof; check the sources and claims yourself.
3. Draft PRs flag inconclusive research or fact checks. Correct these before marking ready.
4. Merge only when approving publication. Netlify then builds main. Check the deploy status and live article URL; a merge alone is not successful deployment.
5. Close without merging to reject. Auto-merge is not configured.

## Verification and recovery

Run node --test scripts/agent/test/cloud-drafts.test.mjs. The bearer-protected /.netlify/functions/blog-cloud-status endpoint checks deployed GitHub access and reports the current slot. A background 202 means accepted, not finished. Completion requires saved article content and a review PR.

Inspect Netlify function logs for failures. A hard timeout leaves a lease recoverable after 30 minutes. Ordinary failures allow one retry. Exhausted slots require investigation; do not repeatedly force AI calls. GitHub outages affect persistence on both platforms. A second generator does not protect the Netlify-hosted website from Netlify outages.

The inspected account is legacy Free with included background-functions capability. Limits, quotas, runtime and website usage can change; indefinite free operation is not guaranteed. Check actual usage before increasing frequency.

Rollback: BLOG_CLOUD_ENABLED=false and redeploy, then revert the automation code commit if needed. Preserve review branches and pending files. Owner: Akif Saeed. Resolve the GitHub PR permission limitation only after authorized workflow changes and external verification.
