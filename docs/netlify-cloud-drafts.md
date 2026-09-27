# Netlify cloud drafts — decision and operations

Authorized task: restore cloud generation, three drafts per week, with manual approval before publication. This task is independent of the HVAC product gates. No new paid service or production dependency is introduced.

## Decision

Keep the existing Node research/writer/critic/fact-check modules. A Netlify scheduled function invokes an authenticated background function. Its 15-minute runtime accommodates generation. Temporary covers use the platform temporary directory. Python/edge-tts audio is omitted in this cloud path and explicitly reported in each PR.

Netlify triggers Monday, Wednesday and Friday at 09:30 UTC (14:30 Pakistan), with a fallback at 11:30 UTC. The current due slot is the most recent Mon/Wed/Fri after 09:00 UTC. A manual test consumes that slot too. Slots have at most two generation attempts. No article is committed to main automatically.

Existing GitHub schedules invoke run-auto.mjs, now using the same coordinator. Both providers share blog-drafts/YYYY-MM-DD. A 30-minute lease is acquired atomically through a Git ref; non-force updates fence stale workers. A saved draft whose PR creation fails is recovered without another AI generation. Closed/merged review PRs are terminal, even after branch deletion. Do not delete closed PR history or edit reservation-only branches.

GitHub Actions remains subject to the account billing lock. Its existing job token has Contents write but not Pull requests write: it can preserve a draft branch; Netlify subsequently creates the PR using the dedicated PAT. Independent GitHub PR creation needs a future workflow change to grant Pull requests write (and allow Actions-created PRs), or inject a dedicated PAT. Netlify can create PRs independently. The old GitHub-only ClickUp poller remains inactive; Netlify now handles ClickUp reviews of the new review branches. Old pending files remain intact.

## Configuration

- GITHUB_TOKEN: fine-grained PAT, only iDevBuddy/dex-website, Contents read/write and Pull requests read/write. Required in production Functions. Renew before expiry.
- NVIDIA_API_KEY: existing generation provider. GitHub Models/OpenRouter keys are optional fallbacks.
- BLOG_DRAFT_MODEL: defaults to NVIDIA-hosted openai/gpt-oss-20b. The former 120b endpoint returned HTTP 410 during this migration. Research, writing and critique share the verified model; human review remains mandatory.
- BLOG_CLOUD_SECRET: random bearer secret of at least 32 characters, Functions scope. Never expose to browser code or logs.
- BLOG_CLOUD_ENABLED=true: activation switch. Set false and redeploy to stop.
- CLICKUP_TOKEN: ClickUp personal API token, Functions scope; never expose or log it. The owner's existing lowercase `clickup` variable is also supported; `CLICKUP_TOKEN` takes precedence when both exist.
- CLICKUP_LIST_ID: numeric ID of the owner's existing blog-approval list, Functions scope. Its open status starts reviews; its closed status (normally Complete) signifies approval. Other intermediate statuses never approve publication.
- CLICKUP_REVIEW_VIEW_ID: optional alternative when the owner supplies a `/v/l/...` ClickUp view link. The API resolves its parent and verifies that it is a List; a folder/space view cannot silently select another list. A numeric CLICKUP_LIST_ID takes precedence.
- Netlify's built-in URL supplies the scheduler's production destination.

The linked repository integration continues deploying main. Replacing the application GITHUB_TOKEN does not relink it. Netlify API masks secrets: validate credentials inside the deployed function, never by testing the masked placeholder.

## Review and publish

1. The new draft appears as an assigned ClickUp task in the configured list, with the full article, source-check report and GitHub reference. `notify_all=true` requests a ClickUp notification, including to the token owner. Actual mobile/email delivery depends on the user's ClickUp notification settings.
2. Read the article and verify its claims. Change the task to **Complete** to approve. Leave it open to hold. Editing the ClickUp description does not edit the source article.
3. Netlify checks approvals at minute 7 and 37 each hour. It merges only the exact revision shown in the review task, with article/media additions only. Changed content or a reopened PR resets the task for another review. Unresolved draft PRs remain blocked even if the task is completed; correct the article and mark the PR ready first.
4. After a confirmed merge, the task says **Approved — deployment pending**. Netlify builds main. This is not proof that the article is live: check the deployment before claiming publication.
5. Deleting or moving a task never approves or deletes the article. Close the underlying PR to reject it. Manual GitHub review/merge remains available, but routine approval uses ClickUp.

The review worker uses a ten-minute Git-ref lease and a four-minute work budget. A durable journal on `automation/clickup-reviews` binds each PR, reviewed SHA and task ID. An uncertain task-create response is reconciled against a unique description marker before retrying; if no task can be found, it stops for manual investigation rather than creating duplicates. A missing/deleted task also stops for investigation. Owner: Akif Saeed. Preserve the journal until all tracked reviews are closed. A changed list ID requires an explicit migration, not silent reassignment.

Preview deployments may be manually invoked to send review tasks, but they cannot publish approvals. Only a production-context worker can merge. New drafts queue a separate review worker immediately; the 30-minute schedule also recovers notification failures and drafts made by GitHub. No additional AI generation happens during approval polling. Each pass processes at most ten pending reviews; larger queues need operational review.

## Verification and recovery

Run `node --test --test-isolation=none scripts/agent/test/cloud-drafts.test.mjs scripts/agent/test/clickup-reviews.test.mjs`. The bearer-protected /.netlify/functions/blog-cloud-status endpoint checks deployed GitHub access, ClickUp configuration presence, and the current slot. Configuration presence is not an authentication check. A background 202 means accepted, not finished. Completion requires saved article content and a review PR; ClickUp delivery additionally requires a real task ID and readable task.

Inspect Netlify function logs for failures. A hard timeout leaves a lease recoverable after 30 minutes. Ordinary failures allow one retry. Exhausted slots require investigation; do not repeatedly force AI calls. GitHub outages affect persistence on both platforms. A second generator does not protect the Netlify-hosted website from Netlify outages.

The inspected account is legacy Free with included background-functions capability. Limits, quotas, runtime and website usage can change; indefinite free operation is not guaranteed. Check actual usage before increasing frequency.

Rollback: BLOG_CLOUD_ENABLED=false and redeploy, then revert the automation code commit if needed. Preserve review branches and pending files. Owner: Akif Saeed. Resolve the GitHub PR permission limitation only after authorized workflow changes and external verification.
