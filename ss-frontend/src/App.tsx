import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './assets/styles.scss'
import './App.css'
import GameManager from './components/GameManager'
import MainMenu from './components/MainMenu'
import MsgModal from './components/MsgModal'
import SocketManager from './services/SocketManager'
import EventsManager from './services/EventsManager'
import { Routes, Route } from 'react-router-dom'

function App() {
    const [gameMode, setGameMode] = useState(2)
    const [isHost, setIsHost] = useState<boolean | null>(true)
    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        SocketManager.newInstance()
    }, [])

    return (
        <>
            <Routes>
                <Route
                    path="/game"
                    element={
                        <GameManager gameMode={gameMode} isHost={isHost} />
                    }
                />
                <Route
                    path="/"
                    element={<MainMenu setGameMode={setGameMode} />}
                />
            </Routes>
        </>
    )
}

export default App
