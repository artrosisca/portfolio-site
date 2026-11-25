"""
CC0 models from Poly Haven (blender/assets, not committed) replacing the site's placeholders:
the orange clamp lamp, the floor plant and a haworthia on the shelf.
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
DESK_Y = 0.76
DESK_BACK = 0.675          # blender y of the desk's back edge
TARGET = Vector((-0.18, -0.1, DESK_Y))  # the pool of light: on the keyboard, the notebook at its edge

def remove(pred):
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and pred(o): bpy.data.objects.remove(o)

def centre(o):
    return o.matrix_world @ (sum((Vector(c) for c in o.bound_box), Vector()) / 8)

def load(name, part):
    """Imports a Poly Haven glTF, bakes its transforms into the meshes, prefixes the part."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, name, f'{name}_1k.gltf'))
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    for o in new:
        o.data = o.data.copy()
        o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)
        o.name = f'{part}__{o.name}'
    return new

def place(objs, m):
    for o in objs: o.data.transform(m)

def lamp():
    """Clamped to the desk's back edge, arm reaching over the desk; the shade is turned on its
    joint so it points at the same spot the site's lamp lights."""
    remove(lambda o: o.name.startswith('lamp__'))
    o, = load('desk_lamp_arm_01', 'lamp')
    s = 0.85
    clamp = Vector((-0.86, DESK_BACK + 0.02, DESK_Y - 0.075 * s))  # desk top sits in the jaw
    # reaching mostly along the wall: the elbow then folds out to the side, not into the wall
    d = Vector((0.94, -0.34)).normalized()
    T = Matrix.Translation(clamp) @ Matrix.Rotation(math.atan2(-d.x, d.y), 4, 'Z') @ Matrix.Scale(s, 4)

    # model space: the shade is everything above the top joint on the reaching side
    pivot = Vector((0, 0.1, 0.71))
    me = o.data
    shade = [v for v in me.vertices if v.co.z > 0.57 and v.co.y > 0.085]
    want_at = T.inverted() @ TARGET
    def mouth(axis):
        """The rim: the shade's verts furthest along its axis; their centre and the normal of the
        plane they lie in (the shade's real axis, pointing out of the mouth)."""
        for _ in range(3):
            top = max(v.co.dot(axis) for v in shade)
            rim = [v.co.copy() for v in shade if v.co.dot(axis) > top - 0.012]
            c = sum(rim, Vector()) / len(rim)
            cov = Matrix(((0, 0, 0), (0, 0, 0), (0, 0, 0)))
            for r in rim:
                d = r - c
                for i in range(3):
                    for j in range(3): cov[i][j] += d[i] * d[j]
            # smallest-variance direction of the rim = its plane's normal (power iteration on the inverse)
            n = axis.copy(); inv = (cov + Matrix.Identity(3) * 1e-9).inverted()
            for _ in range(30): n = (inv @ n).normalized()
            axis = n if n.dot(axis) > 0 else -n
        return c, axis
    # the scan's shade points down and out over the arm's reach; turn it on its joint until the
    # mouth faces the pool of light (a few rounds: turning moves the mouth too)
    c, axis = mouth(Vector((0, 0.37, -0.93)).normalized())
    for _ in range(4):
        q = axis.rotation_difference((want_at - c).normalized())
        for v in shade: v.co = pivot + q @ (v.co - pivot)
        c, axis = mouth((q @ axis).normalized())
    me.update()
    o.data.transform(T)
    # keep the persimmon, a little less loud than the scan's orange
    for m in o.data.materials:
        nt = m.node_tree; p = nt.nodes.get('Principled BSDF'); link = p.inputs['Base Color'].links[0] if p.inputs['Base Color'].links else None
        if link:
            hs = nt.nodes.new('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = 0.92
            nt.links.new(link.from_socket, hs.inputs['Color']); nt.links.new(hs.outputs['Color'], p.inputs['Base Color'])

    # world space: the light sits just inside the mouth, on its axis, and shines along it. The scan
    # has its own bulb 18 mm in from the rim: the light goes in front of it, not inside it
    c, axis = T @ c, (T.to_3x3() @ axis).normalized()
    inside = c - axis * 0.01
    spot = bpy.data.objects.get('lamp_spot')
    if spot:
        spot.location = inside
        spot.rotation_euler = axis.to_track_quat('-Z', 'Y').to_euler()
    print('LAMP mouth', tuple(round(x, 3) for x in c), 'axis', tuple(round(x, 3) for x in axis))
    # the bulb, glowing inside the shade
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=0.022)
    bulb_me = bpy.data.meshes.new('bulb'); bm.to_mesh(bulb_me); bm.free()
    for p in bulb_me.polygons: p.use_smooth = True
    m = bpy.data.materials.new('bulb'); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (1, 0.8, 0.55, 1)
    p.inputs['Emission Color'].default_value = (1, 0.72, 0.42, 1); p.inputs['Emission Strength'].default_value = 25
    bulb_me.materials.append(m)
    bulb = bpy.data.objects.new('lamp__bulb', bulb_me); bpy.context.scene.collection.objects.link(bulb)
    bulb.location = c - axis * 0.02  # over the scan's bulb, its front half glowing
    bulb.visible_shadow = False
    # warm light on the inside of the shade
    d = bpy.data.lights.new('shade_glow', 'POINT'); d.energy = 1.2; d.color = (1, 0.7, 0.4); d.shadow_soft_size = 0.02
    g = bpy.data.objects.new('shade_glow', d); g.location = c - axis * 0.012
    bpy.context.scene.collection.objects.link(g)

def plants():
    # the site's floor plant goes; corner.py grows a snake plant in its place
    remove(lambda o: o.name.startswith('plant__'))
    # haworthia on the shelf, where the site has its small plant
    remove(lambda o: o.name.startswith('decor__') and centre(o).x > 1.2 and centre(o).z > 1.73)
    objs = load('potted_plant_04', 'decor')
    place(objs, Matrix.Translation((1.316, 0.685, 1.737)) @ Matrix.Scale(0.8, 4))
