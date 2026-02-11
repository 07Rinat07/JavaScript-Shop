#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const [, , fromArg = '.env.example', toArg = '.env'] = process.argv

const sourcePath = path.resolve(process.cwd(), fromArg)
const targetPath = path.resolve(process.cwd(), toArg)

if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`)
    process.exit(1)
}

if (fs.existsSync(targetPath)) {
    console.log(`Already exists: ${targetPath}`)
    process.exit(0)
}

fs.copyFileSync(sourcePath, targetPath)
console.log(`Created: ${targetPath}`)
