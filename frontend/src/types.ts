export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type GameStatus = "ACTIVE" | "LOCKED_BY_LADDER" | "LOCKED_BY_SNAKE";

export type GameSession = {
  id: string;
  userId: string;
  status: GameStatus;
  currentTile: number;
  createdAt: string;
};

export type AssignedTask = {
  id: string;
  gameSessionId: string;
  taskName: string;
  durationMinutes: number;
  status: "PENDING" | "VERIFIED";
  createdAt: string;
};

export type TileEffect = {
  from: number;
  to: number;
  kind: "LADDER" | "SNAKE";
};

export type TaskPreference = {
  id: string;
  userId: string;
  type: "FAVORITE" | "PRODUCTIVE";
  name: string;
  durationMinutes: number;
};

export type AvatarKind = "male" | "female" | "cat";

export type AvatarPreference = {
  kind: AvatarKind;
  outfitColor: string;
};

export type GalleryItem = {
  id: string;
  userId: string;
  taskName: string;
  s3Url: string;
  uploadedAt: string;
};

export type GameState = {
  session: GameSession;
  pendingTask: AssignedTask | null;
  gallery: GalleryItem[];
  board: {
    ladders: TileEffect[];
    snakes: TileEffect[];
    effects?: TileEffect[];
    winTile: number;
  };
  victory: boolean;
};
