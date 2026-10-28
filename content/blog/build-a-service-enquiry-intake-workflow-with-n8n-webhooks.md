---
title: "Build a Service Enquiry Intake Workflow with n8n Webhooks"
slug: "build-a-service-enquiry-intake-workflow-with-n8n-webhooks"
description: "Turn a website enquiry into a validated review item with an n8n webhook: illustrative payload, validation branches, failure cases and a test checklist."
publishedAt: "2026-10-28"
category: "AI Automation"
stream: "practical-workflows"
topicId: "n8n-service-enquiry-intake"
author: "Akif Saeed"
image: "/blog/images/ai-authority-blog-engine.png"
imageAlt: "A desk with a laptop showing an n8n workflow canvas, a printed website enquiry form, and a paper tray labelled pending review holding one sheet."
directAnswer: "An n8n Webhook node can receive a website enquiry and return a controlled HTTP response, but it does not validate fields, route items into a review queue, or write acknowledgement wording — those are nodes and decisions you build on top. The workflow's job ends at \"received, awaiting review\"; nothing in the documented webhook behaviour confirms a booking or appointment."
keyTakeaways: ["The Webhook node is a trigger that starts a workflow when a service calls its URL and can return data generated at the end of the workflow, making it usable as an API-style endpoint.","Field validation, review-queue routing and \"not a booking\" acknowledgement wording are design choices, not documented webhook features.","\"Only Run If\" returns a 200 without creating an execution for non-matching requests, and a broken expression lets the request through rather than blocking it — both are silent-drop risks.","Respond to Webhook runs once using the first incoming data item, so multi-item validation results need All Incoming Items, When Last Node Finishes, or an Aggregate step.","Since n8n 1.103.0 HTML webhook responses are wrapped in sandboxed iframes, breaking relative URLs and authentication headers — return JSON instead."]
faqs: [{"question":"Does the n8n Webhook node validate form fields?","answer":"No. The documented webhook capabilities cover receiving data, authentication, conditional execution, response shaping and error routing. Field validation, review-queue routing and acknowledgement wording are nodes and decisions you build yourself."},{"question":"What happens when a request does not match the 'Only Run If' expression?","answer":"It receives a 200 response without creating an execution. That means a mis-scoped expression can discard genuine enquiries with no visible failure, so reconcile execution counts against form submissions during testing."},{"question":"Can I return an HTML confirmation page from the webhook?","answer":"You can, but since n8n 1.103.0 HTML responses to webhooks are automatically wrapped in sandboxed iframe tags. JavaScript cannot reach the top-level window or local storage, authentication headers are unavailable, and relative URLs will not work. A JSON acknowledgement avoids all of that."},{"question":"Does this workflow confirm a booking?","answer":"No. The supplied sources describe intake and response mechanics only. The acknowledgement should state that the enquiry was received and is awaiting review, and explicitly state that no booking or appointment is confirmed."},{"question":"What is the maximum webhook payload size?","answer":"16MB. Self-hosted instances can change this with N8N_PAYLOAD_SIZE_MAX, which matters if your enquiry form accepts file uploads."}]
sources: [{"title":"docs.n8n.io","url":"https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md"},{"title":"docs.n8n.io","url":"https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook.md"},{"title":"docs.n8n.io","url":"https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md"}]
tags: ["n8n webhooks","service enquiry intake","lead validation workflow","error handling","business automation"]
businessProblem: "Website enquiries arrive as unstructured messages that get retyped, mislaid or answered with language that implies a confirmed appointment."
---

## What does an n8n webhook actually do for a service enquiry?

The Webhook node is a trigger node: it starts a workflow when a service calls its URL, and it can also return data generated at the end of the workflow, which makes it usable as an API-style endpoint ([n8n Webhook node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md)). That is the whole of the documented intake mechanic.

Everything a business owner actually cares about — required fields, email shape, consent, routing into a review queue, and the wording of the acknowledgement — is built on top of it with additional nodes. None of it is a webhook feature.

The honest framing: n8n gives you a doorbell and a way to answer it. You decide what counts as a real enquiry and what happens next.

## What n8n documents versus what you have to design

| Capability | Status | Detail |
|---|---|---|
| Receiving a POST at a URL | Documented | Trigger node; methods DELETE, GET, HEAD, PATCH, POST, PUT; maximum payload 16MB ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md)) |
| Test vs production URLs | Documented | Test URL registers on "Listen for Test Event" or executing an inactive workflow; production URL registers when you publish. Production does not display incoming data in the workflow — review under the Executions tab ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md)) |
| Authentication | Documented | Basic auth, Header auth, JWT auth, n8n User Auth (OAuth2), or None. Callers outside the IP allowlist get a 403 ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md)) |
| Conditional execution | Documented | "Only Run If" evaluates an expression against `$json` as `{ body, headers, params, query }`. Non-matching requests receive a 200 without creating an execution; a failing expression logs a warning and lets the request through ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md)) |
| Response shaping | Documented | Respond modes: Immediately, When Last Node Finishes, Using 'Respond to Webhook' node, Streaming. Response Data choices apply only to When Last Node Finishes ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md)) |
| Field validation, queue routing, "not a booking" wording | Design decision | Not documented webhook behaviour |

## Who should build this — and who should not

Build it if you run a service business, enquiries arrive through a website form, and someone currently retypes them into a spreadsheet or inbox. It also suits teams that need an auditable pending queue rather than a shared mailbox. If you are weighing this against other back-office work, our overview of [AI automation for small businesses](https://dex.agency/blog/ai-automation-for-small-businesses) covers where intake sits in a practical workflow.

Do not build it if you need a booking engine with calendar availability and payment. The supplied sources describe intake and response mechanics only. Do not build it if your form accepts file uploads larger than 16MB and you cannot raise `N8N_PAYLOAD_SIZE_MAX` on a self-hosted instance. And do not build it if nobody will own the review queue — an unread queue is just a slower inbox.

## Prerequisites

- An n8n instance with rights to publish workflows.
- A stable webhook path, for example `/enquiry/:source`.
- A destination for review items: a table, a queue, or a monitored inbox.
- A shared secret for Header auth, plus the known source IPs of your form host.
- A named owner to receive error alerts.
- Version awareness: HTML responses to webhooks are automatically wrapped in sandboxed `<iframe>` tags since n8n 1.103.0 ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook.md)).

## How do you build the intake workflow?

1. **Add the Webhook node.** Input: none. Set method POST, path `/enquiry/:source`, authentication Header auth, and an IP allowlist. Output: a test URL and a production URL.
2. **Add "Only Run If".** Input: `$json.body.formId`. Expression: does it equal a known form or campaign identifier? Output: matching requests continue; non-matching requests get a 200 with no execution created.
3. **Validate fields.** Input: the body fields. Use a Code or Set node to produce one item carrying the original payload plus a validation result — per-field booleans and a list of failure reasons. Output: a single item with `valid: true` or `valid: false`.
4. **Branch.** Valid items go to the review queue. Invalid items go to a log-and-acknowledge path.
5. **Write the review item.** Input: the validated payload. Output: a pending record with status `pending review`, source, and received timestamp.
6. **Respond.** Use the Respond to Webhook node with a JSON body. Output: an acknowledgement stating the enquiry was received and is awaiting review, and explicitly that no booking is confirmed.
7. **Add the error workflow.** It must start with the Error Trigger ([docs](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md)). Route failures to the owner.

One constraint to design around: the Respond to Webhook node runs once, using the first incoming data item ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook.md)). If your validation step emits multiple items, use All Incoming Items, When Last Node Finishes, or an Aggregate step before responding.

## What does the enquiry payload look like?

Illustrative only — this is a proposed shape, not a tested payload.

```json
{
  "formId": "site-contact-main",
  "source": "website",
  "name": "Sample Name",
  "email": "sample@example.com",
  "phone": "000-000-0000",
  "serviceType": "installation",
  "message": "Short description of the work required.",
  "consent": true,
  "submittedAt": "2024-01-01T09:00:00Z"
}
```

And the acknowledgement your workflow returns:

```json
{
  "status": "received",
  "reviewStatus": "pending",
  "message": "Your enquiry has been received and is awaiting review. No booking or appointment is confirmed.",
  "reference": "generated-by-your-workflow"
}
```

The reference is generated by your own workflow. n8n does not supply one.

## How do validation branches decide what enters the review queue?

| Condition | Branch | Enters queue? | Response |
|---|---|---|---|
| Required fields present (name, email, message) | Pass | Yes | Received, pending review |
| Missing required field | Fail | No | Received, flagged incomplete |
| Email shape fails | Fail | No | Received, flagged |
| Consent flag false | Fail | No | Received, flagged |
| Message below minimum length | Fail | No | Received, flagged |
| `formId` not in allowlist | Blocked by "Only Run If" | No | 200, no execution created |

That last row is the one to watch. A non-matching request gets a 200 without creating an execution, so a mis-scoped expression discards genuine enquiries with no visible failure.

## What breaks, and how do you recover?

| Failure | What you see | Recovery |
|---|---|---|
| Mis-scoped "Only Run If" expression | Enquiries vanish; caller still gets 200; no execution | Reconcile execution counts against form submission counts over a test window |
| Expression fails to evaluate | Warning logged; request passes through | Treat warnings as alerts; re-test after every edit |
| Multi-item validation results | Only the first item is responded to | Use All Incoming Items, When Last Node Finishes, or Aggregate |
| HTML confirmation page | Sandboxed iframe since 1.103.0; relative URLs and auth headers break | Return JSON instead |
| Error before the first Respond to Webhook node | Error message with a 500 status ([docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook.md)) | Inspect the Executions tab |
| Error in the trigger node | `execution.id` and `execution.url` absent from the error payload | Alert on `lastNodeExecuted` and `mode` instead |
| Payload over 16MB | Request rejected | Cap uploads, or raise `N8N_PAYLOAD_SIZE_MAX` on self-hosted |
| Test URL used in production | Data not displayed in the workflow | Switch to the production URL and review under Executions |

To prove your error path works, add the Stop And Error node to force an execution to fail under chosen circumstances ([docs](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md)). That is the only reliable way to know the alert reaches a human.

## Acceptance checklist

- The production URL — not the test URL — is embedded in the form.
- A request from an unlisted IP returns a 403.
- A non-matching `formId` returns 200 with no execution created.
- Every validation branch has been exercised with a real submission.
- The acknowledgement JSON contains no booking or appointment language.
- A valid enquiry appears in the queue with status `pending review`.
- The error workflow fires on a forced failure via Stop And Error.
- Execution counts match form submission counts across a test window.
- The 16MB ceiling has been checked against any file upload field.

## The one sentence you must never write

Nothing in the supplied sources confirms bookings, appointments or reservations. The workflow's job ends at "received, awaiting review." If your acknowledgement says a booking is confirmed, you have invented a capability and created an expectation your calendar cannot meet. Teams that get this right tend to treat intake as one stage of a larger system — the same discipline we apply in our [automation implementation work](https://dex.agency/capabilities) and in the [customer support automation playbook](https://dex.agency/blog/ai-customer-support-automation-playbook-for-small-service-businesses), where acknowledgement and resolution are deliberately kept separate.
