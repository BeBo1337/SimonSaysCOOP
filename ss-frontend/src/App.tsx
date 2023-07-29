import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './assets/styles.scss'
import './App.css'
import GameManager from './components/GameManager'
import MainMenu from './components/MainMenu'
import { Routes, Route } from 'react-router-dom'

function App() {
    return (
        <>
            <Routes>
                <Route path="/game" element={<GameManager />} />
                <Route path="/" element={<MainMenu />} />
            </Routes>
        </>
    )
}

export default App
