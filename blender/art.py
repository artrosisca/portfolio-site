"""
Draws the room's printed things: four MPB album posters for the wall (our own versions in each
record's colours and mood, not copies of the cover photos), the book spines and the LP sleeves.
Run: python3 blender/art.py  ->  blender/textures/*.png (committed; build.py uses them)
Fonts: Fedora's Montserrat, Libre Bodoni and Garamond Libre, plus Caveat (blender/assets/fonts).
"""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures'); os.makedirs(OUT, exist_ok=True)
FONTS = {
    'black': '/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Black.otf',
    'bold': '/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Bold.otf',
    'bodoni': '/usr/share/fonts/librebodoni/LibreBodoni-Bold.otf',
    'bodoni_i': '/usr/share/fonts/librebodoni/LibreBodoni-BoldItalic.otf',
    'garamond_i': '/usr/share/fonts/garamond-libre/GaramondLibre-Italic.otf',
    'garamond': '/usr/share/fonts/garamond-libre/GaramondLibre-Regular.otf',
    'hand': os.path.join(HERE, 'assets', 'fonts', 'Caveat.ttf'),
}
F = lambda k, s: ImageFont.truetype(FONTS[k], s)
S = 1024
random.seed(3)

def centred(d, y, text, font, fill, spacing=0):
    if spacing:
        w = sum(d.textlength(c, font=font) for c in text) + spacing * (len(text) - 1)
        x = (S - w) / 2
        for c in text:
            d.text((x, y), c, font=font, fill=fill); x += d.textlength(c, font=font) + spacing
    else:
        d.text(((S - d.textlength(text, font=font)) / 2, y), text, font=font, fill=fill)

def grain(img, k=10):
    """Printed-paper noise so flat colours don't look digital."""
    n = Image.effect_noise(img.size, k).convert('L')
    return Image.blend(img, Image.merge('RGB', (n, n, n)), 0.06)

# --- posters ---------------------------------------------------------------------------------

def perola_negra():
    """Luiz Melodia, 1973: black, a single glowing pearl, the title small and elegant."""
    img = Image.new('RGB', (S, S), (10, 9, 12)); d = ImageDraw.Draw(img)
    glow = Image.new('L', (S, S), 0); ImageDraw.Draw(glow).ellipse((300, 250, 724, 674), fill=120)
    img.paste((70, 60, 52), (0, 0), glow.filter(ImageFilter.GaussianBlur(90)))
    pearl = Image.new('RGB', (S, S)); pd = ImageDraw.Draw(pearl)
    for i in range(160):  # radial shading, lit from the top left
        t = i / 160; r = 190 * (1 - t)
        c = tuple(int(a + (b - a) * t ** 0.7) for a, b in zip((120, 112, 104), (252, 248, 240)))
        pd.ellipse((512 - r - 30 * t, 460 - r - 34 * t, 512 + r - 30 * t, 460 + r - 34 * t), fill=c)
    m = Image.new('L', (S, S), 0); ImageDraw.Draw(m).ellipse((322, 270, 702, 650), fill=255)
    img.paste(pearl, (0, 0), m)
    centred(d, 110, 'LUIZ MELODIA', F('bold', 44), (236, 228, 214), spacing=14)
    centred(d, 760, 'Pérola Negra', F('bodoni_i', 104), (240, 232, 218))
    centred(d, 900, '1973', F('garamond', 40), (170, 160, 146), spacing=10)
    return grain(img)

def cartola():
    """Cartola, 1976: Mangueira's green and pink, a rose, the name set big."""
    img = Image.new('RGB', (S, S), (238, 170, 182)); d = ImageDraw.Draw(img)
    d.rectangle((0, 700, S, S), fill=(22, 108, 70))
    # a rose: petals as offset circles, a stem and two leaves
    d.line((600, 700, 560, 470), fill=(22, 108, 70), width=14)
    d.ellipse((600, 560, 700, 610), fill=(22, 108, 70)); d.ellipse((470, 600, 575, 650), fill=(22, 108, 70))
    for i, (dx, dy, r, c) in enumerate([(0, 0, 120, (196, 30, 58)), (-40, -20, 80, (220, 48, 76)), (35, -35, 70, (176, 22, 48)),
                                         (-5, -45, 48, (236, 76, 100)), (10, -30, 26, (150, 14, 38))]):
        d.ellipse((560 + dx - r, 380 + dy - r, 560 + dx + r, 380 + dy + r), fill=c)
    d.text((80, 90), 'CARTOLA', font=F('black', 150), fill=(22, 108, 70))
    d.text((84, 260), '1976', font=F('bold', 54), fill=(150, 30, 56))
    d.text((80, 770), 'as rosas não falam', font=F('garamond_i', 72), fill=(244, 214, 220))
    return grain(img)

def construcao():
    """Chico Buarque, 1971: a brick wall going up, the title stamped on it."""
    img = Image.new('RGB', (S, S), (60, 40, 32)); d = ImageDraw.Draw(img)
    bw, bh = 128, 56
    for row in range(S // bh + 1):
        off = (row % 2) * bw // 2
        for col in range(-1, S // bw + 2):
            x = col * bw + off; y = S - (row + 1) * bh
            if row > 12 and col > 4 - (row - 12): continue  # the wall is still being built
            c = random.choice([(168, 74, 46), (156, 66, 40), (182, 86, 54), (142, 60, 38), (176, 96, 64)])
            d.rectangle((x + 4, y + 4, x + bw - 4, y + bh - 4), fill=c)
    d.rectangle((150, 360, S - 150, 640), fill=(238, 230, 214))
    centred(d, 390, 'CHICO BUARQUE', F('bold', 56), (40, 30, 26), spacing=8)
    centred(d, 470, 'Construção', F('bodoni', 116), (176, 60, 34))
    centred(d, 960, '1971', F('bold', 36), (238, 230, 214), spacing=12)
    return grain(img)

def elis():
    """Elis Regina, 20 Anos Blue: deep blues, her name huge, the song title like a note."""
    img = Image.new('RGB', (S, S)); d = ImageDraw.Draw(img)
    for y in range(S):
        t = y / S; d.line((0, y, S, y), fill=(int(14 + 20 * t), int(30 + 40 * t), int(78 + 70 * t)))
    for i in range(7):  # soft stage light from the top
        d.ellipse((260 - i * 30, -420 - i * 20, 760 + i * 30, 300 + i * 30), outline=(60 + i * 8, 100 + i * 8, 170 + i * 6), width=3)
    centred(d, 330, 'ELIS', F('black', 300), (236, 232, 222))
    centred(d, 640, 'REGINA', F('bold', 70), (150, 186, 236), spacing=40)
    centred(d, 800, '20 anos blue', F('hand', 110), (255, 140, 100))
    return grain(img)

def copacabana():
    """A tall print of Copacabana's promenade: Burle Marx's black and cream waves, a persimmon sun."""
    W, H = 680, S
    img = Image.new('RGB', (W, H), (236, 228, 212)); d = ImageDraw.Draw(img)
    # the waves run across the print; every other band between two wave lines is black
    lines = [(y0, 26 + 4 * (i % 3), 0.011 + 0.0006 * (i % 2)) for i, y0 in enumerate(range(150, H - 40, 62))]
    wave = lambda y0, amp, k, x: y0 + amp * math.sin(k * x + y0 * 0.02)
    d.ellipse((W - 250, 70, W - 90, 230), fill=(232, 108, 54))  # setting behind the sea
    for i in range(0, len(lines) - 1, 2):
        a, b = lines[i], lines[i + 1]
        top = [(x, wave(*a, x)) for x in range(0, W + 8, 8)]
        bottom = [(x, wave(*b, x)) for x in range(W, -8, -8)]
        d.polygon(top + bottom, fill=(22, 20, 26))
    d.text((44, 60), 'COPACABANA', font=F('bold', 40), fill=(22, 20, 26))
    d.text((46, 108), 'rio, 1970', font=F('garamond_i', 36), fill=(120, 60, 30))
    return grain(img)

POSTERS = {'perola_negra': perola_negra, 'cartola': cartola, 'construcao': construcao, 'elis': elis, 'copacabana': copacabana}

# --- the acoustic guitar's top and the record on the turntable --------------------------------
import guitar_shape as G  # noqa: E402

def guitar_top():
    """Spruce top as models/guitar.py maps it: x across the body, z up from its bottom end.
    Honey grain, a soft burst at the edges, cream binding, rosette, sound hole, tortoise guard."""
    PX = 2000; W, H = int(0.4 * PX), int(G.BODY_L * PX)
    to = lambda x, z: ((x + 0.2) * PX, (G.BODY_L - z) * PX)
    img = Image.new('RGB', (W, H), (218, 172, 108)); d = ImageDraw.Draw(img)
    rnd = random.Random(7)
    x = 0
    while x < W:  # grain: fine, slightly wavy, uneven lines
        c = rnd.choice([(196, 148, 88), (204, 158, 96), (230, 186, 122), (188, 140, 82)])
        wdt = rnd.choice([1, 1, 2, 2, 3]); ph = rnd.uniform(0, 6)
        d.line([(x + 2.5 * math.sin(y / 140 + ph), y) for y in range(0, H + 20, 20)], fill=c, width=wdt)
        x += rnd.uniform(3, 9)
    img = img.filter(ImageFilter.GaussianBlur(0.6)); d = ImageDraw.Draw(img)
    shape = [to(x, z) for x, z in G.outline(200)]
    # a light burst: darker towards the edge
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(shape, fill=255)
    inner = mask.filter(ImageFilter.GaussianBlur(70)).point(lambda v: 255 - v)
    img.paste((110, 64, 30), (0, 0), inner.point(lambda v: min(255, int(v * 1.3))))
    d = ImageDraw.Draw(img)
    # pickguard on the treble side, below the hole (viewer's right)
    hx, hz = to(0, G.HOLE_Z); r = G.HOLE_R * PX
    guard = [(hx + r * 0.55 + 150 * math.cos(t) * (1 - 0.25 * math.sin(t)), hz + 30 + 120 * math.sin(t)) for t in [i / 40 * 2 * math.pi for i in range(41)]]
    gimg = Image.new('RGB', (W, H), (52, 24, 14)); gd = ImageDraw.Draw(gimg)
    for _ in range(900):  # tortoiseshell mottling
        cx, cy = rnd.uniform(0, W), rnd.uniform(0, H); rr = rnd.uniform(3, 14)
        gd.ellipse((cx - rr, cy - rr * 0.6, cx + rr, cy + rr * 0.6), fill=rnd.choice([(120, 50, 20), (150, 70, 26), (30, 12, 8), (90, 36, 16)]))
    gimg = gimg.filter(ImageFilter.GaussianBlur(3))
    gm = Image.new('L', (W, H), 0); ImageDraw.Draw(gm).polygon(guard, fill=255)
    img.paste(gimg, (0, 0), gm)
    # rosette: cream and black rings around a band of shell
    for rr, c, wdt in ((r + 32, (24, 18, 14), 3), (r + 28, (236, 224, 196), 3), (r + 22, (40, 120, 110), 7), (r + 16, (236, 224, 196), 3),
                       (r + 12, (24, 18, 14), 3), (r + 7, (236, 224, 196), 2)):
        d.ellipse((hx - rr, hz - rr, hx + rr, hz + rr), outline=c, width=wdt)
    for i in range(60):  # flecks of abalone in the shell band
        t = i / 60 * 2 * math.pi; rr = r + 22
        d.ellipse((hx + rr * math.cos(t) - 3, hz + rr * math.sin(t) - 3, hx + rr * math.cos(t) + 3, hz + rr * math.sin(t) + 3),
                  fill=rnd.choice([(80, 170, 150), (170, 110, 190), (90, 140, 200), (230, 150, 90)]))
    d.ellipse((hx - r, hz - r, hx + r, hz + r), fill=(14, 10, 8))
    # binding round the edge, with a black purfling line just inside
    from PIL import ImageChops
    body = mask.filter(ImageFilter.MinFilter(17)); purfl = body.filter(ImageFilter.MinFilter(5))
    img.paste((236, 226, 200), (0, 0), ImageChops.subtract(mask, body))
    img.paste((30, 20, 14), (0, 0), ImageChops.subtract(body, purfl))
    return grain(img, 6)

def vinyl():
    """The record seen from above: fine grooves, gaps between the tracks, the dull sheen vinyl has
    along a line through the centre, and a label."""
    img = Image.new('RGB', (S, S), (16, 16, 18)); d = ImageDraw.Draw(img)
    c = S / 2; R = S / 2 - 2
    rnd = random.Random(4)
    gaps = [0.52, 0.6, 0.69, 0.79, 0.88]
    rr = R
    while rr > R * 0.37:
        f = rr / R
        if f > 0.985 or any(abs(f - g) < 0.006 for g in gaps): v = 10  # lead-in and the smooth bands between songs
        else: v = 20 + rnd.randint(-4, 5)
        d.ellipse((c - rr, c - rr, c + rr, c + rr), outline=(v, v, v + 2), width=2)
        rr -= 1.6
    # the sheen: two opposite fans of light across the grooves
    sheen = Image.new('L', (S, S), 0); sd = ImageDraw.Draw(sheen)
    for a0 in (-28, 152):
        sd.pieslice((0, 0, S, S), a0 - 9, a0 + 9, fill=70)
        sd.pieslice((0, 0, S, S), a0 - 3, a0 + 3, fill=120)
    sheen = sheen.filter(ImageFilter.GaussianBlur(22))
    hole = Image.new('L', (S, S), 0); ImageDraw.Draw(hole).ellipse((c - R * 0.37, c - R * 0.37, c + R * 0.37, c + R * 0.37), fill=255)
    sheen.paste(0, (0, 0), hole)
    img.paste((120, 118, 124), (0, 0), sheen)
    d = ImageDraw.Draw(img)
    # the label: Elis on the persimmon of the room
    lr = R * 0.33
    d.ellipse((c - lr, c - lr, c + lr, c + lr), fill=(232, 108, 54))
    d.ellipse((c - lr + 10, c - lr + 10, c + lr - 10, c + lr - 10), outline=(250, 200, 170), width=3)
    centred(d, c - 118, 'ELIS REGINA', F('bold', 26), (40, 22, 16), spacing=5)
    centred(d, c - 70, 'Elis & Tom', F('bodoni_i', 50), (40, 22, 16))
    centred(d, c + 50, 'lado A  ·  33⅓', F('garamond', 30), (70, 36, 22))
    centred(d, c + 92, 'Águas de Março', F('garamond_i', 34), (70, 36, 22))
    d.ellipse((c - 9, c - 9, c + 9, c + 9), fill=(10, 10, 12))  # spindle hole
    return img

# --- book spines ------------------------------------------------------------------------------
from books import BOOKS  # shared with models/wall_shelf.py

def spine(title, author, bg, fg, accent, thick, height):
    """Spine art, text running top to bottom as on Brazilian/US spines."""
    W, H = int(1400 * thick) + 40, int(1400 * height)
    img = Image.new('RGB', (H, W), bg); d = ImageDraw.Draw(img)  # drawn sideways, rotated at the end
    def fit(key, size, maxw, text):
        f = F(key, size)
        while d.textlength(text, font=f) > maxw and size > 8: size -= 1; f = F(key, size)
        return f, size
    ft, size = fit('bold', int(W * 0.42), H * 0.56, title)
    d.text((int(H * 0.05), (W - size) // 2 - 2), title, font=ft, fill=fg)
    fa, sa = fit('garamond', int(W * 0.3), H * 0.22, author)
    d.text((int(H * 0.68), (W - sa) // 2 - 2), author, font=fa, fill=fg)
    d.rectangle((H - int(H * 0.06), 0, H, W), fill=accent)
    return grain(img.rotate(-90, expand=True), 6)

# --- LPs --------------------------------------------------------------------------------------

def acabou_chorare():
    """The record facing out on the shelf: Novos Baianos, 1972, in sunny yellow."""
    img = Image.new('RGB', (S, S), (238, 204, 74)); d = ImageDraw.Draw(img)
    d.ellipse((560, 80, 940, 460), fill=(232, 120, 50))
    d.text((70, 520), 'acabou', font=F('black', 170), fill=(40, 30, 24))
    d.text((70, 700), 'chorare', font=F('black', 170), fill=(40, 30, 24))
    d.text((76, 110), 'NOVOS BAIANOS', font=F('bold', 48), fill=(40, 30, 24))
    d.text((76, 175), '1972', font=F('garamond_i', 56), fill=(120, 60, 30))
    return grain(img)

# --- the rug: Arthur's burgundy kilim -----------------------------------------------------------

def kilim():
    """Long axis along x: three stepped diamonds between striped, chequered bands, chevrons on the
    long edges, a woven texture over everything."""
    W, H = 2400, 1560
    img = Image.new('RGB', (W, H), (112, 26, 40)); d = ImageDraw.Draw(img)
    red, white, black = (196, 44, 52), (236, 228, 214), (24, 20, 26)
    def band(x, w=150):
        """Vertical band across the rug: stripes and a row of black squares on white."""
        stripes = [(red, 14), (white, 8), (red, 6), (white, 34), (red, 6), (white, 8), (red, 14)]
        t = sum(h for _, h in stripes); xx = x - t / 2
        for c, h in stripes:
            d.rectangle((xx, 0, xx + h, H), fill=c); xx += h
        for y in range(10, H, 46):
            d.rectangle((x - 12, y, x + 12, y + 26), fill=black)
    def diamond(cx, cy, r, c):
        d.polygon([(cx - r, cy), (cx, cy - r), (cx + r, cy), (cx, cy + r)], fill=c)
    def serrated(cx, cy, r, c, teeth=11):
        """A diamond outline of little steps, as woven kilims do."""
        for k in range(teeth):
            t = k / teeth; s = r / teeth * 0.9
            for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
                x = cx + sx * r * t; y = cy + sy * r * (1 - t)
                d.polygon([(x, y), (x + sx * s, y), (x, y - sy * s)], fill=c)
    def chevron(x, y, up, c, s=34):
        k = -1 if up else 1
        d.polygon([(x - s, y), (x, y + k * s * 0.8), (x + s, y), (x + s, y + k * s * 0.45), (x, y + k * s * 1.25), (x - s, y + k * s * 0.45)], fill=c)
    # end bands and the dark border lines on the short edges
    for x in (60, W - 60): band(x, 120)
    d.rectangle((0, 0, 18, H), fill=(40, 30, 50)); d.rectangle((W - 18, 0, W, H), fill=(40, 30, 50))
    panels = [(W * (i + 0.5) / 3) for i in range(3)]
    for x in (W / 3, 2 * W / 3): band(x)
    for cx in panels:
        cy = H / 2
        # olive shading towards the long edges, as on the real rug
        for y0 in (0, H - 260):
            for k in range(26):
                a = (1 - k / 26)
                d.rectangle((cx - 300, y0 + (k * 10 if y0 == 0 else 250 - k * 10), cx + 300, y0 + (k * 10 if y0 == 0 else 250 - k * 10) + 10),
                            fill=tuple(int(c1 + (c2 - c1) * a * 0.55) for c1, c2 in zip((112, 26, 40), (86, 70, 46))))
        diamond(cx, cy, 330, (196, 186, 198))
        serrated(cx, cy, 330, (226, 150, 110))
        diamond(cx, cy, 270, (232, 210, 190))
        diamond(cx, cy, 225, (214, 92, 52))
        diamond(cx, cy, 195, (150, 70, 110))
        diamond(cx, cy, 165, (238, 214, 196))
        serrated(cx, cy, 165, (214, 92, 52), 8)
        diamond(cx, cy, 110, (124, 28, 52))
        d.rectangle((cx - 70, cy - 18, cx + 70, cy + 18), fill=(124, 28, 52)); d.rectangle((cx - 18, cy - 70, cx + 18, cy + 70), fill=(124, 28, 52))
        diamond(cx, cy, 34, (214, 92, 52))
        for i, dx in enumerate((-230, -150, 150, 230)):
            col = [(190, 186, 200), (222, 120, 70), (222, 120, 70), (190, 186, 200)][i]
            chevron(cx + dx, 70, False, col); chevron(cx + dx, H - 70, True, col)
            chevron(cx + dx * 1.15, 140, False, (230, 214, 196)); chevron(cx + dx * 1.15, H - 140, True, (230, 214, 196))
    # weave: fine horizontal ribs and noise
    rib = Image.new('L', (W, H), 0); rd = ImageDraw.Draw(rib)
    for y in range(0, H, 7): rd.line((0, y, W, y), fill=60)
    img = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), img, rib.point(lambda v: v // 3))
    return grain(img, 14)

# --- laptop stickers: the stack from the GitHub README ------------------------------------------

def sticker(kind):
    """Die-cut vinyl stickers, our own simple takes on each logo."""
    S2 = 512
    img = Image.new('RGBA', (S2, S2), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    def badge(fill, r=230):
        d.ellipse((256 - r - 18, 256 - r - 18, 256 + r + 18, 256 + r + 18), fill=(246, 244, 238, 255))
        d.ellipse((256 - r, 256 - r, 256 + r, 256 + r), fill=fill)
    if kind == 'python':
        d.rounded_rectangle((40, 40, 472, 472), 90, fill=(246, 244, 238, 255))
        d.rounded_rectangle((80, 80, 300, 300), 60, fill=(55, 118, 171)); d.rounded_rectangle((212, 212, 432, 432), 60, fill=(255, 212, 59))
        d.ellipse((130, 120, 160, 150), fill=(246, 244, 238)); d.ellipse((352, 362, 382, 392), fill=(246, 244, 238))
    elif kind == 'react':
        badge((32, 35, 42))
        for a in (0, 60, 120):
            e = Image.new('RGBA', (S2, S2), (0, 0, 0, 0)); ImageDraw.Draw(e).ellipse((66, 196, 446, 316), outline=(97, 218, 251), width=18)
            img.alpha_composite(e.rotate(a, center=(256, 256)))
        d.ellipse((226, 226, 286, 286), fill=(97, 218, 251))
    elif kind == 'docker':
        badge((36, 150, 237))
        d.chord((96, 180, 430, 380), 0, 180, fill=(246, 244, 238)); d.polygon([(430, 280), (470, 240), (452, 300)], fill=(246, 244, 238))
        for i, j in ((0, 0), (1, 0), (2, 0), (1, 1), (2, 1), (2, 2)):
            x, y = 150 + i * 58, 222 - j * 58; d.rectangle((x, y, x + 48, y + 48), fill=(246, 244, 238))
    elif kind == 'laravel':
        d.rounded_rectangle((20, 150, 492, 362), 50, fill=(246, 244, 238, 255)); d.rounded_rectangle((40, 170, 472, 342), 36, fill=(255, 45, 32))
        f = F('black', 96); d.text((256 - d.textlength('laravel', font=f) / 2, 196), 'laravel', font=f, fill=(255, 255, 255))
    elif kind == 'postgres':
        badge((51, 103, 145))
        f = F('black', 150); d.text((256 - d.textlength('pg', font=f) / 2, 150), 'pg', font=f, fill=(246, 244, 238))
        f = F('bold', 40); d.text((256 - d.textlength('postgresql', font=f) / 2, 340), 'postgresql', font=f, fill=(246, 244, 238))
    elif kind == 'fedora':
        badge((41, 65, 114))
        d.ellipse((150, 150, 362, 362), outline=(81, 162, 218), width=34)
        f = F('black', 190); d.text((256 - d.textlength('f', font=f) / 2 + 6, 130), 'f', font=f, fill=(246, 244, 238))
    return img

STICKERS = ['python', 'react', 'docker', 'laravel', 'postgres', 'fedora']

# --- the post-its under the monitor ---------------------------------------------------------------

def postit(text, colour):
    img = Image.new('RGB', (512, 512), colour); d = ImageDraw.Draw(img)
    for i in range(40): d.line((0, 511 - i, 511, 511 - i), fill=tuple(int(c * (0.9 + 0.1 * i / 40)) for c in colour))
    lines = text.split('\n'); f = F('hand', 150 if len(lines) > 1 else 190)
    y = 256 - len(lines) * f.size * 0.55
    for line in lines:
        d.text((256 - d.textlength(line, font=f) / 2, y), line, font=f, fill=(30, 36, 80)); y += f.size * 1.05
    return grain(img, 8)

def contrib_card():
    """A printed GitHub contribution graph, pinned to the cork board."""
    W, H = 620, 384
    img = Image.new('RGB', (W, H), (246, 244, 238)); d = ImageDraw.Draw(img)
    d.text((24, 16), 'artrosisca · 2026', font=F('bold', 30), fill=(40, 40, 46))
    greens = [(235, 237, 240), (155, 233, 168), (64, 196, 99), (48, 161, 78), (33, 110, 57)]
    r = random.Random(5)
    for wk in range(26):
        for day in range(7):
            v = r.choices(range(5), weights=[3, 3, 3, 2, 1 + wk // 6])[0]
            x, y = 24 + wk * 22, 80 + day * 22
            d.rounded_rectangle((x, y, x + 17, y + 17), 3, fill=greens[v])
    d.text((24, 250), '1.2k contribuições', font=F('hand', 54), fill=(40, 40, 46))
    return grain(img, 6)

if __name__ == '__main__':
    for k, f in POSTERS.items(): f().save(os.path.join(OUT, f'poster_{k}.png'))
    for i, b in enumerate(BOOKS): spine(*b).save(os.path.join(OUT, f'spine_{i}.png'))
    acabou_chorare().save(os.path.join(OUT, 'lp_acabou_chorare.png'))
    kilim().save(os.path.join(OUT, 'rug_kilim.png'))
    for k in STICKERS: sticker(k).save(os.path.join(OUT, f'sticker_{k}.png'))
    postit('sexta\n≠ deploy', (255, 226, 122)).save(os.path.join(OUT, 'postit_deploy.png'))
    postit('água!', (159, 211, 255)).save(os.path.join(OUT, 'postit_agua.png'))
    for k, text, c in (('tcc', 'TCC\n12/12', (255, 226, 122)), ('pr', 'PR #42\nreview', (190, 236, 170)),
                       ('cafe', 'mais\ncafé', (255, 190, 160)), ('dormir', 'dormir\n> 6h', (159, 211, 255))):
        postit(text, c).save(os.path.join(OUT, f'cork_{k}.png'))
    contrib_card().save(os.path.join(OUT, 'cork_contrib.png'))
    guitar_top().save(os.path.join(OUT, 'guitar_top.png'))
    vinyl().save(os.path.join(OUT, 'vinyl.png'))
    print('art done')
