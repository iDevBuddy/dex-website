# Image Generation Setup

The primary image system is provider-based. It is designed for real AI image models, not coded SVGs.

## Local ComfyUI

Set:

```bash
USE_IMAGE_MODEL=true
IMAGE_PROVIDER=local_comfyui
COMFYUI_URL=http://localhost:8188
COMFYUI_WORKFLOW_PATH=
```

`COMFYUI_WORKFLOW_PATH` should point to a workflow JSON file that accepts the blog image prompt.

The pipeline sends:

- Blog title
- Category
- Brand style
- Image prompt
- Website colors

Generated images are saved into:

```text
public/blog/images
```

## GPT image provider

Set:

```bash
USE_GPT_IMAGE=true
IMAGE_PROVIDER=gpt_image
OPENAI_API_KEY=
```

## Fallback behavior

If image generation fails, the pipeline logs the error, marks image generation as failed where possible, sends a Slack notification when configured, and falls back to a safe placeholder image. The fallback keeps the build from breaking, but it is not treated as the primary image system.
