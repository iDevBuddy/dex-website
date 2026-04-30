# AI Provider Setup

The blog engine has a provider layer so it can use local models or OpenAI-compatible APIs.

## Main writing model

The main model writes article drafts:

```bash
LOCAL_LLM_URL=http://localhost:11434/v1/chat/completions
LOCAL_LLM_MODEL=gpt-oss
```

Any OpenAI-compatible endpoint can work if it accepts:

```json
{
  "model": "model-name",
  "messages": []
}
```

## Review model

The review model handles research summarization, SEO optimization, and quality review:

```bash
REVIEW_LLM_URL=
REVIEW_LLM_MODEL=
```

If the review model is missing, the engine falls back to the main model.

## GPT-OSS

Use GPT-OSS when it is available through a local or hosted OpenAI-compatible endpoint:

```bash
USE_GPT_OSS=true
LOCAL_LLM_MODEL=gpt-oss
```

## Gemma

Use Gemma the same way:

```bash
USE_GEMMA=true
LOCAL_LLM_MODEL=gemma
```

## Optional OpenAI fallback

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
```

If no model is configured, the site still builds and the status API clearly shows that article generation is not ready.

## Check status

```text
https://YOUR_DOMAIN/api/blog/status
```
