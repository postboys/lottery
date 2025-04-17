const typescript = require("@camaro/eslint-config/ts");
const globals = require("globals");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
    ...typescript,
    { ignores: ["lib/**", "out/**"] },
    {
        files: ["eng/**/*.js"],
        languageOptions: { globals: { ...globals.node } },
    },
];
