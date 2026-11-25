"""
The room around the desk: a tall snake plant on the left, a pothos trailing from the shelf, a
cork board, the record player on a low cabinet full of LPs (guitar beside it), and the warm LED
strip behind the desk. Poly Haven has no snake plant or pothos, so both are grown here: leaf
shapes on small grids, coloured by procedural materials that the bake flattens into its texture.
"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESK_Y = 0.76
WALL_Y = 0.8
SHELF_TOP, SHELF_FRONT = 1.7375, 0.57
rng = random.Random(11)  # the LP spines; each plant has its own

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

# --- leaves -----------------------------------------------------------------------------------

def sheet(bm, rows, cols, at, tint):
    """A leaf as a grid: at(a, b) -> (point, (u, v)) for a along the midrib (0..1) and b across
    (-1..1). Every leaf gets a tint (its own shade of green), read by the material."""
    uv = bm.loops.layers.uv.get('UVMap') or bm.loops.layers.uv.new('UVMap')
    col = bm.loops.layers.float_color.get('tint') or bm.loops.layers.float_color.new('tint')
    grid = [[None] * (cols + 1) for _ in range(rows + 1)]
    for i in range(rows + 1):
        for j in range(cols + 1):
            co, st = at(i / rows, j / cols * 2 - 1)
            grid[i][j] = (bm.verts.new(co), st)
    for i in range(rows):
        for j in range(cols):
            q = (grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j])
            if len({id(x[0]) for x in q}) < 4: continue
            f = bm.faces.new([x[0] for x in q])
            for l, x in zip(f.loops, q): l[uv].uv = x[1]; l[col] = (*tint, 1)

def tube(bm, pts, r):
    """A thin 4-sided stem through pts."""
    rings = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        a = t.cross(Vector((0.3, 0.2, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))).normalized(); b = t.cross(a)
        rings.append([bm.verts.new(p + (a * math.cos(k * math.pi / 2) + b * math.sin(k * math.pi / 2)) * r) for k in range(4)])
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(4): bm.faces.new((r0[k], r0[(k + 1) % 4], r1[(k + 1) % 4], r1[k]))

def leaf_material(name, nodes):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    uv = nt.nodes.new('ShaderNodeUVMap'); uv.uv_map = 'UVMap'
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(uv.outputs['UV'], sep.inputs[0])
    tint = nt.nodes.new('ShaderNodeAttribute'); tint.attribute_name = 'tint'
    nodes(nt, p, uv, sep, tint)
    return m

def ramp(nt, stops):
    r = nt.nodes.new('ShaderNodeValToRGB'); e = r.color_ramp.elements
    for k, (pos, c) in enumerate(stops):
        el = e[k] if k < 2 else e.new(pos); el.position = pos; el.color = (*srgb(c), 1)
    return r

def math_node(nt, op, a, b=None):
    n = nt.nodes.new('ShaderNodeMath'); n.operation = op
    for k, x in enumerate((a, b)):
        if x is None: continue
        if isinstance(x, (int, float)): n.inputs[k].default_value = x
        else: nt.links.new(x, n.inputs[k])
    return n.outputs[0]

def mix(nt, fac, a, b):
    n = nt.nodes.new('ShaderNodeMix'); n.data_type = 'RGBA'
    for sock, x in ((n.inputs[0], fac), (n.inputs[6], a), (n.inputs[7], b)):
        if isinstance(x, tuple): sock.default_value = (*srgb(x), 1)
        else: nt.links.new(x, sock)
    return n.outputs[2]

# --- snake plant ------------------------------------------------------------------------------

def sansevieria_nodes(nt, p, uv, sep, tint):
    """Laurentii: zigzag bands of dark and grey-green across the blade (v is metres along it),
    a yellow margin down both edges."""
    co = nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(math_node(nt, 'MULTIPLY', sep.outputs['X'], 2.0), co.inputs['X']); nt.links.new(sep.outputs['Y'], co.inputs['Y'])
    nt.links.new(tint.outputs['Fac'], co.inputs['Z'])
    w = nt.nodes.new('ShaderNodeTexWave'); w.wave_type = 'BANDS'; w.bands_direction = 'Y'
    w.inputs['Scale'].default_value = 9; w.inputs['Distortion'].default_value = 9
    w.inputs['Detail'].default_value = 3; w.inputs['Detail Scale'].default_value = 2.5
    nt.links.new(co.outputs[0], w.inputs['Vector'])
    bands = ramp(nt, [(0.25, (26, 50, 30)), (0.55, (62, 92, 58)), (0.8, (104, 128, 86))])
    nt.links.new(w.outputs['Fac'], bands.inputs['Fac'])
    # margin: |u - 0.5| near 0.5, wobbling a little
    edge = math_node(nt, 'ABSOLUTE', math_node(nt, 'SUBTRACT', sep.outputs['X'], 0.5))
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 14; nt.links.new(co.outputs[0], nz.inputs['Vector'])
    edge = math_node(nt, 'ADD', edge, math_node(nt, 'MULTIPLY', nz.outputs['Fac'], 0.03))
    m = nt.nodes.new('ShaderNodeMapRange'); m.inputs['From Min'].default_value = 0.455; m.inputs['From Max'].default_value = 0.47
    nt.links.new(edge, m.inputs['Value'])
    c = mix(nt, m.outputs[0], bands.outputs['Color'], (196, 178, 74))
    nt.links.new(mix(nt, math_node(nt, 'MULTIPLY', tint.outputs['Fac'], 0.25), c, (40, 60, 34)), p.inputs['Base Color'])
    p.inputs['Roughness'].default_value = 0.42

def snake_plant():
    rng = random.Random(7)
    loc = Vector((-1.42, 0.5, 0))
    pot = lathe([(0.0, 0.0), (0.11, 0.0), (0.125, 0.02), (0.15, 0.3), (0.162, 0.31), (0.162, 0.33), (0.148, 0.33),
                 (0.138, 0.3), (0.0, 0.3)])
    obj('plant__pot', pot, mat('terracotta', srgb((176, 92, 58)), 0.85), Matrix.Translation(loc))
    soil = bmesh.new(); bmesh.ops.create_circle(soil, cap_ends=True, segments=24, radius=0.14)
    obj('plant__soil', soil, mat('soil', srgb((40, 28, 20)), 1.0), Matrix.Translation(loc + Vector((0, 0, 0.29))))
    bm = bmesh.new()
    # clumps from the rhizome: each a few nested blades facing the same way, tall in the middle,
    # the outer ones leaning out so the whole plant opens like a fan
    clumps = [(-0.05, 0.0, 0.0), (0.05, 0.02, 1.0), (0.0, -0.06, 2.1), (-0.06, 0.05, 3.3), (0.06, -0.04, 4.4), (0.0, 0.06, 5.4),
              (0.0, 0.0, 0.5), (-0.03, -0.03, 3.9)]
    for cx, cy, face in clumps:
        n = rng.choice((3, 4, 4))
        for k in range(n):
            out = Vector((math.cos(face + rng.uniform(-0.5, 0.5)), math.sin(face + rng.uniform(-0.5, 0.5)), 0)).normalized()
            # the blade's flat face turns away from the lean, so the fan isn't all edges
            facing = Matrix.Rotation(rng.uniform(-0.8, 0.8), 3, 'Z') @ out
            inner = k / max(n - 1, 1)                       # 0 = outermost of the clump
            h = rng.uniform(0.75, 1.05) * (0.7 + 0.3 * inner) * (1.0 if abs(cx) + abs(cy) < 0.07 else 0.92)
            lean = rng.uniform(0.15, 0.35) * (1.4 - inner)   # radians from vertical at the base
            bend = rng.uniform(0.2, 0.45) * (1.3 - inner)   # more lean towards the tip
            W = rng.uniform(0.09, 0.12)
            twist = rng.uniform(-0.35, 0.35)
            base = loc + Vector((cx, cy, 0.29)) + out * 0.012 * k
            # midrib path
            pts, p, ang = [], base.copy(), lean
            N = 18
            for i in range(N + 1):
                pts.append(p.copy())
                t = i / N
                ang = lean + bend * t * t
                p = p + (Vector((0, 0, math.cos(ang))) + out * math.sin(ang)) * (h / N)
            def at(a, b, pts=pts, out=facing, W=W, twist=twist, h=h):
                f = a * N; i = min(int(f), N - 1); fr = f - i
                c = pts[i].lerp(pts[i + 1], fr)
                tang = (pts[i + 1] - pts[i]).normalized()
                side = tang.cross(out).normalized()
                nrm = side.cross(tang)
                rot = Matrix.Rotation(twist * a, 3, tang)
                side, nrm = rot @ side, rot @ nrm
                # lanceolate: narrow sheathing base, widest past the middle, a sharp tip
                if a < 0.55: w = 0.5 + 0.5 * math.sin(a / 0.55 * math.pi / 2)
                else: w = max(0.0, 1 - ((a - 0.55) / 0.45) ** 1.7)
                w *= W / 2 * (1 + 0.04 * math.sin(a * 23 + b))
                return c + side * b * w + nrm * (1 - b * b) * w * 0.35, ((b + 1) / 2, a * h)
            sheet(bm, 22, 4, at, (rng.random(), 0, 0))
    o = obj('plant__sansevieria', bm, leaf_material('sansevieria', sansevieria_nodes), Matrix.Translation(Vector()))
    o.modifiers.new('thick', 'SOLIDIFY').thickness = 0.0035

# --- pothos trailing from the shelf ------------------------------------------------------------

def pothos_nodes(nt, p, uv, sep, tint):
    """Golden pothos: deep glossy green, cream-yellow streaks fanning out from the midrib."""
    base = mix(nt, tint.outputs['Fac'], (34, 82, 30), (66, 120, 44))
    # streaks: noise stretched along the side veins (across from the midrib, angled to the tip)
    co = nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(math_node(nt, 'MULTIPLY', sep.outputs['X'], 3.0), co.inputs['X'])
    nt.links.new(math_node(nt, 'ADD', math_node(nt, 'MULTIPLY', sep.outputs['Y'], 12.0),
                           math_node(nt, 'MULTIPLY', tint.outputs['Fac'], 40.0)), co.inputs['Y'])
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.6; nz.inputs['Detail'].default_value = 3
    nt.links.new(co.outputs[0], nz.inputs['Vector'])
    m = nt.nodes.new('ShaderNodeMapRange'); m.inputs['From Min'].default_value = 0.58; m.inputs['From Max'].default_value = 0.66
    nt.links.new(nz.outputs['Fac'], m.inputs['Value'])
    c = mix(nt, math_node(nt, 'MULTIPLY', m.outputs[0], 0.75), base, (190, 186, 92))
    # a lighter midrib
    mid = nt.nodes.new('ShaderNodeMapRange'); mid.inputs['From Min'].default_value = 0.025; mid.inputs['From Max'].default_value = 0.0
    nt.links.new(math_node(nt, 'ABSOLUTE', math_node(nt, 'SUBTRACT', sep.outputs['X'], 0.5)), mid.inputs['Value'])
    nt.links.new(mix(nt, math_node(nt, 'MULTIPLY', mid.outputs[0], 0.6), c, (120, 150, 70)), p.inputs['Base Color'])
    p.inputs['Roughness'].default_value = 0.32

def heart_leaf(bm, at, axis, normal, size, curl, rng):
    """A heart-shaped leaf with its petiole end at `at`: midrib along `axis`, blade facing
    `normal`, the two halves raised a little from the midrib and the tip curling down."""
    axis = axis.normalized(); side = normal.cross(axis).normalized(); normal = axis.cross(side)
    fold, droop = rng.uniform(0.12, 0.25), curl
    def pt(a, b):
        x0 = -0.26 * abs(b) ** 0.8                              # the lobes reach back past the petiole
        x = x0 + (1 - x0) * a
        # widest near the base, tapering to a pointed tip, lobes rounded off
        hw = 0.44 * math.sqrt(max(0.0, 1 - ((x - 0.18) / 0.82) ** 2)) * (1 - max(0.0, x - 0.5) / 0.5 * 0.3)
        if x < 0: hw *= math.sqrt(max(0.0, 1 - (x / 0.3) ** 2)) * 0.35 + 0.65
        y = b * hw
        z = fold * abs(y) - droop * max(0.0, x) ** 2
        return at + (axis * x + side * y + normal * z) * size, ((b + 1) / 2, a)
    sheet(bm, 7, 6, pt, (rng.random(), 0, 0))

def pothos():
    rng = random.Random(5)
    potloc = Vector((0.43, 0.68, SHELF_TOP))
    obj('decor__pothos_pot', lathe([(0, 0), (0.05, 0), (0.06, 0.09), (0.064, 0.095), (0.0, 0.095)]),
        mat('pot_white', srgb((228, 224, 214)), 0.35), Matrix.Translation(potloc))
    green = leaf_material('pothos', pothos_nodes)
    vine = mat('pothos_vine', srgb((84, 112, 48)), 0.6)
    leaves, stems = bmesh.new(), bmesh.new()
    top = potloc + Vector((0, 0, 0.09))
    def leaf_on(p, out_dir, size, hanging):
        """A petiole from the vine, then the leaf: hanging ones point down and face the room."""
        if hanging:
            axis = Vector((out_dir.x * rng.uniform(0.2, 0.9), -rng.uniform(0.2, 0.6), -1))
            normal = Vector((out_dir.x * rng.uniform(0.1, 0.7), -1, rng.uniform(0.2, 0.8)))
        else:
            axis = out_dir + Vector((0, 0, rng.uniform(0.1, 0.5)))
            normal = Vector((0, 0, 1)) + out_dir * 0.2 + Vector((0, -0.3, 0))
        axis.normalize()
        stem_end = p + (axis * 0.5 + out_dir * 0.5).normalized() * size * 0.45
        tube(stems, [p, (p + stem_end) / 2 + Vector((0, 0, 0.004)), stem_end], 0.0018)
        heart_leaf(leaves, stem_end, axis, normal, size, rng.uniform(0.15, 0.4), rng)
    # vines: over the shelf's front edge and down the wall, bunched into a full curtain
    for s in range(13):
        x0 = potloc.x + rng.uniform(-0.12, 0.1)
        length = rng.uniform(0.3, 0.85) if s > 3 else rng.uniform(0.1, 0.25)
        pts = [top + Vector((rng.uniform(-0.03, 0.03), rng.uniform(-0.03, 0.02), 0))]
        pts.append(Vector((x0 * 0.6 + potloc.x * 0.4, SHELF_FRONT + 0.03, SHELF_TOP + 0.05)))
        pts.append(Vector((x0, SHELF_FRONT - 0.015, SHELF_TOP - 0.01)))
        n = max(3, int(length / 0.03)); ph = rng.uniform(0, 6); drift = rng.uniform(-0.12, 0.12); amp = rng.uniform(0.01, 0.04)
        for k in range(1, n + 1):
            t = k / n
            pts.append(Vector((x0 + math.sin(t * 4 + ph) * amp + t * t * drift,
                               SHELF_FRONT - 0.015 + t * 0.08 * (1 + 0.5 * math.sin(ph)), SHELF_TOP - 0.01 - length * t)))
        tube(stems, pts, 0.0025)
        # a leaf at each node, alternating sides, smaller towards the tip
        for k in range(1, len(pts) - 1):
            if rng.random() < 0.15: continue
            t = k / (len(pts) - 1)
            side = Vector((1 if k % 2 else -1, 0, 0))
            size = rng.uniform(0.05, 0.08) * (1 - 0.45 * t)
            leaf_on(pts[k], side, size, hanging=k > 1)
        heart_leaf(leaves, pts[-1], Vector((0, -0.3, -1)), Vector((0, -1, 0.3)), 0.025, 0.2, rng)
    # a full crown in the pot: leaves arching up and out over the rim
    for k in range(34):
        a = k / 26 * 2 * math.pi + rng.uniform(-0.15, 0.15)
        out = Vector((math.cos(a), math.sin(a), 0))
        r = rng.uniform(0.0, 0.045)
        p = top + out * r + Vector((0, 0, rng.uniform(0.0, 0.05)))
        tip = p + out * rng.uniform(0.02, 0.06) + Vector((0, 0, rng.uniform(0.03, 0.11)))
        tube(stems, [p - Vector((0, 0, 0.02)), (p + tip) / 2 + Vector((0, 0, 0.01)), tip], 0.002)
        heart_leaf(leaves, tip, out + Vector((0, 0, rng.uniform(-0.1, 0.5))), Vector((0, 0, 1)) + out * 0.3,
                   rng.uniform(0.06, 0.085), rng.uniform(0.2, 0.5), rng)
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
