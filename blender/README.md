# Quarto com luz assada (Blender)

O quarto do site é modelado em código (`src/components/intro/objects`). A iluminação é feita
no Blender e "assada" em texturas: o navegador só desenha texturas, sem calcular luz nem
sombra. Fica mais bonito (luz rebatida, sombras suaves) e bem mais leve.

Blender usado: 5.3 (`~/Applications/blender-5.3.0-linux-x64/blender`, abreviado `blender` abaixo).

## Modelos e materiais

- `models/sofle.py`, `models/mouse.py`: o teclado (Sofle, teclas KLP Lamé) e o mouse (VXE R1 Pro Max)
  modelados em código.
- `models/props.py`: troca a luminária e as plantas do site por modelos CC0 do Poly Haven.
- `models/materials.py`: superfícies escaneadas (nogueira, reboco, piso, lã, camurça), tingidas
  para manter a paleta do quarto.

Os arquivos do Poly Haven ficam em `blender/assets/` (fora do git, resolução 1k):
texturas `american_walnut_veneer`, `clay_plaster`, `dark_wooden_planks`, `poly_wool_herringbone`,
`scuba_suede` (`<nome>_diff|rough|nor_gl_1k.jpg`) e os modelos glTF `desk_lamp_arm_01`,
`potted_plant_02`, `potted_plant_04` (cada um na sua pasta).
As capas dos discos (do acervo do Arthur) ficam em `blender/assets/covers/` (`perola_negra`, `cartola`,
`construcao`, `elis`, `alcione`, PNG quadrado); sem elas, `wall_shelf.py` usa os pôsteres desenhados por `art.py`. Para baixar, use a API pública:
`https://api.polyhaven.com/files/<nome>`.

## Fluxo

1. **Exportar o quarto do site** (`scene.glb`)
   ```sh
   node blender/receive.mjs          # escuta na porta 4399
   # abra http://localhost:4321/?export com o `astro dev` rodando
   ```
   `src/components/intro/exportScene.tsx` (só em dev) envia a cena como `.glb`.

2. **Montar a cena iluminada** (`room.blend`)
   ```sh
   blender --background --python blender/build.py
   ```
   Importa o `scene.glb`, cria as luzes (luminária, luar, brilhos) e a câmera da landing.
   Para conferir a iluminação antes de assar:
   ```sh
   blender --background blender/room.blend --render-output /tmp/prev_ --render-format JPEG -f 1
   ```
   O `room.blend` também pode ser aberto e ajustado à mão no Blender.

3. **Assar e exportar** (`public/room/room.glb`)
   ```sh
   BAKE_SCALE=1 BAKE_SAMPLES=48 blender --background blender/room.blend --python blender/bake.py
   ```
   Junta cada parte num objeto, apaga faces que a câmera nunca vê, desdobra UVs, assa a luz
   no Cycles, tira o ruído (`denoise.py`, OIDN) e exporta com texturas WebP e malha Draco.
   `BAKE_SCALE=0.25 BAKE_SAMPLES=16` faz uma versão rápida para testar (cerca de 20s).

No site, `BakedRoom.tsx` carrega o `.glb` e escurece as texturas enquanto a luminária está
apagada. A tela do monitor, a poeira e o vapor continuam ao vivo, em código.
