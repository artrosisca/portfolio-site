"""
Arthur's mouse, a black VXE Dragonfly R1 Pro Max: a simple, low, symmetric shell in matte
black with the button split, a scroll wheel and two side buttons on the left.
build() replaces the site's mouse (Keyboard.tsx) at the same place.
"""
import bpy, bmesh, math
from mathutils import Vector, Matrix

DESK_Y = 0.76
SCALE = 1.35                       # the desk set is drawn slightly larger on the site
L, W, H = 0.1225, 0.0620, 0.0380   # real size (m)

def mat(name, rgb, rough):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1); p.inputs['Roughness'].default_value = rough
    return m

def hump(yn):
    """Height profile along the length (yn: -1 back .. 1 front)."""
    return 0.62 + 0.38 * math.exp(-((yn + 0.25) ** 2) / 0.5)

def top_z(y):
    """Height of the shell's centre line at local y (m)."""
    u = y / L  # -0.5 .. 0.5 on the unit sphere
    return 2 * H * hump(2 * u) * math.sqrt(max(0.0, 0.25 - u * u))

def shell():
    """Top half of a sphere, shaped: highest a bit behind the middle, narrower at the front."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=0.5)
    for v in list(bm.verts):
        if v.co.z < -1e-6: bm.verts.remove(v)
    for v in bm.verts:
        y = v.co.y * 2          # -1 back .. 1 front
        k = hump(y)
        width = 1 - 0.1 * max(0, y)  # a touch narrower towards the buttons
        v.co.x *= W * width; v.co.y *= L; v.co.z *= 2 * H * k
    bmesh.ops.contextual_create(bm, geom=[e for e in bm.edges if e.is_boundary])  # flat base
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
    rubber = mat('vxe_wheel', (0.03, 0.03, 0.032), 0.8)

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
    for (sx, sy, cx, cy) in ((0.0009, L * 0.42, 0, L * 0.29), (W * 0.62, 0.0009, 0, L * 0.08)):
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
        for v in bm.verts: v.co.x *= sx; v.co.y *= sy; v.co.z = (v.co.z + 0.5) * 2 * H
        o = add('vxe_seam', bm, seam, smooth=False); o.location = (cx, cy, 0)
        bool_ = o.modifiers.new('only_on_shell', 'BOOLEAN'); bool_.operation = 'INTERSECT'; bool_.object = body
        o.scale = (1, 1, 1.002)
    # scroll wheel in its slot
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.009, radius2=0.009, depth=0.0065)
    wheel = add('vxe_wheel', bm, rubber); wheel.rotation_euler = (0, math.pi / 2, 0)
    # sunk in its slot: only ~1.5 mm shows above the shell
    wheel.location = (0, L * 0.2, top_z(L * 0.2) + 0.0015 - 0.009)
    # two side buttons on the left
    for i, y in enumerate((L * 0.12, -L * 0.06)):
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
        for v in bm.verts: v.co.x *= 0.002; v.co.y *= 0.014; v.co.z *= 0.0045
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.0012, segments=2, affect='EDGES')
        b = add(f'vxe_side{i}', bm, black); b.location = (-W * 0.485, y, H * 0.45)
    return root
