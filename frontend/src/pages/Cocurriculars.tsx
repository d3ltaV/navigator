import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ViewToggle, useViewMode } from '@/components/ViewToggle'

type CocurricularRow = {
    name: string | null
    category: string | null
    season: string | null
    prerequisites: string | null
    location: string | null
    schedule: string | null
    advisor?: string | null
}

export default function Cocurriculars() {
    const [rows, setRows] = useState<CocurricularRow[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [view, setView] = useViewMode('cocurricularsView')
    const [expanded, setExpanded] = useState<number | null>(null)
    const hasFetchedOnce = useRef(false)

    useEffect(() => {
        fetch('/api/search?s=cocurriculars')
            .then((r) => r.json())
            .then((data: CocurricularRow[]) => setTotal(data.length))
    }, [])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 200)
        return () => clearTimeout(t)
    }, [query])

    useEffect(() => {
        setLoading(true)
        const q = debouncedQuery.trim()
        const url = q
            ? `/api/search?q=${encodeURIComponent(q)}&s=cocurriculars`
            : '/api/search?s=cocurriculars'
        fetch(url)
            .then((r) => r.json())
            .then((data: CocurricularRow[]) => {
                setRows(data)
                setLoading(false)
                hasFetchedOnce.current = true
            })
    }, [debouncedQuery])

    return (
        <div
            className="mx-auto"
            style={{
                maxWidth: 1120,
                padding: 'clamp(24px, 5vh, 48px) clamp(16px, 3vw, 32px) 64px',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="dir-header"
            >
                <h1>Cocurriculars Directory</h1>

                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, location, category, season, prerequisites..."
                        className="h-[46px] rounded-none border-black/25 bg-white/80 pl-11 text-base font-medium focus-visible:border-black/35 focus-visible:ring-[3px] focus-visible:ring-sky/50"
                    />
                </div>

                <div className="results-info-row">
                    <p className="text-[0.88rem] font-normal text-muted-foreground">
                        {loading
                            ? 'Loading cocurriculars...'
                            : rows.length === total
                            ? 'Showing all cocurriculars!'
                            : `Showing ${rows.length} of ${total} cocurricular${total !== 1 ? 's' : ''}`}
                    </p>
                    <ViewToggle mode={view} onChange={setView} />
                </div>
            </motion.div>

            {view === 'list' ? (
                <div className="dir-list">
                    {rows.map((c, i) => {
                        const isOpen = expanded === i
                        return (
                            <div key={(c.name || '') + i} className="dir-list-item">
                                <button
                                    type="button"
                                    className="dir-list-row"
                                    aria-expanded={isOpen}
                                    onClick={() => setExpanded(isOpen ? null : i)}
                                >
                                    <span className="dir-list-title">{c.name || 'Untitled Position'}</span>
                                    <span className="dir-list-meta">
                                        {c.category && <span className="pill">{c.category}</span>}
                                    </span>
                                    <ChevronRight className="dir-list-caret h-4 w-4" />
                                </button>
                                {isOpen && (
                                    <div className="dir-list-detail">
                                        <dl className="mt-1 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
                                            <MetaRow label="Category" value={c.category} />
                                            <MetaRow label="Season" value={c.season} />
                                            <MetaRow label="Prereq" value={c.prerequisites || 'None'} />
                                            <MetaRow label="Location" value={c.location || 'TBD'} />
                                            <MetaRow label="Schedule" value={c.schedule || 'TBD'} />
                                        </dl>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
            <div className="dir-grid">
                {loading && !hasFetchedOnce.current &&
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-56 w-full rounded-none" />
                    ))}
                {(!loading || hasFetchedOnce.current) &&
                    rows.map((c, i) => (
                        <motion.div
                            key={(c.name || '') + i}
                            initial={hasFetchedOnce.current ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                            className="dir-card"
                        >
                                <h3 className="mb-2.5 text-[1.15rem] font-bold leading-tight text-foreground">
                                    {c.name || 'Untitled Position'}
                                </h3>

                                <Separator className="mb-3" />

                                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
                                    <MetaRow label="Category" value={c.category} />
                                    <MetaRow label="Season" value={c.season} />
                                    <MetaRow label="Prereq" value={c.prerequisites || 'None'} />
                                    <MetaRow label="Location" value={c.location || 'TBD'} />
                                    <MetaRow label="Schedule" value={c.schedule || 'TBD'} />
                                </dl>
                        </motion.div>
                    ))}
            </div>
            )}

            {!loading && rows.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-14 border border-dashed border-black/28 bg-white/50 p-14 text-center backdrop-blur-sm"
                >
                    <h2 className="text-lg font-medium text-foreground">No cocurriculars found</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search.</p>
                </motion.div>
            )}
        </div>
    )
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
    return (
        <>
            <dt className="pt-[2px] text-[0.72rem] font-bold uppercase tracking-[0.1em] text-navy">
                {label}
            </dt>
            <dd className="text-[0.88rem] font-normal leading-tight text-muted-foreground">
                {value || '—'}
            </dd>
        </>
    )
}
