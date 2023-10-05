import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../assets/styles.scss'
import MsgModal from './MsgModal'
import svgLogo from '../assets/SimonSaysLogo.png'
import EventsManager from '../services/EventsManager'
import { SocketEvents } from '../services/SocketEvents'
import { JoinRoomPayload } from '../payloads/JoinRoomPayload'
import SocketManager, { endpoint } from '../services/SocketManager'

interface PreGameScreenProps {
    isHost: boolean | null
    handleFailToJoin: Function
    handleDisband: Function
}

function PreGameScreen({ isHost, handleDisband }: PreGameScreenProps) {
    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)
    const [canStart, setCanStart] = useState(false)
    const [searchParams, _] = useSearchParams()
    const [roomToJoin, setRoomToJoin] = useState<string>('')
    const startedRef = useRef<number>(0)
    const navigate = useNavigate()
    const canStartRef = useRef<any>()
    canStartRef.current = canStart

    const handleCloseModal = () => {
        setShowModal(false)
        setModalMsg('')
    }

    const onRoomJoined = (p: JoinRoomPayload) => {
        if (p.playerJoined) {
            setCanStart(true)
        } else {
            EventsManager.instance.trigger(SocketEvents.ON_GAME_LEAVE, {})
        }
    }

    const onGameStarted = () => {
        if (canStartRef.current) {
            startedRef.current = 1
            navigate('/game')
        }
    }

    useEffect(() => {
        if (roomToJoin)
            EventsManager.instance.trigger(SocketEvents.JOIN_ROOM, {
                roomId: roomToJoin
            })
    }, [roomToJoin])

    useEffect(() => {
        EventsManager.instance.on(
            SocketEvents.ROOM_JOINED,
            'PregameScreen',
            onRoomJoined
        )

        EventsManager.instance.on(
            SocketEvents.GAME_STARTED,
            'PregameScreen',
            onGameStarted
        )

        EventsManager.instance.on(
            SocketEvents.DISBAND_GAME,
            'GameManager',
            handleDisbandGame
        )

        window.addEventListener('beforeunload', triggerDisband)

        if (isHost && !SocketManager.instance.roomId) {
            navigate('/')
        } else if (!isHost) {
            const roomId = searchParams.get('roomId')
            if (roomId) {
                setRoomToJoin(roomId)
            } else navigate('/')
        }
    }, [])

    // onBeforeDestroy
    useEffect(
        () => () => {
            if (!startedRef.current) triggerDisband()

            EventsManager.instance.off(
                SocketEvents.ROOM_JOINED,
                'PregameScreen'
            )

            EventsManager.instance.off(
                SocketEvents.GAME_STARTED,
                'PregameScreen'
            )

            EventsManager.instance.off(
                SocketEvents.PLAYER_LEFT_LOBBY,
                'PregameScreen'
            )

            EventsManager.instance.off(SocketEvents.DISBAND_GAME, 'GameManager')

            window.removeEventListener('beforeunload', triggerDisband)
        },
        []
    )

    const triggerDisband = () => {
        EventsManager.instance.trigger(SocketEvents.ON_GAME_LEAVE, {})
    }

    const handleDisbandGame = () => {
        setCanStart(false)
        handleDisband()
    }

    const handleClick = () => {
        if (SocketManager.instance.isHost)
            EventsManager.instance.trigger(SocketEvents.START_GAME, {
                roomId: SocketManager.instance.roomId
            })
    }

    const handleLinkClick = () => {
        navigator.clipboard.writeText(
            endpoint + '/join?roomId=' + SocketManager.instance.roomId
        )
    }

    return (
        <>
            {showModal && (
                <MsgModal onClose={handleCloseModal} msg={modalMsg} />
            )}
            <section className={`mainMenuContainer`}>
                <div className={`logoContainer`}>
                    <img src={svgLogo} alt="Logo" />
                </div>
                <h1>Welcome to SimonSays</h1>
                {!canStartRef.current && isHost ? (
                    <div className="">
                        <h2>Waiting for player to join...</h2>
                    </div>
                ) : (
                    ''
                )}
                {canStartRef.current ? (
                    <div className="">
                        <p>Player Joined!</p>
                        {!isHost && <p>Waiting to start...</p>}
                    </div>
                ) : (
                    ''
                )}
                {!isHost && !SocketManager.instance.roomId ? (
                    <div className="">Failed to join, try getting new link</div>
                ) : (
                    ''
                )}
                {isHost && (
                    <button
                        onClick={handleClick}
                        disabled={!canStart}
                        className={canStart ? '' : 'buttonDisabled'}
                    >
                        Start Game
                    </button>
                )}
                {isHost && (
                    <button onClick={handleLinkClick}>Invite Link</button>
                )}
            </section>
        </>
    )
}

export default PreGameScreen
