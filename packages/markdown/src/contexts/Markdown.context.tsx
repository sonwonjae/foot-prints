import { createContext, useContext, useMemo, useState } from 'react';

import { StyledTextType } from '@/constants';
import { KeyMapProvider } from '@/contexts/KeyMap.context';
import { ParserProvider } from '@/contexts/Parser.context';
import {
	getMarkdownInfo,
	getMarkdownSelectionStartWithMarkdownList,
	parseMarkdownListToValue,
	reorderOli,
	toggleStyledText,
} from '@/utils/parse';

import type { MarkdownContextValue } from '@/types';
import type {
	ChangeSelectionRange,
	ChangeValueParam,
	MakeChangeValue,
	MarkdownProps,
} from '@/types/markdown';
import type { ChangeEvent, KeyboardEvent, PropsWithChildren } from 'react';

declare global {
	/** NOTE: textarea change event에 e.nativeEvent.isComposing boolean 값이 있는데 없다고 선언되어 있어서 강제로 덮어씀 */
	interface Event {
		isComposing: boolean;
	}
}

const MarkdownContext = createContext<MarkdownContextValue>({
	value: '',
	setValue: () => {},
	makeChangeValueInOnKeyDown: () => {
		return {
			updateCurrentMarkdownLine: () => {},
			insertMarkdownWithSelectionStart: () => {},
			changeSelectionRange: () => {},
			toggleSelectionRange: () => {},
		};
	},
	changeValueInOnChange: () => {},
	undo: () => {},
	redo: () => {},
});

export const useMarkdown = () => {
	return useContext(MarkdownContext);
};

export function MarkdownProvider({
	value,
	setValue,
	children,
}: PropsWithChildren<MarkdownProps>) {
	const [undoHistoryStack, setUndoHistoryStack] = useState<
		Array<{
			value: string;
			selectionStart: number;
			selectionEnd: number;
		}>
	>([
		{
			value: value ?? '',
			selectionStart: 0,
			selectionEnd: 0,
		},
	]);
	const [redoHistoryStack, setRedoHistoryStack] = useState<
		Array<{
			value: string;
			selectionStart: number;
			selectionEnd: number;
		}>
	>([]);

	const makeChangeValue: MakeChangeValue =
		(e) =>
		({
			newValue = e.currentTarget.value,
			nextSelectionStart = e.currentTarget.selectionStart,
			nextSelectionEnd,
		} = {}) => {
			const { reorderdValue, nextSelectionStart: finalSelectionStart } =
				reorderOli({
					value: newValue,
					selectionStart: nextSelectionStart,
				});

			setValue(reorderdValue);
			e.currentTarget.value = reorderdValue;
			e.currentTarget.setSelectionRange(
				finalSelectionStart,
				nextSelectionEnd ?? finalSelectionStart,
			);

			/** NOTE: undo/redo set */
			setUndoHistoryStack([
				...undoHistoryStack,
				{
					value: newValue,
					selectionStart: finalSelectionStart,
					selectionEnd: nextSelectionEnd ?? finalSelectionStart,
				},
			]);
			setRedoHistoryStack([]);
		};

	const makeChangeValueInOnKeyDown = (
		e: KeyboardEvent<HTMLTextAreaElement>,
	) => {
		const {
			markdownList,
			currentMarkdownLine,
			postMarkdown,
			nextMarkdown,

			replaceCurrentMarkdownLine,
		} = getMarkdownInfo({
			value: e.currentTarget.value,
			selectionStart: e.currentTarget.selectionStart,
		});

		const changeValueWithKeyDown = (
			hangeValueParam: ChangeValueParam = {},
		) => {
			e.preventDefault();
			if (e.nativeEvent.isComposing) {
				return;
			}
			const changeValue = makeChangeValue(e);
			changeValue(hangeValueParam);
		};

		/** NOTE: 현재 markdown line을 갈아끼우는 함수 */
		const updateCurrentMarkdownLine = (
			replacedCurrentMarkdownLine: string,
		) => {
			const replacedValue = replaceCurrentMarkdownLine(
				replacedCurrentMarkdownLine,
			);
			const selectionStartGap =
				replacedCurrentMarkdownLine.length - currentMarkdownLine.length;

			changeValueWithKeyDown({
				newValue: replacedValue,
				nextSelectionStart:
					e.currentTarget.selectionStart + selectionStartGap,
			});
		};

		/** NOTE: 현재 selectionStart에 새로운 값을 추가하는 함수 */
		const insertMarkdownWithSelectionStart = (insertedMarkdown: string) => {
			const newValue = `${postMarkdown}${insertedMarkdown}${nextMarkdown}`;
			const nextSelectionStart =
				e.currentTarget.selectionStart + insertedMarkdown.length;

			changeValueWithKeyDown({
				newValue,
				nextSelectionStart,
			});
		};

		const changeSelectionRange: ChangeSelectionRange = ({
			moveTo,
			nextSelectionSameGapType,
			nextSelectionStartGapType,
			nextSelectionEndGapType,
			replaceSelectionMarkdown,
		}) => {
			/** NOTE: get markdown selectRange index */
			const startIndexMap = getMarkdownSelectionStartWithMarkdownList({
				value: e.currentTarget.value,
				selectionIndex: e.currentTarget.selectionStart,
			});

			const endIndexMap = getMarkdownSelectionStartWithMarkdownList({
				value: e.currentTarget.value,
				selectionIndex: e.currentTarget.selectionEnd,
			});

			const finalDirect = (() => {
				switch (true) {
					case e.currentTarget.selectionStart <
						e.currentTarget.selectionEnd:
						return 'forward';
					case e.currentTarget.selectionStart >
						e.currentTarget.selectionEnd:
						return 'backward';
					default:
						return 'none';
				}
			})();

			/** NOTE: selection index ordering */
			const finalStartIndexMap =
				finalDirect === 'forward' ? startIndexMap : endIndexMap;
			const finalEndIndexMap =
				finalDirect === 'forward' ? endIndexMap : startIndexMap;

			const changeValueParam = markdownList.reduce(
				(acc, markdown, index) => {
					/** NOTE: 선택되지 않은 범위 */
					if (
						index < finalStartIndexMap.indexInMarkdownList ||
						index > finalEndIndexMap.indexInMarkdownList
					) {
						return {
							markdownList: [...acc.markdownList, markdown],
							nextSelectionStart: acc.nextSelectionStart,
							nextSelectionEnd: acc.nextSelectionEnd,
						};
					}

					const {
						type,
						prevSelectionMarkdown,
						selectionMarkdown,
						nextSelectionMarkdown,
					} = (() => {
						switch (true) {
							/** NOTE: 시작점과 끝점이 같은 경우 */
							case e.currentTarget.selectionStart ===
								e.currentTarget.selectionEnd:
								return {
									type: 'same-selection',
									prevSelectionMarkdown: markdown.slice(
										0,
										finalStartIndexMap.indexInMarkdown,
									),
									selectionMarkdown: markdown.slice(
										finalStartIndexMap.indexInMarkdown,
										finalEndIndexMap.indexInMarkdown,
									),
									nextSelectionMarkdown: markdown.slice(
										finalEndIndexMap.indexInMarkdown,
									),
								} as const;
							/** NOTE: 시작 라인과 끝 라인이 같은 경우 */
							case finalStartIndexMap.indexInMarkdownList ===
								finalEndIndexMap.indexInMarkdownList:
								return {
									type: 'same-line',
									prevSelectionMarkdown: markdown.slice(
										0,
										finalStartIndexMap.indexInMarkdown,
									),
									selectionMarkdown: markdown.slice(
										finalStartIndexMap.indexInMarkdown,
										finalEndIndexMap.indexInMarkdown,
									),
									nextSelectionMarkdown: markdown.slice(
										finalEndIndexMap.indexInMarkdown,
									),
								} as const;
							/** NOTE: 선택된 라인이 최소 두줄 이상이며 첫번째로 선택된 라인인 경우  */
							case index ===
								finalStartIndexMap.indexInMarkdownList:
								return {
									type: 'first-line',
									prevSelectionMarkdown: markdown.slice(
										0,
										finalStartIndexMap.indexInMarkdown,
									),
									selectionMarkdown: markdown.slice(
										finalStartIndexMap.indexInMarkdown,
									),
									nextSelectionMarkdown: '',
								} as const;
							/** NOTE: 선택된 라인이 최소 두줄 이상이며 마지막으로 선택된 라인인 경우  */
							case index === finalEndIndexMap.indexInMarkdownList:
								return {
									type: 'last-line',
									prevSelectionMarkdown: '',
									selectionMarkdown: markdown.slice(
										0,
										finalEndIndexMap.indexInMarkdown,
									),
									nextSelectionMarkdown: markdown.slice(
										finalEndIndexMap.indexInMarkdown,
									),
								} as const;
							/** NOTE: 선택된 라인이 최소 두줄 이상이며 첫번째와 마지막을 제외한 라인인 경우 */
							default:
								return {
									type: 'selection-line',
									prevSelectionMarkdown: '',
									selectionMarkdown: markdown,
									nextSelectionMarkdown: '',
								} as const;
						}
					})();

					const newMarkdown = replaceSelectionMarkdown({
						type,
						prevSelectionMarkdown,
						selectionMarkdown,
						nextSelectionMarkdown,
					});

					const { nextSelectionStart, nextSelectionEnd } = (() => {
						if (newMarkdown === null) {
							return {
								nextSelectionStart: acc.nextSelectionStart,
								nextSelectionEnd:
									acc.nextSelectionEnd - markdown.length - 1,
							};
						}

						const gap = newMarkdown.length - markdown.length;

						if (type === 'same-selection' || type === 'same-line') {
							if (nextSelectionSameGapType === 'include') {
								return {
									nextSelectionStart: acc.nextSelectionStart,
									nextSelectionEnd:
										acc.nextSelectionEnd + gap,
								};
							}
							if (nextSelectionSameGapType === 'exclude') {
								return {
									nextSelectionStart:
										acc.nextSelectionStart + gap,
									nextSelectionEnd:
										acc.nextSelectionEnd + gap,
								};
							}
							if (nextSelectionSameGapType === 'exclude-half') {
								return {
									nextSelectionStart:
										acc.nextSelectionStart +
										Math.round(gap / 2),
									nextSelectionEnd:
										acc.nextSelectionEnd +
										Math.round(gap / 2),
								};
							}
						}
						if (type === 'first-line') {
							if (nextSelectionStartGapType === 'include') {
								return {
									nextSelectionStart: acc.nextSelectionStart,
									nextSelectionEnd:
										acc.nextSelectionEnd + gap,
								};
							}
							if (nextSelectionStartGapType === 'exclude') {
								return {
									nextSelectionStart:
										acc.nextSelectionStart + gap,
									nextSelectionEnd:
										acc.nextSelectionEnd + gap,
								};
							}
						}
						if (type === 'last-line') {
							if (nextSelectionEndGapType === 'include') {
								return {
									nextSelectionStart: acc.nextSelectionStart,
									nextSelectionEnd:
										acc.nextSelectionEnd + gap,
								};
							}
							if (nextSelectionEndGapType === 'exclude') {
								return {
									nextSelectionStart: acc.nextSelectionStart,
									nextSelectionEnd: acc.nextSelectionEnd,
								};
							}
						}
						if (type === 'selection-line') {
							return {
								nextSelectionStart: acc.nextSelectionStart,
								nextSelectionEnd: acc.nextSelectionEnd + gap,
							};
						}
						throw new Error('여기까지 올 일이 없습니다.');
					})();

					return {
						markdownList: [...acc.markdownList, newMarkdown],
						nextSelectionStart,
						nextSelectionEnd,
					};
				},
				{
					markdownList: [] as Array<string | null>,
					nextSelectionStart: e.currentTarget.selectionStart,
					nextSelectionEnd: e.currentTarget.selectionEnd,
				},
			);

			const finalNewValue = parseMarkdownListToValue(
				changeValueParam.markdownList.filter((markdown) => {
					return typeof markdown === 'string';
				}) as Array<string>,
			);

			const finalNextSelectionStart = (() => {
				switch (moveTo) {
					case 'first':
						return changeValueParam.nextSelectionStart;
					case 'last':
						return changeValueParam.nextSelectionEnd;
					default:
						return changeValueParam.nextSelectionStart;
				}
			})();
			const finalNextSelectionEnd = (() => {
				switch (moveTo) {
					case 'first':
						return changeValueParam.nextSelectionStart;
					case 'last':
						return changeValueParam.nextSelectionEnd;
					default:
						return changeValueParam.nextSelectionEnd;
				}
			})();

			changeValueWithKeyDown({
				newValue: finalNewValue,
				nextSelectionStart: finalNextSelectionStart,
				nextSelectionEnd: finalNextSelectionEnd,
			});
		};

		const toggleSelectionRange = (styledTextType: StyledTextType) => {
			changeSelectionRange({
				nextSelectionSameGapType: 'include',
				nextSelectionStartGapType: 'include',
				nextSelectionEndGapType: 'include',
				replaceSelectionMarkdown: ({
					prevSelectionMarkdown,
					selectionMarkdown,
					nextSelectionMarkdown,
				}) => {
					return `${prevSelectionMarkdown}${toggleStyledText({
						styledTextType,
						markdown: selectionMarkdown,
					})}${nextSelectionMarkdown}`;
				},
			});
		};

		return {
			updateCurrentMarkdownLine,
			insertMarkdownWithSelectionStart,
			changeSelectionRange,
			toggleSelectionRange,
		};
	};

	const changeValueInOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const changeValue = makeChangeValue(e);
		changeValue();
	};

	const undo = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		e.preventDefault();

		if (undoHistoryStack.length >= 2) {
			const undoedValueInfo = undoHistoryStack.pop()!;

			const newUndoHistoryStack = [...undoHistoryStack];
			const newRedoHistoryStack = [...redoHistoryStack, undoedValueInfo];

			setUndoHistoryStack(newUndoHistoryStack);
			setRedoHistoryStack(newRedoHistoryStack);

			setValue(
				newUndoHistoryStack[newUndoHistoryStack.length - 1]!.value,
			);
			e.currentTarget.value =
				newUndoHistoryStack[newUndoHistoryStack.length - 1]!.value;
			e.currentTarget.setSelectionRange(
				newUndoHistoryStack[newUndoHistoryStack.length - 1]!
					.selectionStart,
				newUndoHistoryStack[newUndoHistoryStack.length - 1]!
					.selectionEnd,
			);
		}
	};

	const redo = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		e.preventDefault();

		if (redoHistoryStack.length >= 1) {
			const redoedValueInfo = redoHistoryStack.pop()!;

			const newRedoHistoryStack = [...redoHistoryStack];
			const newUndoHistoryStack = [...undoHistoryStack, redoedValueInfo];

			setRedoHistoryStack(newRedoHistoryStack);
			setUndoHistoryStack(newUndoHistoryStack);

			setValue(redoedValueInfo.value);
			e.currentTarget.value = redoedValueInfo.value;
			e.currentTarget.setSelectionRange(
				redoedValueInfo.selectionStart,
				redoedValueInfo.selectionEnd,
			);
		}
	};

	const contextValue = useMemo(() => {
		return {
			value,
			setValue,
			makeChangeValueInOnKeyDown,
			changeValueInOnChange,
			undo,
			redo,
		};
	}, [value, undoHistoryStack, redoHistoryStack, undo, redo]);

	return (
		<MarkdownContext.Provider value={contextValue}>
			<ParserProvider>
				<KeyMapProvider>{children}</KeyMapProvider>
			</ParserProvider>
		</MarkdownContext.Provider>
	);
}
