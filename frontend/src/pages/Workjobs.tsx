import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

type WorkjobRow = {
    name: string | null
    location: string | null
    supervisor: string | null
    supervisor_email: string | null
    spots: string | null
    blocks: string | null
    selected_or_assigned: string | null
    description: string | null
    notes: string | null
}

export default function Workjobs() {
    const [rows, setRows] = useState<WorkjobRow[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')

    // First load — total count baseline.
    useEffect(() => {
        fetch('/api/search?s=workjobs')
            .then((r) => r.json())
            .then((data: WorkjobRow[]) => setTotal(data.length))
    }, [])

    // Search / filter fetch.
    useEffect(() => {
        setLoading(true)
        const q = query.trim()
        const url = q
            ? `/api/search?q=${encodeURIComponent(q)}&s=workjobs`
            : '/api/search?s=workjobs'
        fetch(url)
            .then((r) => r.json())
            .then((data: WorkjobRow[]) => {
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
            {/* Frosted header block. */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="dir-header"
            >
                <h1>Workjobs Directory</h1>

                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, location, or description..."
                        className="h-[46px] rounded-none border-black/25 bg-white/80 pl-11 text-base font-medium focus-visible:border-black/35 focus-visible:ring-[3px] focus-visible:ring-sky/50"
                    />
                </div>

                <p className="mt-1 text-[0.88rem] font-normal text-muted-foreground">
                    {loading
                        ? 'Loading workjobs...'
                        : rows.length === total
                        ? 'Showing all workjobs!'
                        : `Showing ${rows.length} of ${total} workjob${total !== 1 ? 's' : ''}`}
                </p>
            </motion.div>

            {/* Advisory notice — matches the Flask disclaimer. */}
            <div className="mb-4 flex items-baseline gap-3 border border-black/10 bg-white/70 p-4 text-[0.88rem] leading-relaxed text-muted-foreground backdrop-blur-md">
                <span className="shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-navy opacity-85">
                    Note
                </span>
                <span>This is for informational purposes only. Please do not excessively request workjobs.</span>
            </div>

            <div className="dir-grid">
                <AnimatePresence mode="popLayout">
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 w-full rounded-none" />
                        ))}
                    {!loading &&
                        rows.map((j, i) => (
                            <motion.div
                                key={(j.name || '') + i}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                                className="dir-card"
                            >
                                <h3 className="mb-2.5 text-[1.15rem] font-bold leading-tight text-foreground">
                                    {j.name || 'Untitled Position'}
                                </h3>

                                <span className="mb-3 inline-block self-start border border-navy/15 bg-white/72 px-2.5 py-[3px] text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-navy">
                                    {j.location || 'Location TBD'}
                                </span>

                                {j.description && (
                                    <div className="mt-2.5 border-t border-black/15 pt-2.5 text-[0.9rem] leading-relaxed text-muted-foreground">
                                        <span className="font-semibold text-foreground">Description: </span>
                                        {j.description}
                                    </div>
                                )}

                                {j.notes && (
                                    <div className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
                                        <span className="font-semibold text-foreground">Note: </span>
                                        {j.notes}
                                    </div>
                                )}
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
                    <h2 className="text-lg font-medium text-foreground">No workjobs found</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search.</p>
                </motion.div>
            )}
        </div>
    )
}
