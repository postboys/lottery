const common = require("@camaro/eslint-config");
const globals = require("globals");

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    ...common,
    {
        files: ["eng/**/*.js", "src/**/*.js"],
        languageOptions: { globals: { ...globals.node } },
    },
];
