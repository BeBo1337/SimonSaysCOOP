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
import { Routes, Route, useNavigate } from 'react-router-dom'
import PreGameScreen from './components/PregameScreen'

function App() {
    const [gameMode, setGameMode] = useState(2)
    const [isHost, setIsHost] = useState<boolean | null>(false)
    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)

    const navigate = useNavigate()

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

    const handleDisbandGame = () => {
        navigate('/')
        setModalMsg('Player left, lobby disbanded!')
        setShowModal(true)
    }

    const failedToJoin = () => {
        navigate('/')
        setModalMsg("Failed to join or room doesn't exist")
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setModalMsg('')
        setShowModal(false)
    }

    return (
        <>
            {showModal && (
                <MsgModal onClose={handleCloseModal} msg={modalMsg} />
            )}
            <Routes>
                <Route
                    path="/game"
                    element={
                        <GameManager
                            gameMode={gameMode}
                            isHost={isHost}
                            handleDisband={handleDisbandGame}
                        />
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
                    element={
                        <PreGameScreen
                            isHost={isHost}
                            handleFailToJoin={failedToJoin}
                            handleDisband={handleDisbandGame}
                        />
                    }
                />
                <Route
                    path="/join/*"
                    element={
                        <PreGameScreen
                            isHost={isHost}
                            handleFailToJoin={failedToJoin}
                            handleDisband={handleDisbandGame}
                        />
                    }
                />
            </Routes>
        </>
    )
}

export default App
