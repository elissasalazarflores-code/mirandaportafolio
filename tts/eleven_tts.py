# ElevenLabs TTS per line, with character alignment. Usage: eleven_tts.py VOICE_ID NAME
import sys, json, base64, urllib.request, os
vid, name = sys.argv[1], sys.argv[2]
LINES = [
 "¿Todavía haces tu contabilidad a mano?",
 "Conecta tu Sat, y FisApp descarga tus facturas en automático.",
 "IVA, DIOT y balanza... con un solo clic.",
 "Y ahora, nómina: calculada, timbrada y contabilizada.",
 "Tus sellos y tu e-firma, siempre bajo tu control.",
 "FisApp. Tu información fiscal, más simple.",
 "Pruébalo quince días gratis.",
]
out = f"tts/eleven/{name}"; os.makedirs(out, exist_ok=True)
for i, t in enumerate(LINES, 1):
    f = f"{out}/l{i}.mp3"
    if os.path.exists(f): continue
    body = {"text": t, "model_id": "eleven_multilingual_v2", "language_code": "es",
            "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 1.05},
            "previous_text": LINES[i-2] if i > 1 else None, "next_text": LINES[i] if i < len(LINES) else None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    d = json.load(urllib.request.urlopen(req, timeout=60))
    open(f, "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d.get("alignment"), open(f"{out}/l{i}.json", "w"))
    print(name, i, "ok")
