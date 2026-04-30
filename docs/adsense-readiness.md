# AdSense Readiness

The AI Blog Engine includes a white-hat AdSense readiness checker. It does not use tricks, hidden content, fake navigation, or policy-risk tactics.

Run:

```bash
npm run blog:adsense
```

The checker scores the site from 0 to 100 across:

- About, Contact, Privacy Policy, Terms, and Disclaimer pages
- Minimum number of quality posts
- Thin content risk
- Duplicate slug risk
- Clear author information
- Sources where needed
- Ad-safe categories
- Indexability basics

The goal is not to force AdSense approval. The goal is to show whether the site has enough useful, original, transparent content to be worth submitting.

Slack:

```text
/blog adsense status
```
