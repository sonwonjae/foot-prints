import type { ComponentProps, Dispatch } from 'react';

export interface MarkdownareaPropsProviderProps extends ComponentProps<'textarea'>{
    value: string;
    setValue: Dispatch<React.SetStateAction<string>>;
}


export interface MarkdownareaPropsContextValue extends Omit<MarkdownareaPropsProviderProps, 'onChange' | 'onKeyDown'> {
    onChangeInherit?: MarkdownareaPropsProviderProps['onChange'];
    onKeyDownInherit?: MarkdownareaPropsProviderProps['onKeyDown'];
}