import { Server, Socket } from "socket.io";
import { SocketEvents } from "./SocketEvents";
import uniqid from "uniqid";
import { CreateRoomPayload } from "../models/CreateRoomPayload.model";
import { JoinRoomPayload } from "../models/JoinRoomPayload.model";
import { GameOverPayload } from "../models/GameOverPayload.model";
import { ButtonPayload } from "../models/ButtonPayload.model";
import { GameSession } from "../models/GameSession.model";
import { setNextLevel } from "../utils/GameLogic";

export class SocketManager {
  private static _activeGames: Record<string, GameSession> = {};

  public static init(io: Server, socket: Socket) {
    return new SocketManager(io, socket);
  }

  private get rooms() {
    return this._io.sockets.adapter.rooms;
  }

  private _roomExists(roomId: string) {
    return this.rooms.get(roomId);
  }

  constructor(private _io: Server, private _socket: Socket) {
    const onHandlers: { [key: string]: any } = {
      [SocketEvents.PING]: this._onPing.bind(this),
      [SocketEvents.CREATE_ROOM]: this._createRoom.bind(this),
      [SocketEvents.JOIN_ROOM]: this._joinRoom.bind(this),
      [SocketEvents.START_GAME]: this._startGame.bind(this),
      [SocketEvents.CLICK_BUTTON]: this._onClickButton.bind(this),
      [SocketEvents.GENERATE_SEQUENCE]: this._generateSequence.bind(this),
      [SocketEvents.ON_GAME_LEAVE]: this._onGameLeave.bind(this),
      [SocketEvents.LEAVE_ROOM]: this._onRoomLeave.bind(this),
      [SocketEvents.RESTART_GAME]: this._restartGame.bind(this),
      [SocketEvents.GAMEOVER]: this._onGameOver.bind(this),
    };

    Object.entries(onHandlers).forEach(([key, value]) =>
      this._socket.on(key, value),
    );

    // send socket connected to client
    this._socket.emit(SocketEvents.CONNECTED, { message: "connected" });
  }

  private _onPing() {
    this._socket.emit(SocketEvents.PONG, { message: "pong" });
  }

  private _createRoom(gameMode: number) {
    const room = uniqid("room-");

    SocketManager._activeGames[room] = new GameSession(room, gameMode);
    this._socket.join(room.toString());
    const payload: CreateRoomPayload = {
      roomId: room,
      gameMode: gameMode,
    };
    console.log(`${room} created`);
    this._socket.emit(SocketEvents.ROOM_CREATED, payload);
  }

  private _joinRoom(roomId: string) {
    if (!roomId) {
      this._sendError(
        "joinRoom",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "joinRoom",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    if (roomId in SocketManager._activeGames) {
      const session = SocketManager._activeGames[roomId];
      const payload: JoinRoomPayload = {
        roomId: session.roomId,
        gameMode: session.gameMode,
        playerJoined: true,
      };
      this._socket.join(roomId);
      if (session.playerCount < 2) {
        session.addPlayer();
      } else payload.playerJoined = false;

      this._io.sockets.in(roomId).emit(SocketEvents.ROOM_JOINED, payload);
    }
  }

  private _startGame(roomId: string, host: boolean | null) {
    if (!roomId || host === null) {
      this._sendError(
        "startGame",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "startGame",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    if (host === false) {
      return;
    }
    this._io.sockets.in(roomId).emit(SocketEvents.GAME_STARTED, {});
  }

  private _onClickButton(roomId: string, buttonPayload: ButtonPayload) {
    if (!roomId || !buttonPayload) {
      this._sendError(
        "onClickButton",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "onClickButton",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    const session = SocketManager._activeGames[roomId];
    if (session.gameOver) return;

    session.currIndex = buttonPayload.currentSeqIndex;
    if (session.sequence[session.currIndex] !== buttonPayload.buttonColor)
      session.setGameOver();

    this._io.sockets
      .in(roomId)
      .emit(SocketEvents.BUTTON_CLICKED, buttonPayload);
  }

  private _generateSequence(roomId: string) {
    if (!roomId) {
      this._sendError(
        "generateSequence",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "generateSequence",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    const session = SocketManager._activeGames[roomId];
    if (session.gameOver) return;
    let n = setNextLevel(session);
    this._io.sockets.in(roomId).emit(SocketEvents.SEQUENCE_GENERATED, n);
  }

  private _restartGame(roomId: string) {
    if (!roomId) {
      this._sendError(
        "restartGame",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "restartGame",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    const session = SocketManager._activeGames[roomId];
    session.restartGame();
    this._io.sockets.in(roomId).emit(SocketEvents.GAME_RESTARTED, {});
  }

  private _onGameLeave(roomId: string, host: boolean) {
    if (!roomId || (host !== false && host !== true)) {
      this._sendError(
        "onGameLeave",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "onGameLeave",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    this._io.sockets.in(roomId).emit(SocketEvents.DISBAND_GAME, {});
    delete SocketManager._activeGames[roomId];
    console.log(`${roomId} removed`);
  }

  private _onRoomLeave(roomId: string, host: boolean | null) {
    if (!roomId || host === null) {
      this._sendError(
        "onRoomLeave",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "onRoomLeave",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    const session = SocketManager._activeGames[roomId];
    if (host) {
      this._io.sockets.in(roomId).emit(SocketEvents.DISBAND_GAME, {});
      delete SocketManager._activeGames[roomId];
      console.log(`${roomId} removed`);
    } else {
      session.removePlayer();
      this._socket.leave(roomId);
      this._io.sockets.in(roomId).emit(SocketEvents.PLAYER_LEFT_LOBBY, {});
    }
  }

  private _onGameOver(roomId: string) {
    if (!roomId) {
      this._sendError(
        "onGameOver",
        "There was an issue, please try again",
        "Missing Variables",
      );
      return;
    }
    if (!this._roomExists(roomId)) {
      this._sendError(
        "onGameOver",
        "There was an issue, please try again",
        `This room ${roomId} does not exist.`,
      );
      return;
    }
    const session = SocketManager._activeGames[roomId];
    const payload: GameOverPayload = {
      gameMode: session.gameMode,
      score: session.score,
    };
    this._io.sockets.in(roomId).emit(SocketEvents.GAMEOVER_RET, payload);
    delete SocketManager._activeGames[roomId];
    console.log(`${roomId} removed`);
  }

  private _sendError(where?: string, message?: string, error?: unknown) {
    this._socket.emit(
      SocketEvents.ERROR,
      where,
      message ?? `There was an issue`,
      error,
    );
  }
}
