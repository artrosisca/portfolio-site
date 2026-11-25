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
SIZES = {'room': 2048, 'desk': 2048, 'decor': 2048, 'monitor': 1024, 'keyboard': 1024, 'lamp': 1024, 'guitar': 1024, 'plant': 1024, 'cube': 512, 'art': 2048, 'rug': 1024, 'records': 1024, 'pothos': 2048, 'notes': 1024}
# share of triangles kept per part: detail the camera never gets close enough to see
DECIMATE = {'cube': float(os.environ.get('DEC_CUBE', 0.15)), 'lamp': float(os.environ.get('DEC_LAMP', 0.4)),
            'keyboard': float(os.environ.get('DEC_KB', 0.6)), 'plant': float(os.environ.get('DEC_PLANT', 0.6)),
            'decor': float(os.environ.get('DEC_DECOR', 0.6))}

sc = bpy.context.scene
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = False
b = sc.render.bake
b.use_pass_direct = b.use_pass_indirect = True
b.use_pass_diffuse = b.use_pass_emit = b.use_pass_transmission = True
b.use_pass_glossy = os.environ.get("BAKE_GLOSSY", "1") == "1"  # rough sheen on dark surfaces is most of their light; sharp highlights get blurred
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

def lighten(o, ratio):
    """Welds coincident vertices (flat-shaded parts arrive with every face apart) and decimates."""
    import bmesh
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(o.data); bm.free()
    if ratio < 1:
        d = o.modifiers.new('dec', 'DECIMATE'); d.ratio = ratio; d.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=d.name)

# every place the camera can be: the orbit around the screen (CameraRig) from the widest, most
# sideways start down to the screen, plus the pointer sway. Visibility from a point is linear in
# it, so testing the corners of this region covers everything inside.
def _cams():
    import math
    from mathutils import Vector
    screen = Vector((0, 0.3, 1.17))
    for az in (-1.1, -0.5, 0.15):
        for el in (-0.05, 0.55):
            for r in (0.4, 4.9):
                d = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
                yield screen + d * r
CAMS = list(_cams())

def cull_back(o):
    """On closed solids, drops faces that point away from every camera position: the backs of
    frames, books and sleeves against the wall, the far sides of boxes. Open sheets (leaves,
    blades, paper) are left alone, since the site draws both their sides."""
    import bmesh
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    if not bm.edges or not all(e.is_manifold for e in bm.edges):
        bm.free(); return
    mw = o.matrix_world; m3 = mw.to_3x3()
    dead = []
    for f in bm.faces:
        n = (m3 @ f.normal).normalized(); c = mw @ f.calc_center_median()
        if all(n.dot(C - c) <= 0 for C in CAMS): dead.append(f)
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
    for o in group: cull_back(o); o.select_set(True)
    bpy.context.view_layer.objects.active = group[0]
    if len(group) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    o.name = part
    tris = len(o.data.loop_triangles) if o.data.calc_loop_triangles() is None else 0
    lighten(o, DECIMATE.get(part, 1)); o.data.calc_loop_triangles()
    print(f'MESH {part} {tris} -> {len(o.data.loop_triangles)} tris', flush=True)
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
                          export_draco_mesh_compression_enable=True, export_materials='EXPORT', export_yup=True,
                          export_normals=False)  # drawn unlit on the site: normals are dead weight
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'room_baked.blend'))
print('EXPORTED', OUT, os.path.getsize(OUT))
