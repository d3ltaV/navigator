import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Workjobs from '@/pages/Workjobs'
import Clubs from '@/pages/Clubs'
import Resources from '@/pages/Resources'
import CampusMap from '@/pages/CampusMap'
// Classes + Cocurriculars are hidden until their data feeds are ready.
// import Classes from '@/pages/Classes'
// import Cocurriculars from '@/pages/Cocurriculars'

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/workjobs" element={<Workjobs />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/map" element={<CampusMap />} />
                {/* <Route path="/classes" element={<Classes />} /> */}
                {/* <Route path="/cocurriculars" element={<Cocurriculars />} /> */}
            </Route>
        </Routes>
    )
}

export default App
