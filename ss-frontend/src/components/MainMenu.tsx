import { useState, useEffect, FC } from 'react'
import { Modes } from '../utils/GameConstants'
import { useNavigate } from 'react-router-dom'
import '../assets/styles.scss'
import svgLogo from '../assets/SimonSaysLogo.png'
import DropdownMenu from './GameModeMenu'
import MsgModal from './MsgModal'
import { CreateRoomPayload } from '../payloads/CreateRoomPayload'
import EventsManager from '../services/EventsManager'
import { SocketEvents } from '../services/SocketEvents'
import SocketManager from '../services/SocketManager'

interface MainMenuProps {
    setGameMode: Function
    setHost: Function
}

const MainMenu: FC<MainMenuProps> = ({
    setGameMode,
    setHost
}: MainMenuProps) => {
    const [mode, setMode] = useState(0)

    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)
    const [isModeError, setIsModeError] = useState(false)

    const navigate = useNavigate()

    const handleChange = (selectedOption: string) => {
        switch (selectedOption) {
            case 'Classic':
                setMode(Modes.CLASSIC)
                setGameMode(Modes.CLASSIC)
                break
            case 'CO-OP':
                setMode(Modes.CO_OP)
                setGameMode(Modes.CO_OP)
                break
        }
    }

    const handleClick = () => {
        if (!mode) {
            setIsModeError(true)
        } else if (!isModeError && !SocketManager.instance.roomId) {
            EventsManager.instance.trigger(SocketEvents.CREATE_ROOM, {
                gameMode: mode
            })
        }

        setTimeout(() => {
            setIsModeError(false)
        }, 1000)
    }

    const onRoomCreated = (p: CreateRoomPayload) => {
        setGameMode(p.gameMode)
        setHost(true)

        if (p.gameMode === Modes.CO_OP) {
            setTimeout(() => {
                navigate(`/create?roomId=${p.roomId}`)
            }, 1000)
        } else if (p.gameMode === Modes.CLASSIC) {
            setTimeout(() => {
                navigate('/game')
            }, 1000)
        }
    }

    // onMount
    useEffect(() => {
        EventsManager.instance.on(
            SocketEvents.ROOM_CREATED,
            'MainMenu',
            onRoomCreated
        )
    }, [])

    // onBeforeDestroy
    useEffect(
        () => () => {
            EventsManager.instance.off(SocketEvents.ROOM_CREATED, 'MainMenu')
        },
        []
    )

    const handleCloseModal = () => {
        setShowModal(false)
        setModalMsg('')
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

                <button onClick={handleClick}>
                    {mode !== Modes.CO_OP ? 'Start Game' : 'Create Game'}
                </button>
                <DropdownMenu
                    onSelectOption={handleChange}
                    isModeSelected={isModeError}
                />
            </section>
        </>
    )
}

export default MainMenu
