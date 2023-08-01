import { useEffect, useState, FC } from 'react'
import correct from '../assets/sounds/Correct.mp3'
import { ColorStrings } from '../utils/ColorsConstants'

interface ButtonProps {
    initialClassName: string
    glowing: boolean
    colorNumber?: number
    handleButtonPressed?: Function
    clickable: boolean
    gameOver: boolean
}

const GameButton: FC<ButtonProps> = ({
    initialClassName,
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
                if (handleButtonPressed) handleButtonPressed(colorNumber)
            }, 300)
        }
    }

    useEffect(() => {
        if (glowing) {
            if (colorNumber)
                setClassName(`btn glowing ${ColorStrings[colorNumber]}`)
            else setClassName(`btn-coop glowing orange`)
        } else {
            setClassName(initialClassName)
        }
    }, [glowing])

    useEffect(() => {
        if (gameOver) {
            if (colorNumber) setClassName(`btn glowing wrong`)
            else setClassName(`btn-coop glowing wrong`)
        }
        if (!gameOver) {
            setClassName(initialClassName)
        }
    }, [gameOver])

    return (
        <div
            className={className}
            onClick={isClickable ? handleButtonClick : () => {}}
        ></div>
    )
}

export default GameButton
