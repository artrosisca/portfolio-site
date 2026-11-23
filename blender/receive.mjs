// Dev helper: receives the .glb posted by ExportScene (?export) and writes it next to this file.
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';
createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.end();
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const file = new URL('./scene.glb', import.meta.url);
    writeFileSync(file, Buffer.concat(chunks));
    console.log('wrote', file.pathname, Buffer.concat(chunks).length);
    res.end('ok');
  });
}).listen(4399, () => console.log('listening on 4399'));
