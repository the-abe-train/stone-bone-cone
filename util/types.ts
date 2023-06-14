// Create a file to hold all my types
export type Attack = "stone" | "bone" | "cone";
export type Player = {
  name: string;
  queue: Attack[];
};
export type Battle = {
  player1: Player;
  player2: Player | null;
  winner: Player[];
};
