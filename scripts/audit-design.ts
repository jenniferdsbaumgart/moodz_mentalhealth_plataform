/**
 * Script para auditar inconsistências de design
 * Execute com: npx ts-node scripts/audit-design.ts
 */

import { glob } from "glob"
import * as fs from "fs"

const patterns = {
  // Espaçamentos inconsistentes
  spacingIssues: /space-[xy]-[1357]/g, // Usar 2, 4, 6, 8
  // Padding inconsistente
  paddingIssues: /\bp-[1357]\b/g,
  // Gap inconsistente
  gapIssues: /gap-[1357]/g,
  // Cores hardcoded
  hardcodedColors: /#[0-9a-fA-F]{3,6}/g,
  // Text sizes hardcoded
  textSizeIssues: /text-\[[\d]+px\]/g,
}

async function audit() {
  const files = await glob("src/**/*.tsx")
  const issues: { file: string; line: number; issue: string; match: string }[] = []

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    const lines = content.split("\n")

    lines.forEach((line, index) => {
      for (const [name, pattern] of Object.entries(patterns)) {
        const matches = line.match(pattern)
        if (matches) {
          matches.forEach(match => {
            issues.push({
              file,
              line: index + 1,
              issue: name,
              match,
            })
          })
        }
      }
    })
  }

  console.log("=== Design Audit Results ===\n")

  if (issues.length === 0) {
    console.log("✅ No issues found!")
  } else {
    console.log(`Found ${issues.length} potential issues:\n`)
    issues.forEach(({ file, line, issue, match }) => {
      console.log(`${file}:${line} - ${issue} (${match})`)
    })
  }
}

audit().catch(console.error)
