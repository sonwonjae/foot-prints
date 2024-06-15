export const STYLED_SYNTAX_MAP = {
	italic: '*',
	bold: '**',
	'strike-through': '~~',
	code: '`',
	highlight: '==',
};
export type StyledTextType = keyof typeof STYLED_SYNTAX_MAP;
