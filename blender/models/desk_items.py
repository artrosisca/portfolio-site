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
    o.matrix_world = Matrix.Translation(loc) @ (rot.to_4x4() if rot else Matrix.Identity(4))
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

    black = mat('arm_black', (0.012, 0.012, 0.014), 0.42, 0.35)
    steel = mat('arm_steel', (0.5, 0.5, 0.52), 0.3, 1.0)
    part = 'monitor__arm'
    # pole behind the monitor's left half; both links stay mostly hidden behind the screen,
    # like a real arm: from the front you see the pole, from the side the arm folding up
    bx, by = mid.x - 0.14, DESK_BACK - 0.06
    top = DESK_Y + 0.13
    # clamp: plate on the desk, jaw behind the edge, screw under it
    place(obj(part + '_plate', rbox((0.07, 0.07, 0.012), 0.004), black), (bx, by, DESK_Y + 0.006))
    place(obj(part + '_jaw', rbox((0.045, 0.012, 0.075), 0.003), black), (bx, DESK_BACK + 0.007, DESK_Y - 0.03))
    place(obj(part + '_jaw2', rbox((0.045, 0.06, 0.01), 0.003), black), (bx, DESK_BACK - 0.02, DESK_Y - 0.072))
    place(obj(part + '_pole', cyl(0.015, top - DESK_Y), black), (bx, by, (top + DESK_Y) / 2))
    place(obj(part + '_j0', cyl(0.02, 0.04), black), (bx, by, top))
    # lower link rises steeply to the elbow, the gas spring comes back down to the head
    elbow = Vector((bx - 0.06, by - 0.05, DESK_Y + 0.36))
    beam(part + '_low', (bx, by, top), elbow, 0.026, 0.032, black)
    place(obj(part + '_j1', cyl(0.019, 0.045), black), elbow)
    head = Vector((mid.x, back + 0.07, mid.z - 0.03))
    beam(part + '_spring', elbow, head, 0.03, 0.044, black, taper=0.85)
    beam(part + '_spring_hl', elbow + Vector((0, -0.016, 0.02)), head + Vector((0, -0.016, 0.017)), 0.004, 0.003, steel)
    place(obj(part + '_j2', cyl(0.017, 0.045), black), head)
    # swivel + tilt + VESA
    tilt = Vector((mid.x, back + 0.03, mid.z))
    beam(part + '_neck', head + Vector((0, 0, 0.02)), tilt, 0.026, 0.026, black)
    place(obj(part + '_tilt', cyl(0.016, 0.07), black), tilt, Matrix.Rotation(math.pi / 2, 3, 'Y'))
    place(obj(part + '_vesa', rbox((0.1, 0.008, 0.1), 0.004), black), (mid.x, back + 0.005, mid.z))

# --- notebook -----------------------------------------------------------------------------

def notebook():
    """An open A5 notebook left of the mat, turned towards the chair, and a pen on it."""
    loc, rot = Vector((-0.70, 0.16, DESK_Y)), 0.32
    T = Matrix.Translation(loc) @ Matrix.Rotation(rot, 4, 'Z')
    W, D = 0.36, 0.25
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
    o.matrix_world = T @ Matrix.Translation((0.1, -0.02, 0.011)) @ Matrix.Rotation(0.5, 4, 'Z') @ Matrix.Rotation(math.pi / 2, 4, 'Y')
    o = obj('decor__pen_clip', rbox((0.03, 0.002, 0.0015), 0.0005, 1), mat('pen_clip', (0.7, 0.7, 0.72), 0.25, 1))
    o.matrix_world = T @ Matrix.Translation((0.1, -0.02, 0.011)) @ Matrix.Rotation(0.5, 4, 'Z') @ Matrix.Translation((-0.045, 0, 0.0055))

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
    """Swaps the mug for a cappuccino cup on its saucer."""
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name.startswith('decor__') and (centre(o).xy - CUP).length < 0.08 and centre(o).z < DESK_Y + 0.12:
            bpy.data.objects.remove(o)
    china = mat('china', (0.82, 0.8, 0.76), 0.12)
    base = Vector((CUP.x, CUP.y, DESK_Y))
    saucer = [(0.0, 0.0), (0.045, 0.0), (0.05, 0.004), (0.068, 0.009), (0.072, 0.0135), (0.069, 0.0145),
              (0.052, 0.0095), (0.03, 0.007), (0.0, 0.007)]
    lathe('decor__saucer', saucer, china).location = base
    z0 = 0.007
    body = [(0.0, z0), (0.024, z0), (0.026, z0 + 0.006), (0.034, z0 + 0.025), (0.0415, z0 + 0.05), (0.0435, z0 + 0.058),
            (0.0415, z0 + 0.0585), (0.039, z0 + 0.05), (0.031, z0 + 0.026), (0.0, z0 + 0.01)]
    lathe('decor__cup', body, china).location = base
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
    h = obj('decor__cup_handle', bm, china)
    h.matrix_world = Matrix.Translation(base) @ Matrix.Rotation(-0.7, 4, 'Z') @ Matrix.Translation((0.047, 0, z0 + 0.032))
    return base + Vector((0, 0, z0 + 0.06))
