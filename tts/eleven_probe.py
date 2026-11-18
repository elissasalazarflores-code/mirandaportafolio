import sys, json, urllib.request, os, time
T = "¿Crees que llevar tu contabilidad es complicado? Mira esto: conectas tu SAT, das un clic, y listo."
VOICES = {"liam":"TX3LPaxmHKxFdv7VOQHJ","will":"bIHbv24MWmeRgasZH58o","chris":"iP95p4xoKVk53GoZ742B","charlie":"IKne3meq5aSn9XLyUdCD","eric":"cjVigY5qzO86Huf0OWal","roger":"CwhRBWXzGAHq8TQ4Fs17"}
MODELS = sys.argv[1:] or ["eleven_multilingual_v2"]
for m in MODELS:
  for n, v in VOICES.items():
    f = f"tts/eleven2/{n}_{m}.mp3"
    if os.path.exists(f): continue
    body = {"text": T.replace("SAT","Sat"), "model_id": m, "language_code": "es"}
    if m != "eleven_v3": body["voice_settings"] = {"stability":0.45,"similarity_boost":0.75,"style":0.3}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v}?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers={"Content-Type":"application/json","xi-api-key":"proxy-injected"})
    try: open(f,"wb").write(urllib.request.urlopen(req, timeout=90).read()); print(n, m, "ok")
    except urllib.error.HTTPError as e: print(n, m, e.code, e.read()[:200])
