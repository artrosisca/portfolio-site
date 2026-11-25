"""
Arthur's mouse, a black VXE Dragonfly R1 Pro Max: a simple, low, symmetric shell in matte
black with the button split, a scroll wheel and two side buttons on the left.
build() replaces the site's mouse (Keyboard.tsx) at the same place.
"""
import bpy, bmesh, math
from mathutils import Vector, Matrix

DESK_Y = 0.76
SCALE = 1.0                        # real size (the site draws its placeholder desk set 1.35x)
L, W, H = 0.1225, 0.0620, 0.0380   # real size (m)

def mat(name, rgb, rough):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1); p.inputs['Roughness'].default_value = rough
    return m

# Side profile traced from a photo of the R1 Pro Max (yn: -1 back .. 1 front), as a fraction
# of H: a long slope from the palm, the peak just behind the middle, a tall blunt nose.
HEIGHT = [(-1.0, 0.12), (-0.95, 0.38), (-0.85, 0.58), (-0.7, 0.8), (-0.45, 0.95), (-0.15, 1.0),
          (0.15, 0.97), (0.45, 0.85), (0.75, 0.66), (0.92, 0.52), (1.0, 0.34)]
# half width as a fraction of W/2: round at the back, a faint waist, straight sides at the front
WIDTH = [(-1.0, 0.3), (-0.9, 0.7), (-0.75, 0.9), (-0.4, 1.0), (0.0, 0.95), (0.5, 0.93),
         (0.85, 0.9), (0.97, 0.72), (1.0, 0.45)]

def curve(table, x):
    """Catmull-Rom through the table's points."""
    x = min(max(x, table[0][0]), table[-1][0])
    i = max(j for j in range(len(table) - 1) if table[j][0] <= x) if x < table[-1][0] else len(table) - 2
    (x1, p1), (x2, p2) = table[i], table[i + 1]
    p0 = table[i - 1][1] if i > 0 else p1
    p3 = table[i + 2][1] if i + 2 < len(table) else p2
    t = (x - x1) / (x2 - x1)
    return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                  + (3 * p1 - p0 - 3 * p2 + p3) * t ** 3)

def top_z(y):
    """Height of the shell's centre line at local y (m)."""
    return H * curve(HEIGHT, 2 * y / L)

def shell(rings=72, arc=28, n=2.6):
    """Lofted along the length: each ring is a superellipse arch (boxy, like the real shell)
    over a flat base; the two end rings are capped."""
    bm = bmesh.new(); loops = []
    for i in range(rings):
        yn = -1 + 2 * i / (rings - 1)
        h, w = H * curve(HEIGHT, yn), W / 2 * curve(WIDTH, yn)
        ring = []
        for j in range(arc + 1):
            t = math.pi * j / arc
            c, s_ = math.cos(t), math.sin(t)
            ring.append(bm.verts.new((math.copysign(abs(c) ** (2 / n), c) * w, yn * L / 2, abs(s_) ** (2 / n) * h)))
        loops.append(ring)
    for a, b in zip(loops, loops[1:]):
        for j in range(arc): bm.faces.new((a[j], a[j + 1], b[j + 1], b[j]))
        bm.faces.new((a[arc], a[0], b[0], b[arc]))           # flat base strip
    bm.faces.new(loops[0]); bm.faces.new(loops[-1][::-1])  # end caps
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm

def build(replace_existing=True):
    sc = bpy.context.scene
    if replace_existing:
        for o in list(bpy.data.objects):
            if o.type == 'MESH' and o.name.startswith('keyboard__'):
                c = o.matrix_world @ (sum((Vector(b) for b in o.bound_box), Vector()) / 8)
                if c.x > 0.3: bpy.data.objects.remove(o)
    coll = bpy.data.collections.new('mouse'); sc.collection.children.link(coll)
    black = mat('vxe_black', (0.012, 0.012, 0.013), 0.55)
    seam = mat('vxe_seam', (0.0, 0.0, 0.0), 0.9)
    rubber = mat('vxe_wheel', (0.55, 0.55, 0.56), 0.45)  # white wheel, as on the real one

    root = bpy.data.objects.new('vxe', None); coll.objects.link(root)
    # site: mouse at (0.29, 0, 0.03) inside the keyboard group at (0, DESK_Y+0.006, 0.13) x1.35
    root.location = (0.29 * SCALE, -(0.13 + 0.03 * SCALE), DESK_Y + 0.0062)
    root.rotation_euler = (0, 0, 0.08)  # +y local = buttons, away from the viewer
    root.scale = (SCALE,) * 3

    def add(name, bm, m, parent=root, smooth=True):
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
        for p in me.polygons: p.use_smooth = smooth
        o = bpy.data.objects.new(name, me); coll.objects.link(o); o.parent = parent; return o

    body = add('vxe_body', shell(), black)
    body.modifiers.new('wn', 'WEIGHTED_NORMAL')
    # the split between the buttons and the seam behind them: thin dark strips on the shell
    for (sx, sy, cx, cy) in ((0.0009, L * 0.46, 0, L * 0.28), (W * 0.9, 0.0009, 0, L * 0.06)):
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
        # the cross seam only runs over the top, where the buttons end
        z0 = 0.0 if sx < 0.01 else 0.62 * H
        for v in bm.verts: v.co.x *= sx; v.co.y *= sy; v.co.z = z0 + (v.co.z + 0.5) * (2 * H - z0)
        o = add('vxe_seam', bm, seam, smooth=False); o.location = (cx, cy, 0)
        bool_ = o.modifiers.new('only_on_shell', 'BOOLEAN'); bool_.operation = 'INTERSECT'; bool_.object = body
        o.scale = (1, 1, 1.002)
    # scroll wheel in its slot
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.0095, radius2=0.0095, depth=0.007)
    wheel = add('vxe_wheel', bm, rubber); wheel.rotation_euler = (0, math.pi / 2, 0)
    # sunk in its slot: ~3 mm shows above the shell
    wheel.location = (0, L * 0.27, top_z(L * 0.27) + 0.003 - 0.0095)
    # two side buttons on the left
    for i, y in enumerate((L * 0.2, L * 0.03)):
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
        for v in bm.verts: v.co.x *= 0.004; v.co.y *= 0.015; v.co.z *= 0.005
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.0011, segments=3, affect='EDGES')
        b = add(f'vxe_side{i}', bm, black); b.location = (-W / 2 * curve(WIDTH, 2 * y / L) * 0.985, y, H * 0.55)
    return root
