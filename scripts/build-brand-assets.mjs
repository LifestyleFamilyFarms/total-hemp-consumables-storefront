#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE_DIR = path.join(ROOT, "public", "logos", "LOGOS_ICONS_WEB")
const OUTPUT_DIR = path.join(ROOT, "public", "logos", "optimized")
const MANIFEST_PATH = path.join(ROOT, "src", "lib", "brand", "brand-assets.json")

const SUPPORTED_EXT = new Set([".gif", ".jpg", ".jpeg", ".png"])
const SIZE_PRESETS = [
  { label: "orig", width: null },
  { label: "md", width: 256 },
]

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

function describeAsset(baseName) {
  const tokens = baseName.split(/[_-]+/).filter(Boolean)
  const id = tokens.join("-").toLowerCase()

  const background = /nobg/i.test(baseName)
    ? "transparent"
    : /wbg/i.test(baseName)
      ? "light"
      : "unspecified"

  const hasTagline = /tagline/i.test(baseName)
  const markType = /icon/i.test(baseName) ? "icon" : "logo"
  const orientation = /horizontal/i.test(baseName) ? "horizontal" : "stacked"
  const hasTrademark = !/notm/i.test(baseName)

  let palette = "full-color"
  if (/grey/i.test(baseName)) palette = "grey"
  else if (/bw/i.test(baseName)) palette = "black-white"
  else if (/color/i.test(baseName)) palette = "full-color"

  const collection = baseName.startsWith("DB_") ? "dark-block" : "standard"

  const label = tokens
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ")

  return {
    id,
    label,
    meta: {
      baseName,
      collection,
      palette,
      background,
      orientation,
      markType,
      hasTagline,
      hasTrademark,
    },
  }
}

async function convertAsset(fileName) {
  const ext = path.extname(fileName)
  if (!SUPPORTED_EXT.has(ext.toLowerCase())) return null

  const inputPath = path.join(SOURCE_DIR, fileName)
  const baseName = path.basename(fileName, ext)
  const outputDir = path.join(OUTPUT_DIR, baseName)
  await ensureDir(outputDir)

  const descriptor = describeAsset(baseName)
  const outputs = {}

  for (const preset of SIZE_PRESETS) {
    const sizeLabel = preset.label
    const pngPath = path.join(outputDir, `${sizeLabel}.png`)
    const webpPath = path.join(outputDir, `${sizeLabel}.webp`)

    let pipeline = sharp(inputPath, { animated: true }).ensureAlpha()
    if (preset.width) {
      pipeline = pipeline.resize({ width: preset.width, withoutEnlargement: true })
    }
    await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngPath)

    pipeline = sharp(inputPath, { animated: true }).ensureAlpha()
    if (preset.width) {
      pipeline = pipeline.resize({ width: preset.width, withoutEnlargement: true })
    }
    await pipeline.webp({ quality: 90, effort: 6 }).toFile(webpPath)

    const meta = await sharp(pngPath).metadata()
    outputs[sizeLabel] = {
      width: meta.width,
      height: meta.height,
      png: `/logos/optimized/${baseName}/${sizeLabel}.png`,
      webp: `/logos/optimized/${baseName}/${sizeLabel}.webp`,
    }
  }

  return {
    ...descriptor,
    source: `/logos/LOGOS_ICONS_WEB/${fileName}`,
    outputs,
  }
}

async function main() {
  await ensureDir(OUTPUT_DIR)
  const files = await fs.readdir(SOURCE_DIR)
  const manifestEntries = []

  for (const file of files) {
    const entry = await convertAsset(file)
    if (entry) {
      manifestEntries.push(entry)
      console.log(`✔ Processed ${file}`)
    } else {
      console.log(`• Skipped ${file}`)
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: "/logos/LOGOS_ICONS_WEB",
    outputDir: "/logos/optimized",
    sizes: SIZE_PRESETS,
    assets: manifestEntries.sort((a, b) => a.id.localeCompare(b.id)),
  }

  await ensureDir(path.dirname(MANIFEST_PATH))
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\nManifest written to ${path.relative(ROOT, MANIFEST_PATH)}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
