import { StyledTextType } from '@/constants';

import type { ChangeEvent, Dispatch, KeyboardEvent, PropsWithChildren, SetStateAction } from 'react';

export interface MarkdownProps extends PropsWithChildren {
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
}

export interface ChangeValueParam {
	/** 새롭게 적용할 value [=e.currentTarget.value] */
	newValue?: string;
	/** 새롭게 적용할 selectionStart [=e.currentTarget.selectionStart] */
	nextSelectionStart?: number;
	/** 새롭게 적용할 selectionEnd */
	nextSelectionEnd?: number;
}

/**  */
export interface ChangeValue {
	(param?: ChangeValueParam): void;
}

export interface MakeChangeValue {
	(
		e:
			| KeyboardEvent<HTMLTextAreaElement>
			| ChangeEvent<HTMLTextAreaElement>,
	): ChangeValue;
}

export type ReplaceSelectionMarkdownType =
	| 'same-selection'
	| 'same-line'
	| 'first-line'
	| 'last-line'
	| 'selection-line';

export interface ReplaceSelectionMarkdown {
	(param: {
		type: ReplaceSelectionMarkdownType;
		prevSelectionMarkdown: string;
		selectionMarkdown: string;
		nextSelectionMarkdown: string;
	}): string | null;
}

export type GapType = 'include' | 'exclude' | 'exclude-half';

export interface ChangeSelectionRange {
	(param: {
		moveTo?: 'first' | 'last';
		nextSelectionSameGapType: GapType;
		nextSelectionStartGapType: GapType;
		nextSelectionEndGapType: GapType;
		replaceSelectionMarkdown: ReplaceSelectionMarkdown;
	}): void;
}

export interface MakeChangeValueInOnKeyDown {
	(e: KeyboardEvent<HTMLTextAreaElement>): {
		/** 현재  */
		updateCurrentMarkdownLine: (
			replacedCurrentMarkdownLine: string,
		) => void;
		insertMarkdownWithSelectionStart: (insertedMarkdown: string) => void;
		changeSelectionRange: ChangeSelectionRange;
		toggleSelectionRange: (styledTextType: StyledTextType) => void;
	};
}
