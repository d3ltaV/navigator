import { useEffect } from 'react'

/**
 * The painterly sunset->night background, ported from the Flask site.
 *
 * Five fixed image layers stack in the same position and cross-fade based on
 * `--scroll-t` (0 at the top of the document, 1 at the bottom). The whole thing
 * sits under a soft lavender haze so text and cards stay readable.
 *
 * Uses `position: fixed` layers so scrolling never repaints the WebPs — only
 * their opacity/transform is recomputed each frame.
 */
export function SceneBackground() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const doc = document.documentElement
        let moveRaf: number | null = null
        let scrollRaf: number | null = null

        function onMove(e: PointerEvent) {
            if (moveRaf) return
            moveRaf = requestAnimationFrame(() => {
                const px = (e.clientX / window.innerWidth - 0.5) * 2
                const py = (e.clientY / window.innerHeight - 0.5) * 2
                doc.style.setProperty('--px', px.toFixed(3))
                doc.style.setProperty('--py', py.toFixed(3))
                moveRaf = null
            })
        }

        function updateScroll() {
            scrollRaf = null
            const max = document.documentElement.scrollHeight - window.innerHeight
            const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
            doc.style.setProperty('--scroll-t', t.toFixed(3))
        }

        function onScroll() {
            if (scrollRaf) return
            scrollRaf = requestAnimationFrame(updateScroll)
        }

        document.addEventListener('pointermove', onMove, { passive: true })
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        updateScroll()

        return () => {
            document.removeEventListener('pointermove', onMove)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    return (
        <div className="scene-bg" aria-hidden>
            <div className="scene-bg__art">
                <img src="/static/images/scene-sunset.webp" alt="" className="scene-layer scene-layer--sunset" />
                <img src="/static/images/scene-night.webp" alt="" className="scene-layer scene-layer--night" />
                <img src="/static/images/scene-sun.webp" alt="" className="scene-layer scene-layer--sun" />
                <img src="/static/images/scene-stars.webp" alt="" className="scene-layer scene-layer--stars" />
                <img src="/static/images/scene-moon.webp" alt="" className="scene-layer scene-layer--moon" />
            </div>
            <div className="scene-bg__haze" />
        </div>
    )
}
