import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Classes from '@/pages/Classes'
import Workjobs from '@/pages/Workjobs'
import Cocurriculars from '@/pages/Cocurriculars'
import Clubs from '@/pages/Clubs'
import Resources from '@/pages/Resources'
import CampusMap from '@/pages/CampusMap'

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/workjobs" element={<Workjobs />} />
                <Route path="/cocurriculars" element={<Cocurriculars />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/map" element={<CampusMap />} />
            </Route>
        </Routes>
    )
}

export default App
