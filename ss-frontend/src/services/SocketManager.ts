import io, { Socket } from 'socket.io-client'
import { SocketEvents } from './SocketEvents'
import EventsManager from './EventsManager'

import { CreateRoomPayload } from '../payloads/CreateRoomPayload'
import { JoinRoomPayload } from '../payloads/JoinRoomPayload'
import { GameOverPayload } from '../payloads/GameOverPayload'
import { ButtonPayload } from '../payloads/ButtonPayload'

const endpoint = 'localhost:3000'

export interface SocketError {
    where: string
    message: string
    error: any
}

export default class SocketManager {
    private static _instance: SocketManager
    private _roomId: string | null = null
    //private _playerId: string | null = null
    private _isHost: boolean = false

    public static get instance() {
        if (!SocketManager._instance) {
            SocketManager._instance = new SocketManager()
        }
        return SocketManager._instance
    }

    public static newInstance() {
        if (SocketManager._instance) {
            SocketManager._instance.dispose()
        }

        SocketManager._instance = new SocketManager()
        return SocketManager._instance
    }

    public get roomId() {
        return this._roomId || null
    }
    // public get playerId() {
    //     return this._playerId || null
    // }
    public get isHost() {
        return this._isHost
    }

    private _unsubscribers: (() => void)[]
    private _socket: Socket
    private _eventsManager: EventsManager
    constructor() {
        this._eventsManager = EventsManager.instance
        this._unsubscribers = []

        const emitsHandler = {
            [SocketEvents.PING]: this._ping.bind(this),
            [SocketEvents.CREATE_ROOM]: this._createRoom.bind(this),
            [SocketEvents.JOIN_ROOM]: this._joinRoom.bind(this),
            [SocketEvents.START_GAME]: this._startGame.bind(this),
            [SocketEvents.ON_DISCONNECT]: this._onDisconnect.bind(this),
            [SocketEvents.CLICK_BUTTON]: this._onClickButton.bind(this),
            [SocketEvents.GENERATE_SEQUENCE]: this._generateSequence.bind(this),
            [SocketEvents.ON_GAME_LEAVE]: this._onGameLeave.bind(this),
            [SocketEvents.LEAVE_ROOM]: this._onRoomLeave.bind(this),
            [SocketEvents.RESTART_GAME]: this._onRestartGame.bind(this),
            [SocketEvents.GAMEOVER]: this._onGameOver.bind(this)
        }

        const onsHandler = {
            [SocketEvents.PONG]: this._pong.bind(this),
            [SocketEvents.ERROR]: this._onError.bind(this),
            [SocketEvents.ROOM_CREATED]: this._roomCreated.bind(this),
            [SocketEvents.ROOM_JOINED]: this._roomJoined.bind(this),
            [SocketEvents.GAME_STARTED]: this._gameStarted.bind(this),
            [SocketEvents.BUTTON_CLICKED]: this._buttonClicked.bind(this),
            [SocketEvents.SEQUENCE_GENERATED]:
                this._sequenceGenerated.bind(this),
            [SocketEvents.DISBAND_GAME]: this._disbandGame.bind(this),
            [SocketEvents.PLAYER_LEFT_LOBBY]: this._onPlayerLeft.bind(this),
            [SocketEvents.GAME_RESTARTED]: this._gameRestarted.bind(this),
            [SocketEvents.GAMEOVER_RET]: this._gameOverReturn.bind(this)
        }

        for (const [key, value] of Object.entries(emitsHandler)) {
            this._eventsManager.on(key, 'socket-manager', value)
            this._unsubscribers.push(() =>
                this._eventsManager.off(key, 'socket-manager')
            )
        }

        this._socket = io(endpoint, {
            transports: ['websocket']
        })

        this._socket.on(SocketEvents.CONNECTED, this._connected.bind(this))

        Object.entries(onsHandler).forEach(([key, value]) =>
            this._socket.on(key, value)
        )
    }

    private _connected() {
        this._eventsManager.trigger(SocketEvents.CONNECTED, {})
    }

    //#region emits
    private _ping() {
        this._socket.emit(SocketEvents.PING, {})
    }

    private _createRoom(data: any) {
        const { gameMode } = data
        //this._playerId = playerId
        this._socket.emit(SocketEvents.CREATE_ROOM, gameMode)
    }

    private _joinRoom(data: any) {
        const { roomId } = data
        //this._playerId = playerId
        this._socket.emit(SocketEvents.JOIN_ROOM, roomId)
    }

    private _startGame(data: any) {
        const { roomId } = data
        this._socket.emit(SocketEvents.START_GAME, roomId, this._isHost)
    }

    private _onDisconnect() {
        this._socket.emit(SocketEvents.ON_DISCONNECT, {})
    }

    private _onClickButton(buttonPayload: ButtonPayload) {
        this._socket.emit(
            SocketEvents.CLICK_BUTTON,
            this._roomId,
            buttonPayload
        )
    }

    private _generateSequence() {
        if (this._isHost)
            this._socket.emit(SocketEvents.GENERATE_SEQUENCE, this._roomId)
    }

    private _onGameLeave() {
        this._socket.emit(
            SocketEvents.ON_GAME_LEAVE,
            this._roomId,
            this._isHost
        )
    }

    private _onRoomLeave() {
        this._socket.emit(SocketEvents.LEAVE_ROOM, this._roomId)
    }

    private _onRestartGame() {
        if (this._isHost)
            this._socket.emit(SocketEvents.RESTART_GAME, this._roomId)
    }

    private _onGameOver() {
        if (this._isHost)
            this._socket.emit(SocketEvents.GAMEOVER, this._roomId, this._isHost)
    }
    //#endregion

    //#region ons
    private _pong() {
        this._eventsManager.trigger(SocketEvents.PONG, {})
    }

    private _onError(where?: string, message?: string, error?: unknown) {
        console.error(`[${where ?? 'Server Error'}] ${message};`, error)
    }

    private _roomCreated(p: CreateRoomPayload) {
        this._roomId = p.roomId
        this._isHost = true
        this._eventsManager.trigger(SocketEvents.ROOM_CREATED, p)
    }

    private _roomJoined(p: JoinRoomPayload) {
        if (p) {
            this._roomId = p.roomId
            this._eventsManager.trigger(SocketEvents.ROOM_JOINED, p)
        }
    }

    private _gameStarted() {
        this._eventsManager.trigger(SocketEvents.GAME_STARTED, {})
    }

    private _buttonClicked(p: ButtonPayload) {
        this._eventsManager.trigger(SocketEvents.BUTTON_CLICKED, p)
    }

    private _sequenceGenerated(n: number) {
        this._eventsManager.trigger(SocketEvents.SEQUENCE_GENERATED, n)
    }

    private _disbandGame() {
        this._roomId = null
        this._eventsManager.trigger(SocketEvents.DISBAND_GAME, this._isHost)
        this._isHost = false
    }

    private _onPlayerLeft() {
        this._eventsManager.trigger(
            SocketEvents.PLAYER_LEFT_LOBBY,
            this._isHost
        )
    }

    private _gameRestarted() {
        this._eventsManager.trigger(SocketEvents.GAME_RESTARTED, {})
    }

    private _gameOverReturn(p: GameOverPayload) {
        this._eventsManager.trigger(SocketEvents.GAMEOVER_RET, p)
    }
    //#endregion

    public dispose() {
        for (const unsub of this._unsubscribers) {
            unsub()
        }
    }
}

// @ts-ignore
window.SocketManager = SocketManager
