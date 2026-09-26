import { useEffect, useRef, useState } from 'react'
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
    const [popup, setPopup] = useState<{ title: string; jobs: Workjob[] } | null>(null)
    const [detail, setDetail] = useState<{ job: Workjob; all: Workjob[] } | null>(null)

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
                            })
                    })
                })
            })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="relative" style={{ padding: 'clamp(12px, 2vw, 24px)' }}>
            <div
                ref={mapDivRef}
                className="w-full border border-black/45 bg-white/40"
                style={{
                    height: 'calc(100vh - 68px - 48px)',
                    minHeight: 420,
                }}
            />

            {/* Location popup — bottom-left frosted card. */}
            <AnimatePresence>
                {popup && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="fixed z-[1000] flex flex-col overflow-hidden border border-black/45 bg-white/72 backdrop-blur-2xl"
                        style={{
                            left: 'clamp(16px, 3vw, 32px)',
                            bottom: 'clamp(16px, 3vh, 32px)',
                            width: 'min(340px, calc(100vw - 32px))',
                            maxHeight: '60vh',
                        }}
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-black/15 px-[18px] py-[10px]">
                            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                <span className="inline-block h-[6px] w-[6px] bg-navy" />
                                Location
                            </p>
                            <button
                                onClick={() => setPopup(null)}
                                aria-label="Close"
                                className="flex h-7 w-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-navy hover:bg-sky hover:text-navy"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-[18px] pb-[18px] pt-[14px]">
                            <h3 className="mb-3 font-semibold leading-tight tracking-tight text-foreground" style={{ fontSize: '1.35rem' }}>
                                {popup.title}
                            </h3>
                            {popup.jobs.length > 0 ? (
                                <>
                                    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Workjobs at this location
                                    </p>
                                    <div className="flex flex-col gap-0.5">
                                        {popup.jobs.map((j, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setDetail({ job: j, all: popup.jobs })}
                                                className="border-l-2 border-transparent px-3 py-2 text-left text-[0.95rem] font-medium text-navy transition-colors hover:border-navy hover:bg-sky/40"
                                            >
                                                {j.name ?? 'Unnamed Workjob'}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-1 italic text-[0.9rem] text-muted-foreground">
                                    No workjobs found at this location.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Workjob detail modal — centered frosted card with tabs. */}
            <AnimatePresence>
                {detail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="fixed z-[1100] flex flex-col overflow-hidden border border-black/45 bg-white/72 backdrop-blur-2xl"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'min(560px, calc(100vw - 32px))',
                            maxHeight: '82vh',
                        }}
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-black/15 px-[18px] py-[10px]">
                            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                <span className="inline-block h-[6px] w-[6px] bg-navy" />
                                Workjob
                            </p>
                            <button
                                onClick={() => setDetail(null)}
                                aria-label="Close"
                                className="flex h-7 w-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-navy hover:bg-sky hover:text-navy"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-[18px] pb-[18px] pt-[14px]">
                            {detail.all.length > 1 && (
                                <div className="mb-4 flex flex-wrap gap-1.5">
                                    {detail.all.map((tab, idx) => {
                                        const active = tab.name === detail.job.name
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setDetail({ ...detail, job: tab })}
                                                className={
                                                    active
                                                        ? 'border border-navy bg-navy px-3 py-1.5 text-[0.8rem] font-medium text-paper'
                                                        : 'border border-navy/35 bg-white/50 px-3 py-1.5 text-[0.8rem] font-medium text-navy transition-colors hover:border-navy hover:bg-sky'
                                                }
                                            >
                                                {tab.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            <h3 className="mb-3 text-[1.15rem] font-bold leading-tight text-foreground">
                                {detail.job.name ?? 'Untitled Workjob'}
                            </h3>

                            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
                                <MetaRow label="Location" value={detail.job.location} />
                                <MetaRow label="Supervisor" value={detail.job.supervisor} />
                                {detail.job.supervisor_email && (
                                    <>
                                        <dt className="pt-[2px] text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Email
                                        </dt>
                                        <dd className="text-[0.92rem] leading-tight text-foreground">
                                            <a
                                                href={`mailto:${detail.job.supervisor_email}`}
                                                className="font-medium text-navy hover:underline"
                                            >
                                                {detail.job.supervisor_email}
                                            </a>
                                        </dd>
                                    </>
                                )}
                                <MetaRow label="Spots" value={detail.job.spots} />
                                <MetaRow label="Blocks" value={detail.job.blocks} />
                                <MetaRow label="Type" value={detail.job.selected_or_assigned} />
                            </dl>

                            {detail.job.description && (
                                <div className="mt-4 border-t border-black/15 pt-3 text-[0.95rem] leading-relaxed text-foreground">
                                    {detail.job.description}
                                </div>
                            )}

                            {detail.job.notes && (
                                <div className="mt-3 border-l-2 border-navy bg-sky/40 p-3 text-[0.88rem] leading-relaxed text-foreground">
                                    <span className="mr-2 inline-block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-navy">
                                        Note
                                    </span>
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

function MetaRow({ label, value }: { label: string; value: string | null }) {
    if (!value) return null
    return (
        <>
            <dt className="pt-[2px] text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </dt>
            <dd className="text-[0.92rem] leading-tight text-foreground">{value}</dd>
        </>
    )
}
