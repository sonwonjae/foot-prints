import { memo } from 'react';

import { cn } from '@/utils/tailwindcss';
import { MarkdownareaPropsProvider } from './contexts/props';
import type { MarkdownareaPropsContextValue, MarkdownareaPropsProviderProps } from './contexts/props/types';
import { MarkdownareaValueProvider, useMarkdownareaValueContext } from './contexts/value';
import { MarkdownareaKeymapProvider, useMarkdownareaKeymapContext } from './contexts/keymap';
import { MarkdownareaHistoryProvider } from './contexts/history';

function MarkdownareaComponent() {
	const { markdownareaRef } = useMarkdownareaValueContext()
	const { onChange } = useMarkdownareaValueContext();
	const { onKeyDown } = useMarkdownareaKeymapContext();

	return (
		<textarea
			ref={markdownareaRef}
			autoComplete="off"
			spellCheck="false"
			className={cn(
				'tracking-widest',
				'w-full',
				'h-full',
				'min-h-[1.5em]',
				'text-base',
				'box-border',
				'focus:outline-none',
				'text-black'
			)}
			onKeyDown={onKeyDown}
			onChange={onChange}
		/>
	);
}

const MemoizedMarkdownareaComponent = memo(MarkdownareaComponent)

export default function Markdownarea({ value, onChange, onKeyDown, ...props }: MarkdownareaPropsProviderProps) {
    return (
        <MarkdownareaPropsProvider value={value} onChange={onChange} onKeyDown={onKeyDown} {...props}>
			<MarkdownareaHistoryProvider>
				<MarkdownareaValueProvider>
					<MarkdownareaKeymapProvider>
						<MemoizedMarkdownareaComponent/>
					</MarkdownareaKeymapProvider>
				</MarkdownareaValueProvider>
			</MarkdownareaHistoryProvider>
        </MarkdownareaPropsProvider>
    )
};
