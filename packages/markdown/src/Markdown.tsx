import { Editor } from './sub-components';
import { MarkdownProvider } from './contexts/Markdown.context';

import type { MarkdownProps } from './types/markdown';

function Markdown({ value, setValue, children }: MarkdownProps) {
	return (
		<MarkdownProvider value={value} setValue={setValue}>
			{children}
		</MarkdownProvider>
	);
}

Markdown.Editor = Editor;

export default Markdown;
