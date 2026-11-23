"""
CC0 models from Poly Haven (blender/assets, not committed) replacing the site's placeholders:
the orange clamp lamp, the floor plant and a haworthia on the shelf.
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
DESK_Y = 0.76
DESK_BACK = 0.675          # blender y of the desk's back edge
TARGET = Vector((-0.05, -0.08, DESK_Y))  # where the lamp's pool of light lands (as on the site)

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
    s = 1.0
    clamp = Vector((-0.78, DESK_BACK + 0.02, DESK_Y - 0.075 * s))  # desk top sits in the jaw
    d = (TARGET - clamp).xy.normalized()
    T = Matrix.Translation(clamp) @ Matrix.Rotation(math.atan2(-d.x, d.y), 4, 'Z') @ Matrix.Scale(s, 4)

    # model space: the shade is everything above the top joint on the reaching side
    pivot = Vector((0, 0.1, 0.71))
    me = o.data
    shade = [v for v in me.vertices if v.co.z > 0.57 and v.co.y > 0.085]
    far = max((v.co - pivot).length for v in shade)
    mouth = sum((v.co for v in shade if (v.co - pivot).length > 0.9 * far), Vector()) / \
        len([v for v in shade if (v.co - pivot).length > 0.9 * far])
    want = (T.inverted() @ TARGET - pivot).normalized()
    q = (mouth - pivot).normalized().rotation_difference(want)
    for v in shade: v.co = pivot + q @ (v.co - pivot)
    axis = q @ (mouth - pivot)
    me.update()
    o.data.transform(T)

    inside = T @ (pivot + axis * 0.72)
    spot = bpy.data.objects.get('lamp_spot')
    if spot:
        spot.location = inside
        spot.rotation_euler = (TARGET - inside).to_track_quat('-Z', 'Y').to_euler()
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
    bulb.location = T @ (pivot + axis * 0.62)
    # warm light on the inside of the shade
    d = bpy.data.lights.new('shade_glow', 'POINT'); d.energy = 1.2; d.color = (1, 0.7, 0.4); d.shadow_soft_size = 0.02
    g = bpy.data.objects.new('shade_glow', d); g.location = T @ (pivot + axis * 0.5)
    bpy.context.scene.collection.objects.link(g)

def plants():
    # floor plant in the corner, left of the desk
    remove(lambda o: o.name.startswith('plant__'))
    objs = load('potted_plant_02', 'plant')
    place(objs, Matrix.Translation((-1.55, 0.42, 0)) @ Matrix.Rotation(0.6, 4, 'Z') @ Matrix.Scale(1.0, 4))
    for o in objs:
        if o.name.endswith('dirt'):  # 54k faces of soil nobody looks into
            dec = o.modifiers.new('dec', 'DECIMATE'); dec.ratio = 0.04
            bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='dec')
    # haworthia on the shelf, where the site has its small plant
    remove(lambda o: o.name.startswith('decor__') and centre(o).x > 1.2 and centre(o).z > 1.73)
    objs = load('potted_plant_04', 'decor')
    place(objs, Matrix.Translation((1.316, 0.685, 1.737)) @ Matrix.Scale(0.8, 4))
