import * as THREE from 'three';

// Small procedural textures drawn once on a canvas: detail without downloading images.

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Walnut-ish grain running along x. Tint it with the material color. */
export function woodTexture(seed = 1) {
  let s = seed * 9301;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return canvasTexture(1024, 256, (ctx) => {
    ctx.fillStyle = '#c99a6e';
    ctx.fillRect(0, 0, 1024, 256);
    // broad colour bands
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? '90,55,30' : '235,200,160'},${0.05 + rnd() * 0.08})`;
      ctx.fillRect(0, rnd() * 256, 1024, 6 + rnd() * 30);
    }
    // fine grain lines
    for (let i = 0; i < 140; i++) {
      const y0 = rnd() * 256;
      const amp = 1 + rnd() * 5;
      const f = 0.002 + rnd() * 0.006;
      const ph = rnd() * 10;
      ctx.strokeStyle = `rgba(70,40,20,${0.08 + rnd() * 0.22})`;
      ctx.lineWidth = 0.5 + rnd() * 1.4;
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 16) ctx.lineTo(x, y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1) * amp * 0.3);
      ctx.stroke();
    }
    // a couple of knots
    for (let k = 0; k < 2; k++) {
      const x = 150 + rnd() * 700;
      const y = 40 + rnd() * 170;
      for (let r = 2; r < 18; r += 3) {
        ctx.strokeStyle = `rgba(70,40,20,${0.25 - r * 0.01})`;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 2.6, r * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });
}

/** Felt desk mat with a stitched edge. */
export function feltTexture(stitch: string) {
  return canvasTexture(1024, 448, (ctx) => {
    ctx.fillStyle = '#1b1f29';
    ctx.fillRect(0, 0, 1024, 448);
    const img = ctx.getImageData(0, 0, 1024, 448);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    ctx.strokeStyle = stitch;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 9]);
    ctx.beginPath();
    ctx.roundRect(16, 16, 1024 - 32, 448 - 32, 14);
    ctx.stroke();
  });
}

/** A sticky note with a handwritten-ish line or two. */
export function noteTexture(bg: string, lines: string[]) {
  return canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 256);
    const g = ctx.createLinearGradient(0, 0, 0, 60);
    g.addColorStop(0, 'rgba(0,0,0,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 60);
    ctx.fillStyle = '#23242c';
    ctx.font = 'italic 600 34px "Inter Variable", sans-serif';
    ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, 22, 60 + i * 46));
  });
}

/** Soft round sprite, for dust motes and steam puffs. */
export function softDot() {
  return canvasTexture(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
}
