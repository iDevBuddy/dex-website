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
TTS_PROVIDER=api
TTS_API_URL=
TTS_VOICE=
TTS_SPEED=
```

Future providers can include Piper, Kokoro, Coqui, or another local TTS service.

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
