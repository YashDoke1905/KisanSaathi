#!/usr/bin/env python3
"""
Sarvam AI Text-to-Speech (TTS) integration script for KisanSaathi.
Uses the official `sarvamai` Python SDK to generate Indic speech audio.
Input: JSON payload via stdin with UTF-8 encoding.
Output: JSON payload on stdout with base64 encoded audio or error info.
"""

import sys
import os
import json

# Ensure stdout uses UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")

def main():
    try:
        # Read payload from stdin
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"success": False, "error": "empty_input", "message": "No input JSON received"}))
            sys.exit(0)

        data = json.loads(raw_input)
        text = data.get("text", "").strip()
        lang = data.get("language", "mr").lower()
        pace = float(data.get("pace", 1.0))
        requested_speaker = data.get("speaker")

        if not text:
            print(json.dumps({"success": False, "error": "missing_text", "message": "Text parameter is required"}))
            sys.exit(0)

        # Get API key from env or fallback to provided key
        api_key = os.environ.get("SARVAM_API_KEY", "sk_3mdxptw6_VbK9sLAWhL6MGaMz4hIsKvRs").strip()
        if not api_key:
            print(json.dumps({"success": False, "error": "missing_api_key", "message": "SARVAM_API_KEY not found in environment"}))
            sys.exit(0)

        # Map language codes
        lang_map = {
            "mr": "mr-IN",
            "hi": "hi-IN",
            "en": "en-IN",
            "mr-in": "mr-IN",
            "hi-in": "hi-IN",
            "en-in": "en-IN",
        }
        target_lang = lang_map.get(lang, "mr-IN")

        # Map default speakers per language
        speaker = requested_speaker
        if not speaker:
            if target_lang == "mr-IN":
                speaker = "shubh"
            elif target_lang == "hi-IN":
                speaker = "shubh"
            else:
                speaker = "shubh"

        # Import SDK
        try:
            from sarvamai import SarvamAI
            from sarvamai.core.api_error import ApiError
        except ImportError:
            print(json.dumps({"success": False, "error": "sdk_not_installed", "message": "sarvamai package not installed"}))
            sys.exit(0)

        client = SarvamAI(api_subscription_key=api_key)

        # Truncate text if needed to avoid exceeding max character limits (500 chars per chunk in Bulbul)
        clean_text = text[:480]

        # Call Sarvam AI text_to_speech
        res = client.text_to_speech.convert(
            text=clean_text,
            language_code=target_lang,
            model="bulbul:v3",
            speaker=speaker,
            pace=pace,
            output_audio_codec="mp3",
            enable_preprocessing=True
        )

        if res.audios and len(res.audios) > 0:
            audio_b64 = res.audios[0]
            print(json.dumps({
                "success": True,
                "audioBase64": audio_b64,
                "format": "audio/mp3",
                "provider": "sarvamai",
                "model": "bulbul:v3",
                "speaker": speaker,
                "language": target_lang
            }))
        else:
            print(json.dumps({
                "success": False,
                "error": "no_audio_returned",
                "message": "Sarvam AI did not return any audio data"
            }))

    except Exception as e:
        error_type = type(e).__name__
        err_msg = str(e)
        status_code = getattr(e, "status_code", None)
        
        # Check for insufficient quota / credits
        is_quota = "insufficient_quota" in err_msg or status_code == 402 or "credits" in err_msg.lower()

        print(json.dumps({
            "success": False,
            "error": "insufficient_quota" if is_quota else "api_error",
            "errorType": error_type,
            "statusCode": status_code,
            "message": err_msg,
            "provider": "sarvamai"
        }))

if __name__ == "__main__":
    main()
