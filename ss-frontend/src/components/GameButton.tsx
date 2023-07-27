import { useEffect, useState, FC } from 'react'

import correct from '../assets/sounds/Correct.mp3'
import { ColorStrings } from '../utils/ColorsConstants'

interface ButtonProps {
    initialClassName: string
    gameStarted: boolean
    glowing: boolean
    colorNumber: number
    handleButtonPressed: Function
    clickable: boolean
    gameOver: boolean
}

const GameButton: FC<ButtonProps> = ({
    initialClassName,
    gameStarted,
    glowing,
    colorNumber,
    handleButtonPressed,
    clickable,
    gameOver
}: ButtonProps) => {
    const [className, setClassName] = useState(initialClassName)
    const [isClickable, setIsClickable] = useState(true) //same button spam stopper
    const clickSound = new Audio(correct)

    const handleButtonClick = () => {
        if (clickable) {
            clickSound.play()
            setClassName('btn blinking')
            setIsClickable(false)

            setTimeout(() => {
                setClassName(initialClassName)
                setIsClickable(true)
                handleButtonPressed(colorNumber)
            }, 300)
        }
    }

    useEffect(() => {
        if (glowing) {
            console.log(`btn glowing ${ColorStrings[colorNumber]}`)
            setClassName(`btn glowing ${ColorStrings[colorNumber]}`)
        } else {
            setClassName(initialClassName)
        }
    }, [glowing])

    useEffect(() => {
        if (gameOver) {
            setClassName(`btn glowing wrong`)
        }
    }, [gameOver])

    return (
        <div
            className={className}
            onClick={isClickable && gameStarted ? handleButtonClick : () => {}}
        ></div>
    )
}

export default GameButton
