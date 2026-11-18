import sys, json, base64, urllib.request, os
vid, out = sys.argv[1], sys.argv[2]; texts = sys.argv[3:]
os.makedirs(os.path.dirname(out), exist_ok=True)
for k, t in enumerate(texts):
    body = {"text": t, "model_id": os.environ.get("MODEL","eleven_multilingual_v2"), "language_code": "es",
            "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 1.06}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    d = json.load(urllib.request.urlopen(req, timeout=90))
    open(f"{out}_{k}.mp3", "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d.get("alignment"), open(f"{out}_{k}.json", "w"))
    print(k, t)
