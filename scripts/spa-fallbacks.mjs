// GitHub Pages has no server-side routing. After the build we copy index.html to:
//  - 404.html, which Pages serves for any unknown path (works, but with a 404 status), and
//  - real folders for the public marketing pages, so they are served with a 200 and can be indexed.
import { copyFileSync, mkdirSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
for (const route of ['experts', 'experts/join']) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('dist/index.html', `dist/${route}/index.html`);
}
console.log('SPA fallbacks written');
