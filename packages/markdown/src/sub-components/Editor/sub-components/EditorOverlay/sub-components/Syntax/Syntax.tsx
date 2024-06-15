import {
	getMarkdownType,
	parseToPureMarkdown,
	splitMarkdownOfSyntax,
} from '@/utils/parse';
import { cn } from '@/utils/tailwindcss';
import { textCommonClassName } from '../../EditorOverlay.constants';

interface SyntaxProps {
	markdownType: ReturnType<typeof getMarkdownType>;
	children: string;
}

function Syntax({ markdownType, children: markdown }: SyntaxProps) {
	const pureMarkdown = parseToPureMarkdown(markdown);

	const isHeadingTag = /^(h[1-6])$/.test(markdownType);

	const { syntax } = splitMarkdownOfSyntax(pureMarkdown);

	if (markdownType === 'cli-f') {
		return (
			<span className={cn('inline-block', 'h-full', 'text-slate-400')}>
				- [
				<span className={cn('drop-shadow-bold', 'text-slate-800')}>
					x
				</span>
				]{' '}
			</span>
		);
	}
	if (!syntax) {
		return null;
	}

	return (
		<span
			className={cn(
				textCommonClassName,
				'inline-block',
				'h-full',
				'text-slate-400',
				isHeadingTag && 'drop-shadow-bold',
				isHeadingTag && 'text-slate-800',
			)}
		>
			{syntax}
		</span>
	);
}

export default Syntax;
