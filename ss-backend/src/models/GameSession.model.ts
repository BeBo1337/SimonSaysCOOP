import { Modes } from "../utils/GameConstants";

export interface Game {
  roomId: string;
  score: number;
  players: string[];
  gameMode: number;
  sequence: number[];
}

export class GameSession implements Game {
  roomId: string = "";
  score: number = -1;
  players: string[] = [];
  gameMode: number = 0;
  sequence: number[] = [];
  host: string = "";

  constructor(roomId: string, players: string[], gameMode: number) {
    this.host = players[0];
    this.roomId = roomId;
    this.players = players;
    this.gameMode = gameMode;
  }

  incrementScore(): void {
    this.score++;
  }

  addPlayer(playerId: string) {
    this.players.push(playerId);
  }

  addToSequence(n: number) {
    this.sequence = [...this.sequence, n];
  }

  removePlayer(playerId: string) {
    const index = this.players.findIndex((player) => player === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }
}
