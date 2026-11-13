import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outDir = resolve('..', 'frontend');
const assetsDir = resolve(outDir, 'assets');
let html = await readFile(resolve(outDir, 'index.html'), 'utf8');
const assets = await readdir(assetsDir);

for (const asset of assets) {
  if (asset.endsWith('.css')) {
    const css = await readFile(resolve(assetsDir, asset), 'utf8');
    html = html.replace(
      new RegExp(`<link[^>]+href=["'][^"']*${asset}["'][^>]*>`),
      () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`
    );
  }
  if (asset.endsWith('.js')) {
    const javascript = await readFile(resolve(assetsDir, asset), 'utf8');
    html = html.replace(
      new RegExp(`<script[^>]+src=["'][^"']*${asset}["'][^>]*></script>`),
      () => `<script type="module">${javascript.replace(/<\/script/gi, '<\\/script')}</script>`
    );
  }
}

await writeFile(resolve(outDir, 'index.html'), html, 'utf8');
