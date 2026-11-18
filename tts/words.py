import sys, subprocess, numpy as np, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
raw = subprocess.run(["ffmpeg","-nostdin","-v","error","-i",sys.argv[1],"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
segs,_ = m.transcribe(np.frombuffer(raw,np.float32), language="es", word_timestamps=True)
g=json.load(open('fisapp/beats.json'))
for s in segs:
    print(" ".join(f"{w.word.strip()}@{(w.start-g['offset'])/g['period']:.2f}" for w in s.words))
