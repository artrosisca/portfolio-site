"""Renders the landing view in two candidate art directions (STYLE=real|toon)."""
import bpy, os, math
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(HERE, 'assets')
STYLE = os.environ.get('STYLE', 'real')
sc = bpy.context.scene
DESK_Y = 0.76

def meshes(part=None): return [o for o in bpy.data.objects if o.type == 'MESH' and (part is None or o.name.split('__')[0] == part)]
def near(v, t, e=0.02): return abs(v - t) < e
desk_top = next(o for o in meshes('desk') if near(o.dimensions.x, 2.17) and near(o.dimensions.y, 1.02))
mat_top = next(o for o in meshes('desk') if near(o.dimensions.x, 0.944, 0.01) and o.dimensions.z < 0.002)
wall = next(o for o in meshes('room') if o.dimensions.y < 0.01 and o.dimensions.z > 5)

def pbr(name, base, scale, rough=None, nor=None, tint=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; p = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = scale
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    def img(f, color):
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(A, f))
        if not color: t.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(mp.outputs['Vector'], t.inputs['Vector']); return t
    b = img(base, True)
    if tint:
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1
        nt.links.new(b.outputs['Color'], mix.inputs['A']); mix.inputs['B'].default_value = tint
        nt.links.new(mix.outputs['Result'], p.inputs['Base Color'])
    else: nt.links.new(b.outputs['Color'], p.inputs['Base Color'])
    if rough: nt.links.new(img(rough, False).outputs['Color'], p.inputs['Roughness'])
    if nor:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(img(nor, False).outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], p.inputs['Normal'])
    return m

def flat(name, rgb, rough=0.85):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*[c ** 2.2 for c in rgb], 1); p.inputs['Roughness'].default_value = rough
    return m

def assign(o, m): o.data.materials.clear(); o.data.materials.append(m)

if STYLE == 'real':
    assign(desk_top, pbr('walnut', 'american_walnut_veneer_diff_1k.jpg', (2.2, 1.0, 1), 'american_walnut_veneer_rough_1k.jpg', 'american_walnut_veneer_nor_gl_1k.jpg'))
    assign(mat_top, pbr('leather', 'brown_leather_albedo_1k.jpg', (2.0, 0.9, 1), 'brown_leather_rough_1k.jpg', 'brown_leather_nor_gl_1k.jpg', tint=(0.12, 0.11, 0.12, 1)))
    assign(wall, pbr('plaster', 'clay_plaster_diff_1k.jpg', (6, 3.6, 1), 'clay_plaster_rough_1k.jpg', 'clay_plaster_nor_gl_1k.jpg', tint=(0.32, 0.27, 0.4, 1)))
    # an artist-made plant in place of the procedural one
    for o in meshes('plant'): o.hide_render = True
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(A, 'potted_plant_02', 'potted_plant_02_1k.gltf'))
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    zmax = max((o.matrix_world @ Vector(c)).z for o in new for c in o.bound_box)
    root = [o for o in bpy.data.objects if o not in before and o.parent is None]
    for r in root:
        r.scale = [1.35 / zmax] * 3; r.location = (-1.45, 0.38, 0)
else:
    # stylised: flat warm colours, matte materials, drawn outlines
    pal = {'desk': (0.78, 0.46, 0.27), 'room': (0.2, 0.16, 0.27)}
    assign(desk_top, flat('t_wood', (0.80, 0.47, 0.28), 0.7))
    assign(mat_top, flat('t_mat', (0.16, 0.15, 0.19)))
    assign(wall, flat('t_wall', (0.24, 0.19, 0.33)))
    for o in meshes():
        for m in o.data.materials:
            p = m and m.use_nodes and m.node_tree.nodes.get('Principled BSDF')
            if p and not p.inputs['Base Color'].is_linked:
                p.inputs['Roughness'].default_value = max(0.75, p.inputs['Roughness'].default_value)
                p.inputs['Metallic'].default_value = 0
    sc.render.use_freestyle = True
    fs = sc.view_layers[0].freestyle_settings
    ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('lines')
    if not ls.linestyle: ls.linestyle = bpy.data.linestyles.new('ink')
    ls.linestyle.color = (0.04, 0.03, 0.06); ls.linestyle.thickness = 1.4
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = 1.4

sc.render.resolution_x, sc.render.resolution_y = 1200, 750
sc.cycles.samples = 96
sc.render.filepath = f'/tmp/style_{STYLE}.jpg'
sc.render.image_settings.file_format = 'JPEG'
bpy.ops.render.render(write_still=True)
print('RENDERED', sc.render.filepath)
