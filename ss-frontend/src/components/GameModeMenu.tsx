import { useState, FC } from 'react'
import '../assets/styles.scss'

interface DropdownProps {
    onSelectOption: (option: string) => void
    isModeSelected: boolean
}

const DropdownMenu: FC<DropdownProps> = ({
    onSelectOption,
    isModeSelected
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState('Select Game Mode')

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option)
        onSelectOption(option)
        setIsOpen(false)
    }

    return (
        <section className={`dropdown`}>
            <p
                className={`dropdownToggle ${
                    isModeSelected ? 'modeError' : ''
                }`}
                onClick={handleToggle}
            >
                {selectedOption}
            </p>
            <ul className={`dropdownMenu ${isOpen && 'fadeIn'}`}>
                <li
                    className="top"
                    onClick={() => handleOptionSelect('Classic')}
                >
                    Classic
                </li>
                <li className="bot" onClick={() => handleOptionSelect('CO-OP')}>
                    CO-OP
                </li>
            </ul>
        </section>
    )
}

export default DropdownMenu
