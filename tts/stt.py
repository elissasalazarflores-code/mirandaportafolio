import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
def load(f):
    raw = subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
for f in sys.argv[1:]:
    segs, _ = m.transcribe(load(f), language="es")
    print(f, "|", " ".join(s.text.strip() for s in segs))
