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

## NVIDIA FLUX provider

Set:

```bash
USE_IMAGE_MODEL=true
IMAGE_PROVIDER=nvidia_flux
NVIDIA_API_KEY=
NVIDIA_FLUX_URL=https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell
NVIDIA_FLUX_MODEL=black-forest-labs/flux.1-schnell
NVIDIA_IMAGE_SIZE=1200x675
NVIDIA_FLUX_STEPS=4
NVIDIA_FLUX_CFG_SCALE=0
NVIDIA_FLUX_TIMEOUT_MS=120000
```

The provider uses NVIDIA Build/NIM FLUX.1-schnell with Bearer authentication. NVIDIA supports fixed image dimensions, so the engine chooses the closest supported size to the requested blog hero ratio.

## GPT image provider

Set:

```bash
USE_GPT_IMAGE=true
IMAGE_PROVIDER=gpt_image
OPENAI_API_KEY=
```

## Fallback behavior

If image generation fails, the pipeline logs the error, marks image generation as failed where possible, sends a Slack notification when configured, and falls back to a safe placeholder image. The fallback keeps the build from breaking, but it is not treated as the primary image system.
