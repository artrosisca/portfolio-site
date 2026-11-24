"""
The wall and the shelf: four framed MPB posters above the desk, programming books (and a
calculus one) on the shelf next to a few LPs leaning on the wall. Art from blender/art.py.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
from books import BOOKS  # noqa: E402

WALL_Y = 0.8
SHELF_TOP = 1.7375
SHELF_BACK = 0.785

def art(name):
    """The real cover if Arthur's copy is in blender/assets/covers (not committed), else our drawing."""
    cover = os.path.join(HERE, 'assets', 'covers', f'{name}.png')
    return cover if os.path.exists(cover) else os.path.join(HERE, 'textures', f'poster_{name}.png')

def mat(name, rgb, rough, image=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']; p.inputs['Roughness'].default_value = rough
    p.inputs['Base Color'].default_value = (*rgb, 1)
    if image:
        t = m.node_tree.nodes.new('ShaderNodeTexImage')
        t.image = bpy.data.images.load(image if os.path.isabs(image) else os.path.join(HERE, 'textures', image), check_existing=True)
        m.node_tree.links.new(t.outputs['Color'], p.inputs['Base Color'])
    return m

def srgb(c): return tuple((x / 255) ** 2.2 for x in c)

def obj(name, bm, m, M=None, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
    for p in me.polygons: p.use_smooth = smooth
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    if M is not None: o.matrix_world = M
    return o

def box(size, bevel=0.0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel: bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=2, affect='EDGES')
    return bm

def quad(w, h):
    """A picture facing -y (towards the room), UVs covering the image."""
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    vs = [bm.verts.new((x * w / 2, 0, z * h / 2)) for x, z in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    f = bm.faces.new(vs)  # this winding faces -y
    for l, c in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): l[uv].uv = c
    return bm

def centre(o):
    return o.matrix_world @ (sum((Vector(c) for c in o.bound_box), Vector()) / 8)

def clear_old():
    for o in list(bpy.data.objects):
        if o.type != 'MESH' or not o.name.startswith('decor__'): continue
        c, d = centre(o), max(o.dimensions)
        if c.y > 0.75 and c.z > 1.5 and c.x < 0.3:                   # the two prints and frames
            bpy.data.objects.remove(o)
        elif 0.35 < c.x < 1.2 and SHELF_TOP < c.z < 2.1 and d < 0.3:  # the coloured books
            bpy.data.objects.remove(o)

def posters():
    frame = mat('frame', (0.015, 0.014, 0.016), 0.5)
    for i, name in enumerate(('perola_negra', 'cartola', 'construcao', 'elis')):
        x, z = -0.98 + i * 0.34, 1.68
        obj(f'art__frame_{name}', box((0.3, 0.02, 0.3), 0.003), frame, Matrix.Translation((x, WALL_Y - 0.011, z)))
        obj(f'art__poster_{name}', quad(0.27, 0.27), mat(f'poster_{name}', (1, 1, 1), 0.7, art(name)),
            Matrix.Translation((x, WALL_Y - 0.0215, z)))

def books():
    x = 0.44
    for i, (title, author, bg, fg, accent, thick, height) in enumerate(BOOKS):
        depth = 0.17 + 0.02 * (height > 0.24)
        cx = x + thick / 2; cy = SHELF_BACK - 0.005 - depth / 2
        cover = mat(f'book_{i}', srgb(bg), 0.6)
        obj(f'decor__book_{i}', box((thick, depth, height), 0.0015), cover, Matrix.Translation((cx, cy, SHELF_TOP + height / 2)))
        # page block showing at the top, then the printed spine on the front
        obj(f'decor__book_{i}_pages', box((thick * 0.86, depth * 0.96, 0.002)), mat(f'pages_{i}', (0.8, 0.77, 0.7), 0.9),
            Matrix.Translation((cx, cy + 0.003, SHELF_TOP + height + 0.0005)))
        obj(f'decor__spine_{i}', quad(thick, height), mat(f'spine_{i}', (1, 1, 1), 0.55, f'spine_{i}.png'),
            Matrix.Translation((cx, cy - depth / 2 - 0.0006, SHELF_TOP + height / 2)))
        x += thick + 0.002

def lps():
    """Sleeves leaning on the wall, the front one (Alcione) facing out with a record pulled up."""
    colours = [(30, 30, 34), (200, 70, 50), (240, 236, 222), (40, 90, 140), (120, 40, 60)]
    lean = math.radians(14); size = 0.315
    base = Vector((0.88, SHELF_BACK - 0.012 - size * math.sin(lean), SHELF_TOP))
    R = Matrix.Rotation(-lean, 4, 'X')  # top tips back towards the wall
    for i, c in enumerate(colours):
        off = Vector((0.004 * (i % 2 * 2 - 1), 0.006 * (len(colours) - i), 0))
        M = Matrix.Translation(base + off) @ R @ Matrix.Translation((0, 0.0025, size / 2))
        obj(f'decor__lp_{i}', box((size, 0.003, size)), mat(f'lp_{i}', srgb(c), 0.7), M)
    M = Matrix.Translation(base) @ R
    front = os.path.join(HERE, 'assets', 'covers', 'alcione.png')  # A Voz do Samba
    if not os.path.exists(front): front = 'lp_acabou_chorare.png'
    obj('decor__lp_front', box((size, 0.003, size)), mat('lp_front_back', srgb((60, 110, 170)), 0.7),
        M @ Matrix.Translation((0, 0.0015, size / 2)))
    obj('decor__lp_front_art', quad(size, size), mat('lp_front', (1, 1, 1), 0.6, front),
        M @ Matrix.Translation((0, -0.0004, size / 2)))
    # the vinyl, half out of its sleeve
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=64, radius1=0.15, radius2=0.15, depth=0.0015)
    obj('decor__vinyl', bm, mat('vinyl', (0.008, 0.008, 0.01), 0.25),
        M @ Matrix.Translation((0.05, 0.003, size / 2 + 0.1)) @ Matrix.Rotation(math.pi / 2, 4, 'X'))
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.05, radius2=0.05, depth=0.0018)
    obj('decor__vinyl_label', bm, mat('vinyl_label', srgb((232, 120, 50)), 0.6),
        M @ Matrix.Translation((0.05, 0.003, size / 2 + 0.1)) @ Matrix.Rotation(math.pi / 2, 4, 'X'))

def build():
    clear_old(); posters(); books(); lps()
