import { useEffect, useState, FC, useRef } from 'react'
import GameButton from './GameButton'
import '../assets/styles.scss'
import '../assets/buttons.scss'
import wrong from '../assets/sounds/Wrong.mp3'
import { getNumberInRange } from '../utils/GenericFuncs'
import { ColorNumbers } from '../utils/ColorsConstants'
import { Modes } from '../utils/GameConstants'

interface GameManagerProps {
    gameMode: number
    isHost: boolean | null
    //   score: number;
    //   setScore: Function;
    //   goBack: Function;
}

const GameManager: FC<GameManagerProps> = ({
    gameMode,
    isHost
}: GameManagerProps) => {
    const [gameOver, setGameOver] = useState<boolean>(false)
    const [pauseClicks, setPauseClicks] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)
    const [sequence, setSequence] = useState<number[]>([])
    const sequenceIndexRef = useRef<number>(-1)
    const [glowingButton, setGlowingButton] = useState<number>(0)

    const wrongSound = new Audio(wrong)
    const setNextLevel = () => {
        let n: number
        if (gameMode === Modes.CO_OP) n = getNumberInRange(1, 8)
        if (gameMode === Modes.CLASSIC) n = getNumberInRange(1, 4)
        setSequence((prevSequence) => [...prevSequence, n])
    }

    const showSequence = async () => {
        for (const num of sequence) {
            console.log('HI ' + num)
            setGlowingButton(num)

            await new Promise((resolve) => setTimeout(resolve, 300))

            setGlowingButton(0)
            await new Promise((resolve) => setTimeout(resolve, 300))
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setNextLevel()
            sequenceIndexRef.current = 0
        }, 1000)
    }, [])

    useEffect(() => {
        if (sequence) {
            setPauseClicks(true)
            showSequence().then(() => {
                setPauseClicks(false)
            })
        }
    }, [sequence])

    const handleButtonPressed = (buttonPressed: number) => {
        if (gameOver) return
        console.log(
            'buttonPressed ' +
                buttonPressed +
                ' with index ' +
                sequenceIndexRef.current
        )
        if (sequence[sequenceIndexRef.current] === buttonPressed) {
            sequenceIndexRef.current += 1
            if (sequenceIndexRef.current >= sequence.length) {
                sequenceIndexRef.current = 0
                setScore((prevScore) => prevScore + 1)
            }
        } else {
            setGameOver(true)
            wrongSound.play()
            console.log('game over')
        }
    }

    useEffect(() => {
        if (score) {
            setNextLevel()
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

    return (
        <div>
            <div className="buttons-container">
                <h1>{`Score: ${score}`}</h1>

                {gameMode === Modes.CO_OP && (
                    <GameButton
                        initialClassName="btn-coop"
                        glowing={indicator()}
                        clickable={false}
                        gameOver={gameOver}
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
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
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
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
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
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
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
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
                    />
                </div>
            </div>
        </div>
    )
}

export default GameManager
