#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE_DIR = path.join(ROOT, "assets", "brand", "LOGOS_ICONS_WEB")
const SVG_DIR = path.join(ROOT, "public", "logos", "svg")
const MANIFEST_PATH = path.join(ROOT, "src", "lib", "brand", "brand-assets.json")
const SOURCE_MANIFEST_DIR = "assets/brand/LOGOS_ICONS_WEB"

const SUPPORTED_EXT = new Set([".gif", ".jpg", ".jpeg", ".png"])
const SIZE_PRESETS = [
  { label: "orig", width: null },
  { label: "md", width: 256 },
]

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

function getSvgCandidates(baseName) {
  const normalized = baseName
    .replace(/_(?:NObgWEB|WbgWEB)$/i, "_PRINT")
    .replace(/(?:noBGWEB|wBGWEB)$/i, "_PRINT")

  const candidates = new Set([`${normalized}.svg`])

  if (normalized.startsWith("DB_GREY_")) {
    candidates.add(`${normalized.replace(/^DB_GREY_/, "GREY_")}.svg`)
  }
  if (normalized.startsWith("DB_")) {
    candidates.add(`${normalized.replace(/^DB_/, "")}.svg`)
  }

  return [...candidates]
}

function resolveSvgPath(baseName, availableSvgFiles) {
  const svgFile = getSvgCandidates(baseName).find((candidate) =>
    availableSvgFiles.has(candidate)
  )

  if (!svgFile) {
    return null
  }

  return `/logos/svg/${svgFile}`
}

function toAbsolutePublicPath(publicPath) {
  return path.join(ROOT, "public", publicPath.replace(/^\//, ""))
}

function deriveSizeFromMeta(meta, targetWidth) {
  if (!meta.width || !meta.height) {
    return {
      width: targetWidth ?? 0,
      height: targetWidth ?? 0,
    }
  }

  if (!targetWidth) {
    return {
      width: meta.width,
      height: meta.height,
    }
  }

  const width = Math.min(targetWidth, meta.width)
  const ratio = meta.height / meta.width

  return {
    width,
    height: Math.max(1, Math.round(width * ratio)),
  }
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

async function convertAsset(fileName, availableSvgFiles) {
  const ext = path.extname(fileName)
  if (!SUPPORTED_EXT.has(ext.toLowerCase())) return null

  const baseName = path.basename(fileName, ext)
  const svgPath = resolveSvgPath(baseName, availableSvgFiles)
  if (!svgPath) {
    throw new Error(
      `Missing matching SVG for ${fileName}. Add SVG export in public/logos/svg before running brand:build.`
    )
  }
  const svgMeta = await sharp(toAbsolutePublicPath(svgPath)).metadata()

  const descriptor = describeAsset(baseName)
  const outputs = {}

  for (const preset of SIZE_PRESETS) {
    const sizeLabel = preset.label
    const derivedSize = deriveSizeFromMeta(svgMeta, preset.width)
    outputs[sizeLabel] = {
      width: derivedSize.width,
      height: derivedSize.height,
      svg: svgPath,
    }
  }

  return {
    ...descriptor,
    source: `${SOURCE_MANIFEST_DIR}/${fileName}`,
    outputs,
  }
}

async function main() {
  try {
    await fs.access(SOURCE_DIR)
  } catch {
    throw new Error(
      `Brand source directory is missing: ${SOURCE_DIR}\n` +
        "Restore it or add new source assets before running `yarn brand:build`."
    )
  }

  const availableSvgFiles = new Set(
    await fs.readdir(SVG_DIR).catch(() => [])
  )
  if (availableSvgFiles.size === 0) {
    throw new Error(
      `SVG directory is missing or empty: ${SVG_DIR}\n` +
        "Add logo SVG exports in public/logos/svg before running `yarn brand:build`."
    )
  }
  const files = await fs.readdir(SOURCE_DIR)
  const manifestEntries = []

  for (const file of files) {
    const entry = await convertAsset(file, availableSvgFiles)
    if (entry) {
      manifestEntries.push(entry)
      console.log(`✔ Processed ${file}`)
    } else {
      console.log(`• Skipped ${file}`)
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: SOURCE_MANIFEST_DIR,
    outputDir: "/logos/svg",
    sizes: SIZE_PRESETS,
    svgFiles: [...availableSvgFiles].sort(),
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
