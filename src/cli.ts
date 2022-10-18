#!/usr/bin/env node

import path from 'path'
import JoyCon from 'joycon'
import fs from 'fs-extra'
import { cac } from 'cac'
import { bundleRequire } from 'bundle-require'

const canonicalFilenames = {
  prettier: '.prettierrc',
}

async function generate() {
  const configJoycon = new JoyCon()

  const configPath = await configJoycon.resolve({
    files: ['.brrrr.ts', '.brrrr.js'],
    cwd: process.cwd(),
    stopDir: path.parse(process.cwd()).root,
  })

  const config = await bundleRequire({
    filepath: configPath,
  })

  const resolvedConfig = {
    path: configPath,
    data: config.mod.brrrr || config.mod.default || config.mod,
  }

  const outPath = path.resolve(process.cwd())
  await fs.mkdirp(outPath)

  const jobs: Promise<void>[] = []

  for (let [configName, config] of Object.entries(resolvedConfig.data)) {
    const filename = canonicalFilenames[configName]

    jobs.push(fs.writeJson(path.resolve(outPath, filename), config))
  }

  await Promise.all(jobs)
}

async function run() {
  const pkgPath = path.join(__dirname, '../package.json')
  const version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version

  const cli = cac('brrrr')

  cli.command('').action(generate)
  cli.version(version)
  cli.parse(process.argv, { run: false })
  cli.help()

  await cli.runMatchedCommand()
}

run()
