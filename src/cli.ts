#!/usr/bin/env node

import path, { format } from 'path'
import JoyCon from 'joycon'
import fs from 'fs-extra'
import { cac } from 'cac'
import { bundleRequire } from 'bundle-require'
import kebab from 'lodash/kebabCase'
import identity from 'lodash/identity'
import mapKeys from 'lodash/mapKeys'

const canonicalFilenames = {
  prettier: '.prettierrc',
  npm: '.npmrc',
}

const fileFormat = {
  prettier: 'json',
  npm: 'key-value',
}

const keyTransform = {
  prettier: identity,
  npm: kebab,
}

const formatConfig = (configName, config) => {
  const mappedConfig = mapKeys(config, (_, key) =>
    keyTransform[configName](key)
  )

  switch (fileFormat[configName]) {
    case 'key-value':
      return Object.entries(mappedConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
    case 'json':
    default:
      return JSON.stringify(mappedConfig, null, 2)
  }
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
    const formattedConfig = formatConfig(configName, config)

    jobs.push(fs.writeFile(path.resolve(outPath, filename), formattedConfig))
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
