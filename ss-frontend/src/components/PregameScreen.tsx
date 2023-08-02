import { useState, useEffect, ChangeEvent, useRef } from 'react'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import '../assets/styles.scss'
import MsgModal from './MsgModal'
import svgLogo from '../../public/SimonSaysLogo.png'
import EventsManager from '../services/EventsManager'
import { SocketEvents } from '../services/SocketEvents'
import { JoinRoomPayload } from '../payloads/JoinRoomPayload'
// import { Errors } from '../utils/CommonErrors'
import SocketManager from '../services/SocketManager'
//import { toast } from 'react-toastify'

interface PreGameScreenProps {
    isHost: boolean | null
}

function PreGameScreen({ isHost }: PreGameScreenProps) {
    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)
    const [canStart, setCanStart] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const [roomToJoin, setRoomToJoin] = useState<string>('')
    const navigate = useNavigate()
    const stateRef = useRef<any>()
    stateRef.current = canStart

    const handleCloseModal = () => {
        setShowModal(false)
        setModalMsg('')
    }

    const onRoomJoined = (p: JoinRoomPayload) => {
        if (p.playerJoined) {
            setCanStart(true)
        }
    }

    const onPlayerLeft = () => {
        setModalMsg('Player Left')
        setShowModal(true)
        setCanStart(false)
    }

    const onGameStarted = () => {
        if (stateRef.current) {
            navigate('/game')
        }
    }

    const handleBeforeUnload = () => {
        EventsManager.instance.trigger(SocketEvents.LEAVE_ROOM, {})
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
            SocketEvents.PLAYER_LEFT_LOBBY,
            'PregameScreen',
            onPlayerLeft
        )

        // EventsManager.instance.on(
        //     SocketEvents.DISBAND_GAME,
        //     'PreGameScreen',
        //     onDisbandGame
        // )

        window.addEventListener('beforeunload', handleBeforeUnload)

        if (isHost && !SocketManager.instance.roomId) {
            // toast.error('Please create/join a room to enter a game', {
            //     position: toast.POSITION.BOTTOM_CENTER,
            //     autoClose: 1500
            // })
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
            window.removeEventListener('beforeunload', handleBeforeUnload)
        },
        []
    )

    const handleClick = () => {
        if (SocketManager.instance.isHost)
            EventsManager.instance.trigger(SocketEvents.START_GAME, {
                roomId: SocketManager.instance.roomId
            })
    }

    const handleLinkClick = () => {
        navigator.clipboard.writeText(
            'http://localhost:5173' +
                '/join?roomId=' +
                SocketManager.instance.roomId
        )

        // toast.success('Successfully copied game link to clipboard', {
        //     position: toast.POSITION.BOTTOM_CENTER,
        //     toastId: 'copyToast',
        //     autoClose: 1500
        // })
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
                {!canStart ? (
                    <div className="">
                        <h2>Waiting for player to join...</h2>
                    </div>
                ) : (
                    <div className="">
                        <p>Player Joined!</p>
                        {!isHost && <p>Waiting to start...</p>}
                    </div>
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
