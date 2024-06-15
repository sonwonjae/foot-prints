import 'highlight.js/styles/tokyo-night-dark.css';

import { forwardRef } from 'react';

import { useParser } from '@/contexts/Parser.context';
import {
	getMarkdownTabCount,
	getMarkdownType,
	parseTabCountToTab,
	parseToPureMarkdown,
	splitMarkdownOfSyntax,
} from '@/utils/parse';
import { cn } from '@/utils/tailwindcss';
import hljs from 'highlight.js';

import { textCommonClassName } from './EditorOverlay.constants';
import { Blockquote, Horizon, StyledText, Syntax } from './sub-components';

const EditorOverlay = forwardRef<HTMLDivElement>(
	function EditorOverlay(_, ref) {
		const { markdownList, isInCodeBlockMarkdownList } = useParser();

		return (
			<div
				ref={ref}
				className={cn(
					'absolute',
					'-z-10',
					'top-0',
					'left-0',
					'p-4',
					'rounded-lg',
					'text-base',
					'w-full',
					'h-full',
					'min-h-[1.5em]',
					'cursor-text',
					'select-none',
					'overflow-hidden',
					'tracking-widest',
					'bg-white'
				)}
			>
				{markdownList.map((markdown, index) => {
					const { isInCodeBlock, language } =
						isInCodeBlockMarkdownList[index]!;

					const key = `${markdown + index}`;

					if (isInCodeBlock) {
						return (
							<pre
								key={key}
								className={cn(
									textCommonClassName,
									'hljs',
									!isInCodeBlockMarkdownList[index - 1]
										?.isInCodeBlock && 'rounded-t-md',
									!isInCodeBlockMarkdownList[index + 1]
										?.isInCodeBlock && 'rounded-b-md',
								)}
								dangerouslySetInnerHTML={{
									__html: hljs.highlight(markdown, {
										language,
									}).value,
								}}
							></pre>
						);
					}

					const markdownType = getMarkdownType(markdown);

					const pureMarkdown = parseToPureMarkdown(markdown);
					const markdownTabCount = getMarkdownTabCount(markdown);
					const markdownTab = parseTabCountToTab(markdownTabCount);
					const { text } = splitMarkdownOfSyntax(pureMarkdown);

					if (markdownType === 'horizon') {
						return <Horizon key={key} />;
					}

					if (markdownType === 'blockquote') {
						return <Blockquote key={key}>{markdown}</Blockquote>;
					}

					return (
						<pre key={key} className={cn(textCommonClassName)}>
							{markdownTab}
							<Syntax markdownType={markdownType}>
								{pureMarkdown}
							</Syntax>
							<StyledText>{text}</StyledText>
						</pre>
					);
				})}
			</div>
		);
	},
);

export default EditorOverlay;
