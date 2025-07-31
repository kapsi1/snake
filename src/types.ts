enum TileType {
  Snake = 'snake',
  Fruit = 'fruit',
}

enum Direction {
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
}

type TilePosition = [number, number];

type Tile = {
  type: TileType;
  color: string;
};

type Snake = TilePosition[];

type GameState = {
  direction: Direction;
  prevDirection: Direction;
  snake: Snake;
  fruit: TilePosition | null;
  isPaused: boolean;
  isGameOver: boolean;
};

export { Tile, TileType, TilePosition, Direction, Snake, GameState };
