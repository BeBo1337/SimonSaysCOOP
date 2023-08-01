import { useState, useEffect, FC, ChangeEvent } from 'react'
import { Modes } from '../utils/GameConstants'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import '../assets/styles.scss'
import svgLogo from '../../public/SimonSaysLogo.png'
import DropdownMenu from './GameModeMenu'
import MsgModal from './MsgModal'
import { CreateRoomPayload } from '../payloads/CreateRoomPayload'
import EventsManager from '../services/EventsManager'
import { SocketEvents } from '../services/SocketEvents'

interface MainMenuProps {
    setGameMode: Function
    // setPlayerID: Function
}

const MainMenu: FC<MainMenuProps> = ({
    setGameMode
}: // setPlayerID
MainMenuProps) => {
    const [mode, setMode] = useState(0)
    const [name, setName] = useState<string>('')

    const [modalMsg, setModalMsg] = useState<string>('')
    const [showModal, setShowModal] = useState(false)
    const [isNameError, setIsNameError] = useState(false)
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

    const checkName = (name: string): boolean => {
        const englishAndNumbersRegex = /^[A-Za-z0-9]+$/

        return englishAndNumbersRegex.test(name)
    }

    const handleClick = () => {
        if (!name && !mode) {
            setIsNameError(true)
            setIsModeError(true)
        } else if (!checkName(name)) {
            setShowModal(true)
            setModalMsg('bruh')
            setIsNameError(true)
            setIsModeError(false)
        } else if (name.length < 3) {
            setShowModal(true)
            setModalMsg('bruh')
            setIsNameError(true)
            setIsModeError(false)
        } else if (name.length > 8) {
            setShowModal(true)
            setModalMsg('bruh')
            setIsNameError(true)
            setIsModeError(false)
        } else if (!mode) {
            setIsNameError(false)
            setIsModeError(true)
        } else if (!isModeError && !isNameError) {
            EventsManager.instance.trigger(SocketEvents.CREATE_ROOM, {
                playerId: name,
                gameMode: mode
            })
        }

        setTimeout(() => {
            setIsNameError(false)
            setIsModeError(false)
        }, 1000)
    }

    const onRoomCreated = (p: CreateRoomPayload) => {
        console.log(p)
        setGameMode(p.gameMode)
        //setPlayerID(p.host)

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

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
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
                <form>
                    <input
                        className={isNameError ? 'inputError' : ''}
                        name="players-name"
                        type="text"
                        placeholder="Enter your name..."
                        value={name}
                        maxLength={8}
                        minLength={3}
                        onChange={handleNameChange}
                    ></input>
                </form>
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
