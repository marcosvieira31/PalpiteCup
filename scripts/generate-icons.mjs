import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#22c55e"/>
  <circle cx="256" cy="220" r="120" fill="#facc15" stroke="#1e3a8a" stroke-width="12"/>
  <text x="256" y="200" font-family="Arial Black" font-size="80" font-weight="900"
    fill="#1e3a8a" text-anchor="middle" dominant-baseline="middle">PC</text>
  <text x="256" y="420" font-family="Arial Black" font-size="52" font-weight="900"
    fill="#facc15" text-anchor="middle">2026</text>
</svg>`

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icons/icon-512.png')

console.log('✅ Ícones gerados!')
