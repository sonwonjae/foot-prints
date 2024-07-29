/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: [
        "@foot-prints/eslint-config/next",
        "plugin:@tanstack/eslint-plugin-query/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
    },
};
