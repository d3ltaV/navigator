import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

type ClubRow = {
    'Name of Club'?: string
    'Type of Club'?: string
    'Description of Club'?: string
    'Club Meeting Time and Location'?: string
}

type SortKey = 'name' | 'type'

export default function Clubs() {
    const [rows, setRows] = useState<ClubRow[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState<SortKey>('name')
    const [descending, setDescending] = useState(false)

    useEffect(() => {
        fetch('/api/search?s=clubs')
            .then((r) => r.json())
            .then((data: ClubRow[]) => setTotal(data.length))
    }, [])

    useEffect(() => {
        setLoading(true)
        const q = query.trim()
        const url = q ? `/api/search?q=${encodeURIComponent(q)}&s=clubs` : '/api/search?s=clubs'
        fetch(url)
            .then((r) => r.json())
            .then((data: ClubRow[]) => {
                setRows(data)
                setLoading(false)
            })
    }, [query])

    const sorted = useMemo(() => {
        const list = [...rows].sort((a, b) => {
            if (sort === 'name') return (a['Name of Club'] || '').localeCompare(b['Name of Club'] || '')
            return (a['Type of Club'] || '').localeCompare(b['Type of Club'] || '')
        })
        if (descending) list.reverse()
        return list
    }, [rows, sort, descending])

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
                <h1>Clubs Directory</h1>

                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by Club name or type..."
                        className="h-[46px] rounded-none border-black/25 bg-white/80 pl-11 text-base font-medium focus-visible:border-black/35 focus-visible:ring-[3px] focus-visible:ring-sky/50"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <ChipSelect
                        label="Sort"
                        value={sort}
                        onChange={(v) => setSort(v as SortKey)}
                        options={[
                            { value: 'name', label: 'Club Name' },
                            { value: 'type', label: 'Club Type' },
                        ]}
                    />
                    <label className="ml-1 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                            checked={descending}
                            onCheckedChange={(v) => setDescending(v === true)}
                            className="rounded-none border-black/40 data-[state=checked]:bg-navy data-[state=checked]:border-navy"
                        />
                        Descending
                    </label>
                </div>

                <p className="mt-3 text-[0.88rem] font-normal text-muted-foreground">
                    {loading
                        ? 'Loading Clubs...'
                        : sorted.length === total
                        ? 'Showing all clubs!'
                        : `Showing ${sorted.length} of ${total} club${total !== 1 ? 's' : ''}`}
                </p>
            </motion.div>

            <div className="dir-grid">
                <AnimatePresence mode="popLayout">
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 w-full rounded-none" />
                        ))}
                    {!loading &&
                        sorted.map((c, i) => {
                            const name = c['Name of Club']
                            if (!name) return null
                            const type = c['Type of Club']
                            const meeting = c['Club Meeting Time and Location']
                            const desc = c['Description of Club']
                            return (
                                <motion.div
                                    key={name + i}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                                    className="dir-card"
                                >
                                    <h3 className="mb-2.5 text-[1.15rem] font-bold leading-tight text-foreground">
                                        {name}
                                    </h3>

                                    {type && (
                                        <span className="mb-3 inline-block self-start border border-navy/15 bg-white/72 px-2.5 py-[3px] text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-navy">
                                            {type}
                                        </span>
                                    )}

                                    {meeting && (
                                        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
                                            <dt className="pt-[2px] text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Meeting
                                            </dt>
                                            <dd className="text-[0.9rem] leading-tight text-foreground">{meeting}</dd>
                                        </dl>
                                    )}

                                    {desc && (
                                        <>
                                            <Separator className="my-3" />
                                            <div className="text-[0.9rem] leading-relaxed text-muted-foreground">
                                                <span className="font-semibold text-foreground">Description: </span>
                                                {desc}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )
                        })}
                </AnimatePresence>
            </div>

            {!loading && sorted.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-14 border border-dashed border-black/28 bg-white/50 p-14 text-center backdrop-blur-sm"
                >
                    <h2 className="text-lg font-medium text-foreground">No clubs found</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search.</p>
                </motion.div>
            )}
        </div>
    )
}

function ChipSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-9 w-auto min-w-0 gap-2 rounded-none border-navy/25 bg-white/72 px-3 text-[0.85rem] font-medium text-navy focus:ring-0 focus-visible:ring-2 focus-visible:ring-sky/40 [&>span:last-child]:hidden">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                </span>
                <Separator orientation="vertical" className="h-4 bg-navy/20" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-black/18 bg-white/92 backdrop-blur-xl">
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="rounded-none">
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
