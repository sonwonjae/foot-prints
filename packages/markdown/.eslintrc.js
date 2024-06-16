/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	extends: ['@foot-prints/eslint-config/react-internal'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
};
