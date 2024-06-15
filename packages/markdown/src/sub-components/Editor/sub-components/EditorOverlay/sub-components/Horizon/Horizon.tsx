import { textCommonClassName } from '@/sub-components/Editor/sub-components/EditorOverlay/EditorOverlay.constants';
import { cn } from '@/utils/tailwindcss';

function Horizon() {
	return <pre className={cn(textCommonClassName, 'text-slate-400')}>---</pre>;
}

export default Horizon;
