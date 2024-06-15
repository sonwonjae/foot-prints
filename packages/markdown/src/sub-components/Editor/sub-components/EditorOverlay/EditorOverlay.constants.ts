import { cn } from '@/utils/tailwindcss';

export const styledTextRegExp =
	/(!\[.*?\]\(.*?\))|(\[.*?\]\(.*?\))|(==[^\s]*==)|(`[^\s]*`)|(~~[^\s]*~~)|(\*\*\*[^*|^\s]*\*\*\*)|(\*\*[^*|^\s]*\*\*)|(\*[^*|^\s]*\*)/g;

export const textCommonClassName = cn(
	'whitespace-pre-wrap',
	'break-words',
	'font-sans',
	'min-h-[1.5em]',
	'tracking-widest',
	'text-slate-600',
);
