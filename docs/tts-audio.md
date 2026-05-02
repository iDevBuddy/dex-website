# TTS and Listen Button Setup

Every article can show a Forbes-style listen control.

## Browser fallback

The MVP default is browser speech synthesis:

```bash
USE_LOCAL_TTS=true
TTS_PROVIDER=browser_fallback
```

This requires no server API. The article page reads the text in the user browser.

## NVIDIA humanized voice

For more natural article narration, use NVIDIA TTS:

```bash
USE_LOCAL_TTS=true
TTS_PROVIDER=nvidia_tts
NVIDIA_TTS_API_KEY=
NVIDIA_TTS_SERVER=grpc.nvcf.nvidia.com:443
NVIDIA_TTS_FUNCTION_ID=877104f7-e885-42b9-8de8-f6e4c6303969
NVIDIA_TTS_VOICE=Magpie-Multilingual.EN-US.Aria
NVIDIA_TTS_LANGUAGE_CODE=en-US
NVIDIA_TTS_SAMPLE_RATE=22050
NVIDIA_TTS_MAX_CHARS=520
```

This generates a real `.wav` file in `public/blog/audio/` during the blog pipeline. The frontend will use that generated file automatically.

## API or local TTS

For generated audio files, configure:

```bash
TTS_PROVIDER=browser_fallback | nvidia_tts | piper | kokoro | minimax | elevenlabs | openai
TTS_API_URL=
TTS_VOICE=
TTS_SPEED=
MINIMAX_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=
PIPER_TTS_URL=
KOKORO_TTS_URL=
```

Free/local options:

- `browser_fallback`: no API, reads in the browser.
- `piper`: local Piper TTS service via `PIPER_TTS_URL`.
- `kokoro`: local Kokoro service via `KOKORO_TTS_URL`.

API options:

- `nvidia_tts` with `NVIDIA_TTS_API_KEY`.
- `minimax` with `MINIMAX_API_KEY`.
- `elevenlabs` with `ELEVENLABS_API_KEY`.
- `openai` with `OPENAI_API_KEY`.

If `REQUIRE_REAL_TTS=false`, the browser fallback is allowed. If `REQUIRE_REAL_TTS=true`, missing provider credentials stop audio generation and notify the pipeline.

## Article behavior

The article page checks for a generated audio file first. If one exists, it plays that file. If not, it uses browser `SpeechSynthesis`.

Controls include:

- Play
- Pause
- Resume
- Stop
- Speed control

The status endpoint shows whether TTS is configured:

```text
https://YOUR_DOMAIN/api/blog/status
```
