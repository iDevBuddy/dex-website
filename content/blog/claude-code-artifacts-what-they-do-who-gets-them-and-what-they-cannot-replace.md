---
title: "Claude Code Artifacts: What They Do, Who Gets Them, and What They Cannot Replace"
slug: "claude-code-artifacts-what-they-do-who-gets-them-and-what-they-cannot-replace"
description: "Anthropic launched Claude Code Artifacts on June 18, 2026 as a beta feature for Team and Enterprise organizations. It turns Claude Code session output into private, versioned HTML or Markdown pages for internal collaboration."
publishedAt: "2026-06-22"
category: "AI Automation"
author: "Akif Saeed"
image: "/blog/images/claude-code-artifacts-what-they-do-who-gets-them-and-what-they-cannot-replace.png"
imageAlt: "Claude Code Artifacts: What They Do, Who Gets Them, and What They Cannot Replace"
audio: "/blog/audio/claude-code-artifacts-what-they-do-who-gets-them-and-what-they-cannot-replace.mp3"
directAnswer: "Claude Code Artifacts are beta, organization-private pages generated from Claude Code sessions. Launched by Anthropic on June 18, 2026, they let Team and Enterprise users publish AI coding work as interactive HTML or Markdown pages at private URLs for authenticated members of the same organization. They are useful for incident reviews, PR walkthroughs, security findings, architecture maps, FinOps analysis, and design comparisons. They are not production dashboards, backend apps, or live BI systems: Artifacts are self-contained pages that update only when Claude Code republishes them."
keyTakeaways: ["Claude Code Artifacts publish Claude Code session output as private HTML or Markdown pages accessible only to authenticated members of the same organization.","Artifacts can update in place when Claude Code republishes them, and version control lets authors choose which version viewers see.","The beta is limited to Team and Enterprise organizations using Claude Code CLI or the desktop app version 1.13576.0 or later.","Artifacts require the Anthropic API and are not available through Amazon Bedrock, Google Cloud Vertex AI, or Microsoft Foundry.","They are single, self-contained pages: no backend logic, no external API calls at view time, no stored form input, no multi-route apps, and no live data querying.","Enterprise admins can control availability, role-based access, retention policies, audit logs, and artifact management through a Compliance API.","Claude Code Artifacts are separate from Claude Cowork Live Artifacts, which are local to a user’s computer and not shareable."]
faqs: [{"question":"When did Anthropic launch Claude Code Artifacts?","answer":"Anthropic launched Claude Code Artifacts on June 18, 2026 as a beta feature for Team and Enterprise organizations."},{"question":"Can Claude Code Artifacts fetch live data?","answer":"No. Artifacts are self-contained pages. They update when Claude Code republishes them, not by querying live databases or external APIs at view time."},{"question":"Are Claude Code Artifacts available on Pro or Max plans?","answer":"No. The brief states that Artifacts are limited to Team and Enterprise plans, even though Pro and Max plans may include Claude Code."},{"question":"Can Claude Code Artifacts be used on Bedrock, Vertex AI, or Microsoft Foundry?","answer":"No. Claude Code Artifacts require the Anthropic API and are not available through Amazon Bedrock, Google Cloud Vertex AI, or Microsoft Foundry."},{"question":"Who can view a Claude Code Artifact?","answer":"Only authenticated members of the same organization can access the private Artifact URL."}]
sources: [{"title":"claude.com","url":"https://claude.com/blog/artifacts-in-claude-code"},{"title":"code.claude.com","url":"https://code.claude.com/docs/en/artifacts"},{"title":"support.claude.com","url":"https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them"},{"title":"claude.com","url":"https://claude.com/pricing"},{"title":"claude.com","url":"https://claude.com/product/claude-code"},{"title":"anthropic.com","url":"https://www.anthropic.com/claude-code"}]
tags: ["Claude Code","Enterprise AI","Collaboration","DevTools"]
businessProblem: "Engineering teams lose time turning AI coding sessions into status updates, screenshots, transcripts, and stakeholder explanations."
---

## What are Claude Code Artifacts?

Claude Code Artifacts are private, shareable pages created from Claude Code sessions. Anthropic launched them on June 18, 2026 as a beta feature for Team and Enterprise organizations.

An Artifact can be published as HTML or Markdown at a private URL. Access is limited to authenticated members of the same organization. If the author republishes from Claude Code in the same or a later session, the Artifact can update in place. Version control lets the author select which version viewers see.

The short version: Claude Code Artifacts turn AI coding work into an internal page your team can inspect, share, and revisit.

## What business problem do Claude Code Artifacts solve?

They reduce the translation work around engineering-heavy AI sessions.

Without Artifacts, useful Claude Code output can stay trapped in a session transcript, a screenshot, a pasted Slack thread, or a manually rewritten status update. That creates repeated explanation work for engineering managers, security leads, product owners, finance stakeholders, and executives who need the result but do not need the full chat history.

Artifacts make that output easier to package as a visual, explainable workspace. The strongest use cases are internal workflows where context matters:

- incident investigation timelines;
- pull request walkthroughs;
- security findings;
- architecture maps;
- infrastructure cost and FinOps reviews;
- design and UX comparisons.

For a business owner, the value is not “Claude built an app.” The value is that technical teams can publish a clear internal artifact instead of spending another cycle turning AI-assisted work into a briefing.

## What does “live” mean in Claude Code Artifacts?

“Live” means the Artifact can update in place when Claude Code republishes it. It does not mean the page is connected to a live database, analytics warehouse, API, logging system, or production backend.

That distinction matters. Claude Code Artifacts are single, self-contained pages. Strict content security policies block external requests, so Artifacts cannot call APIs at view time, store form input, fetch real-time data, or serve multiple routes.

Use them as shareable reporting and collaboration pages. Do not treat them as production applications.

## Who can use Claude Code Artifacts?

Claude Code Artifacts are available in beta only for Team and Enterprise organizations.

Important eligibility details:

- They require Claude Code CLI or the Claude desktop app version 1.13576.0 or later.
- They require the Anthropic API.
- They are not available on Amazon Bedrock, Google Cloud Vertex AI, or Microsoft Foundry.
- They are not included in Pro or Max plans, even though those plans may include Claude Code.
- They are not available for organizations with CMEK, HIPAA, or Zero Data Retention policies enabled.
- Publishing requires authenticated login through a Claude Code session; API keys or cloud provider credentials cannot publish Artifacts.

Enterprise plans add administrative controls for artifact availability, role-based access, retention policies, audit logs, and management through a Compliance API.

## How much do Claude Code Artifacts cost?

Claude Code Artifacts are tied to Team and Enterprise plan access.

According to the briefed pricing facts, Team plan seats range from $20 to $125 per seat per month depending on tier. Enterprise pricing includes $20 per seat plus usage fees and advanced controls.

The practical buying question is not only seat price. It is whether enough engineering, security, infrastructure, or product work currently gets re-explained through meetings, screenshots, and manually written updates. If Artifacts remove that coordination tax from high-value workflows, they may justify themselves as collaboration infrastructure. If your team only needs occasional Claude Code usage, the value case is weaker.

## Are Claude Code Artifacts a replacement for dashboards or internal apps?

No. This is the main trap.

Claude Code Artifacts can look like dashboards because they can be interactive HTML pages. But they do not behave like production BI tools or backend applications. They cannot query live data at view time, call external APIs, persist user input, or run server-side logic.

That makes them useful for explaining a point-in-time analysis, not operating a live business system.

Use Claude Code Artifacts for:

- publishing an incident timeline after analysis;
- walking stakeholders through a pull request;
- summarizing security findings;
- showing an architecture map;
- comparing infrastructure cost scenarios;
- presenting design or UX alternatives.

Do not use them for:

- live operational dashboards;
- production BI reporting;
- customer-facing apps;
- internal tools that need backend logic;
- pages that must fetch fresh data from external systems;
- workflows that need stored form submissions.

## How are Claude Code Artifacts different from Claude Cowork Live Artifacts?

Claude Code Artifacts and Claude Cowork Live Artifacts are separate features.

Claude Code Artifacts are shareable inside an organization through private URLs and are created from Claude Code sessions. Claude Cowork Live Artifacts are local to a user’s computer and are not shareable.

The naming is easy to confuse. Buyers evaluating team collaboration should focus on Claude Code Artifacts, not assume every “Live Artifact” feature has the same sharing model.

## What should teams use Claude Code Artifacts for first?

Start where the output needs to be understood by people outside the original coding session.

The best first pilots are:

1. Incident investigations where engineers need to show a timeline and reasoning path.
2. Pull request reviews where reviewers need a guided walkthrough, not a raw diff dump.
3. Security audits where findings need to be visible, versioned, and internally shareable.
4. Architecture reviews where diagrams and explanations need to travel together.
5. FinOps reviews where cost analysis needs to be presented to technical and non-technical stakeholders.

Do not start by trying to rebuild your BI stack or internal app platform. That will expose the product’s limits quickly and miss the actual value.

## Final verdict for business owners

Claude Code Artifacts are a collaboration layer for AI-assisted engineering work. They make Claude Code sessions easier to explain, share, govern, and revisit inside a Team or Enterprise organization.

The contrarian take: the feature is valuable precisely because it is not a full app platform. It is a faster way to turn technical AI work into an internal page for review, alignment, and auditability. If you need backend logic, live data integration, external API calls, or production dashboards, buy or build those systems separately.
