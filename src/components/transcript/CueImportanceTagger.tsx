import type { TranscriptCue } from '../../types/transcript';
import { IMPORTANCE_CONFIG } from '../../types/transcript';

interface CueImportanceTaggerProps {
	cue: TranscriptCue;
	onImportanceChange: (importance: number) => void;
	onClear?: () => void;
	disabled?: boolean;
	className?: string;
}

type RatedStyle = {
	status: string;
	badge: string;
	buttonActive: string;
	buttonBase: string;
};

const RATED_STYLE_MAP: Record<number, RatedStyle> = {
	0: {
		status: 'bg-gray-50 border-l-gray-400 text-gray-700',
		badge: 'bg-gray-100 text-gray-800 border border-gray-300',
		buttonActive: 'bg-gray-600 text-white',
		buttonBase: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
	},
	1: {
		status: 'bg-blue-50 border-l-blue-400 text-blue-700',
		badge: 'bg-blue-100 text-blue-800 border border-blue-200',
		buttonActive: 'bg-blue-600 text-white',
		buttonBase: 'bg-blue-200 text-blue-700 hover:bg-blue-300',
	},
	2: {
		status: 'bg-orange-50 border-l-orange-400 text-orange-700',
		badge: 'bg-orange-100 text-orange-800 border border-orange-200',
		buttonActive: 'bg-orange-600 text-white',
		buttonBase: 'bg-orange-200 text-orange-700 hover:bg-orange-300',
	},
	3: {
		status: 'bg-red-50 border-l-red-400 text-red-700',
		badge: 'bg-red-100 text-red-800 border border-red-200',
		buttonActive: 'bg-red-600 text-white',
		buttonBase: 'bg-red-200 text-red-700 hover:bg-red-300',
	},
};

export function CueImportanceTagger({
	cue,
	onImportanceChange,
	onClear,
	disabled = false,
	className = '',
}: CueImportanceTaggerProps) {
	const selectedConfig = cue.importance !== undefined
		? IMPORTANCE_CONFIG.find((config) => config.level === cue.importance)
		: undefined;

	const ratedStyles = cue.importance !== undefined ? RATED_STYLE_MAP[cue.importance] : undefined;

	const statusClass = ratedStyles?.status ?? 'bg-yellow-50 border-l-yellow-400 text-yellow-800';
	const badgeClass = ratedStyles?.badge ?? 'bg-yellow-100 text-yellow-700 border border-yellow-300 animate-pulse';

	return (
		<section className={`bg-white rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}>
			<header
				className={`p-3 rounded-lg border-l-4 transition-colors duration-200 ${statusClass}`}
			>
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-sm font-semibold">Status: {selectedConfig?.label ?? 'Unrated'}</p>
						<p className="text-xs mt-1 leading-snug opacity-80">
							{selectedConfig?.description ?? 'Assign an importance score so this cue is captured in exports.'}
						</p>
					</div>
					{cue.importance !== undefined && (
						<span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-white/80 text-gray-700 border border-white/60 shadow-sm">
							{cue.importance}
						</span>
					)}
				</div>
			</header>

			<div className="flex flex-wrap items-center gap-2">
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
					{selectedConfig?.label ?? 'Needs rating'}
				</span>
				<span className="text-[11px] text-gray-500">
					Use keys 0-3 to rate quickly.
				</span>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
				{IMPORTANCE_CONFIG.map((config) => {
					const isSelected = cue.importance === config.level;
					const style = RATED_STYLE_MAP[config.level];
					const baseClasses = isSelected ? style.buttonActive : style.buttonBase;

					return (
						<button
							key={config.level}
							type="button"
							disabled={disabled}
							onClick={() => onImportanceChange(config.level)}
							className={`
								w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
								${baseClasses}
								${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
							`}
						>
							<div className="flex flex-col items-center space-y-1">
								<span>{config.level}</span>
								<span className="text-[11px] font-medium leading-none">{config.label}</span>
							</div>
						</button>
					);
				})}
			</div>

			<div className="flex items-center justify-between text-xs text-gray-500">
				<span>
					{selectedConfig ? `Shortcut: ${selectedConfig.shortcut}` : 'Pick a rating to continue'}
				</span>
				{cue.importance !== undefined && onClear && (
					<button
						type="button"
						onClick={onClear}
						disabled={disabled}
						className={`text-blue-600 hover:text-blue-800 transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
					>
						Clear
					</button>
				)}
			</div>
		</section>
	);
}

interface CompactImportanceTaggerProps {
	cue: TranscriptCue;
	onImportanceChange: (importance: number) => void;
	disabled?: boolean;
	className?: string;
}

export function CompactImportanceTagger({
	cue,
	onImportanceChange,
	disabled = false,
	className = '',
}: CompactImportanceTaggerProps) {
	const selectedConfig = cue.importance !== undefined
		? IMPORTANCE_CONFIG.find((config) => config.level === cue.importance)
		: undefined;

	const badgeClass = cue.importance !== undefined
		? RATED_STYLE_MAP[cue.importance].badge
		: 'bg-yellow-100 text-yellow-700 border border-yellow-300 animate-pulse';

	return (
		<div className={`flex flex-wrap items-center gap-3 ${className}`}>
			<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
				{selectedConfig?.label ?? 'Unrated'}
			</span>

			<div className="flex items-center gap-1">
				{IMPORTANCE_CONFIG.map((config) => {
					const isSelected = cue.importance === config.level;
					const style = RATED_STYLE_MAP[config.level];
					const baseClasses = isSelected ? style.buttonActive : style.buttonBase;

					return (
						<button
							key={config.level}
							type="button"
							disabled={disabled}
							onClick={() => onImportanceChange(config.level)}
							className={`
								w-7 h-7 rounded text-xs font-bold transition-all duration-200
								${baseClasses}
								${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
							`}
							aria-label={`Set importance to ${config.label}`}
						>
							{config.level}
						</button>
					);
				})}
			</div>
		</div>
	);
}