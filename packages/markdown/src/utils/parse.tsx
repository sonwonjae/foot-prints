import { STYLED_SYNTAX_MAP } from '@/constants';
import hljs from 'highlight.js';

import type { StyledTextType } from '@/constants';

export const parseValueToMarkdownList = (value: string) => {
	return value.split('\n');
};

export const parseMarkdownListToValue = (markdownList: Array<string>) => {
	return markdownList.join('\n');
};

export const parseToPureMarkdown = (markdown: string) => {
	return markdown.replace(/^\t+/, '');
};

export const getMarkdownTabCount = (markdown: string) => {
	return markdown.match(/^\t+/)?.[0]?.length ?? 0;
};

export const parseTabCountToTab = (tabCount: number) => {
	return '\t'.repeat(tabCount);
};

export const getMarkdownType = (markdown: string) => {
	const purebMarkdown = parseToPureMarkdown(markdown);

	switch (true) {
		case /^(# )/.test(purebMarkdown):
			return 'h1';
		case /^(## )/.test(purebMarkdown):
			return 'h2';
		case /^(### )/.test(purebMarkdown):
			return 'h3';
		case /^(#### )/.test(purebMarkdown):
			return 'h4';
		case /^(##### )/.test(purebMarkdown):
			return 'h5';
		case /^(###### )/.test(purebMarkdown):
			return 'h6';
		case /^(- \[x\] )/.test(purebMarkdown):
			return 'cli-f';
		case /^(- \[ \] )/.test(purebMarkdown):
			return 'cli-e';
		case /^(- )/.test(purebMarkdown):
			return 'uli';
		case /^([0-9]+\. )/.test(purebMarkdown):
			return 'oli';
		case /^(---)$/.test(purebMarkdown):
			return 'horizon';
		case /^(>+ )/.test(markdown):
			return 'blockquote';
		// case /^\|(?:[^|]*\|)+$/.test(markdown):
		// 	return 'table';
		default:
			return 'paragraph';
	}
};

export const makeStyledTextConfig = (styledSyntax: string) => {
	const escapedStyledSyntax = styledSyntax.replace(
		/[.*+?^${}()|[\]\\]/g,
		'\\$&',
	);

	return {
		styledSyntax,
		styledSyntaxLength: styledSyntax.length,
		toggleStyleRegExp: new RegExp(
			`^(${escapedStyledSyntax})(.*)(${escapedStyledSyntax})$`,
		),
	};
};

export const splitMarkdownOfSyntax = (markdown: string) => {
	const pureMarkdown = parseToPureMarkdown(markdown);
	const markdownType = getMarkdownType(pureMarkdown);

	let REGEXP = null;

	switch (markdownType) {
		case 'h1':
			REGEXP = /^(# )/;
			break;
		case 'h2':
			REGEXP = /^(## )/;
			break;
		case 'h3':
			REGEXP = /^(### )/;
			break;
		case 'h4':
			REGEXP = /^(#### )/;
			break;
		case 'h5':
			REGEXP = /^(##### )/;
			break;
		case 'h6':
			REGEXP = /^(###### )/;
			break;
		case 'cli-f':
			REGEXP = /^(- \[x\] )/;
			break;
		case 'cli-e':
			REGEXP = /^(- \[ \] )/;
			break;
		case 'uli':
			REGEXP = /^(- )/;
			break;
		case 'oli':
			REGEXP = /^([0-9]+\. )/;
			break;
		case 'blockquote':
			REGEXP = /^(>+ )/;
			break;
		default:
			break;
	}

	if (!REGEXP) {
		return {
			syntax: '',
			text: markdown,
		};
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, syntax = '', text = ''] = markdown.split(REGEXP);

	return {
		syntax,
		text,
	};
};

export const getStyledTextType = (markdown: string) => {
	const pureMarkdown = parseToPureMarkdown(markdown);
	const { text } = splitMarkdownOfSyntax(pureMarkdown);

	switch (true) {
		case /^\*\*\*.*\*\*\*$/.test(text):
			return 'bold-italic';
		case /^\*\*.*\*\*$/.test(text):
			return 'bold';
		case /^\*.*\*$/.test(text):
			return 'italic';
		case /^~~.*~~$/.test(text):
			return 'strike-through';
		case /^`.*`$/.test(text):
			return 'code';
		case /^==.*==$/.test(text):
			return 'highlight';
		case /^(!\[.*?\]\(.*?\))$/.test(text):
			return 'image';
		case /^(\[.*?\]\(.*?\))$/.test(text):
			return 'link';
		default:
			return null;
	}
};
export type MarkdownType = ReturnType<typeof getMarkdownType>;

export const getIsEmptyMarkdown = ({
	markdown,
	markdownType,
}: {
	markdown: string;
	markdownType: MarkdownType;
}) => {
	const purebMarkdown = parseToPureMarkdown(markdown);

	switch (markdownType) {
		case 'h1':
			return /(# )$/.test(purebMarkdown);
		case 'h2':
			return /(## )$/.test(purebMarkdown);
		case 'h3':
			return /(### )$/.test(purebMarkdown);
		case 'h4':
			return /(#### )$/.test(purebMarkdown);
		case 'h5':
			return /(##### )$/.test(purebMarkdown);
		case 'h6':
			return /(###### )$/.test(purebMarkdown);
		case 'cli-f':
			return /(- \[x\] )$/.test(purebMarkdown);
		case 'cli-e':
			return /(- \[ \] )$/.test(purebMarkdown);
		case 'uli':
			return /(- )$/.test(purebMarkdown);
		case 'oli':
			return /([0-9]+\. )$/.test(purebMarkdown);
		case 'blockquote':
			return /(>+ )$/.test(purebMarkdown);
		default:
			return purebMarkdown.length === 0;
	}
};

export const getOliNumber = (markdown: string) => {
	const markdownType = getMarkdownType(markdown);

	if (markdownType !== 'oli') {
		return '';
	}

	return Number(markdown.replace(/[^0-9]/g, ''));
};

export const getMarkdownSelectionStartWithMarkdownList = ({
	value,
	selectionIndex,
}: {
	value: string;
	selectionIndex: number;
}) => {
	let indexInMarkdownList = 0;
	let indexInMarkdown = 0;

	for (let i = 0; i < selectionIndex; i += 1) {
		if (value[i] === '\n') {
			indexInMarkdownList += 1;
			indexInMarkdown = -1;
		}
		indexInMarkdown += 1;
	}

	return {
		indexInMarkdownList, // value를 parsing한 markdownList에서 현재 focuse된 markdown이 속한 배열 index
		indexInMarkdown, // 현재 foucs된 markdown기준 selectionIndex index
	};
};

export const getMarkdownInfo = ({
	value,
	selectionStart,
}: {
	value: string;
	selectionStart: number;
}) => {
	const markdownList = parseValueToMarkdownList(value);

	const { indexInMarkdownList, indexInMarkdown } =
		getMarkdownSelectionStartWithMarkdownList({
			value,
			selectionIndex: selectionStart,
		});

	const currentMarkdownLine = markdownList[indexInMarkdownList] ?? '';
	const pureCurrentMarkdownLine = parseToPureMarkdown(currentMarkdownLine);
	const currentLineTabCount = getMarkdownTabCount(currentMarkdownLine);
	const currentLineTab = parseTabCountToTab(currentLineTabCount);
	const hasCurrentLineTab = !!currentLineTabCount;
	const markdownType = getMarkdownType(currentMarkdownLine);

	const postMarkdown = value.slice(0, selectionStart);
	const nextMarkdown = value.slice(selectionStart);

	const prevLineList = markdownList.slice(0, indexInMarkdownList);
	const prevLine = markdownList[indexInMarkdownList - 1];
	const hasPrevLine = typeof prevLine === 'string';
	const prevLineTabCount = getMarkdownTabCount(hasPrevLine ? prevLine : '');
	const prevLineTab = parseTabCountToTab(prevLineTabCount);
	const hasPrevLineTab = !!prevLineTabCount;
	const prevMarkdownType = prevLine ? getMarkdownType(prevLine) : null;

	const nextLineList = markdownList.slice(indexInMarkdownList + 1);
	const nextLine = markdownList[indexInMarkdownList + 1];
	const hasNextLine = typeof nextLine === 'string';

	const isMarkdownStartWithTab = currentMarkdownLine?.startsWith('\t');

	const isEmptyMarkdown = getIsEmptyMarkdown({
		markdown: currentMarkdownLine,
		markdownType,
	});

	const replaceCurrentMarkdownLine = (newCurrentLine: string) => {
		const newMarkdownList = [
			hasPrevLine && parseMarkdownListToValue(prevLineList),
			newCurrentLine,
			hasNextLine && parseMarkdownListToValue(nextLineList),
		].filter((line) => {
			return typeof line === 'string';
		}) as Array<string>;

		return parseMarkdownListToValue(newMarkdownList);
	};

	return {
		markdownList,

		indexInMarkdownList,
		indexInMarkdown,

		currentMarkdownLine,
		pureCurrentMarkdownLine,
		currentLineTabCount,
		currentLineTab,
		hasCurrentLineTab,

		markdownType,

		postMarkdown,
		nextMarkdown,

		prevLineList,
		prevLine,
		hasPrevLine,
		prevLineTabCount,
		prevLineTab,
		hasPrevLineTab,
		prevMarkdownType,

		nextLineList,
		nextLine,
		hasNextLine,

		isMarkdownStartWithTab,
		isEmptyMarkdown,

		replaceCurrentMarkdownLine,
	} as const;
};

export const reorderOli = ({
	value,
	selectionStart,
}: {
	value: string;
	selectionStart: number;
}) => {
	const { indexInMarkdownList } = getMarkdownSelectionStartWithMarkdownList({
		value,
		selectionIndex: selectionStart,
	});
	const markdownList = parseValueToMarkdownList(value);

	let prevMarkdown: string | null = null;
	const oliIndexArray: Array<number> = [];

	let prevMarkdownInBlockquote: string | null = null;
	const oliIndexArrayInBlockquote: Array<number> = [];

	const newMarkdownList = markdownList.map((markdown) => {
		const prevMarkdownTabCount = prevMarkdown
			? getMarkdownTabCount(prevMarkdown)
			: null;

		const markdownType = getMarkdownType(markdown);
		const pureMarkdown = parseToPureMarkdown(markdown);
		const markdownTabCount = getMarkdownTabCount(markdown);
		const markdownTab = parseTabCountToTab(markdownTabCount);

		if (markdownType !== 'blockquote') {
			oliIndexArrayInBlockquote[1] = 0;
		}

		if (markdownType === 'blockquote') {
			const prevBlockquoteCount = prevMarkdownInBlockquote
				? prevMarkdownInBlockquote.match(/^>+/)?.[0]?.length ?? 0
				: null;

			const { syntax: blockquoteSyntax, text: remainedMarkdown } =
				splitMarkdownOfSyntax(markdown);
			const blockquoteCount = markdown.match(/^>+/)?.[0]?.length ?? 0;
			const remainedPureMarkdown = parseToPureMarkdown(remainedMarkdown);
			const remainedMarkdownTabCount =
				getMarkdownTabCount(remainedPureMarkdown);
			const remainedMarkdownTab = parseTabCountToTab(
				remainedMarkdownTabCount,
			);

			if (
				typeof prevBlockquoteCount === 'number' &&
				blockquoteCount !== 0 &&
				prevBlockquoteCount < blockquoteCount
			) {
				oliIndexArrayInBlockquote[blockquoteCount] = 0;
			}

			if (
				typeof oliIndexArrayInBlockquote[blockquoteCount] !== 'number'
			) {
				oliIndexArrayInBlockquote[blockquoteCount] = 1;
			} else {
				oliIndexArrayInBlockquote[blockquoteCount] += 1;
			}

			const finalOliNumber = oliIndexArrayInBlockquote[blockquoteCount];
			const newMarkdown = `${blockquoteSyntax}${remainedMarkdownTab}${remainedPureMarkdown.replace(/^([0-9]+\. )/, `${finalOliNumber}. `)}`;

			prevMarkdownInBlockquote = markdown;

			return newMarkdown;
		}

		if (markdownType !== 'oli') {
			oliIndexArray[markdownTabCount] = -1;
		}

		if (
			typeof prevMarkdownTabCount === 'number' &&
			markdownTabCount !== 0 &&
			prevMarkdownTabCount < markdownTabCount
		) {
			oliIndexArray[markdownTabCount] = 0;
		}

		if (typeof oliIndexArray[markdownTabCount] !== 'number') {
			oliIndexArray[markdownTabCount] = 1;
		} else {
			oliIndexArray[markdownTabCount] += 1;
		}

		const finalOliNumber = oliIndexArray[markdownTabCount];
		const newMarkdown = `${markdownTab}${pureMarkdown.replace(/^([0-9]+\. )/, `${finalOliNumber}. `)}`;

		prevMarkdown = markdown;

		return newMarkdown;
	});

	const reorderdValue = parseMarkdownListToValue(newMarkdownList);

	const selectionStartGap = markdownList.reduce((acc, markdown, index) => {
		if (indexInMarkdownList < index) {
			return acc;
		}

		return acc + ((newMarkdownList[index]?.length ?? 0) - markdown.length);
	}, 0);
	return {
		reorderdValue,
		nextSelectionStart: selectionStart + selectionStartGap,
	};
};

export const toggleStyledText = ({
	styledTextType,
	markdown,
}: {
	styledTextType: StyledTextType;
	markdown: string;
}) => {
	const { styledSyntax, toggleStyleRegExp } = makeStyledTextConfig(
		STYLED_SYNTAX_MAP[styledTextType],
	);

	const currentMarkdownStyledTextType = getStyledTextType(markdown);
	const isStyledText = !!currentMarkdownStyledTextType;

	const markdownTabCount = getMarkdownTabCount(markdown);
	const markdownTab = parseTabCountToTab(markdownTabCount);
	const pureMarkdown = parseToPureMarkdown(markdown);
	const { syntax, text } = splitMarkdownOfSyntax(pureMarkdown);

	if (currentMarkdownStyledTextType === 'italic') {
		if (styledTextType === 'bold') {
			return `${markdownTab}${syntax}**${text}**`;
		}
		if (styledTextType === 'strike-through') {
			return `${markdownTab}${syntax}~~${text}~~`;
		}
		if (styledTextType === 'code') {
			return `${markdownTab}${syntax}\`${text}\``;
		}
		if (styledTextType === 'highlight') {
			return `${markdownTab}${syntax}==${text}==`;
		}
	}

	if (currentMarkdownStyledTextType === 'bold') {
		if (styledTextType === 'italic') {
			return `${markdownTab}${syntax}*${text}*`;
		}
		if (styledTextType === 'strike-through') {
			return `${markdownTab}${syntax}~~${text}~~`;
		}
		if (styledTextType === 'code') {
			return `${markdownTab}${syntax}\`${text}\``;
		}
		if (styledTextType === 'highlight') {
			return `${markdownTab}${syntax}==${text}==`;
		}
	}

	if (currentMarkdownStyledTextType === 'bold-italic') {
		if (styledTextType === 'italic') {
			return `${markdownTab}${syntax}${text.replace(
				/\*\*\*(.*?)\*\*\*/,
				'**$1**',
			)}`;
		}
		if (styledTextType === 'bold') {
			return `${markdownTab}${syntax}${text.replace(
				/\*\*\*(.*?)\*\*\*/,
				'*$1*',
			)}`;
		}
		if (styledTextType === 'strike-through') {
			return `${markdownTab}${syntax}~~${text}~~`;
		}
		if (styledTextType === 'code') {
			return `${markdownTab}${syntax}\`${text}\``;
		}
		if (styledTextType === 'highlight') {
			return `${markdownTab}${syntax}==${text}==`;
		}
	}

	if (currentMarkdownStyledTextType === 'strike-through') {
		if (styledTextType === 'italic') {
			return `${markdownTab}${syntax}*${text}*`;
		}
		if (styledTextType === 'bold') {
			return `${markdownTab}${syntax}**${text}**`;
		}
		if (styledTextType === 'code') {
			return `${markdownTab}${syntax}\`${text}\``;
		}
		if (styledTextType === 'highlight') {
			return `${markdownTab}${syntax}==${text}==`;
		}
	}
	if (currentMarkdownStyledTextType === 'code') {
		if (styledTextType === 'italic') {
			return `${markdownTab}${syntax}*${text}*`;
		}
		if (styledTextType === 'bold') {
			return `${markdownTab}${syntax}**${text}**`;
		}
		if (styledTextType === 'strike-through') {
			return `${markdownTab}${syntax}~~${text}~~`;
		}
		if (styledTextType === 'highlight') {
			return `${markdownTab}${syntax}==${text}==`;
		}
	}
	if (currentMarkdownStyledTextType === 'highlight') {
		if (styledTextType === 'italic') {
			return `${markdownTab}${syntax}*${text}*`;
		}
		if (styledTextType === 'bold') {
			return `${markdownTab}${syntax}**${text}**`;
		}
		if (styledTextType === 'strike-through') {
			return `${markdownTab}${syntax}~~${text}~~`;
		}
		if (styledTextType === 'code') {
			return `${markdownTab}${syntax}\`${text}\``;
		}
	}

	if (isStyledText) {
		return `${markdownTab}${syntax}${text.replace(
			toggleStyleRegExp,
			'$2',
		)}`;
	}
	return `${markdownTab}${syntax}${styledSyntax}${text}${styledSyntax}`;
};

export const makeIsInCodeBlockMarkdownList = (markdownList: Array<string>) => {
	let isInCodeBlock = false;

	let prevLanguage: string | null = null;

	return markdownList.map((markdown) => {
		/** NOTE: code-block 시작점 */
		if (!isInCodeBlock && /^(```)/.test(markdown)) {
			const language = markdown.replace(/^(```)/, '').trim();
			const currentLanguage = hljs.getLanguage(language)
				? language
				: 'plaintext';
			prevLanguage = currentLanguage;
			isInCodeBlock = true;
			return {
				language: 'plaintext',
				isInCodeBlock: true,
			};
		}

		/** NOTE: code-block 끝점 */
		if (isInCodeBlock && /^(```)$/.test(markdown)) {
			isInCodeBlock = false;
			return {
				language: 'plaintext',
				isInCodeBlock: true,
			};
		}

		/** */
		if (isInCodeBlock) {
			return {
				language: prevLanguage!,
				isInCodeBlock,
			};
		}
		return {
			language: 'plaintext',
			isInCodeBlock,
		};
	});
};
