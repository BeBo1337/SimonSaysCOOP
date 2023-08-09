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
  gameOver: boolean = false;
  sequence: number[] = [];
  currIndex = 0;
  whichSideStreak = 0;
  sameSideStreak = 0;

  constructor(roomId: string, gameMode: number) {
    this.roomId = roomId;
    this.playerCount = 1;
    this.gameMode = gameMode;
  }

  incrementScore(): void {
    this.score++;
  }

  incrementSeqIndex(): void {
    this.currIndex++;
  }

  increaseSameSideStreak(): void {
    this.sameSideStreak++;
  }

  setGameOver(): void {
    this.gameOver = true;
  }

  resetSameSideStreak(): void {
    this.sameSideStreak = 1;
  }

  setSideStreak(side: number): void {
    this.whichSideStreak = side;
  }

  restartGame(): void {
    this.sequence = [];
    this.currIndex = 0;
    this.gameOver = false;
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
