"""
Semi-realistic surfaces for the room: CC0 Poly Haven scans (blender/assets, not committed)
projected onto the site's geometry. Each scan is tinted so the room keeps its palette:
purple-black walls and floor, warm walnut, persimmon accents.
"""
import bpy, os
import numpy as np
from mathutils import Vector

ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
_cache = {}

def img(name, data=False):
    i = bpy.data.images.load(os.path.join(ASSETS, f'{name}_1k.jpg'), check_existing=True)
    if data: i.colorspace_settings.name = 'Non-Color'
    return i

def mean(name):
    """Average linear colour of a scan, so a tint can aim at an absolute colour."""
    if name not in _cache:
        px = np.array(img(name).pixels[:]).reshape(-1, 4)[::97, :3]
        _cache[name] = px.mean(axis=0)
    return _cache[name]

def scan(name, tex, *, color=None, tint=(1, 1, 1), scale=1.0, normal=0.6, rough=1.0, metallic=0.0, keep_base=False, diff='diff'):
    """A material from a scan, box-projected in object space (the site's meshes have no useful UVs).
    color: the average colour it should end up with; tint: multiplier when color is None.
    keep_base: keep the existing base colour input (e.g. the mat's printed stitches)."""
    m = bpy.data.materials.get(name) if keep_base else None
    if m is None:
        m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    p = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale,) * 3
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    def tex_node(kind, data):
        t = N.new('ShaderNodeTexImage'); t.image = img(f'{tex}_{kind}', data)
        t.projection = 'BOX'; t.projection_blend = 0.25
        L.new(mp.outputs['Vector'], t.inputs['Vector']); return t
    if not keep_base:
        d = tex_node(diff, False)
        mul = N.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1
        if color is not None:
            avg = mean(f'{tex}_{diff}'); tint = [c / max(a, 1e-4) for c, a in zip(color, avg)]
        mul.inputs['B'].default_value = (*tint, 1)
        L.new(d.outputs['Color'], mul.inputs['A']); L.new(mul.outputs['Result'], p.inputs['Base Color'])
    r = tex_node('rough', True)
    rm = N.new('ShaderNodeMath'); rm.operation = 'MULTIPLY'; rm.inputs[1].default_value = rough; rm.use_clamp = True
    L.new(r.outputs['Color'], rm.inputs[0]); L.new(rm.outputs['Value'], p.inputs['Roughness'])
    n = tex_node('nor_gl', True)
    nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = normal
    L.new(n.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], p.inputs['Normal'])
    p.inputs['Metallic'].default_value = metallic
    return m

def principled(o):
    m = o.data.materials[0] if o.data.materials else None
    return m.node_tree.nodes.get('Principled BSDF') if m and m.node_tree else None

def base(o):
    p = principled(o)
    return tuple(p.inputs['Base Color'].default_value[:3]) if p else (0, 0, 0)

MUG = Vector((0.72, -0.12))

def centre(o):
    return o.matrix_world @ (sum((Vector(c) for c in o.bound_box), Vector()) / 8)

def set_mat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)

def apply():
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    part = lambda o: o.name.split('__')[0]
    dims = lambda o: sorted(o.dimensions, reverse=True)

    walnut = scan('walnut', 'american_walnut_veneer', color=(0.1, 0.045, 0.022), scale=0.9, normal=0.35, rough=0.9)
    metal = bpy.data.materials.new('dark_metal'); metal.use_nodes = True
    pm = metal.node_tree.nodes['Principled BSDF']
    pm.inputs['Base Color'].default_value = (0.03, 0.03, 0.035, 1); pm.inputs['Metallic'].default_value = 0.5
    pm.inputs['Roughness'].default_value = 0.38

    for o in meshes:
        d = dims(o); p = part(o)
        if p == 'room':
            if d[0] > 9 and d[1] > 9:                       # floor
                set_mat(o, scan('floor', 'dark_wooden_planks', color=(0.02, 0.015, 0.026), scale=0.45, normal=0.5))
            elif d[0] > 9 and d[1] > 5:                     # wall
                set_mat(o, scan('wall', 'clay_plaster', color=(0.034, 0.024, 0.05), scale=1.4, normal=0.25))
            elif d[0] > 2 and d[1] > 2:                     # the round rug and its ring
                set_mat(o, scan(f'rug_{o.name[-3:]}', 'poly_wool_herringbone', color=base(o), scale=2.5, normal=0.9))
        elif p == 'desk':
            if d[0] > 2:                                    # desk top box + its wood plane
                set_mat(o, walnut)
            elif 0.9 < d[0] < 1 and d[2] > 0.003:           # the mat's slab
                set_mat(o, scan('mat_edge', 'scuba_suede', color=base(o), scale=3, normal=0.5))
            elif 0.9 < d[0] < 1:                            # the mat's printed top (stitches): keep the print
                scan(o.data.materials[0].name, 'scuba_suede', keep_base=True, scale=3, normal=0.5)
            elif d[0] > 0.6:                                # legs and frame
                set_mat(o, metal)
        elif p == 'decor':
            if 1 < d[0] < 1.2:                              # shelf + its wood plane
                set_mat(o, walnut)
            elif (centre(o).xy - MUG).length < 0.06 and 0.002 < d[2] and d[0] < 0.1 and principled(o):  # glazed mug
                principled(o).inputs['Roughness'].default_value = 0.14
            elif (centre(o).xy - MUG).length < 0.01 and principled(o):              # coffee
                principled(o).inputs['Roughness'].default_value = 0.05
        elif p == 'monitor' and '__arm' not in o.name and principled(o) and principled(o).inputs['Metallic'].default_value > 0.5:
            set_mat(o, metal)                               # the arm
