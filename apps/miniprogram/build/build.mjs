// Build the mini program's JavaScript (committed, so WeChat DevTools can open the folder as is):
//  1. the pattern engine (packages/pattern-engine) bundled into miniprogram/lib/engine.js
//  2. every page / util .ts compiled 1:1 into a .js next to it (CommonJS, ES2018 syntax)
// Run after changing any .ts here or the engine:  pnpm --filter miniprogram build
import { build } from 'esbuild'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../miniprogram/', import.meta.url).pathname

await build({
  entryPoints: [new URL('./engine.ts', import.meta.url).pathname],
  bundle: true,
  platform: 'neutral',
  format: 'cjs',
  target: 'es2018',
  mainFields: ['module', 'main'],
  outfile: join(root, 'lib/engine.js'),
  legalComments: 'none',
  logLevel: 'warning',
})

const ts = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.ts') && !f.endsWith('.d.ts')) ts.push(p)
  }
}
walk(root)

await build({
  entryPoints: ts,
  outdir: root,
  outbase: root,
  bundle: false,
  format: 'cjs',
  platform: 'neutral',
  target: 'es2018',
  logLevel: 'warning',
})
console.log(`mini program: engine + ${ts.length} files compiled`)
