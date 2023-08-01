import { ColorStrings, ColorNumbers } from "./ColorsConstants";
import { Modes } from "./GameConstants";

export const getNumberInRange = (start: number, end: number): number => {
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

export const setNextLevel = (gameMode: number): number => {
  let n: number = 1;
  if (gameMode === Modes.CO_OP) n = getNumberInRange(1, 8);
  else if (gameMode === Modes.CLASSIC) n = getNumberInRange(1, 4);
  return n;
};
