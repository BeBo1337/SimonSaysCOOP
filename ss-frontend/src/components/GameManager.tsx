import { useEffect, useState, FC } from 'react'
import GameButton from './GameButton'
import '../assets/styles.scss'
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
    const [score, setScore] = useState<number>(0)
    const [sequence, setSequence] = useState<number[]>([])
    const [sequenceIndex, setSequenceIndex] = useState<number>(-1)
    const [buttonPressed, setButtonPressed] = useState<number>(0)
    const [glowingButton, setGlowingButton] = useState<number>(0)

    const setNextLevel = () => {
        let n = getNumberInRange(1, 4)
        setSequence((prevSequence) => [...prevSequence, n])
    }

    const showSequence = () => {
        for (const num of sequence) {
            console.log('HI ' + num)
            setGlowingButton(num)
            setTimeout(() => {
                setGlowingButton(0)
            }, 300)
        }
    }

    useEffect(() => {
        if (gameStarted) {
            setNextLevel()
            setSequenceIndex(0)
        }
    }, [gameStarted])

    useEffect(() => {
        if (sequence) {
            showSequence()
        }
    }, [sequence])

    const handleButtonPressed = (buttonPressed: number) => {
        console.log('buttonPressed ' + buttonPressed)
        console.log('sequence[sequenceIndex] ' + sequence[sequenceIndex])
        if (sequence[sequenceIndex] === buttonPressed) {
            setSequenceIndex((prevIndex) => prevIndex + 1)
        } else if (sequence[sequenceIndex] !== buttonPressed) setScore(0)
    }

    useEffect(() => {
        console.log('sequenceIndex ' + sequenceIndex)
        console.log('sequence.length ' + sequence.length)
        console.log('===========')
        if (sequenceIndex >= sequence.length) {
            setSequenceIndex(0)
            setScore((prevScore) => prevScore + 1)
        }
    }, [sequenceIndex])

    useEffect(() => {
        if (score) {
            setNextLevel()
        }
    }, [score])

    return (
        <div>
            <h1>{gameStarted ? `Score: ${score}` : 'Welcome To SimonSays'}</h1>
            <div className="buttons-container">
                <div className="game-buttons-container">
                    <GameButton
                        initialClassName="btn green"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Green}
                        colorNumber={ColorNumbers.Green}
                        handleButtonPressed={handleButtonPressed}
                    />
                    <GameButton
                        initialClassName="btn red"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Red}
                        colorNumber={ColorNumbers.Red}
                        handleButtonPressed={handleButtonPressed}
                    />
                    <GameButton
                        initialClassName="btn yellow"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Yellow}
                        colorNumber={ColorNumbers.Yellow}
                        handleButtonPressed={handleButtonPressed}
                    />
                    <GameButton
                        initialClassName="btn blue"
                        gameStarted={gameStarted}
                        glowing={glowingButton === ColorNumbers.Blue}
                        colorNumber={ColorNumbers.Blue}
                        handleButtonPressed={handleButtonPressed}
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
