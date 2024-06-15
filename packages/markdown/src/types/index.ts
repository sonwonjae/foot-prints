import { makeIsInCodeBlockMarkdownList } from '@/utils/parse';

import { MakeChangeValueInOnKeyDown } from './markdown';

import type {
	ChangeEvent,
	Dispatch,
	KeyboardEvent,
	SetStateAction,
} from 'react';

export interface MarkdownContextValue {
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
	makeChangeValueInOnKeyDown: MakeChangeValueInOnKeyDown;
	changeValueInOnChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
	undo: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
	redo: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export interface ParserContextValue {
	markdownList: Array<string>;
	isInCodeBlockMarkdownList: ReturnType<typeof makeIsInCodeBlockMarkdownList>;
}

export interface KeyMapContextValue {
	setKeyMap: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}
