# Blog rendering and editorial quality

Authorized scope: fix the audited article SEO, duplicates and internal links, and improve automated writing and cover quality. Existing article approval remains required.

## Rendering decision

Use build-time React rendering within the existing Vite application. Each known route gets readable HTML, route metadata, canonical and JSON-LD before JavaScript runs. The browser hydrates that HTML. Voice UI mounts after hydration because its browser SDK is client-only. Netlify serves a real 404 for unknown routes; retired duplicate articles receive 301 redirects. The canonical origin is defined in `shared/site.mjs`.

No framework migration or additional rendering dependency. The production build runs backend safety tests, renderer checks and generated HTML assertions before deployment.

## Editorial decision

The cloud runner uses the account-tested NVIDIA DeepSeek endpoint instead of the unavailable 120b endpoint or the older 20b writer. Provider availability and free quotas are externally controlled; there is no unlimited-service guarantee and no newly enabled paid provider.

Primary-source practical briefs replace news-feed rewrites for scheduled drafts. The initial queue has eight briefs, each with official documentation. After those, a planner may propose distinct use cases using only the same approved source catalogue. Duplicate titles/IDs and invented URLs are rejected; unavailable or insufficient evidence still holds the draft. Editors should expand the catalogue as coverage grows. The analyst must retrieve at least two sources and match evidence excerpts literally. Missing evidence holds generation rather than writing from model memory. Article prompts distinguish proposed designs from first-hand tests, demand prerequisites, examples, numbered steps, failure handling, and verification. Internal links come from the actual repository catalogue. A separate editorial pass and a source-based fact check inspect the entire article including its FAQ and summary.

Mechanical checks cannot guarantee factual correctness or good writing. Failed/inconclusive checks create a held draft PR, which the ClickUp worker cannot publish. Human review remains necessary. The exact article revision must be approved.

## Cover decision and dependency

Use the existing NVIDIA FLUX access with an article-specific visual concept. `sharp` is added to decode/validate the real image format, reject bad or undersized payloads, crop to 1280 by 720 and encode genuine PNG. The previous provider returned JPEG data despite the `.png` filename. A vision review rejects lettering/gibberish, watermarks and unsuitable compositions, then permits one corrected retry within the run deadline. Its description supplies the actual image alt text. Inconclusive reviews fail closed; human review is still required. The undocumented keyless Pollinations fallback is removed. Cover failures hold the draft for review.

Bing Image Creator is a free browser tool, not a verified free API for this cloud job. No browser-cookie automation or paid Microsoft Foundry service is configured. A reviewer may supply a separately licensed cover manually.

## Platform and approval consistency

Netlify remains primary on Mon/Wed/Fri. GitHub workflow migration is deferred at the owner's request. Its legacy workflow files are unchanged and its billing lock remains unresolved; they are not a verified backup to this Netlify flow. A shared-slot CLI entry point is prepared for a later migration. Netlify writes review branches, not articles directly to main. ClickUp approval polling remains on Netlify every 30 minutes. GitHub's account billing lock is outside this code change; backup execution remains unverified until unlocked. GitHub also must permit Actions to create PRs.

## Historical content

Two overlapping pairs (Square and Mistral OCR) are consolidated. Their surviving articles use official sources and replace unsupported setup, fee and compliance claims with practical review guidance. The old URLs redirect; source Markdown is retained. Other articles gain contextual links but are not thereby fact-checked. Their claims require a separate historical editorial review before monetization.

## Validation and rollback

Run `node --test scripts/agent/test/*.test.mjs` and `npm run build`. On environments where Node child spawning is unavailable, unit tests can run with `--test-isolation=none`; the actual Vite build must still pass in the deployment environment. Check a real article without JavaScript, canonical host, old-article redirect, nonexistent article 404, and the existing API routes. Roll back the code deploy through Netlify if those fail; do not merge pending article drafts during system verification.
