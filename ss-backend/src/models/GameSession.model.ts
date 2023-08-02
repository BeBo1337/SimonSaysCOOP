import { Modes } from "../utils/GameConstants";

export interface Game {
  roomId: string;
  score: number;
  playerCount: number;
  gameMode: number;
  sequence: number[];
}

export class GameSession implements Game {
  roomId: string = "";
  score: number = -1;
  playerCount: number = 0;
  gameMode: number = 0;
  sequence: number[] = [];

  constructor(roomId: string, gameMode: number) {
    this.roomId = roomId;
    this.playerCount = 1;
    this.gameMode = gameMode;
  }

  incrementScore(): void {
    this.score++;
  }

  restartGame(): void {
    this.sequence = [];
    this.score = -1;
  }

  addPlayer() {
    this.playerCount++;
  }

  addToSequence(n: number) {
    this.sequence = [...this.sequence, n];
  }

  removePlayer() {
    this.playerCount--;
  }
}
