"""
The room around the desk: a tall snake plant on the left, a pothos trailing from the shelf, a
cork board, the record player on a low cabinet full of LPs (guitar beside it), and the warm LED
strip behind the desk. Plants are grown in code: a few hundred faces each, no scans.
"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix, noise

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESK_Y = 0.76
WALL_Y = 0.8
SHELF_TOP, SHELF_FRONT = 1.7375, 0.57
rng = random.Random(11)

def mat(name, rgb, rough, metal=0.0, emit=None, image=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1); p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if emit: p.inputs['Emission Color'].default_value = (*emit[0], 1); p.inputs['Emission Strength'].default_value = emit[1]
    if image:
        t = m.node_tree.nodes.new('ShaderNodeTexImage')
        t.image = bpy.data.images.load(os.path.join(HERE, 'textures', image), check_existing=True)
        m.node_tree.links.new(t.outputs['Color'], p.inputs['Base Color'])
    return m

def srgb(c): return tuple((x / 255) ** 2.2 for x in c)

def obj(name, bm, m, M=None, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if isinstance(m, list):
        for x in m: me.materials.append(x)
    else: me.materials.append(m)
    for p in me.polygons: p.use_smooth = smooth
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    if M is not None: o.matrix_world = M
    return o

def box(size, bevel=0.0, segs=2):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel: bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=segs, affect='EDGES')
    return bm

def lathe(profile, segs=40):
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in profile]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, axis=(0, 0, 1), cent=(0, 0, 0), steps=segs, angle=2 * math.pi)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm

def strip(bm, path, widths, normal_hint=Vector((0, 0, 1))):
    """A ribbon along `path` (points), `widths` per point: leaves and blades."""
    prev = None
    for i, (p, w) in enumerate(zip(path, widths)):
        t = (path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]).normalized()
        side = t.cross(normal_hint)
        if side.length < 1e-4: side = t.cross(Vector((1, 0, 0)))
        side.normalize()
        a, b = bm.verts.new(p - side * w / 2), bm.verts.new(p + side * w / 2)
        if prev: bm.faces.new((prev[0], prev[1], b, a))
        prev = (a, b)

# --- snake plant ------------------------------------------------------------------------------

def snake_plant():
    loc = Vector((-1.42, 0.5, 0))
    pot = lathe([(0.0, 0.0), (0.11, 0.0), (0.125, 0.02), (0.15, 0.3), (0.162, 0.31), (0.162, 0.33), (0.148, 0.33),
                 (0.138, 0.3), (0.0, 0.3)])
    obj('plant__pot', pot, mat('terracotta', srgb((176, 92, 58)), 0.85), Matrix.Translation(loc))
    soil = bmesh.new(); bmesh.ops.create_circle(soil, cap_ends=True, segments=24, radius=0.14)
    obj('plant__soil', soil, mat('soil', srgb((40, 28, 20)), 1.0), Matrix.Translation(loc + Vector((0, 0, 0.29))))
    # blades: tall, sword-shaped, a little twist and lean, darker bands across them
    leaf = bpy.data.materials.new('sansevieria'); leaf.use_nodes = True; nt = leaf.node_tree
    p = nt.nodes['Principled BSDF']; p.inputs['Roughness'].default_value = 0.45
    wave = nt.nodes.new('ShaderNodeTexWave'); wave.wave_type = 'BANDS'; wave.bands_direction = 'Z'
    wave.inputs['Scale'].default_value = 18; wave.inputs['Distortion'].default_value = 6
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*srgb((28, 58, 30)), 1); ramp.color_ramp.elements[1].color = (*srgb((74, 112, 56)), 1)
    nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], p.inputs['Base Color'])
    bm = bmesh.new()
    for i in range(16):
        a = i / 16 * 2 * math.pi + rng.uniform(-0.2, 0.2)
        r0 = rng.uniform(0.0, 0.08); h = rng.uniform(0.55, 1.05); lean = rng.uniform(0.05, 0.22)
        base = Vector((math.cos(a) * r0, math.sin(a) * r0, 0.29))
        out = Vector((math.cos(a), math.sin(a), 0))
        path, widths = [], []
        for k in range(12):
            t = k / 11
            path.append(base + out * (lean * t * t * h) + Vector((0, 0, h * t)))
            widths.append(0.055 * math.sin(math.pi * (0.12 + 0.88 * t)) ** 0.6 * (1 - t ** 4))
        strip(bm, path, widths, normal_hint=out.cross(Vector((0, 0, 1))).normalized() if i % 2 else out)
    o = obj('plant__sansevieria', bm, leaf, Matrix.Translation(loc))
    o.modifiers.new('thick', 'SOLIDIFY').thickness = 0.004

# --- pothos trailing from the shelf ------------------------------------------------------------

def heart_leaf(bm, at, facing, size, droop):
    """A small heart-shaped leaf: a fan of triangles around its stem point."""
    up = Vector((0, 0, 1)); side = facing.cross(up).normalized()
    tip = at + facing * size * 1.3 - up * droop * size
    ring = []
    for k in range(9):
        a = math.pi * (k / 8)
        ring.append(at + side * math.cos(a) * size * 0.6 + facing * math.sin(a) * size * 0.75 - up * droop * size * math.sin(a) * 0.5)
    vs = [bm.verts.new(v) for v in [at] + ring + [tip]]
    for k in range(8): bm.faces.new((vs[0], vs[k + 1], vs[k + 2]))
    bm.faces.new((vs[5], vs[9], vs[10])); bm.faces.new((vs[1], vs[5], vs[10]))

def pothos():
    potloc = Vector((0.43, 0.68, SHELF_TOP))
    obj('decor__pothos_pot', lathe([(0, 0), (0.05, 0), (0.06, 0.09), (0.064, 0.095), (0.0, 0.095)]),
        mat('pot_white', srgb((228, 224, 214)), 0.35), Matrix.Translation(potloc))
    green = mat('pothos', srgb((52, 110, 46)), 0.4)
    vine = mat('pothos_vine', srgb((70, 100, 40)), 0.6)
    leaves, stems = bmesh.new(), bmesh.new()
    for s in range(6):
        # over the front edge of the shelf, then down the wall with a little sway
        x0 = potloc.x + rng.uniform(-0.05, 0.06); length = rng.uniform(0.35, 0.75)
        pts = [potloc + Vector((rng.uniform(-0.03, 0.03), rng.uniform(-0.02, 0.02), 0.09))]
        pts.append(Vector((x0, SHELF_FRONT - 0.01, SHELF_TOP + 0.03)))
        n = int(length / 0.03)
        for k in range(1, n + 1):
            t = k / n
            pts.append(Vector((x0 + math.sin(t * 5 + s) * 0.03 + t * rng.uniform(-0.04, 0.04),
                               SHELF_FRONT - 0.01 + t * 0.12, SHELF_TOP - length * t)))
        strip(stems, pts, [0.004] * len(pts), normal_hint=Vector((0, 1, 0)))
        for k, p in enumerate(pts[2::2]):
            side = 1 if k % 2 else -1
            facing = Vector((side * 0.8, -0.6, 0.0)).normalized()
            heart_leaf(leaves, p + Vector((side * 0.006, -0.004, 0)), facing, rng.uniform(0.026, 0.04), rng.uniform(0.6, 1.2))
    for k in range(10):  # a crown of leaves in the pot
        a = k / 10 * 2 * math.pi
        heart_leaf(leaves, potloc + Vector((math.cos(a) * 0.03, math.sin(a) * 0.03, 0.1)),
                   Vector((math.cos(a), math.sin(a), 0.4)).normalized(), 0.045, 0.5)
    obj('decor__pothos_leaves', leaves, green)
    obj('decor__pothos_vines', stems, vine)

# --- cork board ------------------------------------------------------------------------------

def cork_board():
    c = Vector((0.86, WALL_Y - 0.012, 1.3)); W, H = 0.46, 0.32
    obj('art__cork_frame', box((W + 0.03, 0.02, H + 0.03), 0.004), mat('cork_frame', srgb((120, 78, 46)), 0.6), Matrix.Translation(c))
    cork = bpy.data.materials.new('cork'); cork.use_nodes = True; nt = cork.node_tree; p = nt.nodes['Principled BSDF']
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900; nz.inputs['Detail'].default_value = 4
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*srgb((150, 98, 56)), 1); ramp.color_ramp.elements[1].color = (*srgb((206, 150, 96)), 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], p.inputs['Base Color'])
    p.inputs['Roughness'].default_value = 0.95
    obj('art__cork', box((W, 0.004, H)), cork, Matrix.Translation(c + Vector((0, -0.011, 0))))
    face = c.y - 0.0135
    pin = mat('pin', srgb((230, 60, 40)), 0.3)
    items = [('cork_tcc.png', -0.16, 0.08, 0.075, 0.08), ('cork_pr.png', -0.06, 0.09, 0.075, -0.06), ('cork_cafe.png', -0.15, -0.06, 0.075, -0.1),
             ('cork_dormir.png', -0.05, -0.07, 0.075, 0.05), ('cork_contrib.png', 0.12, 0.02, 0.17, -0.03)]
    for img, x, z, size, rot in items:
        w, h = (size, size) if 'contrib' not in img else (size, size * 0.62)
        bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
        vs = [bm.verts.new((sx * w / 2, 0, sz * h / 2)) for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        f = bm.faces.new(vs)
        for l, uvc in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): l[uv].uv = uvc
        M = Matrix.Translation((c.x + x, face - 0.0006, c.z + z)) @ Matrix.Rotation(rot, 4, 'Y')
        obj(f'art__{img[:-4]}', bm, mat(img[:-4], (1, 1, 1), 0.8, image=img), M, smooth=False)
        s = bmesh.new(); bmesh.ops.create_uvsphere(s, u_segments=8, v_segments=6, radius=0.0045)
        obj(f'art__pin_{img[:-4]}', s, pin, Matrix.Translation((c.x + x, face - 0.004, c.z + z + h / 2 - 0.01)))

# --- record player on a low cabinet, LPs inside, guitar beside it ------------------------------

def record_corner():
    x0, x1, depth, height = 1.2, 1.78, 0.42, 0.62
    cx, cy = (x0 + x1) / 2, WALL_Y - depth / 2 - 0.01
    wood = bpy.data.materials.get('walnut') or mat('cab_wood', srgb((90, 56, 34)), 0.6)
    black = mat('cab_black', srgb((22, 20, 24)), 0.5, 0.3)
    t = 0.022
    for name, size, loc in [('top', (x1 - x0, depth, t), (cx, cy, height - t / 2)), ('mid', (x1 - x0 - 2 * t, depth - 0.01, t), (cx, cy + 0.005, height * 0.52)),
                            ('bottom', (x1 - x0, depth, t), (cx, cy, 0.08)), ('left', (t, depth, height - 0.06), (x0 + t / 2, cy, 0.06 + (height - 0.06) / 2)),
                            ('right', (t, depth, height - 0.06), (x1 - t / 2, cy, 0.06 + (height - 0.06) / 2)), ('back', (x1 - x0, 0.01, height - 0.06), (cx, WALL_Y - 0.015, 0.06 + (height - 0.06) / 2))]:
        obj(f'records__cab_{name}', box(size, 0.003), wood, Matrix.Translation(loc))
    for sx in (x0 + 0.04, x1 - 0.04):
        for sy in (cy - depth / 2 + 0.04, cy + depth / 2 - 0.04):
            obj('records__cab_leg', box((0.025, 0.025, 0.07)), black, Matrix.Translation((sx, sy, 0.035)))
    # LPs filling both compartments, spines out
    sleeve = [srgb(c) for c in [(30, 30, 34), (200, 70, 50), (240, 236, 222), (40, 90, 140), (120, 40, 60), (214, 140, 60),
                                 (60, 110, 70), (226, 196, 70), (90, 60, 120), (20, 20, 20), (170, 40, 40), (210, 200, 180)]]
    mats = [mat(f'lp_spine_{i}', c, 0.7) for i, c in enumerate(sleeve)]
    for z0, zt in ((0.08 + t / 2, height * 0.52 - t / 2), (height * 0.52 + t / 2, height - t)):
        x = x0 + t + 0.01; h = min(0.315, zt - z0 - 0.01)
        while x < x1 - t - 0.015:
            w = rng.uniform(0.004, 0.007); tilt = rng.uniform(-0.03, 0.03)
            o = obj('records__cab_lp', box((w, min(0.315, depth - 0.03), h)), mats[rng.randrange(len(mats))],
                    Matrix.Translation((x + w / 2, cy + 0.005, z0 + h / 2)) @ Matrix.Rotation(tilt, 4, 'Y'), smooth=False)
            x += w + 0.0008
    # the turntable
    tt = Vector((cx - 0.02, cy, height))
    obj('records__tt_plinth', box((0.45, 0.35, 0.07), 0.006), mat('tt_plinth', srgb((30, 28, 30)), 0.35, 0.2), Matrix.Translation(tt + Vector((0, 0, 0.035))))
    platter = bmesh.new(); bmesh.ops.create_cone(platter, cap_ends=True, segments=64, radius1=0.15, radius2=0.15, depth=0.014)
    obj('records__tt_platter', platter, mat('tt_metal', srgb((160, 160, 166)), 0.3, 1.0), Matrix.Translation(tt + Vector((-0.06, 0, 0.077))))
    rec = bmesh.new(); bmesh.ops.create_cone(rec, cap_ends=True, segments=64, radius1=0.15, radius2=0.15, depth=0.002)
    obj('records__tt_record', rec, mat('tt_vinyl', (0.01, 0.01, 0.012), 0.2), Matrix.Translation(tt + Vector((-0.06, 0, 0.085))))
    lab = bmesh.new(); bmesh.ops.create_cone(lab, cap_ends=True, segments=32, radius1=0.045, radius2=0.045, depth=0.0024)
    obj('records__tt_label', lab, mat('tt_label', srgb((232, 120, 50)), 0.6), Matrix.Translation(tt + Vector((-0.06, 0, 0.0855))))
    arm = mat('tt_arm', srgb((200, 200, 205)), 0.25, 1.0)
    pivot = tt + Vector((0.15, 0.11, 0.09))
    obj('records__tt_pivot', lathe([(0, 0), (0.018, 0), (0.018, 0.025), (0, 0.025)], 20), arm, Matrix.Translation(pivot - Vector((0, 0, 0.02))))
    a, b = pivot + Vector((0, 0, 0.012)), tt + Vector((-0.02, -0.06, 0.095))
    L = (b - a).length
    o = obj('records__tt_arm', box((L, 0.006, 0.006)), arm)
    o.matrix_world = Matrix.Translation((a + b) / 2) @ (b - a).to_track_quat('X', 'Z').to_matrix().to_4x4()
    obj('records__tt_head', box((0.03, 0.016, 0.01), 0.002), black, Matrix.Translation(b + Vector((0, 0, -0.004))))

def move_guitar():
    """Beside the cabinet, at the far end, leaning near the wall."""
    g = [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('guitar__')]
    pts = [o.matrix_world @ Vector(c) for o in g for c in o.bound_box]
    mid = Vector((sum(p.x for p in pts) / len(pts), sum(p.y for p in pts) / len(pts), 0))
    M = Matrix.Translation((1.98, 0.52, 0)) @ Matrix.Rotation(0.5, 4, 'Z') @ Matrix.Translation(-mid)
    for o in g: o.matrix_world = M @ o.matrix_world

# --- the warm LED strip behind the desk --------------------------------------------------------

def led_strip(light):
    """An amber strip on the back of the desk washing the wall up behind the monitor, and a
    second one under the desk for a glow on the floor; the room further out stays purple."""
    amber = mat('led_amber', srgb((255, 150, 80)), 0.4, emit=(srgb((255, 140, 70)), 6))
    obj('desk__led_back', box((1.9, 0.01, 0.008)), amber, Matrix.Translation((0, 0.67, DESK_Y - 0.03)))
    up = light('led_wall', 'AREA', Vector((0, 0.72, DESK_Y - 0.02)), '#ff9a55', 22, size=1.9, shape='RECTANGLE', size_y=0.04)
    up.rotation_euler = Vector((0, 0.35, 1)).normalized().to_track_quat('-Z', 'Y').to_euler()
    down = light('led_floor', 'AREA', Vector((0, 0.3, DESK_Y - 0.06)), '#ff8a45', 8, size=1.8, shape='RECTANGLE', size_y=0.04)
    down.rotation_euler = Vector((0, 0, -1)).to_track_quat('-Z', 'Y').to_euler()

def build(light):
    snake_plant(); pothos(); cork_board(); record_corner(); move_guitar(); led_strip(light)
