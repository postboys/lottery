const esbuild = require("esbuild");
const path = require("node:path");

const rootPath = path.dirname(__dirname);

esbuild.build({
    bundle: true,
    entryPoints: [path.resolve(rootPath, "src/app.js")],
    minify: true,
    outfile: path.resolve(rootPath, "index.js"),
    packages: "external",
    platform: "node",
    target: "node20",
});
