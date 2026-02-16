/**
 * Copies real images from src/image/ to public/image/ before build.
 * This ensures deployment serves real images instead of 1x1 transparent placeholders.
 * Run this in the build step before `vite build`.
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcImageDir = join(root, 'src', 'image')
const publicImageDir = join(root, 'public', 'image')

if (!existsSync(srcImageDir)) {
  console.warn('scripts/copy-images-to-public.mjs: src/image not found, skipping.')
  process.exit(0)
}

if (!existsSync(publicImageDir)) {
  mkdirSync(publicImageDir, { recursive: true })
}

const files = readdirSync(srcImageDir)
let copied = 0
for (const name of files) {
  const srcPath = join(srcImageDir, name)
  const destPath = join(publicImageDir, name)
  copyFileSync(srcPath, destPath)
  copied++
}

if (copied > 0) {
  console.log('Copied', copied, 'image(s) from src/image to public/image')
}
