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

POSTERS = {'perola_negra': perola_negra, 'cartola': cartola, 'construcao': construcao, 'elis': elis}

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

if __name__ == '__main__':
    for k, f in POSTERS.items(): f().save(os.path.join(OUT, f'poster_{k}.png'))
    for i, b in enumerate(BOOKS): spine(*b).save(os.path.join(OUT, f'spine_{i}.png'))
    acabou_chorare().save(os.path.join(OUT, 'lp_acabou_chorare.png'))
    print('art done')
