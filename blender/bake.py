"""
Bakes the room's lighting into textures and exports a light .glb for the site.
Run: blender --background blender/room.blend --python blender/bake.py
Env: BAKE_SCALE (resolution multiplier, default 1), BAKE_SAMPLES (default 128).
Every part is joined into one mesh with one baked texture on a fresh UV map, so the site
draws it with an unlit material: no lights or shadows computed in the browser.
"""
import bpy, os, time

HERE = os.path.dirname(os.path.abspath(__file__))
SCALE = float(os.environ.get('BAKE_SCALE', 1))
SAMPLES = int(os.environ.get('BAKE_SAMPLES', 128))
OUT = os.environ.get('BAKE_OUT', os.path.join(HERE, '..', 'public', 'room', 'room.glb'))
# texture size per part; the desk area is what the camera gets closest to
SIZES = {'room': 2048, 'desk': 2048, 'decor': 2048, 'monitor': 1024, 'keyboard': 1024, 'lamp': 1024, 'guitar': 1024, 'plant': 1024, 'cube': 512}

sc = bpy.context.scene
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = False
b = sc.render.bake
b.use_pass_direct = b.use_pass_indirect = True
b.use_pass_diffuse = b.use_pass_emit = b.use_pass_transmission = True
b.use_pass_glossy = False  # view-dependent: wrong once baked
b.margin = 6

DESK_Y = 0.76

def cull_hidden(o):
    """Drops faces the camera never sees, so they don't eat texture space: undersides below
    eye level (the camera never goes under the desk) and the desk box's top, hidden under the
    wood plane."""
    import bmesh
    bm = bmesh.new(); bm.from_mesh(o.data)
    mw = o.matrix_world
    dead = []
    for f in bm.faces:
        n = (mw.to_3x3() @ f.normal).normalized(); c = mw @ f.calc_center_median()
        if n.z < -0.7 and c.z < 1.3: dead.append(f)
        elif o.name == 'desk' and n.z > 0.9 and DESK_Y - 0.002 < c.z < DESK_Y + 0.0002: dead.append(f)
    bmesh.ops.delete(bm, geom=dead, context='FACES')
    bm.to_mesh(o.data); bm.free()

def objs(part):
    return [o for o in bpy.data.objects if o.type == 'MESH' and o.name.split('__')[0] == part]

baked = []
for part, size in SIZES.items():
    group = objs(part)
    if not group: continue
    t0 = time.time()
    bpy.ops.object.select_all(action='DESELECT')
    for o in group: o.select_set(True)
    bpy.context.view_layer.objects.active = group[0]
    if len(group) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    o.name = part
    cull_hidden(o)
    # fresh UV for the bake; texture lookups keep using the original (render) UV
    uv = o.data.uv_layers.new(name='bake')
    o.data.uv_layers.active = uv
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.004, area_weight=0.6, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    px = int(size * SCALE)
    img = bpy.data.images.new(f'bake_{part}', px, px, float_buffer=True)
    for m in o.data.materials:
        if not m or not m.use_nodes: continue
        n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img
        m.node_tree.nodes.active = n
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.bake(type='COMBINED')
    baked.append((o, img))
    print(f'BAKED {part} {px}px in {time.time() - t0:.0f}s', flush=True)

# export: one unlit-style material per part with its baked image, only the bake UV kept
for o in [x for x in bpy.data.objects if x.type == 'MESH' and x not in [p for p, _ in baked]]:
    bpy.data.objects.remove(o)  # the live screen and anything unbaked stay procedural on the site
tmp = os.path.join(HERE, 'bakes'); os.makedirs(tmp, exist_ok=True)
paths = {}
for o, img in baked:
    # save through the scene's view transform (AgX + exposure): the site shows these pixels
    # as they are, unlit and without tone mapping, so it looks exactly like Blender's render
    paths[o.name] = os.path.join(tmp, f'{o.name}.png')
    img.save_render(paths[o.name], scene=sc)
import subprocess, sys
subprocess.run([bpy.app.binary_path, '--background', '--factory-startup', '--python', os.path.join(HERE, 'denoise.py'), '--', *paths.values()], check=True)
for o, img in baked:
    shown = bpy.data.images.load(paths[o.name])
    m = bpy.data.materials.new(f'baked_{o.name}'); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = shown
    nt.links.new(t.outputs['Color'], p.inputs['Base Color'])
    o.data.materials.clear(); o.data.materials.append(m)
    for l in [l for l in o.data.uv_layers if l.name != 'bake']: o.data.uv_layers.remove(l)
for l in [x for x in bpy.data.objects if x.type in ('LIGHT', 'CAMERA')]: bpy.data.objects.remove(l)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='WEBP', export_image_quality=82,
                          export_draco_mesh_compression_enable=True, export_materials='EXPORT', export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'room_baked.blend'))
print('EXPORTED', OUT, os.path.getsize(OUT))
