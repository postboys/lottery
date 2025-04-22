import { BuildOptions, build as esbuild } from "esbuild";

const build = async () => {
    const options: BuildOptions = {
        bundle: true,
        entryPoints: ["src/main.ts"],
        outfile: "lib/main.js",
        packages: "external",
        platform: "node",
        target: "node22",
    };

    await esbuild(options);
};

build().catch((e: unknown) => {
    console.error(e);
    process.exit(1);
});
