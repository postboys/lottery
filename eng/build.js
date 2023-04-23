const { build } = require('esbuild')
const fs = require('node:fs/promises')
const JSZIP = require('jszip')
const pkg = require('../package.json', 'json')

const tag = process.argv[2]
if (!tag) {
  console.error('Usage: npm run build <tag>\n')
  process.exit(1)
}

const buildCode = async () => {
  const { outputFiles } = await build({
    platform: 'node',
    entryPoints: ['src/app.js'],
    format: 'cjs',
    bundle: true,
    logLevel: 'info',
    minify: true,
    target: 'node16.13',
    write: false,
    outdir: './',
    external: Object.keys(pkg.dependencies)
  })
  const result = {}
  outputFiles.forEach(output => {
    const key = output.path.split('/').pop()
    result[key] = output.contents
  })
  return result
}

const compress = async (buildResult) => {
  for (const key in buildResult) {
    const value = buildResult[key]
    const zip = new JSZIP()
    zip.file('app.js', value)
    zip.file('package.json', JSON.stringify(pkg))
    const zipFile = await zip.generateAsync({ type: 'nodebuffer' })
    const filename = `${pkg.name}-${tag}.zip`
    await fs.writeFile(filename, zipFile)
  }
}

const publish = async () => {
  const buildResult = await buildCode()
  await compress(buildResult)
}

publish()
