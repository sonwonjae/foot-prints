import { useRef } from 'react';

import { useKeyMap } from '@/contexts/KeyMap.context';
import { useMarkdown } from '@/contexts/Markdown.context';
import { useParser } from '@/contexts/Parser.context';
import { getMarkdownSelectionStartWithMarkdownList } from '@/utils/parse';
import { cn } from '@/utils/tailwindcss';

import { EditorOverlay } from './sub-components';

function Editor() {
	const { changeValueInOnChange } = useMarkdown();

	const { markdownList, isInCodeBlockMarkdownList } = useParser();
	const { setKeyMap } = useKeyMap();

	const overlayRef = useRef<HTMLDivElement>(null);

	return (
		<div
			className={cn(
				'flex',
				'relative',
				'w-full',
				'h-fit',
				'min-h-[1.5em]',
				'p-4',
				'tracking-widest',
				'rounded-lg',
				'border-solid',
				'border-2',
				'border-slate-400',
				'focus-within:outline',
				'focus-within:outline-4',
				'focus-within:outline-slate-200',
				'overflow-hidden',
			)}
		>
			<textarea
				autoComplete="off"
				spellCheck="false"
				className={cn(
					'bg-transparent',
					'tracking-widest',
					'text-transparent',
					'caret-black',
					'w-full',
					'h-full',
					'min-h-[1.5em]',
					'text-base',
					'box-border',
					'focus:outline-none',
					'resize-none',
				)}
				rows={markdownList.length}
				onKeyDown={(e) => {
					setKeyMap(e);
				}}
				onChange={(e) => {
					changeValueInOnChange(e);
				}}
				onSelect={(e) => {
					const { indexInMarkdownList } =
						getMarkdownSelectionStartWithMarkdownList({
							value: e.currentTarget.value,
							selectionIndex: e.currentTarget.selectionStart,
						});

					if (
						isInCodeBlockMarkdownList[indexInMarkdownList]
							?.isInCodeBlock
					) {
						e.currentTarget.classList.toggle('caret-black', false);
						e.currentTarget.classList.toggle('caret-white', true);
					} else {
						e.currentTarget.classList.toggle('caret-black', true);
						e.currentTarget.classList.toggle('caret-white', false);
					}
				}}
				onScroll={(e) => {
					if (!overlayRef.current) {
						return;
					}

					overlayRef.current.scrollTo({
						top: e.currentTarget.scrollTop,
					});
				}}
			/>
			<EditorOverlay ref={overlayRef} />
		</div>
	);
}

export default Editor;
