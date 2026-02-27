#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, "src")

const violations = []

const shouldScanFile = (filePath) =>
  filePath.endsWith(".ts") ||
  filePath.endsWith(".tsx") ||
  filePath.endsWith(".js") ||
  filePath.endsWith(".jsx")

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if ([".next", "node_modules"].includes(entry.name)) {
        continue
      }
      walk(fullPath)
      continue
    }

    if (!shouldScanFile(fullPath)) {
      continue
    }

    scanFile(fullPath)
  }
}

const addViolation = (filePath, line, message) => {
  violations.push({
    filePath: path.relative(ROOT, filePath),
    line,
    message,
  })
}

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")

  const isDataLayer = filePath.includes(`${path.sep}src${path.sep}lib${path.sep}data${path.sep}`)

  if (content.includes("sdk.client.fetch(") && !isDataLayer) {
    lines.forEach((lineText, idx) => {
      if (lineText.includes("sdk.client.fetch(")) {
        addViolation(
          filePath,
          idx + 1,
          "`sdk.client.fetch` must live in src/lib/data/* only."
        )
      }
    })
  }

  if (isDataLayer) {
    lines.forEach((lineText, idx) => {
      if (/\bfetch\s*\(/.test(lineText) && !lineText.includes("sdk.client.fetch(")) {
        addViolation(
          filePath,
          idx + 1,
          "Raw `fetch()` detected in data layer. Use Medusa SDK methods or sdk.client.fetch()."
        )
      }
    })
  }

  if (/sdk\.client\.fetch[\s\S]{0,400}?JSON\.stringify\(/.test(content)) {
    const matchLine = lines.findIndex((lineText) => lineText.includes("JSON.stringify("))
    addViolation(
      filePath,
      matchLine >= 0 ? matchLine + 1 : 1,
      "Do not pass JSON.stringify() bodies to sdk.client.fetch(). Pass plain objects."
    )
  }

  const isPricingFile =
    filePath.endsWith(path.join("cart-totals", "index.tsx")) ||
    filePath.endsWith(path.join("shipping", "index.tsx"))

  if (isPricingFile) {
    lines.forEach((lineText, idx) => {
      if (/\/\s*100\b/.test(lineText)) {
        addViolation(
          filePath,
          idx + 1,
          "Found `/100` price scaling heuristic. Backend amounts are source of truth."
        )
      }
    })
  }
}

walk(SRC_DIR)

if (violations.length) {
  console.error("Commerce rule violations found:\n")
  for (const violation of violations) {
    console.error(
      `- ${violation.filePath}:${violation.line} ${violation.message}`
    )
  }
  process.exit(1)
}

console.log("check:commerce-rules passed")
