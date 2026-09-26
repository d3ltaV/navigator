import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SceneBackground } from '@/components/SceneBackground'
import { FallingPetals } from '@/components/FallingPetals'

const nav = [
    { to: '/', label: 'Home' },
    { to: '/map', label: 'Campus Map' },
    { to: '/classes', label: 'Classes' },
    { to: '/workjobs', label: 'Workjobs' },
    { to: '/cocurriculars', label: 'Cocurriculars' },
    { to: '/clubs', label: 'Clubs' },
    { to: '/resources', label: 'Resources' },
]

export function Layout() {
    return (
        <div className="relative min-h-screen">
            <SceneBackground />
            <FallingPetals />

            {/* Header — height + padding match the Flask site (68px min, 10px vertical,
                horizontal clamp(16, 3vw, 40)). */}
            <header
                className="header-bg sticky top-0 z-50 flex items-center gap-6 border-b border-black/10 backdrop-blur-xl"
                style={{
                    minHeight: 68,
                    padding: '10px clamp(16px, 3vw, 40px)',
                }}
            >
                <NavLink to="/" className="flex items-center gap-2.5 shrink-0 no-underline">
                    <img src="/static/images/pig.png" alt="" className="h-11 w-auto" />
                    <span className="text-[1.1rem] font-semibold tracking-tight text-navy">
                        NMH Navigator
                    </span>
                </NavLink>
                <nav className="ml-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {nav.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                cn(
                                    'relative whitespace-nowrap px-3 py-2 text-[0.92rem] font-medium text-muted-foreground transition-colors no-underline',
                                    'hover:text-navy',
                                    'after:absolute after:bottom-[2px] after:left-3 after:right-3 after:h-[1.5px] after:bg-navy after:origin-left after:scale-x-0',
                                    'after:transition-transform after:duration-[280ms] after:ease-[cubic-bezier(0.4,0,0.2,1)]',
                                    'hover:after:scale-x-100',
                                    isActive && 'text-foreground after:scale-x-100'
                                )
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main>
                <Outlet />
            </main>

            <footer aria-hidden className="byline">
                built by joelle '27 &amp; lorcan '26 <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>&lt;3</span>
            </footer>
        </div>
    )
}
