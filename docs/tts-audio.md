# TTS and Listen Button Setup

Every article can show a Forbes-style listen control.

## Browser fallback

The MVP default is browser speech synthesis:

```bash
USE_LOCAL_TTS=true
TTS_PROVIDER=browser_fallback
```

This requires no server API. The article page reads the text in the user browser.

## API or local TTS

For generated audio files, configure:

```bash
TTS_PROVIDER=browser_fallback | piper | kokoro | minimax | elevenlabs | openai
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

- `minimax` with `MINIMAX_API_KEY`.
- `elevenlabs` with `ELEVENLABS_API_KEY`.
- `openai` with `OPENAI_API_KEY`.

If `REQUIRE_REAL_TTS=false`, the browser fallback is allowed. If `REQUIRE_REAL_TTS=true`, missing provider credentials stop audio generation and notify the pipeline.

## Article behavior

The article page checks for an MP3/audio file first. If one exists, it plays that file. If not, it uses browser `SpeechSynthesis`.

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
