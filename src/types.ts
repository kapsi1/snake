enum TileType {
  Empty = 'empty',
  Body = 'body',
  Head = 'head',
  Fruit = 'fruit',
}

enum Direction {
  Left = "left",
  Up = "up",
  Right = "right",
  Down = "down",
}

type TilePosition = [number, number];
type Tile = {
  type: TileType,
  color: string
}
type Snake = TilePosition[];
type Board = Tile[][];

type GameState = {
  board: Board;
  direction: Direction;
  prevDirection: Direction;
  snake: Snake;
  lastSnakeSegment: TilePosition | null;
  fruit: TilePosition | null,
  isGameOver: boolean
};

export { Tile, TileType, TilePosition, Direction, Snake, Board, GameState };
