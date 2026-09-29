import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

type Workjob = {
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

const LOCATIONS: { title: string; position: { lat: number; lng: number } }[] = [
    { title: 'Gilder', position: { lat: 42.667144, lng: -72.481665 } },
    { title: 'Dorms', position: { lat: 42.6676204, lng: -72.4838411 } },
    { title: 'Admissions (Bolger)', position: { lat: 42.66644601940982, lng: -72.48515196277874 } },
    { title: 'Alumni Hall', position: { lat: 42.66748046088102, lng: -72.48557843400381 } },
    { title: 'Schauffler Library', position: { lat: 42.66899511246868, lng: -72.48312287168545 } },
    { title: 'Gym', position: { lat: 42.66622766388029, lng: -72.48156656247123 } },
    { title: 'RAC', position: { lat: 42.66798729516262, lng: -72.4816328964554 } },
    { title: "O'Connor Health Center", position: { lat: 42.66725816449024, lng: -72.4867499314032 } },
    { title: 'Communications office', position: { lat: 42.67012671214381, lng: -72.48195950620217 } },
    { title: 'Early Childhood Center', position: { lat: 42.66832414764135, lng: -72.47894604438869 } },
    { title: 'Farm', position: { lat: 42.670343686705166, lng: -72.48129390883983 } },
    { title: 'Plant Facilities', position: { lat: 42.66961202001847, lng: -72.48068772960862 } },
    { title: 'BEV', position: { lat: 42.66896317632714, lng: -72.48240568446545 } },
    { title: 'Forest', position: { lat: 42.67102844380024, lng: -72.48804669028948 } },
    { title: 'Blake', position: { lat: 42.66851986413596, lng: -72.4847851241787 } },
]

const BOUNDS = { north: 42.72, south: 42.62, west: -72.545, east: -72.43 }

export default function CampusMap() {
    const mapDivRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const [popup, setPopup] = useState<{ title: string; jobs: Workjob[] } | null>(null)
    const [detail, setDetail] = useState<{
        job: Workjob
        anchorX: number
        anchorY: number
    } | null>(null)
    const [pos, setPos] = useState<{ top: number; triangleTop: number }>({
        top: 0,
        triangleTop: 18,
    })

    useLayoutEffect(() => {
        if (!detail || !cardRef.current) return
        const height = cardRef.current.offsetHeight
        const idealTop = detail.anchorY - 26
        const maxTop = window.innerHeight - height - 20
        const cardTop = Math.max(20, Math.min(idealTop, maxTop))
        const triangleTop = Math.max(6, Math.min(height - 22, detail.anchorY - cardTop - 8))
        setPos({ top: cardTop, triangleTop })
    }, [detail])

    useEffect(() => {
        let cancelled = false

        fetch('/api/config')
            .then((r) => r.json())
            .then(async ({ mapsApiKey }: { mapsApiKey: string }) => {
                if (!mapsApiKey) return
                setOptions({ key: mapsApiKey, v: 'weekly' })
                const { Map } = await importLibrary('maps')
                const { AdvancedMarkerElement } = await importLibrary('marker')
                if (cancelled || !mapDivRef.current) return

                const map = new Map(mapDivRef.current, {
                    zoom: 16,
                    center: { lat: 42.668, lng: -72.4838 },
                    mapId: 'ilovematcha',
                    restriction: { latLngBounds: BOUNDS, strictBounds: true },
                    disableDefaultUI: false,
                })

                LOCATIONS.forEach(({ title, position }) => {
                    const el = document.createElement('div')
                    el.className = 'rect-pin'
                    el.textContent = title

                    const marker = new AdvancedMarkerElement({
                        map,
                        position,
                        title,
                        content: el,
                    })

                    marker.addListener('click', () => {
                        fetch(`/api/workjobs/${encodeURIComponent(title)}`)
                            .then((r) => r.json())
                            .then((data) => {
                                setPopup({
                                    title,
                                    jobs: Array.isArray(data) ? data : [],
                                })
                                setDetail(null)
                            })
                    })
                })
            })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div
            className="relative flex flex-col items-stretch gap-3 md:flex-row md:gap-6"
            style={{ padding: 'clamp(12px, 2vw, 24px)' }}
        >
            <AnimatePresence initial={false}>
                {popup && (
                    <motion.aside
                        key="workjob-sidebar"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="relative order-first flex w-full shrink-0 flex-col overflow-hidden border-y border-r border-black/10 bg-white/[0.62] backdrop-blur-md backdrop-saturate-[1.08] md:-my-[clamp(12px,2vw,24px)] md:-ml-[clamp(12px,2vw,24px)] md:h-[calc(100vh-68px)] md:w-[320px]"
                        style={{ minHeight: 320 }}
                    >
                        <button
                            onClick={() => {
                                setPopup(null)
                                setDetail(null)
                            }}
                            aria-label="Close"
                            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-navy"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
                            <h3
                                className="pr-8 font-semibold leading-[1.15] tracking-tight text-foreground"
                                style={{ fontSize: '1.5rem' }}
                            >
                                {popup.title}
                            </h3>

                            {popup.jobs.length > 0 ? (
                                <>
                                    <p className="mt-1 text-[0.78rem] text-muted-foreground">
                                        {popup.jobs.length} workjob{popup.jobs.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="mt-4 flex flex-col">
                                        {popup.jobs.map((j, idx) => {
                                            const active = detail?.job.name === j.name
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        const btn = e.currentTarget
                                                        const linkRect = btn.getBoundingClientRect()
                                                        const sidebar = btn.closest('aside')
                                                        const anchorX = sidebar
                                                            ? sidebar.getBoundingClientRect().right
                                                            : linkRect.right
                                                        setDetail({
                                                            job: j,
                                                            anchorX,
                                                            anchorY: linkRect.top + linkRect.height / 2,
                                                        })
                                                    }}
                                                    className={
                                                        'group flex items-center justify-between border-t border-black/5 py-2.5 text-left text-[0.95rem] font-medium transition-colors first:border-t-0 ' +
                                                        (active
                                                            ? 'text-navy'
                                                            : 'text-foreground hover:text-navy')
                                                    }
                                                >
                                                    <span>{j.name ?? 'Unnamed Workjob'}</span>
                                                    <span
                                                        className={
                                                            'transition-transform ' +
                                                            (active
                                                                ? 'translate-x-0.5 text-navy'
                                                                : 'text-black/25 group-hover:translate-x-0.5 group-hover:text-navy')
                                                        }
                                                    >
                                                        →
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-3 text-[0.9rem] italic text-muted-foreground">
                                    No workjobs found at this location.
                                </p>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <div
                ref={mapDivRef}
                className="min-w-0 flex-1 border border-black/45 bg-white/40"
                style={{
                    height: 'calc(100vh - 68px - 48px)',
                    minHeight: 420,
                }}
            />

            <AnimatePresence>
                {detail && (
                    <motion.div
                        ref={cardRef}
                        key={detail.job.name ?? 'detail'}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed z-[60] w-[280px] bg-white/75 backdrop-blur-md backdrop-saturate-[1.08]"
                        style={{
                            left: detail.anchorX + 12,
                            top: pos.top,
                            transformOrigin: `-8px ${pos.triangleTop + 8}px`,
                        }}
                    >
                        <span
                            aria-hidden
                            className="pointer-events-none absolute"
                            style={{
                                left: -8,
                                top: pos.triangleTop,
                                width: 0,
                                height: 0,
                                borderTop: '8px solid transparent',
                                borderBottom: '8px solid transparent',
                                borderRight: '8px solid rgba(255, 255, 255, 0.75)',
                            }}
                        />

                        <button
                            onClick={() => setDetail(null)}
                            aria-label="Close"
                            className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center text-muted-foreground transition-colors hover:text-navy"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="px-4 pb-4 pt-4">
                            <h3
                                className="pr-6 font-semibold leading-[1.2] tracking-tight text-foreground"
                                style={{ fontSize: '1.05rem' }}
                            >
                                {detail.job.name ?? 'Untitled Workjob'}
                            </h3>

                            {detail.job.description && (
                                <div className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        Description:{' '}
                                    </span>
                                    {detail.job.description}
                                </div>
                            )}

                            {detail.job.notes && (
                                <div className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
                                    <span className="font-semibold text-foreground">Note: </span>
                                    {detail.job.notes}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

