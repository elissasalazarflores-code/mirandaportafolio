# Genera la voz en off de cada reel/story de parrilla.json con ElevenLabs (+ subtítulos SRT).
# Uso: python3 emitego/vo.py [VOICE_ID] [solo_ids...]
import sys, json, base64, urllib.request, os, re
P = json.load(open("emitego/parrilla.json"))
VID = sys.argv[1] if len(sys.argv) > 1 else P["voz"]["voice_id"]
ONLY = set(sys.argv[2:])
OUT = "emitego/vo"; os.makedirs(OUT, exist_ok=True)
items = [(p["id"], " ".join(e["vo"] for e in p["escenas"])) for p in P["piezas"] if p.get("escenas")]
items += [(s["id"], s["vo"]) for s in P["stories"]]
def srt_time(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
def make_srt(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur, t0 = [], "", None
    for c, a, b in zip(chars, st, en):
        if c.isspace():
            if cur: words.append((cur, t0, last)); cur = ""
            continue
        if not cur: t0 = a
        cur += c; last = b
    if cur: words.append((cur, t0, last))
    cues, buf = [], []
    for w in words:
        buf.append(w)
        if len(buf) >= 5 or re.search(r"[.?!…:,]$", w[0]) and len(buf) >= 2:
            cues.append(buf); buf = []
    if buf: cues.append(buf)
    return "\n".join(f"{i}\n{srt_time(c[0][1])} --> {srt_time(c[-1][2])}\n{' '.join(w[0] for w in c)}\n" for i, c in enumerate(cues, 1))
total = 0
for pid, text in items:
    if ONLY and pid not in ONLY: continue
    f = f"{OUT}/{pid}.mp3"
    total += len(text)
    if os.path.exists(f): continue
    body = {"text": text.replace("EmiteGo", "Emite Go"), "model_id": "eleven_multilingual_v2", "language_code": "es",
            "voice_settings": {"stability": 0.35, "similarity_boost": 0.8, "style": 0.45, "use_speaker_boost": True, "speed": 1.08}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VID}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    d = json.load(urllib.request.urlopen(req, timeout=120))
    open(f, "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d["alignment"], open(f"{OUT}/{pid}.json", "w"))
    open(f"{OUT}/{pid}.srt", "w").write(make_srt(d["alignment"]))
    print(pid, "ok", len(text), "chars")
print("total chars", total)
