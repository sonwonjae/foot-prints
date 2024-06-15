import { textCommonClassName } from '@/sub-components/Editor/sub-components/EditorOverlay/EditorOverlay.constants';
import {
	StyledText,
	Syntax,
} from '@/sub-components/Editor/sub-components/EditorOverlay/sub-components';
import {
	getMarkdownTabCount,
	getMarkdownType,
	parseTabCountToTab,
	parseToPureMarkdown,
	splitMarkdownOfSyntax,
} from '@/utils/parse';
import { cn } from '@/utils/tailwindcss';

interface BlockquoteProps {
	children: string;
}

function Blockquote({ children: markdown }: BlockquoteProps) {
	const { syntax, text: remainedMarkdown } = splitMarkdownOfSyntax(markdown);
	const pureMarkdown = parseToPureMarkdown(remainedMarkdown);
	const { text } = splitMarkdownOfSyntax(pureMarkdown);

	const markdownType = getMarkdownType(pureMarkdown);
	const markdownTabCount = getMarkdownTabCount(pureMarkdown);
	const markdownTab = parseTabCountToTab(markdownTabCount);

	return (
		<pre className={cn(textCommonClassName)}>
			{syntax.split('').map((blockquoteSyntax) => {
				if (blockquoteSyntax === '>') {
					return (
						<span
							className={cn(
								textCommonClassName,
								'inline-block',
								'h-full',
								'text-slate-400',
								'relative',
								'before:contents',
								'before:absolute',
								'before:top-0',
								'before:left-0',
								'before:w-0.5',
								'before:h-full',
								'before:bg-slate-400',
								'before:block',
							)}
						>
							{blockquoteSyntax}
						</span>
					);
				}
				return blockquoteSyntax;
			})}
			{markdownTab}
			<Syntax markdownType={markdownType}>{pureMarkdown}</Syntax>
			<StyledText>{text}</StyledText>
		</pre>
	);
}

export default Blockquote;
