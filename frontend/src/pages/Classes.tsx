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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

type ClassRow = {
    dpt: string | null
    code: string | null
    name: string | null
    credit: string | null
    nine: boolean
    ten: boolean
    eleven: boolean
    twelve: boolean
    pg: boolean
    prereq: string | null
    ncaa: boolean
    desc: string | null
}

type SortKey = 'name' | 'code' | 'credit' | 'ncaa'

function extractSubject(code: string | null) {
    if (!code) return ''
    const m = code.match(/^[A-Z_]+/)
    return m ? m[0] : ''
}

export default function Classes() {
    const [rows, setRows] = useState<ClassRow[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [subject, setSubject] = useState<string>('all')
    const [department, setDepartment] = useState<string>('all')
    const [sort, setSort] = useState<SortKey>('name')
    const [descending, setDescending] = useState(false)

    useEffect(() => {
        setLoading(true)
        const q = query.trim()
        const url = q
            ? `/api/search?q=${encodeURIComponent(q)}&s=classes`
            : '/api/search?s=classes'
        fetch(url)
            .then((r) => r.json())
            .then((data: ClassRow[]) => {
                setRows(data)
                setLoading(false)
            })
    }, [query])

    const subjects = useMemo(
        () => Array.from(new Set(rows.map((c) => extractSubject(c.code)).filter(Boolean))).sort(),
        [rows]
    )
    const departments = useMemo(
        () => Array.from(new Set(rows.map((c) => c.dpt).filter((x): x is string => !!x))).sort(),
        [rows]
    )

    const filtered = useMemo(() => {
        let list = rows
        if (subject !== 'all') list = list.filter((c) => extractSubject(c.code) === subject)
        if (department !== 'all') list = list.filter((c) => c.dpt === department)
        const sorted = [...list].sort((a, b) => {
            switch (sort) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '')
                case 'code':
                    return (a.code || '').localeCompare(b.code || '')
                case 'credit':
                    return (parseFloat(a.credit || '0') || 0) - (parseFloat(b.credit || '0') || 0)
                case 'ncaa':
                    return (b.ncaa ? 1 : 0) - (a.ncaa ? 1 : 0)
            }
        })
        if (descending) sorted.reverse()
        return sorted
    }, [rows, subject, department, sort, descending])

    return (
        <div
            className="mx-auto"
            style={{
                maxWidth: 1120,
                padding: 'clamp(24px, 5vh, 48px) clamp(16px, 3vw, 32px) 64px',
            }}
        >
            {/* Frosted header block — matches the Flask .classes-header. */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="dir-header"
            >
                <h1>Classes Directory</h1>

                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by class name, code, department, or description..."
                        className="h-[46px] rounded-none border-black/25 bg-white/80 pl-11 text-base font-medium focus-visible:border-black/35 focus-visible:ring-[3px] focus-visible:ring-sky/50"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <ChipSelect label="Subject" value={subject} onChange={setSubject} options={[{ value: 'all', label: 'All subjects' }, ...subjects.map((s) => ({ value: s, label: s }))]} />
                    <ChipSelect label="Department" value={department} onChange={setDepartment} options={[{ value: 'all', label: 'All departments' }, ...departments.map((d) => ({ value: d, label: d }))]} />
                    <ChipSelect
                        label="Sort"
                        value={sort}
                        onChange={(v) => setSort(v as SortKey)}
                        options={[
                            { value: 'name', label: 'Class name' },
                            { value: 'code', label: 'Class code' },
                            { value: 'credit', label: 'Credit' },
                            { value: 'ncaa', label: 'NCAA' },
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
                        ? 'Loading classes...'
                        : filtered.length === rows.length
                        ? 'Showing all classes!'
                        : `Showing ${filtered.length} of ${rows.length} classes`}
                </p>
            </motion.div>

            {/* Grid */}
            <div className="dir-grid">
                <AnimatePresence mode="popLayout">
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 w-full rounded-none" />
                        ))}
                    {!loading &&
                        filtered.map((c, i) => (
                            <motion.div
                                key={(c.code || c.name || '') + i}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                                className="dir-card"
                            >
                                <h3 className="mb-2.5 text-[1.15rem] font-bold leading-tight text-foreground">
                                    {c.name}
                                </h3>

                                <div className="mb-3 flex flex-wrap gap-1.5">
                                    {c.nine && <TagPill>9th</TagPill>}
                                    {c.ten && <TagPill>10th</TagPill>}
                                    {c.eleven && <TagPill>11th</TagPill>}
                                    {c.twelve && <TagPill>12th</TagPill>}
                                    {c.pg && <TagPill>PG</TagPill>}
                                    {c.ncaa && (
                                        <Badge className="rounded-none bg-navy px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-paper hover:bg-navy/90">
                                            NCAA
                                        </Badge>
                                    )}
                                </div>

                                <Separator className="mb-3" />

                                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
                                    <MetaRow label="Code" value={c.code} />
                                    <MetaRow label="Credit" value={c.credit} />
                                    <MetaRow label="Department" value={c.dpt} />
                                    <MetaRow label="Prereq" value={c.prereq || 'None'} />
                                </dl>

                                {c.desc && (
                                    <div className="mt-2.5 border-t border-black/15 pt-2.5 text-[0.9rem] leading-relaxed text-muted-foreground">
                                        <span className="font-semibold text-foreground">Description: </span>
                                        {c.desc}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>

            {!loading && filtered.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-14 border border-dashed border-black/28 bg-white/50 p-14 text-center backdrop-blur-sm"
                >
                    <h2 className="text-lg font-medium text-foreground">No classes found</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
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
            <SelectTrigger
                className="h-9 w-auto min-w-0 gap-2 rounded-none border-navy/25 bg-white/72 px-3 text-[0.85rem] font-medium text-navy focus:ring-0 focus-visible:ring-2 focus-visible:ring-sky/40 [&>span:last-child]:hidden"
            >
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

function TagPill({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="inline-block border border-navy/15 bg-white/72 px-2.5 py-[3px] text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-navy"
        >
            {children}
        </span>
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
