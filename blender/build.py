"""
Builds the lit room in Blender from scene.glb (exported by the site with ?export).
Run: blender --background --python blender/build.py  ->  blender/room.blend
Three.js is Y-up, Blender Z-up: three (x, y, z) == blender (x, -z, y).
"""
import bpy, math, os
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
def B(x, y, z): return Vector((x, -z, y))  # three -> blender

DESK_Y = 0.76
HEAD = B(-0.52, DESK_Y + 0.62, -0.3)
TARGET = B(-0.05, DESK_Y, 0.08)
SCREEN = B(0, 1.17, -0.3)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, 'scene.glb'))
sc = bpy.context.scene

# the site uses 40 m floor/wall planes; only the part around the desk is ever seen. Cropped
# in the mesh itself (not the object scale), so the bake's unwrap gives them their real area.
def crop(o, xs, ys=None, zs=None):
    o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)
    for v in o.data.vertices:
        v.co.x = min(max(v.co.x, xs[0]), xs[1])
        if ys: v.co.y = min(max(v.co.y, ys[0]), ys[1])
        if zs: v.co.z = min(max(v.co.z, zs[0]), zs[1])
for o in list(bpy.data.objects):
    if o.type == 'MESH' and max(o.dimensions) > 30:
        if o.dimensions.y > 30: crop(o, (-3.2, 3.2), ys=(-3.0, 0.8))   # floor
        else: crop(o, (-3.2, 3.2), zs=(0, 3.4))                         # wall
    elif o.type == 'MESH' and o.name.startswith('room__') and o.dimensions.x > 30:
        crop(o, (-3.2, 3.2))                                             # skirting

def hexcol(h, a=1):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return [x ** 2.2 for x in c] + [a]

# --- lights -------------------------------------------------------------------
def light(name, kind, loc, color, energy, **kw):
    d = bpy.data.lights.new(name, kind); d.color = hexcol(color)[:3]; d.energy = energy
    for k, v in kw.items(): setattr(d, k, v)
    o = bpy.data.objects.new(name, d); o.location = loc; sc.collection.objects.link(o); return o

lamp = light('lamp_spot', 'SPOT', HEAD, '#ffb765', 70, spot_size=math.radians(110), spot_blend=0.9, shadow_soft_size=0.025)
lamp.rotation_euler = (TARGET - HEAD).to_track_quat('-Z', 'Y').to_euler()
moon = light('moon', 'SUN', (0, 0, 0), '#9fb0ff', 0.7, angle=math.radians(3))
moon.rotation_euler = B(3, 3.5, 2).to_track_quat('Z', 'Y').to_euler()
light('shelf_glow', 'POINT', B(0.0, 1.62, -0.6), '#ffa95a', 6, shadow_soft_size=0.3)
light('lamp_bounce', 'POINT', B(-0.3, DESK_Y + 0.35, 0), '#ff9a4a', 5, shadow_soft_size=0.4)
light('guitar_warm', 'POINT', B(0.9, 1.5, 0.6), '#ffc98a', 6, shadow_soft_size=0.5)

# world: the dim cool night fill
w = bpy.data.worlds.new('night'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = hexcol('#2a2140'); bg.inputs[1].default_value = 1.6

# the screen glows: its desktop image lights the desk
for o in bpy.data.objects:
    if o.name.startswith('screen'):
        for m in o.data.materials:
            p = m.node_tree.nodes.get('Principled BSDF')
            if p: p.inputs['Emission Strength'].default_value = 2.0

# --- Arthur's own gear, modelled here instead of the site's placeholders -------
import sys; sys.path.insert(0, os.path.join(HERE, 'models'))
import sofle; sofle.build()
import mouse; mouse.build()
import props; props.lamp(); props.plants()
import materials; materials.apply()
# bake.py groups meshes by their "part__" prefix: Arthur's gear goes with the keyboard
for name, part in (('sofle', 'keyboard'), ('mouse', 'keyboard')):
    for o in bpy.data.collections[name].all_objects:
        if o.type == 'MESH': o.name = f'{part}__{o.name}'

# the Rubik's cube was drawn oversized in the site; a real 57 mm cube at the desk set's 1.35x
cube = [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('cube__')]
if cube:
    pts = [o.matrix_world @ Vector(c) for o in cube for c in o.bound_box]
    lo = Vector((sum(p.x for p in pts) / len(pts), sum(p.y for p in pts) / len(pts), min(p.z for p in pts)))
    k = 0.057 * 1.35 / (max(p.x for p in pts) - min(p.x for p in pts))
    for o in cube:
        o.matrix_world = Matrix.Translation(lo) @ Matrix.Scale(k, 4) @ Matrix.Translation(-lo) @ o.matrix_world

# --- camera: the site's landing pose (CameraRig START.wide) --------------------
az, el, r = -0.95, 0.42, 3.4
pos = Vector((math.sin(az) * math.cos(el), math.sin(el), math.cos(az) * math.cos(el))) * r
cam_d = bpy.data.cameras.new('cam'); cam_d.sensor_fit = 'VERTICAL'; cam_d.angle_y = math.radians(35)
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam.location = B(pos.x, pos.y + 1.17, pos.z - 0.3)
look = B(-0.75, 0.95, -0.35)
cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.rotation_euler.rotate_axis('Z', 0)  # roll handled loosely

sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 64
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 960, 600
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = 1.6
# the bake joins meshes and unwraps them: modifiers (booleans, bevels) must be real geometry,
# and every transform baked in, so nothing is stretched in the bake UVs
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o.type == 'MESH': o.select_set(True)
bpy.context.view_layer.objects.active = next(o for o in bpy.data.objects if o.type == 'MESH')
bpy.ops.object.make_single_user(object=True, obdata=True)
bpy.ops.object.convert(target='MESH')
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'room.blend'))
print('SAVED')
