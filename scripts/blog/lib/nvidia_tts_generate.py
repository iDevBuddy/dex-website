from __future__ import annotations

import argparse
import re
import wave
from pathlib import Path

from riva.client import Auth, AudioEncoding, SpeechSynthesisService


DEFAULT_SERVER = "grpc.nvcf.nvidia.com:443"
DEFAULT_FUNCTION_ID = "877104f7-e885-42b9-8de8-f6e4c6303969"
DEFAULT_VOICE = "Magpie-Multilingual.EN-US.Aria"
DEFAULT_LANGUAGE_CODE = "en-US"
DEFAULT_SAMPLE_RATE = 22050
DEFAULT_MAX_CHARS = 380


def split_text(text: str, max_chars: int) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text).strip()
    if not cleaned:
        return []
    if len(cleaned) <= max_chars:
        return [cleaned]

    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        candidate = sentence if not current else f"{current} {sentence}"
        if len(candidate) <= max_chars:
            current = candidate
            continue
        if current:
            chunks.append(current)
        if len(sentence) <= max_chars:
            current = sentence
            continue
        words = sentence.split()
        current = ""
        for word in words:
            candidate = word if not current else f"{current} {word}"
            if len(candidate) <= max_chars:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                current = word
        if current:
            chunks.append(current)
            current = ""
    if current:
        chunks.append(current)
    return chunks


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate WAV audio with NVIDIA Riva TTS.")
    parser.add_argument("--text-file", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--api-key", required=True)
    parser.add_argument("--function-id", default=DEFAULT_FUNCTION_ID)
    parser.add_argument("--server", default=DEFAULT_SERVER)
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--language-code", default=DEFAULT_LANGUAGE_CODE)
    parser.add_argument("--sample-rate", type=int, default=DEFAULT_SAMPLE_RATE)
    parser.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS)
    args = parser.parse_args()

    text = Path(args.text_file).read_text(encoding="utf-8")
    chunks = split_text(text, min(args.max_chars, 380))
    if not chunks:
        raise SystemExit("No text provided for TTS generation.")

    auth = Auth(
        uri=args.server,
        use_ssl=True,
        metadata_args=[
            ["function-id", args.function_id],
            ["authorization", f"Bearer {args.api_key}"],
        ],
    )
    service = SpeechSynthesisService(auth)
    frames = bytearray()
    for chunk in chunks:
        response = service.synthesize(
            text=chunk,
            voice_name=args.voice,
            language_code=args.language_code,
            sample_rate_hz=args.sample_rate,
            encoding=AudioEncoding.LINEAR_PCM,
        )
        frames.extend(response.audio)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output_path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(args.sample_rate)
        wav_file.writeframes(bytes(frames))

    print(output_path.as_posix())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
