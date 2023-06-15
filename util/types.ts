// Create a file to hold all my types
export type Weapon = "stone" | "bone" | "cone";

export type Player = {
  name: string;
  queue: Weapon[];
};

// Key: results, tourney id, user, round number
export type Result = {
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

export type Tourney = {
  time: string;
  numPlayers: number;
  winners: string[];
  attacks: Record<Weapon, number>;
  rounds: number;
};
