import { useEffect, useState, FC } from 'react'

import blue from '../assets/sounds/blue.mp3'

interface ButtonProps {
    initialClassName: string
    gameStarted: boolean
    glowing: boolean
    colorNumber: number
    handleButtonPressed: Function
}

const GameButton: FC<ButtonProps> = ({
    initialClassName,
    gameStarted,
    glowing,
    colorNumber,
    handleButtonPressed
}: ButtonProps) => {
    const [className, setClassName] = useState(initialClassName)
    const [isClickable, setIsClickable] = useState(true)
    const clickSound = new Audio(blue)

    const handleButtonClick = () => {
        clickSound.play()
        setClassName('btn blinking')
        setIsClickable(false)

        setTimeout(() => {
            setClassName(initialClassName)
            setIsClickable(true)
            handleButtonPressed(colorNumber)
        }, 300)
    }

    useEffect(() => {
        if (glowing) {
            setClassName('btn glowing')
        } else {
            setClassName(initialClassName)
        }
    }, [glowing])

    return (
        <div
            className={className}
            onClick={isClickable && gameStarted ? handleButtonClick : () => {}}
        ></div>
    )
}

export default GameButton
