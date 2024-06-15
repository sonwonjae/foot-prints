import { styledTextRegExp, textCommonClassName } from '@/sub-components/Editor/sub-components/EditorOverlay/EditorOverlay.constants';
import { cn } from '@/utils/tailwindcss';

interface StyledTextProps {
	children: string;
}

function StyledText({ children: markdown }: StyledTextProps) {
	return (
		<>
			{markdown.split(styledTextRegExp).map((splittedMarkdown) => {
				const isStyledText = styledTextRegExp.test(splittedMarkdown);

				if (!isStyledText) {
					return splittedMarkdown;
				}

				const styledTextClassName = (() => {
					const classNames = [
						textCommonClassName
					];

					if (/(\[.*?\]\(.*?\))/.test(splittedMarkdown)) {
						classNames.push(
							'text-teal-400',
							'drop-shadow-bold',
							'underline',
						);
					}

					if (/(!\[.*?\]\(.*?\))/.test(splittedMarkdown)) {
						classNames.push(
							'text-blue-400',
							'drop-shadow-bold',
							'underline',
						);
					}
					/** NOTE: strike-through style */
					if (/~~.*~~/.test(splittedMarkdown)) {
						classNames.push('line-through');
					}

					/** NOTE: code style */
					if (/`.*`/.test(splittedMarkdown)) {
						classNames.push(
							'bg-slate-100',
							'rounded-sm',
							'text-red-400',
						);
					}

					/** NOTE: highlight style */
					if (/==.*==/.test(splittedMarkdown)) {
						classNames.push(
							'bg-yellow-100',
							'rounded-none',
							'drop-shadow-bold',
						);
					}

					switch (true) {
						/** NOTE: bold-italic style */
						case /\*\*\*[^*]*\*\*\*/.test(splittedMarkdown):
							classNames.push('drop-shadow-bold', 'italic');
							break;
						/** NOTE: bold style */
						case /\*\*[^*]*\*\*/.test(splittedMarkdown):
							classNames.push('drop-shadow-bold');
							break;
						/** NOTE: italic style */
						case /\*[^*]*\*/.test(splittedMarkdown):
							classNames.push('italic');
							break;
						default:
							break;
					}

					return cn(...classNames);
				})();

				return (
					<span className={cn('text-slate-800', styledTextClassName)}>
						{splittedMarkdown}
					</span>
				);
			})}
		</>
	);
}

export default StyledText;
