
import { Route, Routes } from 'react-router'
import './App.css'
import Home from './pages/Home'
import { ChatInterface } from './pages/ChatInterface'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>

    </>
  )
}

export default App
