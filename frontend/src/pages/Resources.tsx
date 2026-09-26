import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

type Link = { href: string; title: string; description: string }

const SECTIONS: { title: string; links: Link[] }[] = [
    {
        title: 'General NMH Information',
        links: [
            {
                href: 'https://nmhschool.teamdynamix.com/TDClient/120/Portal/Home/',
                title: 'NMH Hub',
                description: 'Directory of all NMH resources for students.',
            },
            {
                href: 'https://www.nmhschool.org/',
                title: 'Official NMH Website',
                description:
                    'Provides all official NMH information ranging from classes, athletics, school-wide announcements, etc.',
            },
        ],
    },
    {
        title: 'NMH Academics',
        links: [
            {
                href: 'https://online.fliphtml5.com/apxze/pdqa/',
                title: 'NMH Course Curriculum Guide',
                description: 'Official NMH information on all courses offered.',
            },
        ],
    },
    {
        title: 'NMH Athletics Page',
        links: [
            {
                href: 'https://www.nmhschool.org/athletics-home',
                title: 'NMH Athletics Page',
                description: 'All information and updates about NMH athletic programs and teams.',
            },
            {
                href: 'https://docs.google.com/presentation/d/1-3-yKG-dlMXIGKlV-rQHi-m2vctYtNcur_ON5AJPHNw/edit?slide=id.g39b87ef4d76_0_125#slide=id.g39b87ef4d76_0_125',
                title: '2025 Fall Recap Hogger News Sports',
                description: 'Check out highlights from fall athletes!',
            },
        ],
    },
    {
        title: 'NMH Student Life',
        links: [
            {
                href: 'https://docs.google.com/presentation/d/1VbxG-aSZg9K6R4yfK7G_gG513NNVX4QKcG-1KrbxvdA/edit#slide=id.g2f64d986594_2_46',
                title: 'Hogger News Live Slideshow',
                description:
                    "News for students, by students. Check out everything that's happening on campus weekly at Hogger News!",
            },
            {
                href: 'https://studentclubs.nmhschool.org/',
                title: 'Hogger News Club Database',
                description:
                    'All information on clubs can be found here (club descriptions, student leaders, faculty advisor, meeting times, etc.).',
            },
            {
                href: 'https://mymenus.mgdining.com/northfield-mount-hermon/',
                title: 'Dining Menu',
                description: 'Daily menus for all NMH dining halls.',
            },
            {
                href: 'https://theschauffler.org',
                title: 'The Schauffler Review',
                description: "NMH's student-run academic journal featuring research and scholarly work.",
            },
            {
                href: 'https://aibot.nmhschool.org/',
                title: 'NMH AI Bot',
                description:
                    "NMH's AI chatbot for faculty and staff. Includes HoggerBot, Solver (for math/logic), and NMH-Optimized (trained on handbooks).",
            },
            {
                href: 'https://www.flickr.com/photos/nmhphotos/albums/',
                title: 'NMH Flickr',
                description: 'See the NMH photo album!',
            },
        ],
    },
]

export default function Resources() {
    let cardIdx = 0
    return (
        <div className="pb-24">
            <motion.header
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto"
                style={{
                    maxWidth: 1120,
                    margin: 'clamp(24px, 5vh, 48px) auto 0',
                    padding: '0 clamp(16px, 3vw, 32px)',
                }}
            >
                <h1
                    className="font-medium text-foreground"
                    style={{
                        fontSize: 'clamp(1.7rem, 3.2vw, 2.2rem)',
                        letterSpacing: '-0.015em',
                        margin: '0 0 18px',
                    }}
                >
                    Important Resources
                </h1>
            </motion.header>

            {SECTIONS.map((section, si) => (
                <section
                    key={section.title}
                    className="mx-auto"
                    style={{ maxWidth: 1120, margin: '24px auto', padding: '0 clamp(16px, 3vw, 32px)' }}
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.2 + si * 0.05 }}
                        className="mt-7 inline-block text-[1.2rem] font-bold text-foreground"
                    >
                        {section.title}
                    </motion.h2>

                    <div
                        className="grid gap-4 pt-4"
                        style={{
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                        }}
                    >
                        {section.links.map((link) => {
                            const idx = cardIdx++
                            return (
                                <motion.a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.035 }}
                                    className="dir-card group no-underline"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-[1.1rem] font-bold leading-snug text-foreground group-hover:text-navy">
                                            {link.title}
                                        </h3>
                                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-navy/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>
                                    <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
                                        {link.description}
                                    </p>
                                </motion.a>
                            )
                        })}
                    </div>
                </section>
            ))}
        </div>
    )
}
