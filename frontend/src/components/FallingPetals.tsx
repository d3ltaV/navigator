// 5 drifting cherry-blossom petals (ported from the Flask site's `.leaf` layer).
// Drop-shadow filters were the single biggest per-frame cost, so the ported
// version keeps only the saturate/brightness responsiveness to --scroll-t.
export function FallingPetals() {
    return (
        <div className="scene-leaves" aria-hidden>
            <span className="leaf leaf--1" />
            <span className="leaf leaf--2" />
            <span className="leaf leaf--4" />
            <span className="leaf leaf--6" />
            <span className="leaf leaf--8" />
        </div>
    )
}
