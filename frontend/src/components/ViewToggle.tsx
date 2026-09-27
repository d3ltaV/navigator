import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'

export type ViewMode = 'list' | 'grid'

export function ViewToggle({
    mode,
    onChange,
}: {
    mode: ViewMode
    onChange: (m: ViewMode) => void
}) {
    return (
        <div className="view-toggle" role="group" aria-label="View mode">
            <button
                type="button"
                aria-pressed={mode === 'list'}
                onClick={() => onChange('list')}
                title="List view"
            >
                <List />
            </button>
            <button
                type="button"
                aria-pressed={mode === 'grid'}
                onClick={() => onChange('grid')}
                title="Grid view"
            >
                <LayoutGrid />
            </button>
        </div>
    )
}

/** Persist view mode per catalog key in localStorage. */
export function useViewMode(
    key: string,
    initial: ViewMode = 'list'
): [ViewMode, (m: ViewMode) => void] {
    const [mode, setModeState] = useState<ViewMode>(() => {
        try {
            const v = localStorage.getItem(key)
            return v === 'grid' || v === 'list' ? v : initial
        } catch {
            return initial
        }
    })
    const setMode = (m: ViewMode) => {
        try {
            localStorage.setItem(key, m)
        } catch {
            /* ignore */
        }
        setModeState(m)
    }
    return [mode, setMode]
}
