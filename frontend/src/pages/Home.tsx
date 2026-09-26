import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Link with motion capabilities so we can attach initial/animate props while
// the Link itself remains a direct child of `.features-grid` (needed for the
// `:nth-child(4n)` tic-tac-toe border rules to hit).
const MotionLink = motion(Link)

const features = [
    { num: '01', title: 'Campus map', body: 'Click any building to see the workjobs based there.', to: '/map' },
    { num: '02', title: 'Classes', body: 'Search, filter by subject and sort the whole catalog.', to: '/classes' },
    { num: '03', title: 'Workjobs', body: 'Every job, supervisor, block and open spot.', to: '/workjobs' },
    { num: '04', title: 'Cocurriculars', body: 'PEs and seasonal activities by category.', to: '/cocurriculars' },
    { num: '05', title: 'Clubs', body: 'Every student club, meeting time and description.', to: '/clubs' },
    { num: '06', title: 'Resources', body: 'Official NMH links, including Hogger News.', to: '/resources' },
]

// Hero title tokens — each word cascades letter-by-letter from the left.
// The trailing " " on non-break words renders as an actual space via whitespace:pre.
const HERO_LINES: { words: { text: string; accent?: boolean }[] }[] = [
    { words: [{ text: 'Find ' }, { text: 'your ' }, { text: 'way' }] },
    { words: [{ text: 'around ' }, { text: 'NMH.', accent: true }] },
]

export default function Home() {
    return (
        <div>
            {/* Hero — grid-cols 1.1fr 1fr, max-width 1180, clamp padding. */}
            <section
                className="mx-auto grid items-center"
                style={{
                    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                    gap: 'clamp(28px, 5vw, 88px)',
                    maxWidth: 1180,
                    padding: 'clamp(28px, 5vh, 72px) clamp(20px, 4vw, 48px) 40px',
                }}
            >
                <div>
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="hero-eyebrow"
                    >
                        <span className="hero-dot" />
                        Hogger News · for students, by students
                    </motion.p>

                    <h1 className="hero-title">
                        {(() => {
                            let charIndex = 0
                            return HERO_LINES.map((line, li) => (
                                <span key={li} style={{ display: 'block' }}>
                                    {line.words.map((word, wi) => (
                                        <span
                                            key={wi}
                                            style={{ color: word.accent ? '#7a1e38' : undefined }}
                                        >
                                            {Array.from(word.text).map((ch) => {
                                                const idx = charIndex++
                                                return (
                                                    <motion.span
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -32 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            duration: 0.55,
                                                            delay: 0.15 + idx * 0.028,
                                                            ease: 'easeOut',
                                                        }}
                                                        className="inline-block"
                                                        style={{ whiteSpace: 'pre' }}
                                                    >
                                                        {ch}
                                                    </motion.span>
                                                )
                                            })}
                                        </span>
                                    ))}
                                </span>
                            ))
                        })()}
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                        className="flex flex-wrap gap-3.5"
                    >
                        <Link to="/map" className="btn">Explore the map</Link>
                        <Link to="/classes" className="btn btn--ghost">Browse classes</Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.25 }}
                    className="relative flex items-center justify-center"
                    style={{ minHeight: 360, maxHeight: 440 }}
                >
                    <img
                        src="/static/images/pig.png"
                        alt="Hogger News pig mascot"
                        className="w-auto object-contain"
                        style={{ width: 'min(280px, 70%)', maxHeight: 340, height: 'auto' }}
                    />
                </motion.div>
            </section>

            {/* Feature index — 4-column tic-tac-toe grid with hairline borders. */}
            <section
                className="mx-auto"
                style={{
                    maxWidth: 1180,
                    margin: 'clamp(48px, 8vh, 120px) auto 80px',
                    padding: '32px clamp(20px, 4vw, 48px) 40px',
                }}
            >
                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.15 }}
                    className="relative z-[2] inline-block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy"
                    style={{
                        // Match the transparency of the feature cards below so the eyebrow
                        // reads as part of the same glass system.
                        background: 'rgba(255, 255, 255, 0.32)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        padding: '5px 14px',
                        margin: '0 0 16px 0',
                    }}
                >
                    NMH Navigator
                </motion.p>

                <div className="features-grid">
                    {features.map((f, i) => (
                        <MotionLink
                            key={f.to}
                            to={f.to}
                            className="feature-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.2 + i * 0.06 }}
                        >
                            <span className="feature-card__num">{f.num}</span>
                            <h3>{f.title}</h3>
                            <p>{f.body}</p>
                        </MotionLink>
                    ))}
                </div>
            </section>
        </div>
    )
}
