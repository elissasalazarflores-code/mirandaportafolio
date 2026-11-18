# ElevenLabs TTS per line, with character alignment. Usage: eleven_tts.py VOICE_ID NAME
import sys, json, base64, urllib.request, os
vid, name = sys.argv[1], sys.argv[2]
LINES = [l.strip() for l in open(os.environ.get("LINES_FILE","tts/lines_v1.txt")) if l.strip()]
out = f"tts/eleven/{name}"; os.makedirs(out, exist_ok=True)
for i, t in enumerate(LINES, 1):
    f = f"{out}/l{i}.mp3"
    if os.path.exists(f): continue
    body = {"text": t, "model_id": "eleven_multilingual_v2", "language_code": "es",
            "voice_settings": {"stability": float(os.environ.get("STAB","0.4")), "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": float(os.environ.get("SPEED","1.05"))},
            "previous_text": LINES[i-2] if i > 1 else None, "next_text": LINES[i] if i < len(LINES) else None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    d = json.load(urllib.request.urlopen(req, timeout=60))
    open(f, "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d.get("alignment"), open(f"{out}/l{i}.json", "w"))
    print(name, i, "ok")
