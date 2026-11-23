"""
Draws the open notebook's pages: handwritten quicksort notes on dot-grid paper.
Run: python3 blender/notebook.py  ->  blender/textures/notebook.png (committed; build.py uses it)
Needs Pillow and the Caveat font in blender/assets/fonts (OFL, from Google Fonts).
"""
import os, random
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PW, PH = 1200, 1680                      # one page; the texture is the open spread
INK = (28, 38, 92)
RED = (190, 52, 30)
HIGHLIGHT = (255, 120, 70, 110)          # persimmon marker
random.seed(7)

img = Image.new('RGB', (PW * 2, PH), (238, 232, 216))
d = ImageDraw.Draw(img, 'RGBA')
font = lambda size, bold=False: ImageFont.truetype(os.path.join(HERE, 'assets', 'fonts', 'Caveat.ttf'), size) \
    if not bold else _bold(size)
def _bold(size):
    f = ImageFont.truetype(os.path.join(HERE, 'assets', 'fonts', 'Caveat.ttf'), size); f.set_variation_by_name('Bold'); return f

# paper: dot grid, a soft gutter shadow in the middle
for page in (0, 1):
    for x in range(page * PW + 70, (page + 1) * PW - 40, 48):
        for y in range(90, PH - 40, 48):
            d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(190, 184, 170))
for i in range(60):
    a = int(70 * (1 - i / 60) ** 2)
    d.line((PW - i, 0, PW - i, PH), fill=(90, 70, 50, a)); d.line((PW + i, 0, PW + i, PH), fill=(90, 70, 50, a))

def write(x, y, text, size=64, color=INK, bold=False, tilt=True):
    """Hand-ish: each line sits slightly off the grid."""
    dx = random.uniform(-6, 6) if tilt else 0
    d.text((x + dx, y + random.uniform(-3, 3)), text, font=font(size, bold), fill=color)
    return d.textlength(text, font=font(size, bold))

def boxes(x, y, values, w=78, h=78, mark=None, split=None):
    for i, v in enumerate(values):
        bx = x + i * w
        d.rectangle((bx, y, bx + w, y + h), outline=INK, width=4)
        tw = d.textlength(str(v), font=font(60))
        d.text((bx + (w - tw) / 2, y + 2), str(v), font=font(60), fill=INK)
        if mark == i: d.ellipse((bx - 6, y - 8, bx + w + 6, y + h + 8), outline=RED, width=5)
    if split:
        for s in split:
            sx = x + s * w
            d.line((sx, y - 22, sx, y + h + 22), fill=RED, width=6)

def arrow(x0, y0, x1, y1, color=INK, width=4):
    d.line((x0, y0, x1, y1), fill=color, width=width)
    import math
    a = math.atan2(y1 - y0, x1 - x0)
    for s in (-0.5, 0.5):
        d.line((x1, y1, x1 - 26 * math.cos(a + s), y1 - 26 * math.sin(a + s)), fill=color, width=width)

# --- left page: the idea and one partition -----------------------------------------------
L = 90
w = write(L, 60, 'quicksort', 120, bold=True)
d.line((L, 200, L + w + 10, 192), fill=RED, width=7)
write(PW - 260, 80, '23/11', 64)
write(L, 230, 'escolhe um pivô e particiona:', 66)
x = L + 40 + write(L + 40, 310, 'menores', 64, tilt=False)
arrow(x + 110, 350, x + 25, 350)
x += 130 + write(x + 130, 310, '[ pivô ]', 64, tilt=False)
arrow(x + 25, 350, x + 110, 350)
write(x + 130, 310, 'maiores', 64, tilt=False)

write(L, 430, 'a =', 66)
boxes(L + 110, 430, [7, 2, 9, 4, 1, 8])
arrow(L + 110 + 5.5 * 78, 600, L + 110 + 5.5 * 78, 525, RED)
write(L + 110 + 5.5 * 78 - 70, 600, 'pivô = 8', 56, RED)
write(L, 690, 'i = lo - 1;  j varre lo..hi-1', 60)
write(L, 760, 'se a[j] < p:  i++ e troca a[i], a[j]', 60)
write(L, 830, 'no fim: troca a[i+1] com o pivô', 60)

boxes(L + 110, 940, [7, 2, 4, 1, 8, 9], mark=4, split=[4, 5])
write(L, 1060, 'pivô já está no lugar certo!', 62, RED)
arrow(L, 1192, L + 70, 1192)
write(L + 90, 1150, 'recursão nos dois lados', 66)

write(L, 1270, 'melhor / médio:  O(n log n)', 70, bold=True)
d.rounded_rectangle((L - 12, 1372, L + 340, 1450), 14, fill=HIGHLIGHT)
write(L, 1360, 'pior:  O(n²)', 72, bold=True, tilt=False)
arrow(L + 480, 1410, L + 365, 1410, RED)
write(L + 500, 1368, 'vetor já ordenado', 60, RED)
write(L, 1470, 'solução: mediana de 3 / pivô aleatório', 60)

# --- right page: recursion tree and the code -----------------------------------------------
R = PW + 90
write(R, 60, 'recursão', 84, bold=True)
levels = [
    [(PW + 600, 200, '7 2 9 4 1 8')],
    [(PW + 330, 340, '7 2 4 1'), (PW + 880, 340, '9')],
    [(PW + 180, 480, '—'), (PW + 470, 480, '2 4 7')],
    [(PW + 330, 620, '2 4'), (PW + 610, 620, '—')],
]
nodes = {}
for li, level in enumerate(levels):
    for x, y, t in level:
        tw = d.textlength(t, font=font(58))
        d.rounded_rectangle((x - tw / 2 - 18, y - 4, x + tw / 2 + 18, y + 70), 18, outline=INK, width=4)
        d.text((x - tw / 2, y), t, font=font(58), fill=INK)
        nodes[(li, t)] = (x, y)
for (a, b) in [((0, '7 2 9 4 1 8'), (1, '7 2 4 1')), ((0, '7 2 9 4 1 8'), (1, '9')),
               ((1, '7 2 4 1'), (2, '—')), ((1, '7 2 4 1'), (2, '2 4 7')),
               ((2, '2 4 7'), (3, '2 4')), ((2, '2 4 7'), (3, '—'))]:
    (x0, y0), (x1, y1) = nodes[a], nodes[b]
    d.line((x0, y0 + 72, x1, y1 - 6), fill=INK, width=3)
write(PW + 820, 470, 'p = 8, 1, 7', 50, RED)
write(PW + 820, 530, 'profundidade ~ log n', 50, RED)

code = [
    'def quicksort(a, lo, hi):',
    '    if lo < hi:',
    '        p = particiona(a, lo, hi)',
    '        quicksort(a, lo, p - 1)',
    '        quicksort(a, p + 1, hi)',
]
for i, line in enumerate(code):
    write(R, 790 + i * 78, line, 64, tilt=False)
d.line((R - 30, 780, R - 30, 790 + 5 * 78), fill=(160, 150, 130), width=3)

write(R, 1230, 'in-place: sim     estável: não', 68, bold=True)
write(R, 1330, 'testar no TCC: ordenar as linhas', 58)
write(R, 1395, 'por atraso médio (n ≈ 300)', 58)
arrow(R + 640, 1470, R + 600, 1550, RED)
write(R + 260, 1560, 'sort() do python é timsort :)', 54, RED)

out = os.path.join(HERE, 'textures'); os.makedirs(out, exist_ok=True)
img.resize((PW, PH // 2)).save(os.path.join(out, 'notebook.png'), optimize=True)
print('notebook.png')
