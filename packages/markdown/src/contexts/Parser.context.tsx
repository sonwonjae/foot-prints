import { createContext, useContext, useMemo } from 'react';

import { useMarkdown } from '@/contexts/Markdown.context';
import { makeIsInCodeBlockMarkdownList } from '@/utils/parse';

import type { ParserContextValue } from '@/types';
import type { PropsWithChildren } from 'react';

const ParserContext = createContext<ParserContextValue>({
	markdownList: [],
	isInCodeBlockMarkdownList: [],
});

export const useParser = () => {
	return useContext(ParserContext);
};

export function ParserProvider({ children }: PropsWithChildren) {
	const { value } = useMarkdown();

	const markdownList = value.split('\n');
	const isInCodeBlockMarkdownList =
		makeIsInCodeBlockMarkdownList(markdownList);

	const contextValue = useMemo(() => {
		return {
			markdownList,
			isInCodeBlockMarkdownList,
		};
	}, [markdownList, isInCodeBlockMarkdownList]);

	return (
		<ParserContext.Provider value={contextValue}>
			{children}
		</ParserContext.Provider>
	);
}
