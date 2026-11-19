# Genera variantes transparentes del logo real (emitego/brand/logo_original.png, fondo blanco):
#   logo_color.png / icono_color.png  -> colores originales, fondo transparente (fondos claros)
#   logo_blanco.png / icono_blanco.png -> todo en blanco, fondo transparente (fondos azul / verde)
# La opacidad sale de qué tan lejos está cada pixel del blanco, así el antialias se conserva.
import numpy as np
from PIL import Image
im = np.asarray(Image.open("emitego/brand/logo_original.png").convert("RGB")).astype(np.float32)
lum = im.mean(axis=2)
dark = 255 - lum
ref = np.percentile(dark[dark > 120], 50)          # tinta sólida (azul marino)
a = np.clip(dark / ref, 0, 1)
ys, xs = np.where(a > 0.05)
cols = np.where(a.max(axis=0) > 0.05)[0]
# separa icono y palabra por el hueco horizontal más grande entre columnas con tinta
gaps = np.diff(cols); g = np.argmax(gaps); split = (cols[g] + cols[g + 1]) // 2
y0, y1 = ys.min(), ys.max() + 1
def save(name, x0, x1, white):
    al = a[y0:y1, x0:x1]
    if white: rgb = np.full(al.shape + (3,), 255, np.float32)
    else:
        src = im[y0:y1, x0:x1]; sa = np.maximum(al[..., None], 1e-3)
        rgb = np.clip((src - (1 - sa) * 255) / sa, 0, 255)
    pad = 4
    out = np.zeros((al.shape[0] + 2 * pad, al.shape[1] + 2 * pad, 4), np.uint8)
    out[pad:-pad, pad:-pad, :3] = rgb; out[pad:-pad, pad:-pad, 3] = al * 255
    Image.fromarray(out, "RGBA").save(f"emitego/brand/{name}.png"); print(name, out.shape[1], "x", out.shape[0])
X0, X1 = cols.min(), cols.max() + 1
for white in (False, True):
    suf = "blanco" if white else "color"
    save(f"logo_{suf}", X0, X1, white)
    save(f"icono_{suf}", X0, split, white)
print("split at", split, "ink color", im[a > 0.98].mean(axis=0).round())
