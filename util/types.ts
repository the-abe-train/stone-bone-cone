// Create a file to hold all my types
export type Weapon = "stone" | "bone" | "cone";
export type Player = {
  name: string;
  queue: Weapon[];
};
export type Battle = {
  player1: Player;
  player2: Player | null;
  winner: Player[];
};

export type User = {
  name: string;
  password: string;
};

export type Session = {
  user: string;
};
