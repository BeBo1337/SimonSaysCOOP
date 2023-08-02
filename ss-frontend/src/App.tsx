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
import { SocketEvents } from './services/SocketEvents'
import { Routes, Route } from 'react-router-dom'
import PreGameScreen from './components/PregameScreen'

function App() {
    const [gameMode, setGameMode] = useState(2)
    const [isHost, setIsHost] = useState<boolean | null>(false)
    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const eventManager = EventsManager.instance

        eventManager.on(SocketEvents.PONG, 'app', () => {
            console.log('WE PONGED')
        })

        eventManager.on(SocketEvents.CONNECTED, 'app', () => {
            console.log('connected')
            eventManager.trigger(SocketEvents.PING, 'ping')
        })

        SocketManager.newInstance()
    }, [])

    useEffect(
        () => () => {
            const eventManager = EventsManager.instance
            eventManager.off(SocketEvents.PONG, 'app')
            eventManager.off(SocketEvents.CONNECTED, 'app')
        },
        []
    )

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
                    element={
                        <MainMenu
                            setGameMode={setGameMode}
                            setHost={setIsHost}
                        />
                    }
                />
                <Route
                    path="/create/*"
                    element={<PreGameScreen isHost={isHost} />}
                />
                <Route
                    path="/join/*"
                    element={<PreGameScreen isHost={isHost} />}
                />
            </Routes>
        </>
    )
}

export default App
