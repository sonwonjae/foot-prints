import type { ComponentProps, KeyboardEvent as ReactKeyboardEvent, ChangeEvent as ReactChangeEvent } from 'react';

export interface ChangeValueParam {
	/** 새롭게 적용할 value [=e.currentTarget.value] */
	newValue?: string;
	/** 새롭게 적용할 selectionStart [=e.currentTarget.selectionStart] */
	nextSelectionStart?: number;
	/** 새롭게 적용할 selectionEnd */
	nextSelectionEnd?: number;
}

export interface ChangeValue {
    (param?: ChangeValueParam): void
}

export interface MakeChangeValue {
    (e: ReactKeyboardEvent<HTMLTextAreaElement>): ChangeValue;
    (e: ReactChangeEvent<HTMLTextAreaElement>): ChangeValue;
}

export interface MarkdownareaValueContextValue {
    makeChangeValue: MakeChangeValue;
    onChange: ComponentProps<'textarea'>['onChange'];
}
