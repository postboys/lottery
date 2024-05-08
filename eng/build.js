const esbuild = require("esbuild");
const path = require("node:path");

const rootPath = path.dirname(__dirname);

esbuild.build({
    platform: "node",
    entryPoints: [path.resolve(rootPath, "src/app.js")],
    outfile: path.resolve(rootPath, "index.js"),
    bundle: true,
    packages: "external",
    target: "node20",
    minify: true,
});
