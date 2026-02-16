/**
 * DEV ONLY: Ensures placeholder images exist so images show when real files are missing.
 * Creates 1x1 transparent PNGs — invisible. Do NOT run in production build.
 * For deployment, use: npm run build (which runs copy-images-to-public.mjs to copy real images to public/image/).
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const imageDir = join(root, 'public', 'image')

// Minimal 1x1 transparent PNG (67 bytes)
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADBgGApJ5fDAAAAABJRU5ErkJggg==',
  'base64'
)

const required = [
  'laptop.jpg',
  'programmer.jpg',
  'women.jpg',
  'scaladev.jpg',
  'cbrilliance.png',
  'whitelady.jpg',
  'group.jpg',
  'selfie.jpg',
  'blacknative.jpg',
  'filmconvert.jpg',
  'AfrESH-LOGO.png',
  'GeniusWav-LOGO.png',
  'cbrilliance-LOGO.png',
  'photographyWhite.jpg',
  'photographyBlack.jpg',
  'Darkprojrct.jpg',
  'Afr-Logo.jpg',
]

if (!existsSync(imageDir)) {
  mkdirSync(imageDir, { recursive: true })
}

for (const name of required) {
  const path = join(imageDir, name)
  if (!existsSync(path)) {
    writeFileSync(path, minimalPng)
    console.log('Created placeholder:', name)
  }
}
