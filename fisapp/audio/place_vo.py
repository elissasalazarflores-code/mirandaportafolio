# Places each VO phrase (tts/final/lN.wav) so its onset lands on a beat; writes audio/vo.wav + vo.json.
import json, subprocess, numpy as np, sys
F = 'fisapp'; SR = 48000; TEMPO = 1.0
g = json.load(open(f'{F}/beats.json')); per, off = g['period'], g['offset']
PLACE = [0.25, 8.5, 16.85, 24, 33, 40, 45.75]
TEMPOS = {3: 1.07, 5: 1.05}   # beat of each phrase onset
def load(p, TEMPO=1.0):
    raw = subprocess.run(['ffmpeg','-nostdin','-v','error','-i',p,'-af',f'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse,atempo={TEMPO},highpass=f=90,acompressor=threshold=-18dB:ratio=3:attack=5:release=80','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
dur = 26.0; out = np.zeros(int(SR*dur)+SR, np.float32); info = []
for i, b in enumerate(PLACE, 1):
    x = load(f'tts/eleven/bella/l{i}.mp3', TEMPOS.get(i, 1.0)); x = x / (np.abs(x).max()+1e-9) * 0.9
    # speech onset: first sample above -30 dB of peak
    env = np.abs(x); on = int(np.argmax(env > 0.03)); t0 = off + b*per - on/SR
    s = int(round(t0*SR)); out[s:s+len(x)] += x
    info.append({'line': i, 'beat': b, 'start': round(t0+on/SR,3), 'end': round(t0+len(x)/SR,3), 'end_beat': round((t0+len(x)/SR-off)/per,2)})
for a, c in zip(info, info[1:]): print(f"l{a['line']} beats {a['beat']}..{a['end_beat']}  gap->{c['beat']-a['end_beat']:.2f}")
print(f"l{info[-1]['line']} beats {info[-1]['beat']}..{info[-1]['end_beat']}")
out = out[:int(SR*dur)]
import wave
pcm = (np.clip(out,-1,1)*32767).astype('<i2')
with wave.open(f'{F}/audio/vo.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
json.dump(info, open(f'{F}/vo.json','w'), indent=1)
