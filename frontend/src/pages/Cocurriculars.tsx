import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

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

    useEffect(() => {
        fetch('/api/search?s=cocurriculars')
            .then((r) => r.json())
            .then((data: CocurricularRow[]) => setTotal(data.length))
    }, [])

    useEffect(() => {
        setLoading(true)
        const q = query.trim()
        const url = q
            ? `/api/search?q=${encodeURIComponent(q)}&s=cocurriculars`
            : '/api/search?s=cocurriculars'
        fetch(url)
            .then((r) => r.json())
            .then((data: CocurricularRow[]) => {
                setRows(data)
                setLoading(false)
            })
    }, [query])

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

                <p className="mt-1 text-[0.88rem] font-normal text-muted-foreground">
                    {loading
                        ? 'Loading cocurriculars...'
                        : rows.length === total
                        ? 'Showing all cocurriculars!'
                        : `Showing ${rows.length} of ${total} cocurricular${total !== 1 ? 's' : ''}`}
                </p>
            </motion.div>

            <div className="dir-grid">
                <AnimatePresence mode="popLayout">
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 w-full rounded-none" />
                        ))}
                    {!loading &&
                        rows.map((c, i) => (
                            <motion.div
                                key={(c.name || '') + i}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
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
                </AnimatePresence>
            </div>

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
            <dt className="pt-[2px] text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </dt>
            <dd className="text-[0.9rem] leading-tight text-foreground">{value || '—'}</dd>
        </>
    )
}
