"""
Arthur's acoustic guitar, built here instead of the site's placeholder: a folk body with a printed
spruce top (art.py: binding, rosette, tortoise guard), mahogany sides and neck, a rosewood board
with real fret spacing, bone nut and saddle, an angled headstock with six tuners, and strings.
It leans on the wall beside the record cabinet. Measurements in blender/guitar_shape.py.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import guitar_shape as G  # noqa: E402
from desk_items import mat, obj, rbox, cyl  # noqa: E402

PART = 'guitar__'
WALL_Y = 0.8
LEAN = math.radians(12)   # top tipped back onto the wall
YAW = -0.32               # turned a little towards the camera, which looks from the left

def depth(z):
    """Body depth, a little shallower at the neck end."""
    return 0.1 - 0.016 * z / G.BODY_L

def srgb(c): return tuple((x / 255) ** 2.2 for x in c)

def body(M, top, sides, binding):
    bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    ring = [bm.verts.new((x, 0, z)) for x, z in G.outline(160)]
    f = bm.faces.new(ring)
    f.normal_update()
    if f.normal.y > 0: f.normal_flip()          # the top faces the room (-y)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    back = [v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)]
    for v in back: v.co.y = depth(v.co.z)
    bm.normal_update()
    # round over both rims: the binding wraps the front edge
    rims = [e for e in bm.edges if all(abs(v.co.y) < 1e-6 for v in e.verts) or all(v in back for v in e.verts)]
    rims = [e for e in rims if len(e.link_faces) == 2 and any(len(fc.verts) > 4 for fc in e.link_faces)]
    bmesh.ops.bevel(bm, geom=rims, offset=0.006, segments=3, affect='EDGES', profile=0.5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for fc in bm.faces:
        c = fc.calc_center_median()
        flat_front = len(fc.verts) > 8 and all(abs(v.co.y) < 1e-5 for v in fc.verts)
        fc.material_index = 0 if flat_front else (2 if c.y < 0.007 else 1)
        for l in fc.loops: l[uv].uv = ((l.vert.co.x + 0.2) / 0.4, l.vert.co.z / G.BODY_L)
    me = bpy.data.meshes.new(PART + 'body'); bm.to_mesh(me); bm.free()
    for m in (top, sides, binding): me.materials.append(m)
    for p in me.polygons: p.use_smooth = p.material_index != 0
    o = bpy.data.objects.new(PART + 'body', me); bpy.context.scene.collection.objects.link(o); o.matrix_world = M

def loft(sections, cap=True):
    """Joins rings of points (same count each) into a tube, closing both ends."""
    bm = bmesh.new()
    rings = [[bm.verts.new(p) for p in s] for s in sections]
    n = len(sections[0])
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    if cap:
        bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm

def neck_width(z):
    t = (z - G.JOIN_Z) / (G.NUT_Z - G.JOIN_Z)
    return 0.056 + (0.0435 - 0.056) * max(0.0, min(1.0, t))

def neck(M, wood, board, fret, pearl, bone):
    # the neck: flat under the board, a soft D behind, thickening into the heel at the body
    secs = []
    for i in range(25):
        z = G.JOIN_Z - 0.035 + (G.NUT_Z + 0.004 - (G.JOIN_Z - 0.035)) * i / 24
        w = neck_width(z) / 2; d = 0.021 + 0.004 * (z - G.JOIN_Z) / (G.NUT_Z - G.JOIN_Z)
        heel = max(0.0, 1 - (z - (G.JOIN_Z - 0.035)) / 0.07)
        d += heel * (depth(G.JOIN_Z) - 0.025)
        secs.append([(w * math.cos(a), d * math.sin(a) ** 0.8, z) for a in [math.pi * k / 16 for k in range(17)]])
    o = obj(PART + 'neck', loft(secs), wood); o.matrix_world = M
    # fretboard, tapering from the sound hole to the nut
    z0, z1 = G.BOARD_END_Z, G.NUT_Z
    w0, w1 = neck_width(G.JOIN_Z) / 2 + 0.0005, neck_width(z1) / 2
    bm = bmesh.new()
    v = [bm.verts.new(p) for p in ((-w0, 0, z0), (w0, 0, z0), (w1, 0, z1), (-w1, 0, z1),
                                    (-w0, -0.006, z0), (w0, -0.006, z0), (w1, -0.006, z1), (-w1, -0.006, z1))]
    for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): bm.faces.new([v[i] for i in f])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    o = obj(PART + 'board', bm, board, smooth=False); o.matrix_world = M
    for n in range(1, 21):
        z = G.fret_z(n)
        if z < z0: break
        w = w0 + (w1 - w0) * (z - z0) / (z1 - z0)
        o = obj(PART + f'fret_{n}', rbox((2 * w, 0.0016, 0.0022), 0.0007, 2), fret); o.matrix_world = M @ Matrix.Translation((0, -0.0065, z))
    for n in (3, 5, 7, 9, 12, 15, 17):
        z = (G.fret_z(n) + G.fret_z(n - 1)) / 2
        for x in ((-0.009, 0.009) if n == 12 else (0,)):
            o = obj(PART + f'dot_{n}', cyl(0.0028, 0.0008, 16), pearl)
            o.matrix_world = M @ Matrix.Translation((x, -0.0062, z)) @ Matrix.Rotation(math.pi / 2, 4, 'X')
    o = obj(PART + 'nut', rbox((2 * w1, 0.009, 0.005), 0.001, 2), bone); o.matrix_world = M @ Matrix.Translation((0, -0.0045, z1 + 0.0025))

def headstock(M, face, metal):
    """Tipped back from the nut; returns the six string posts in world space."""
    H = M @ Matrix.Translation((0, 0.004, G.NUT_Z + 0.005)) @ Matrix.Rotation(-math.radians(14), 4, 'X')
    bm = rbox((0.08, 0.015, 0.19), 0.005, 3)
    for v in bm.verts:  # wider at the top, a soft taper into the nut
        v.co.x *= 0.86 + 0.14 * (v.co.z / 0.19 + 0.5)
    o = obj(PART + 'head', bm, face); o.matrix_world = H @ Matrix.Translation((0, 0, 0.095))
    posts = []
    for i, z in enumerate((0.045, 0.09, 0.135)):
        for side in (-1, 1):
            p = Vector((side * 0.021, -0.0075, z))
            o = obj(PART + f'post_{i}{side}', cyl(0.003, 0.012, 12), metal)
            o.matrix_world = H @ Matrix.Translation(p + Vector((0, -0.004, 0))) @ Matrix.Rotation(math.pi / 2, 4, 'X')
            o = obj(PART + f'bush_{i}{side}', cyl(0.0045, 0.002, 16), metal)
            o.matrix_world = H @ Matrix.Translation(p) @ Matrix.Rotation(math.pi / 2, 4, 'X')
            # the gear on the back edge and the button sticking out sideways
            o = obj(PART + f'gear_{i}{side}', rbox((0.016, 0.012, 0.014), 0.003, 2), metal)
            o.matrix_world = H @ Matrix.Translation((side * 0.04, 0.01, z))
            o = obj(PART + f'shaft_{i}{side}', cyl(0.0018, 0.016, 10), metal)
            o.matrix_world = H @ Matrix.Translation((side * 0.055, 0.01, z)) @ Matrix.Rotation(math.pi / 2, 4, 'Y')
            o = obj(PART + f'button_{i}{side}', rbox((0.006, 0.016, 0.012), 0.0025, 3), metal)
            o.matrix_world = H @ Matrix.Translation((side * 0.066, 0.01, z))
            posts.append(H @ (p + Vector((0, -0.009, 0))))
    return posts

def bridge(M, board, bone, pin):
    o = obj(PART + 'bridge', rbox((0.15, 0.009, 0.03), 0.003, 3), board); o.matrix_world = M @ Matrix.Translation((0, -0.0045, G.SADDLE_Z - 0.006))
    o = obj(PART + 'saddle', rbox((0.074, 0.0032, 0.003), 0.0008, 2), bone); o.matrix_world = M @ Matrix.Translation((0, -0.01, G.SADDLE_Z))
    ends = []
    for i in range(6):
        x = (i - 2.5) * 0.0104
        o = obj(PART + f'pin_{i}', cyl(0.0026, 0.004, 12), pin)
        o.matrix_world = M @ Matrix.Translation((x, -0.0105, G.SADDLE_Z - 0.016)) @ Matrix.Rotation(math.pi / 2, 4, 'X')
        ends.append(M @ Vector((x, -0.0115, G.SADDLE_Z)))
    o = obj(PART + 'endpin', cyl(0.004, 0.008, 12), pin); o.matrix_world = M @ Matrix.Translation((0, depth(0) / 2, -0.003))
    return ends

def string(name, pts, r, m):
    bm = bmesh.new()
    for a, b in zip(pts, pts[1:]):
        a, b = Vector(a), Vector(b); L = (b - a).length
        c = bmesh.ops.create_cone(bm, cap_ends=False, segments=6, radius1=r, radius2=r, depth=L)
        R = (b - a).to_track_quat('Z', 'Y').to_matrix().to_4x4()
        bmesh.ops.transform(bm, matrix=Matrix.Translation((a + b) / 2) @ R, verts=c['verts'])
    obj(name, bm, m)

def remove_placeholder():
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name.startswith(PART): bpy.data.objects.remove(o)

def build():
    remove_placeholder()
    top = bpy.data.materials.new('guitar_top'); top.use_nodes = True; nt = top.node_tree; p = nt.nodes['Principled BSDF']
    p.inputs['Roughness'].default_value = 0.32
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(HERE, 'textures', 'guitar_top.png'), check_existing=True)
    nt.links.new(t.outputs['Color'], p.inputs['Base Color'])
    mahogany = mat('guitar_mahogany', srgb((92, 44, 22)), 0.35)
    binding = mat('guitar_binding', srgb((232, 222, 196)), 0.4)
    board = mat('guitar_rosewood', srgb((38, 24, 18)), 0.55)
    fret = mat('guitar_fret', (0.75, 0.74, 0.72), 0.25, 1.0)
    pearl = mat('guitar_pearl', srgb((236, 232, 222)), 0.3)
    bone = mat('guitar_bone', srgb((238, 230, 210)), 0.4)
    face = mat('guitar_headface', srgb((24, 16, 12)), 0.35)
    chrome = mat('guitar_chrome', (0.8, 0.8, 0.82), 0.18, 1.0)
    bronze = mat('guitar_bronze', srgb((196, 150, 96)), 0.3, 1.0)
    steel = mat('guitar_steel', (0.78, 0.78, 0.8), 0.22, 1.0)
    pin = mat('guitar_pin', srgb((236, 230, 214)), 0.4)

    # on the floor beside the cabinet, back resting on the wall
    lift = depth(0) * math.sin(LEAN)
    base = Vector((1.99, WALL_Y - 0.03 - 1.0 * math.sin(LEAN) - depth(G.BODY_L), lift))
    M = Matrix.Translation(base) @ Matrix.Rotation(YAW, 4, 'Z') @ Matrix.Rotation(-LEAN, 4, 'X')
    body(M, top, mahogany, binding)
    neck(M, mahogany, board, fret, pearl, bone)
    posts = headstock(M, face, chrome)
    ends = bridge(M, board, bone, pin)
    # strings: saddle, over the nut, to their posts (bass strings wound in bronze)
    for i in range(6):
        x_nut = (i - 2.5) * 0.0072
        nut = M @ Vector((x_nut, -0.0095, G.NUT_Z + 0.004))
        post = posts[[0, 2, 4, 5, 3, 1][i]]
        string(PART + f'string_{i}', [ends[i], nut, post], 0.0007 - 0.00007 * i, bronze if i < 4 else steel)
