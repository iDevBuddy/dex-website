# NotebookLM Manual Research Workflow

NotebookLM is optional. It is a manual research helper, not a required API dependency.

## 1. Collect sources

For each blog topic, collect useful sources such as:

- Official documentation
- Product pages
- Google Search results worth citing
- Competitor articles
- Research papers
- Case studies
- YouTube transcripts if relevant
- Public reports or benchmark pages

Avoid copied content, low-quality scraped pages, and sources that are only repeating other sources.

## 2. Add sources to NotebookLM

Create a NotebookLM notebook for the topic and upload or paste the sources. Keep one notebook per article topic so the notes stay focused.

## 3. Ask NotebookLM this prompt

```text
Analyze these sources for an SEO blog. Give me:
1. Key facts
2. Missing angles competitors ignore
3. FAQ questions
4. Simple explanation for beginners
5. Practical business examples
6. Claims that need citation
7. Suggested outline
8. Unique angle for our website
```

## 4. Paste insights into Notion

Open the article in the **Blog Drafts** database and paste the useful insights into **Research Notes**.

Good notes include:

- Facts that need citations
- Unique angles
- Missing competitor coverage
- Practical examples
- FAQ ideas
- Internal link ideas

## 5. Generate the final blog

When the blog engine generates or improves the article, it can use the Notion **Research Notes** as extra context. GitHub/MDX remains the publishing source.

## Environment variables

```bash
USE_NOTEBOOKLM=false
NOTEBOOKLM_MODE=manual
```
