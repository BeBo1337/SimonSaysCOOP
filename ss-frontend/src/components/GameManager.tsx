import { useEffect, useState, FC, useRef } from 'react'
import GameButton from './GameButton'
import '../assets/styles.scss'
import wrong from '../assets/sounds/Wrong.mp3'
import { getNumberInRange } from '../utils/GenericFuncs'
import { ColorNumbers } from '../utils/ColorsConstants'

interface GameManagerProps {
    //   gameMode: number;
    //   score: number;
    //   setScore: Function;
    //   goBack: Function;
}

const GameManager: FC<GameManagerProps> = ({}: GameManagerProps) => {
    const [gameStarted, setGameStarted] = useState<boolean>(false)
    const [gameOver, setGameOver] = useState<boolean>(false)
    const [pauseClicks, setPauseClicks] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)
    const [sequence, setSequence] = useState<number[]>([])
    const sequenceIndexRef = useRef<number>(-1)
    const [glowingButton, setGlowingButton] = useState<number>(0)

    const wrongSound = new Audio(wrong)
    const setNextLevel = () => {
        let n = getNumberInRange(1, 4)
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
        if (gameStarted) {
            setNextLevel()
            sequenceIndexRef.current = 0
        }
    }, [gameStarted])

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

    return (
        <div>
            <div className="buttons-container">
                <h1>
                    {gameStarted ? `Score: ${score}` : 'Welcome To SimonSays'}
                </h1>
                <div className="game-buttons-container">
                    <GameButton
                        initialClassName="btn green"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Green}
                        colorNumber={ColorNumbers.Green}
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
                    />
                    <GameButton
                        initialClassName="btn red"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Red}
                        colorNumber={ColorNumbers.Red}
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
                    />
                    <GameButton
                        initialClassName="btn yellow"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Yellow}
                        colorNumber={ColorNumbers.Yellow}
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
                    />
                    <GameButton
                        initialClassName="btn blue"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Blue}
                        colorNumber={ColorNumbers.Blue}
                        handleButtonPressed={handleButtonPressed}
                        clickable={!pauseClicks && !gameOver}
                        gameOver={gameOver}
                    />
                </div>
                <button
                    style={{ visibility: gameStarted ? 'hidden' : 'visible' }}
                    onClick={() => setGameStarted(true)}
                >
                    Start Game
                </button>
            </div>
        </div>
    )
}

export default GameManager
