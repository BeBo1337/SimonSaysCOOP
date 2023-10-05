import { useEffect, useState, FC, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GameButton from './GameButton'
import '../assets/styles.scss'
import wrong from '../assets/sounds/Wrong.mp3'
import seq from '../assets/sounds/Sequence.mp3'
import { ColorNumbers } from '../utils/ColorsConstants'
import { Modes } from '../utils/GameConstants'

import EventsManager from '../services/EventsManager'
import SocketManager from '../services/SocketManager'
import { SocketEvents } from '../services/SocketEvents'
import { ButtonPayload } from '../payloads/ButtonPayload'

interface GameManagerProps {
    gameMode: number
    isHost: boolean | null
    handleDisband: Function
}

const GameManager: FC<GameManagerProps> = ({
    gameMode,
    isHost,
    handleDisband
}: GameManagerProps) => {
    const gameOver = useRef<number>(0)
    const [showGameOverMessage, setShowGameOverMessage] =
        useState<boolean>(false)
    const [pauseClicks, setPauseClicks] = useState<boolean>(true)
    const [score, setScore] = useState<number>(0)
    const [sequence, setSequence] = useState<number[]>([])
    const sequenceIndexRef = useRef<number>(-1)
    const [glowingButton, setGlowingButton] = useState<number>(0)

    const navigate = useNavigate()
    const wrongSound = new Audio(wrong)
    const seqSound = new Audio(seq)

    const showSequence = async () => {
        if (gameOver.current > 0) {
            gameOver.current++
            return
        }
        for (const num of sequence) {
            if (gameOver.current > 0) {
                gameOver.current++
                return
            }

            console.log('HI ' + num)
            seqSound.play()
            setGlowingButton(num)

            await new Promise((resolve) => setTimeout(resolve, 300))

            setGlowingButton(0)
            await new Promise((resolve) => setTimeout(resolve, 300))
        }
    }

    useEffect(() => {
        if (sequence.length > 0) {
            setPauseClicks(true)
            showSequence().then(() => {
                setPauseClicks(false)
            })
        }

        //Server response function
        const handleButtonClicked = (p: ButtonPayload) => {
            if (p.gameOver) return
            console.log(sequenceIndexRef.current)
            if (sequence[p.currentSeqIndex] === p.buttonColor) {
                sequenceIndexRef.current += 1
                if (sequenceIndexRef.current >= sequence.length) {
                    sequenceIndexRef.current = 0
                    setScore((prevScore) => prevScore + 1)
                }
            } else {
                gameOver.current++
                wrongSound.play()
                setShowGameOverMessage(true)
                console.log('game over')
            }
        }

        //Attach event listener to current render
        EventsManager.instance.on(
            SocketEvents.BUTTON_CLICKED,
            'GameManager',
            handleButtonClicked
        )

        // Cleanup the event listener
        return () => {
            EventsManager.instance.off(
                SocketEvents.BUTTON_CLICKED,
                'GameManager'
            )
        }
    }, [sequence])

    //frontend press trigger emit to server
    const handleButtonPressed = (buttonPressed: number) => {
        if (gameOver.current === 0) {
            console.log(gameOver.current)
            console.log(
                'buttonPressed ' +
                    buttonPressed +
                    ' with index ' +
                    sequenceIndexRef.current
            )
            EventsManager.instance.trigger(SocketEvents.CLICK_BUTTON, {
                buttonColor: buttonPressed,
                currentSeqIndex: sequenceIndexRef.current
            } as ButtonPayload)
        }
    }

    useEffect(() => {
        if (score) {
            if (SocketManager.instance.isHost)
                EventsManager.instance.trigger(
                    SocketEvents.GENERATE_SEQUENCE,
                    {}
                )
        }
    }, [score])

    const indicator = () => {
        const hostValidGlowingButtons = [0, 1, 2, 3, 4]
        const guestValidGlowingButtons = [0, 5, 6, 7, 8]

        if (isHost) {
            return !hostValidGlowingButtons.includes(glowingButton)
        } else {
            return !guestValidGlowingButtons.includes(glowingButton)
        }
    }

    const handleSequenceGen = (n: number) => {
        if (gameOver.current === 0)
            setSequence((prevSequence) => [...prevSequence, n])
    }

    // onMount
    useEffect(() => {
        if (!SocketManager.instance.roomId) {
            navigate('/')
        }

        EventsManager.instance.on(
            SocketEvents.SEQUENCE_GENERATED,
            'GameManager',
            handleSequenceGen
        )

        EventsManager.instance.on(
            SocketEvents.GAME_RESTARTED,
            'GameManager',
            handleTryAgain
        )

        EventsManager.instance.on(
            SocketEvents.DISBAND_GAME,
            'GameManager',
            handleDisbandGame
        )

        window.addEventListener('beforeunload', triggerDisband)

        setTimeout(() => {
            sequenceIndexRef.current = 0
            if (SocketManager.instance.isHost) {
                EventsManager.instance.trigger(
                    SocketEvents.GENERATE_SEQUENCE,
                    {}
                )
            }
        }, 1000)
    }, [])

    // onBeforeDestroy
    useEffect(
        () => () => {
            triggerDisband()

            EventsManager.instance.off(
                SocketEvents.SEQUENCE_GENERATED,
                'GameManager'
            )

            EventsManager.instance.off(
                SocketEvents.GAME_RESTARTED,
                'GameManager'
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
        handleDisband()
    }

    const handleRestart = () => {
        EventsManager.instance.trigger(SocketEvents.RESTART_GAME, {})
    }

    const handleTryAgain = () => {
        gameOver.current = 0
        setScore(0)
        setSequence([])
        setPauseClicks(true)
        setShowGameOverMessage(false)

        setTimeout(() => {
            sequenceIndexRef.current = 0
            if (SocketManager.instance.isHost) {
                EventsManager.instance.trigger(
                    SocketEvents.GENERATE_SEQUENCE,
                    {}
                )
            }
        }, 1000)
    }

    return (
        <div>
            <div className="buttons-container">
                <h1>{`Score: ${score}`}</h1>

                {gameMode === Modes.CO_OP && (
                    <GameButton
                        initialClassName="btn-coop"
                        glowing={indicator()}
                        clickable={false}
                        gameOver={gameOver.current}
                    />
                )}
                <div className="game-buttons-container">
                    <GameButton
                        initialClassName={isHost ? 'btn green' : 'btn lime'}
                        glowing={
                            isHost
                                ? glowingButton === ColorNumbers.Green
                                : glowingButton === ColorNumbers.Lime
                        }
                        colorNumber={
                            isHost ? ColorNumbers.Green : ColorNumbers.Lime
                        }
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver.current}
                        gameOver={gameOver.current}
                    />
                    <GameButton
                        initialClassName={isHost ? 'btn red' : 'btn pink'}
                        glowing={
                            isHost
                                ? glowingButton === ColorNumbers.Red
                                : glowingButton === ColorNumbers.Pink
                        }
                        colorNumber={
                            isHost ? ColorNumbers.Red : ColorNumbers.Pink
                        }
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver.current}
                        gameOver={gameOver.current}
                    />
                    <GameButton
                        initialClassName={isHost ? 'btn yellow' : 'btn grey'}
                        glowing={
                            isHost
                                ? glowingButton === ColorNumbers.Yellow
                                : glowingButton === ColorNumbers.Grey
                        }
                        colorNumber={
                            isHost ? ColorNumbers.Yellow : ColorNumbers.Grey
                        }
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver.current}
                        gameOver={gameOver.current}
                    />
                    <GameButton
                        initialClassName={isHost ? 'btn blue' : 'btn cyan'}
                        glowing={
                            isHost
                                ? glowingButton === ColorNumbers.Blue
                                : glowingButton === ColorNumbers.Cyan
                        }
                        colorNumber={
                            isHost ? ColorNumbers.Blue : ColorNumbers.Cyan
                        }
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver.current}
                        gameOver={gameOver.current}
                    />
                </div>
            </div>
            <div
                className={`dimOverlay ${showGameOverMessage ? 'visible' : ''}`}
            />
            {showGameOverMessage && (
                <>
                    <div className="gameOverContainer">
                        <div className="gameOverMessage">
                            <p style={{ whiteSpace: 'pre-line' }}>
                                Game-Over! <br />
                                Your score: <br />
                                {score} <br />
                                Try again?
                            </p>
                            {isHost && (
                                <button
                                    className="gameOverButton"
                                    onClick={handleRestart}
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default GameManager
