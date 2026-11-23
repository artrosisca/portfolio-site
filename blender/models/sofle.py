"""
Arthur's Sofle (Choc): walnut case, black plate, white KLP Lamé low-profile caps over blue
Kailh Choc switches, a
knurled silver encoder and a Sharp MiP display on each half. build(scene_objects) adds it
to the current scene at the same place as the site's keyboard (Keyboard.tsx).
Coordinates: Blender Z-up; three (x, y, z) == blender (x, -z, y).
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

PX, PY = 0.018, 0.017            # Kailh Choc spacing (18 x 17 mm)
P = PX
CAP_X, CAP_Y = 0.0175, 0.0165   # KLP Lamé footprint
STAGGER = [0, 0, 0.25, 0.375, 0.25, 0.125]
DESK_Y = 0.76
SCALE = 1.35                     # the site draws the desk set slightly larger, so it reads
ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')

def lin(h):
    h = h.lstrip('#'); return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)) + (1,)

def principled(name, color, rough=0.5, metal=0.0, coat=0.0, trans=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = lin(color); p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal; p.inputs['Coat Weight'].default_value = coat
    p.inputs['Transmission Weight'].default_value = trans
    return m

def walnut():
    m = bpy.data.materials.get('sofle_walnut')
    if m: return m
    m = bpy.data.materials.new('sofle_walnut'); m.use_nodes = True; nt = m.node_tree; p = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (6, 6, 6)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(ASSETS, 'american_walnut_veneer_diff_1k.jpg'))
    t.projection = 'BOX'; t.projection_blend = 0.3
    nt.links.new(mp.outputs['Vector'], t.inputs['Vector'])
    dark = nt.nodes.new('ShaderNodeMix'); dark.data_type = 'RGBA'; dark.blend_type = 'MULTIPLY'; dark.inputs['Factor'].default_value = 1
    dark.inputs['B'].default_value = (0.42, 0.24, 0.17, 1)  # the case is a deep reddish walnut
    nt.links.new(t.outputs['Color'], dark.inputs['A']); nt.links.new(dark.outputs['Result'], p.inputs['Base Color'])
    p.inputs['Roughness'].default_value = 0.42; p.inputs['Coat Weight'].default_value = 0.25
    return m

def obj_from_bm(name, bm, mat, coll):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); coll.objects.link(o); me.materials.append(mat)
    for poly in me.polygons: poly.use_smooth = True
    return o

def bevel(o, width, segs=3):
    m = o.modifiers.new('bevel', 'BEVEL'); m.width = width; m.segments = segs; m.limit_method = 'ANGLE'
    o.modifiers.new('wn', 'WEIGHTED_NORMAL')

def half_keys():
    keys = []
    for c in range(6):
        for r in range(4):
            keys.append((c * PX, (r - STAGGER[c]) * PY, 0.0, 1.0))
    for c in range(1, 5):
        keys.append((c * PX, (4 - STAGGER[c] * 0.5) * PY, 0.0, 1.0))
    keys.append((5.3 * PX, 4.3 * PY, -0.35, 1.5))  # the big angled thumb key
    return keys  # (x, row-depth z, rotation, width in u) in the site's half-local frame

def keycap_mesh():
    """KLP Lamé: a low (~4.5 mm), slightly tapered cap with soft round edges and a shallow
    concave dish on top. One shared mesh for every key."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        top = v.co.z > 0
        k = 0.9 if top else 1.0  # taper towards the top
        v.co.x *= CAP_X * k; v.co.y *= CAP_Y * k; v.co.z = 0.0045 if top else 0.0
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.0016, segments=4, profile=0.55, affect='EDGES')
    # the dish: a shallow scoop across the top, deepest in the middle
    hx = CAP_X * 0.9 / 2
    for v in bm.verts:
        if v.co.z > 0.0040:
            v.co.z -= 0.0005 * max(0.0, 1 - (v.co.x / hx) ** 2)
    bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if all(v.co.z > 0.0040 for v in e.verts)], cuts=6, use_grid_fill=True)
    for v in bm.verts:
        if v.co.z > 0.0038:
            v.co.z = 0.0045 - 0.0005 * max(0.0, 1 - (v.co.x / hx) ** 2) if abs(v.co.x) < hx * 0.8 and abs(v.co.y) < CAP_Y * 0.9 / 2 * 0.8 else v.co.z
    me = bpy.data.meshes.new('sofle_cap'); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    return me

def build_half(side, coll, mats, capmesh):
    """side -1 = left, 1 = right; returns the half's root empty (site half-local frame)."""
    root = bpy.data.objects.new(f'sofle_{"L" if side < 0 else "R"}', None); coll.objects.link(root)
    ox, oz = 3 * PX, 2 * PY
    def at(x, z, y=0.0):  # site half-local (x, y, z) -> blender local
        return Vector((-side * (x - ox), -(z - oz), y))
    pts = []
    for (x, z, rot, w) in half_keys():
        pos = at(x, z)
        R = Matrix.Rotation(-side * rot, 4, 'Z')  # three rotation.y == -blender rotation.z
        cap = bpy.data.objects.new('cap', capmesh); coll.objects.link(cap); cap.parent = root
        cap.matrix_basis = Matrix.Translation(pos + Vector((0, 0, 0.0040))) @ R @ Matrix.Diagonal((w * 1.0 if w == 1 else w * 0.98, 1, 1, 1))
        if not cap.data.materials: cap.data.materials.append(mats['cap'])
        sw = bpy.data.objects.new('switch', mats['swmesh']); coll.objects.link(sw); sw.parent = root
        sw.matrix_basis = Matrix.Translation(pos + Vector((0, 0, 0.0028))) @ R
        hw = w * PX / 2 + 0.004; hd = PY / 2 + 0.004
        for dx, dy in ((-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd)):
            pts.append(pos + (R @ Vector((dx, dy, 0, 0))).to_3d())
    inner_x = 6.15 * P
    for dz in (-0.4, 3.0):  # room for the display and the encoder on the inner side
        for dx in (-0.6, 0.65):
            pts.append(at(inner_x + dx * PX, dz * PY))
    # case outline: convex hull of the key footprints, extruded and rounded
    def slab(name, z0, z1, inset, mat, bev):
        bm = bmesh.new()
        hull = bmesh.ops.convex_hull(bm, input=[bm.verts.new((p.x, p.y, 0)) for p in pts])
        for g in hull['geom_interior'] + hull['geom_unused']:
            if isinstance(g, bmesh.types.BMVert) and g.is_valid: bm.verts.remove(g)
        ring = [v for v in bm.verts]
        c = sum((v.co for v in ring), Vector()) / len(ring)
        ring.sort(key=lambda v: math.atan2(v.co.y - c.y, v.co.x - c.x))
        for v in ring: v.co += (v.co - c).normalized() * -inset; v.co.z = z0
        for e in list(bm.edges): bm.edges.remove(e)
        f = bm.faces.new(ring)
        ext = bmesh.ops.extrude_face_region(bm, geom=[f])
        for v in [g for g in ext['geom'] if isinstance(g, bmesh.types.BMVert)]: v.co.z = z1
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        o = obj_from_bm(name, bm, mat, coll); o.parent = root; bevel(o, bev); return o
    slab('case', -0.0095, 0.0005, -0.0032, mats['wood'], 0.003)
    slab('plate', 0.0005, 0.0018, 0.0004, mats['plate'], 0.0006)
    # Sharp MiP display and knurled encoder on the inner column
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co.x *= 0.018; v.co.y *= 0.033; v.co.z = 0.0019 + (v.co.z + 0.5) * 0.0006
    d = obj_from_bm('display', bm, mats['display'], coll); d.parent = root; d.location = at(inner_x, 0.55 * PY)
    bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=72, radius=0.0085)
    for i, v in enumerate(bm.verts):
        if v.co.length > 0.001 and i % 2: v.co *= 0.93  # the knurl
    ext = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    for v in [g for g in ext['geom'] if isinstance(g, bmesh.types.BMVert)]: v.co.z = 0.013
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    k = obj_from_bm('encoder', bm, mats['knob'], coll); k.parent = root; k.location = at(inner_x, 2.35 * PY, 0.0018)
    for p in k.data.polygons: p.use_smooth = False
    bevel(k, 0.0006, 2)
    return root

def build(replace_existing=True):
    sc = bpy.context.scene
    if replace_existing:  # the site's procedural halves (keep its mouse and cable)
        for o in list(bpy.data.objects):
            if o.type == 'MESH' and o.name.startswith('keyboard__'):
                c = o.matrix_world @ (sum((Vector(b) for b in o.bound_box), Vector()) / 8)
                if 0.03 < abs(c.x) < 0.3: bpy.data.objects.remove(o)
    coll = bpy.data.collections.new('sofle'); sc.collection.children.link(coll)
    swb = bmesh.new(); bmesh.ops.create_cube(swb, size=1)
    for v in swb.verts: v.co.x *= 0.015; v.co.y *= 0.0145; v.co.z *= 0.003  # Choc: a low switch
    swmesh = bpy.data.meshes.new('sofle_switch'); swb.to_mesh(swmesh); swb.free()
    mats = {
        'cap': principled('sofle_cap', '#eeeeec', 0.5, coat=0.05),
        'wood': walnut(),
        'plate': principled('sofle_plate', '#0d0d0f', 0.55, 0.3),
        'display': principled('sofle_display', '#9ea39e', 0.65),
        'knob': principled('sofle_knob', '#cfd2d6', 0.32, 1.0),
        'swmesh': swmesh,
    }
    swmesh.materials.append(principled('sofle_switch', '#2f6bff', 0.25, trans=0.3))
    capmesh = keycap_mesh()
    rig = bpy.data.objects.new('sofle', None); coll.objects.link(rig)
    # the case sits on the mousepad (its top is at DESK_Y + 0.0062)
    rig.location = Vector((0, -0.13, DESK_Y + 0.0063 + 0.0095 * SCALE)); rig.scale = (SCALE,) * 3
    for side, x in ((-1, -0.105), (1, 0.105)):
        h = build_half(side, coll, mats, capmesh); h.parent = rig
        h.location = (x, 0, 0); h.rotation_euler = (0, 0, -0.2 * side * -1)
    return rig
