
import { Route, Routes } from 'react-router'
import './App.css'
import Home from './pages/Home'
import { ChatInterface } from './pages/ChatInterface'
import { Toaster } from 'react-hot-toast'
import ParcelleMap from './pages/ParcelleMap'

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
      </Routes>

    </>
  )
}

export default App
