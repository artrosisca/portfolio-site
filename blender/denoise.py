"""
Denoises baked textures in place with Blender's compositor (OIDN). Bakes aren't denoised by
Cycles, so fewer samples + this beats many samples.
Run: blender --background --factory-startup --python blender/denoise.py -- a.png b.png ...
"""
import bpy, sys
files = sys.argv[sys.argv.index('--') + 1:]
sc = bpy.context.scene
tree = bpy.data.node_groups.new('den', 'CompositorNodeTree')
sc.compositing_node_group = tree
n_img = tree.nodes.new('CompositorNodeImage')
n_den = tree.nodes.new('CompositorNodeDenoise')
out = tree.nodes.new('NodeGroupOutput')
tree.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
tree.links.new(n_img.outputs['Image'], n_den.inputs['Image'])
tree.links.new(n_den.outputs['Image'], out.inputs[0])
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'Standard'
for f in files:
    img = bpy.data.images.load(f)
    n_img.image = img
    sc.render.resolution_x, sc.render.resolution_y = img.size
    sc.render.filepath = f
    bpy.ops.render.render(write_still=True)
    print('DENOISED', f, flush=True)
