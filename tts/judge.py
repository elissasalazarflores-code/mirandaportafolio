import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
def load(f):
    raw = subprocess.run(["ffmpeg","-nostdin","-v","error","-i",f,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
rows=[]
for f in sys.argv[2:]:
    a = load(f)
    _, info = m.transcribe(a, language=None)
    segs, _ = m.transcribe(a, language="es")
    segs = list(segs)
    lp = np.mean([s.avg_logprob for s in segs])
    txt = " ".join(s.text.strip() for s in segs)
    rows.append((info.language_probability if info.language=="es" else -info.language_probability, lp, len(a)/16000, f.split('/')[-1], txt))
for r in sorted(rows, key=lambda r: -(r[0]+r[1])):
    print(f"es_prob {r[0]:+.3f}  logprob {r[1]:+.3f}  {r[2]:.1f}s  {r[3]:34s} {r[4]}")
