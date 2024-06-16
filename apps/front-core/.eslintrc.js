/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["@foot-prints/eslint-config/next"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
    },
};
