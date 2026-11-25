"""
Things on the desk modelled here: a gas-spring monitor arm, an open notebook with quicksort
notes (texture from blender/notebook.py) and a coffee cup on its saucer.
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESK_Y = 0.76
DESK_BACK = 0.675
CUP = Vector((0.72, -0.12))  # where the site's mug stands (blender xy)

def mat(name, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1); p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    return m

def obj(name, bm, m, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(m)
    for p in me.polygons: p.use_smooth = smooth
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    return o

def centre(o):
    return o.matrix_world @ (sum((Vector(c) for c in o.bound_box), Vector()) / 8)

def rbox(size, bevel=0.004, segs=3):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(bevel, min(size) * 0.45), segments=segs, affect='EDGES')
    return bm

def cyl(r, depth, segs=32):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r, depth=depth)
    return bm

def beam(name, a, b, w, h, m, taper=1.0):
    """A rounded bar from a to b, its height kept vertical-ish (like an arm segment)."""
    a, b = Vector(a), Vector(b); L = (b - a).length
    bm = rbox((L, w, h), bevel=min(w, h) * 0.35)
    for v in bm.verts:  # narrower towards b
        k = 1 + (taper - 1) * (v.co.x / L + 0.5)
        v.co.y *= k; v.co.z *= k
    o = obj(name, bm, m)
    o.matrix_world = Matrix.Translation((a + b) / 2) @ (b - a).to_track_quat('X', 'Z').to_matrix().to_4x4()
    return o

def place(o, loc, rot=None):
    o.matrix_world = Matrix.Translation(Vector(loc)) @ (rot.to_4x4() if rot else Matrix.Identity(4))
    return o

# --- monitor arm --------------------------------------------------------------------------

def monitor_arm():
    """Single gas-spring arm in matte black: desk clamp, short pole, lower link, the thick
    spring arm rising to a swivel and tilt head with the VESA plate on the monitor's back."""
    for o in list(bpy.data.objects):  # the site's arm: the metallic parts of the monitor group
        if o.type == 'MESH' and o.name.startswith('monitor__') and o.data.materials:
            p = o.data.materials[0].node_tree.nodes.get('Principled BSDF') if o.data.materials[0].node_tree else None
            if p and p.inputs['Metallic'].default_value > 0.5: bpy.data.objects.remove(o)
    bezel = max((o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('monitor__')),
                key=lambda o: o.dimensions.x)
    pts = [bezel.matrix_world @ Vector(c) for c in bezel.bound_box]
    back = max(p.y for p in pts); mid = sum(pts, Vector()) / 8

    black = mat('arm_black', (0.018, 0.018, 0.02), 0.38, 0.5)        # powder-coated aluminium
    caps = mat('arm_caps', (0.008, 0.008, 0.009), 0.22)              # glossier plastic joint caps
    steel = mat('arm_steel', (0.6, 0.6, 0.62), 0.28, 1.0)
    rubber = mat('arm_cable', (0.01, 0.01, 0.011), 0.6)
    part = 'monitor__arm'
    # an Ergotron-style arm: clamp and pole behind the monitor's left half, a level link out to the
    # elbow, then the gas-spring link rising forward to the swivel and tilt head on the VESA plate
    bx, by = mid.x - 0.2, DESK_BACK - 0.05
    top = DESK_Y + 0.21
    place(obj(part + '_plate', rbox((0.08, 0.08, 0.01), 0.004), black), (bx, by, DESK_Y + 0.005))
    place(obj(part + '_jaw', rbox((0.05, 0.012, 0.08), 0.003), black), (bx, DESK_BACK + 0.008, DESK_Y - 0.032))
    place(obj(part + '_jaw2', rbox((0.05, 0.07, 0.012), 0.003), black), (bx, DESK_BACK - 0.024, DESK_Y - 0.072))
    place(obj(part + '_collar', cyl(0.024, 0.028), caps), (bx, by, DESK_Y + 0.024))
    place(obj(part + '_pole', cyl(0.016, top - DESK_Y - 0.03), black), (bx, by, (top + DESK_Y) / 2 + 0.01))
    place(obj(part + '_stop', cyl(0.019, 0.014), caps), (bx, by, top - 0.035))
    # level link: a joint housing over the pole, the bar, a housing at the elbow
    elbow = Vector((mid.x + 0.03, by - 0.03, top))
    place(obj(part + '_j0', rbox((0.046, 0.046, 0.046), 0.02, 4), caps), (bx, by, top))
    beam(part + '_low', (bx, by, top), elbow, 0.036, 0.03, black)
    place(obj(part + '_j1', rbox((0.046, 0.046, 0.05), 0.02, 4), caps), elbow + Vector((0, 0, 0.004)))
    # gas-spring link: pivots on a horizontal knuckle at the elbow, tapering towards the head
    head = Vector((mid.x, back + 0.06, mid.z - 0.04))
    k0 = elbow + Vector((0, 0, 0.034)); d = (head - k0).normalized()
    across = d.cross(Vector((0, 0, 1))).normalized()
    knuckle = Vector((0, 0, 1)).rotation_difference(across).to_matrix()
    place(obj(part + '_k0', cyl(0.02, 0.05), caps), k0, knuckle)
    beam(part + '_spring', k0, head, 0.04, 0.034, black, taper=0.82)
    # the channel cover on top of it, and the spring's tension screw at the elbow end
    beam(part + '_cover', k0 + Vector((0, 0, 0.017)) + d * 0.03, head + Vector((0, 0, 0.013)) - d * 0.03, 0.022, 0.004, caps, taper=0.82)
    place(obj(part + '_screw', cyl(0.005, 0.006, 16), steel), k0 - d * 0.024 + Vector((0, 0, 0.01)),
          Vector((0, 0, 1)).rotation_difference(-d).to_matrix())
    place(obj(part + '_k1', cyl(0.017, 0.044), caps), head, knuckle)
    # swivel down into the tilt block and the VESA plate on the monitor's back
    tilt = Vector((mid.x, back + 0.028, mid.z))
    place(obj(part + '_swivel', cyl(0.015, 0.05), black), (head + tilt) / 2 + Vector((0, 0, -0.005)),
          Vector((0, 0, 1)).rotation_difference(tilt - head).to_matrix())
    place(obj(part + '_tilt', rbox((0.07, 0.03, 0.04), 0.008, 3), caps), tilt)
    place(obj(part + '_vesa', rbox((0.105, 0.008, 0.105), 0.006), black), (mid.x, back + 0.005, mid.z))
    for sx in (-1, 1):
        for sz in (-1, 1):
            place(obj(part + '_bolt', cyl(0.0035, 0.004, 12), steel), (mid.x + sx * 0.04, back + 0.01, mid.z + sz * 0.04),
                  Matrix.Rotation(math.pi / 2, 3, 'X'))
    # the monitor's cable, clipped under both links and down the pole
    under = Vector((0, 0, -0.024))
    path = [Vector((mid.x + 0.02, back + 0.012, mid.z - 0.06)), head + under + d * 0.02, (k0 + head) / 2 + under * 1.1,
            k0 + under - d * 0.01, elbow + under * 0.8, (elbow + Vector((bx, by, top))) / 2 + under * 0.9,
            Vector((bx + 0.012, by + 0.02, top - 0.04)), Vector((bx + 0.014, by + 0.022, DESK_Y + 0.05)),
            Vector((bx + 0.02, DESK_BACK + 0.004, DESK_Y + 0.004)), Vector((bx + 0.025, DESK_BACK + 0.012, DESK_Y - 0.12))]
    cable(part + '_cable', path, 0.0035, rubber)

def cable(name, pts, r, m):
    """A cable through the points, smoothed into a curve."""
    pts = [Vector(p) for p in pts]
    fine = []
    for i in range(len(pts) - 1):  # Catmull-Rom between the control points
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, len(pts) - 1)]
        for k in range(8):
            t = k / 8
            fine.append(0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t ** 3))
    fine.append(pts[-1])
    bm = bmesh.new(); rings = []
    for i, p in enumerate(fine):
        tng = (fine[min(i + 1, len(fine) - 1)] - fine[max(i - 1, 0)]).normalized()
        a = tng.orthogonal().normalized(); b = tng.cross(a)
        rings.append([bm.verts.new(p + (a * math.cos(t) + b * math.sin(t)) * r) for t in [2 * math.pi * j / 8 for j in range(8)]])
    for ra, rb in zip(rings, rings[1:]):
        for j in range(8): bm.faces.new((ra[j], ra[(j + 1) % 8], rb[(j + 1) % 8], rb[j]))
    return obj(name, bm, m)

# --- notebook -----------------------------------------------------------------------------

def notebook():
    """An open A5 notebook left of the mat, turned towards the chair, and a pen on it."""
    loc, rot = Vector((-0.70, 0.16, DESK_Y)), 0.32
    T = Matrix.Translation(loc) @ Matrix.Rotation(rot, 4, 'Z')
    W, D = 0.296, 0.21  # A5 opened flat
    cover = mat('nb_cover', (0.02, 0.018, 0.024), 0.6)
    band = mat('nb_band', (0.9, 0.2, 0.08), 0.5)
    o = obj('decor__nb_cover', rbox((W + 0.014, D + 0.012, 0.004), 0.0015, 2), cover)
    o.matrix_world = T @ Matrix.Translation((0, 0, 0.002))
    o = obj('decor__nb_band', rbox((0.006, D + 0.014, 0.0045), 0.001, 1), band)
    o.matrix_world = T @ Matrix.Translation((W / 2 - 0.03, 0, 0.0022))

    # the pages: a sheet that dips into the gutter and swells either side of it
    paper = bpy.data.materials.new('nb_pages'); paper.use_nodes = True
    nt = paper.node_tree; p = nt.nodes['Principled BSDF']; p.inputs['Roughness'].default_value = 0.85
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = bpy.data.images.load(os.path.join(HERE, 'textures', 'notebook.png'), check_existing=True)
    dim = nt.nodes.new('ShaderNodeMix'); dim.data_type = 'RGBA'; dim.blend_type = 'MULTIPLY'
    dim.inputs['Factor'].default_value = 1; dim.inputs['B'].default_value = (0.78, 0.76, 0.72, 1)  # off-white, not lit-white
    nt.links.new(t.outputs['Color'], dim.inputs['A']); nt.links.new(dim.outputs['Result'], p.inputs['Base Color'])
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    nx, ny = 48, 4
    grid = [[bm.verts.new((W * (i / nx - 0.5), D * (j / ny - 0.5), 0)) for j in range(ny + 1)] for i in range(nx + 1)]
    for i in range(nx + 1):
        u = abs(2 * i / nx - 1)
        z = 0.0045 + 0.009 * (1 - (1 - u) ** 6) * (1 - 0.45 * u)
        for v in grid[i]: v.co.z = z
    for i in range(nx):
        for j in range(ny):
            f = bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
            for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                l[uv].uv = (a / nx, b / ny)
    o = obj('decor__nb_pages', bm, paper); o.matrix_world = T
    # page block edges under the sheet
    o = obj('decor__nb_block', rbox((W - 0.004, D - 0.004, 0.0045), 0.001, 1), mat('nb_edge', (0.75, 0.72, 0.64), 0.9))
    o.matrix_world = T @ Matrix.Translation((0, 0, 0.0045))

    # a pen lying across the right page
    pen = mat('pen', (0.03, 0.05, 0.14), 0.3, 0.2)
    o = obj('decor__pen', cyl(0.0048, 0.14, 16), pen)
    o.matrix_world = T @ Matrix.Translation((0.08, -0.015, 0.011)) @ Matrix.Rotation(0.5, 4, 'Z') @ Matrix.Rotation(math.pi / 2, 4, 'Y')
    o = obj('decor__pen_clip', rbox((0.03, 0.002, 0.0015), 0.0005, 1), mat('pen_clip', (0.7, 0.7, 0.72), 0.25, 1))
    o.matrix_world = T @ Matrix.Translation((0.08, -0.015, 0.011)) @ Matrix.Rotation(0.5, 4, 'Z') @ Matrix.Translation((-0.045, 0, 0.0055))

# --- coffee cup ----------------------------------------------------------------------------

def lathe(name, profile, m, segs=48):
    """Spins a closed (r, z) profile around z."""
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in profile]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, axis=(0, 0, 1), cent=(0, 0, 0), steps=segs, angle=2 * math.pi)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return obj(name, bm, m)

def cup():
    """Swaps the mug for a cappuccino cup on its saucer: white china, verde-água outside the
    cup (a white lip and foot), on the handle and round the saucer's rim."""
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name.startswith('decor__') and (centre(o).xy - CUP).length < 0.08 and centre(o).z < DESK_Y + 0.12:
            bpy.data.objects.remove(o)
    china = mat('china', (0.82, 0.8, 0.76), 0.12)
    base = Vector((CUP.x, CUP.y, DESK_Y))
    saucer = [(0.0, 0.0), (0.045, 0.0), (0.05, 0.004), (0.068, 0.009), (0.072, 0.0135), (0.069, 0.0145),
              (0.052, 0.0095), (0.03, 0.007), (0.0, 0.007)]
    agua = mat('china_agua', tuple((x / 255) ** 2.2 for x in (86, 192, 172)), 0.15)
    def paint(o, where):
        o.data.materials.append(agua)
        for f in o.data.polygons:
            if where(f.center, f.normal): f.material_index = 1
    o = lathe('decor__saucer', saucer, china); o.location = base
    paint(o, lambda c, n: c.xy.length > 0.063 and n.z > -0.5)
    z0 = 0.007
    body = [(0.0, z0), (0.024, z0), (0.026, z0 + 0.006), (0.034, z0 + 0.025), (0.0415, z0 + 0.05), (0.0435, z0 + 0.058),
            (0.0415, z0 + 0.0585), (0.039, z0 + 0.05), (0.031, z0 + 0.026), (0.0, z0 + 0.01)]
    o = lathe('decor__cup', body, china); o.location = base
    # outside faces point away from the axis; the inside ones towards it
    paint(o, lambda c, n: n.xy.dot(c.xy) > 0 and z0 + 0.008 < c.z < z0 + 0.05)
    coffee = mat('coffee', (0.26, 0.13, 0.055), 0.12)  # cappuccino: milk foam over espresso
    bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=40, radius=0.0385)
    c = obj('decor__coffee', bm, coffee); c.location = base + Vector((0, 0, z0 + 0.047))
    # handle: an upright loop touching the wall, turned a little towards the chair
    bm = bmesh.new()
    ring = bmesh.ops.create_circle(bm, segments=10, radius=0.0038)['verts']
    for v in ring: v.co = Vector((v.co.x * 0.75 + 0.012, 0, v.co.y * 1.25))
    bmesh.ops.spin(bm, geom=ring + bm.edges[:], axis=(0, 1, 0), cent=(0, 0, 0), steps=24, angle=2 * math.pi)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    for v in bm.verts: v.co.z *= 1.2
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    h = obj('decor__cup_handle', bm, agua)
    h.matrix_world = Matrix.Translation(base) @ Matrix.Rotation(-0.7, 4, 'Z') @ Matrix.Translation((0.047, 0, z0 + 0.032))
    return base + Vector((0, 0, z0 + 0.06))

# --- laptop, post-its, rug ------------------------------------------------------------------

def textured(name, w, h, image, M, rough=0.6, cut=False):
    """A flat picture facing -y. cut: a die-cut sticker, the mesh trimmed to the image's opaque
    shape (a transparent square would shade differently from the lid under it)."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; p = nt.nodes['Principled BSDF']
    p.inputs['Roughness'].default_value = rough
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(HERE, 'textures', image), check_existing=True)
    nt.links.new(t.outputs['Color'], p.inputs['Base Color'])
    n = 40 if cut else 1
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    grid = [[bm.verts.new(((i / n - 0.5) * w, 0, (j / n - 0.5) * h)) for j in range(n + 1)] for i in range(n + 1)]
    if cut:
        iw, ih = t.image.size; px = t.image.pixels[:]
        alpha = lambda u, v: px[(min(ih - 1, int(v * ih)) * iw + min(iw - 1, int(u * iw))) * 4 + 3]
    for i in range(n):
        for j in range(n):
            if cut and alpha((i + 0.5) / n, (j + 0.5) / n) < 0.5: continue
            f = bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
            for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))): l[uv].uv = (a / n, b / n)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    o = obj(name, bm, m, smooth=False); o.matrix_world = M
    return o

def laptop():
    """The closed laptop in its stand: aluminium, a charge LED, the README's stack as stickers."""
    lid = base = None
    for o in bpy.data.objects:
        if o.type != 'MESH' or not o.name.startswith('decor__'): continue
        c = centre(o)
        if 0.4 < c.x < 0.8 and 0.45 < c.y < 0.6 and DESK_Y < c.z < 1.0:
            if o.dimensions.z > 0.15: lid = o
            elif o.dimensions.z < 0.02: base = o
    alu = mat('aluminium', (0.36, 0.37, 0.4), 0.32, 0.8)
    for o in (lid, base):
        if o: o.data.materials.clear(); o.data.materials.append(alu)
    c = centre(lid); R = Matrix.Rotation(-0.12, 4, 'Z')
    front = Matrix.Translation(c) @ R @ Matrix.Translation((0, -0.0096, 0))
    spots = [('python', -0.09, 0.05, 0.065, 0.2), ('react', 0.0, 0.06, 0.06, -0.1), ('docker', 0.09, 0.045, 0.062, 0.15),
             ('laravel', -0.08, -0.045, 0.075, -0.12), ('postgres', 0.02, -0.05, 0.058, 0.08), ('fedora', 0.105, -0.055, 0.05, -0.2)]
    for k, x, z, size, rot in spots:
        textured(f'decor__sticker_{k}', size, size, f'sticker_{k}.png',
                 front @ Matrix.Translation((x, -0.0002 * (1 + len(k) % 3), z)) @ Matrix.Rotation(rot, 4, 'Y'), 0.35, cut=True)
    led = mat('led_green', (0.2, 1, 0.4), 0.3); p = led.node_tree.nodes['Principled BSDF']
    p.inputs['Emission Color'].default_value = (0.2, 1, 0.4, 1); p.inputs['Emission Strength'].default_value = 12
    bc = centre(base)
    o = obj('decor__laptop_led', rbox((0.006, 0.002, 0.002), 0.0005, 1), led)
    o.matrix_world = Matrix.Translation(bc) @ R @ Matrix.Translation((0.035, -0.026, 0.0))

def notes():
    """The post-its under the monitor: two big handwritten words each."""
    for o in list(bpy.data.objects):
        if o.type != 'MESH' or not o.name.startswith('decor__') or max(o.dimensions) > 0.07: continue
        c = centre(o)
        if abs(c.y - 0.3) < 0.02 and 0.9 < c.z < 1.0 and -0.32 < c.x < -0.14:
            img = 'postit_deploy.png' if c.x < -0.2 else 'postit_agua.png'
            n = o.data.materials[0].node_tree.nodes
            t = next(x for x in n if x.type == 'TEX_IMAGE')
            t.image = bpy.data.images.load(os.path.join(HERE, 'textures', img), check_existing=True)
            uv = o.data.uv_layers.active.data  # the site's quad maps them upside down
            if not o.get('uv_fixed'):
                for l in uv: l.uv.y = 1 - l.uv.y
                o['uv_fixed'] = 1
            o.name = 'notes__' + img[:-4]  # baked on their own texture, so the handwriting stays sharp

def rug():
    """Arthur's burgundy kilim in front of the desk, with fringes on the short ends."""
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name.startswith('room__') and 2 < max(o.dimensions) < 3.1 and o.dimensions.z < 0.02:
            bpy.data.objects.remove(o)
    W, D = 2.1, 1.36
    m = bpy.data.materials.new('kilim'); m.use_nodes = True; nt = m.node_tree; p = nt.nodes['Principled BSDF']
    p.inputs['Roughness'].default_value = 0.95
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(HERE, 'textures', 'rug_kilim.png'), check_existing=True)
    nt.links.new(t.outputs['Color'], p.inputs['Base Color'])
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    vs = [bm.verts.new((x * W / 2, y * D / 2, 0)) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    f = bm.faces.new(vs)
    for l, c in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): l[uv].uv = c
    loc = Vector((0.1, -0.78, 0.004))
    o = obj('rug__kilim', bm, m, smooth=False); o.location = loc
    fringe = mat('fringe', (0.78, 0.74, 0.66), 1.0)
    for sx in (-1, 1):
        bm = bmesh.new()
        for i in range(70):
            y = -D / 2 + D * (i + 0.5) / 70
            v = [bm.verts.new((0, y + dy, 0)) for dy in (-0.004, 0.004)] + [bm.verts.new((sx * 0.06, y + dy, 0)) for dy in (0.004, -0.004)]
            bm.faces.new(v if sx > 0 else v[::-1])
        f = obj(f'rug__fringe_{sx}', bm, fringe, smooth=False); f.location = loc + Vector((sx * W / 2, 0, 0.001))
