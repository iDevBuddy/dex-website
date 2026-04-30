# Notion Setup

Notion is the editorial dashboard for the AI Blog Engine. It is not the final blog host. Published posts stay in GitHub as Markdown/MDX content.

## 1. Create a Notion integration

1. Open https://www.notion.so/my-integrations.
2. Click **New integration**.
3. Name it `AI Blog Engine`.
4. Choose your workspace.
5. Copy the **Internal Integration Secret**. This is `NOTION_API_KEY`.

## 2. Create a parent page

1. Create a normal Notion page, for example `AI Blog Engine Dashboard`.
2. Open the page.
3. Click **Share**.
4. Invite the `AI Blog Engine` integration to the page.

If this step is skipped, the setup script will show:

```text
Please share the parent Notion page with the AI Blog Engine integration.
```

## 3. Add local environment variables

Create a local `.env` file or set these in your terminal:

```bash
NOTION_API_KEY=
NOTION_PARENT_PAGE_URL=
```

## 4. Create the databases automatically

Run:

```bash
npm run notion:setup
```

The script will create or reuse these databases under the parent page:

- Blog Ideas
- Blog Drafts
- Published Posts
- Refresh Queue
- Performance Reports

It saves the generated IDs in:

```text
.env.notion.generated
```

## 5. Copy IDs to Netlify

Add these values to Netlify environment variables:

```bash
NOTION_BLOG_IDEAS_DB_ID=
NOTION_BLOG_DRAFTS_DB_ID=
NOTION_PUBLISHED_POSTS_DB_ID=
NOTION_REFRESH_QUEUE_DB_ID=
NOTION_PERFORMANCE_REPORTS_DB_ID=
```

Also add:

```bash
USE_NOTION=true
NOTION_API_KEY=
NOTION_PARENT_PAGE_URL=
NOTION_WEBHOOK_SECRET=
```

## Notes

Notion requires every database to have one title property. For the Refresh Queue, `Blog URL` is used as the title field so records can be created safely.
