
import { Route, Routes } from 'react-router'
import './App.css'
import Home from './pages/Home'
import { ChatInterface } from './pages/ChatInterface'
import { Toaster } from 'react-hot-toast'
import ParcelleMap from './pages/ParcelleMap'
import Start from './pages/Start'

function App() {

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/parcelle" element={<ParcelleMap />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/start" element={<Start />} />
      </Routes>

    </>
  )
}

export default App
