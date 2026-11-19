# Coloca la voz de emitego/vo/<ID>.mp3 en <film>/audio/vo.wav con un retraso, y escribe
# <film>/captions.json (frases de subtítulo con tiempos ya desplazados). Uso: place_vo.py ID FILM DELAY DUR
import sys, json, subprocess, re
pid, film, delay, dur = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
subprocess.run(["ffmpeg","-nostdin","-v","error","-y","-i",f"emitego/vo/{pid}.mp3","-af",f"adelay={int(delay*1000)},apad,atrim=0:{dur},highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80","-ac","1","-ar","48000",f"{film}/audio/vo.wav"],check=True)
a = json.load(open(f"emitego/vo/{pid}.json"))
words, cur = [], None
for c, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
    if c.isspace():
        if cur: words.append(cur); cur = None
        continue
    if not cur: cur = {"w": "", "s": s + delay}
    cur["w"] += c; cur["e"] = e + delay
if cur: words.append(cur)
# "Emite" + "Go" -> "EmiteGo"
m = []
for w in words:
    if m and m[-1]["w"] == "Emite" and w["w"].startswith("Go"):
        m[-1]["w"] += w["w"]; m[-1]["e"] = w["e"]
    else: m.append(w)
caps, buf = [], []
for w in m:
    buf.append(w)
    if len(buf) >= 4 or (re.search(r"[.?!…:,]$", w["w"]) and len(buf) >= 2) or re.search(r"[.?!…]$", w["w"]):
        caps.append(buf); buf = []
if buf: caps.append(buf)
out = [{"s": round(c[0]["s"], 3), "e": round(c[-1]["e"], 3), "words": [{"w": w["w"], "s": round(w["s"], 3)} for w in c]} for c in caps]
json.dump(out, open(f"{film}/captions.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "captions;", " | ".join(" ".join(w["w"] for w in c["words"]) for c in out))
