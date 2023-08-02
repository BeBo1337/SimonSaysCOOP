import { GameSession } from "../models/GameSession.model";
import { ColorStrings, ColorNumbers } from "./ColorsConstants";
import { Modes } from "./GameConstants";

export const getNumberInRange = (start: number, end: number): number => {
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

export const setNextLevel = (session: GameSession): number => {
  let n: number = 1;
  if (session.gameMode === Modes.CO_OP) {
    if (session.sameSideStreak >= 4) {
      if (session.whichSideStreak === 1) {
        n = getNumberInRange(5, 8);
        session.resetSameSideStreak();
        session.setSideStreak(2);
      } else {
        n = getNumberInRange(1, 4);
        session.resetSameSideStreak();
        session.setSideStreak(1);
      }
    } else {
      n = getNumberInRange(1, 8);
      if (n >= 1 && n <= 4) {
        if (session.whichSideStreak === 1) session.increaseSameSideStreak();
        else {
          session.resetSameSideStreak();
          session.setSideStreak(1);
        }
      } else if (n >= 5 && n <= 8) {
        if (session.whichSideStreak === 2) session.increaseSameSideStreak();
        else {
          session.resetSameSideStreak();
          session.setSideStreak(2);
        }
      }
    }
  } else if (session.gameMode === Modes.CLASSIC) n = getNumberInRange(1, 4);
  session.incrementScore();
  session.addToSequence(n);
  return n;
};
