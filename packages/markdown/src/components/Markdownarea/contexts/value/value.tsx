import { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useMarkdownareaPropsContext } from '@/components/Markdownarea/contexts/props';
import { useMarkdownareaHistoryContext } from '@/components/Markdownarea/contexts/history';
import { reorderOli } from '@/utils/markdown';
import type { MarkdownareaValueContextValue, MakeChangeValue } from './types';

const MarkdownareaValueContext = createContext<MarkdownareaValueContextValue>({
	makeChangeValue: () => () => {},
	onChange: () => {},
});

export const useMarkdownareaValueContext = () => {
    return useContext(MarkdownareaValueContext)
};

export function MarkdownareaValueProvider({ children }: PropsWithChildren) {
    const { setValue } = useMarkdownareaPropsContext();
	const { recordHistory } = useMarkdownareaHistoryContext();
    
	const makeChangeValue: MakeChangeValue = (e) => {
        return ({ newValue = e.currentTarget.value, nextSelectionStart = e.currentTarget.selectionStart, nextSelectionEnd } = {}) => {
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
    
            recordHistory({
                value: newValue,
                selectionStart: finalSelectionStart,
                selectionEnd: nextSelectionEnd ?? finalSelectionStart,
            })
        };
    }

	const onChange: MarkdownareaValueContextValue['onChange'] = (e) => {
		const changeValue = makeChangeValue(e);
		changeValue();
	}

    const contextValue = useMemo(() => {
        return { makeChangeValue, onChange }
    }, [makeChangeValue, onChange])

    return (
        <MarkdownareaValueContext.Provider value={contextValue}>
            {children}
        </MarkdownareaValueContext.Provider>
    )
}