//TODO zrobić węża jako path zamiast kwadratów
//płynna animacja

import { TileType, TilePosition, Direction, GameState } from "./types";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;

const CANVAS_WIDTH_PX = 602;
const CANVAS_HEIGHT_PX = 602;
const BOARD_SIZE = 15;
const WALLS_WRAP = false;
const SHOW_GRID = false;
const TICK_SPEED_MS = 250;
const TILE_WIDTH_PX = Math.floor(CANVAS_WIDTH_PX / BOARD_SIZE);
const TILE_HEIGHT_PX = Math.floor(CANVAS_HEIGHT_PX / BOARD_SIZE);

const keyboardListener = (state: GameState) => (event: KeyboardEvent) => {
  if (state.isGameOver) return;
  gameState.prevDirection = gameState.direction;
  switch (event.key) {
    case "w":
      gameState.direction = Direction.Up;
      break;
    case "s":
      gameState.direction = Direction.Down;
      break;
    case "d":
      gameState.direction = Direction.Right;
      break;
    case "a":
      gameState.direction = Direction.Left;
      break;
  }
  // tick(state);
};

function getColor(tileIndex: number, totalTiles: number, isGameOver: boolean): string {
  const opacity = Math.max(0.25, 1 - tileIndex / totalTiles);
  if (isGameOver) return `rgba(139, 0, 0, ${opacity})`;
  return `rgba(255, 255, 255, ${opacity})`;
}

function draw(state: GameState) {
  const { board } = state;
  ctx.strokeStyle = "darkgray";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
  ctx.strokeRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board.length; y++) {
      const tile = board[x][y];
      const xPos = x * TILE_WIDTH_PX + 1;
      const yPos = y * TILE_HEIGHT_PX + 1;
      ctx.fillStyle = tile.color as string;

      switch (tile.type) {
        case TileType.Empty:
          if (SHOW_GRID) ctx.strokeRect(xPos, yPos, TILE_WIDTH_PX, TILE_HEIGHT_PX);
          break;

        case TileType.Head:
        case TileType.Body:
          ctx.fillRect(xPos, yPos, TILE_WIDTH_PX, TILE_HEIGHT_PX);
          break;

        case TileType.Fruit:
          ctx.fillRect(xPos, yPos, TILE_WIDTH_PX, TILE_HEIGHT_PX);
          ctx.font = `${TILE_WIDTH_PX / 1.5}px serif`;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          const fontXPos = xPos + TILE_WIDTH_PX / 2;
          const fontYPos = yPos + TILE_HEIGHT_PX / 2;
          ctx.fillText("🍒", fontXPos, fontYPos);
          if (SHOW_GRID) ctx.strokeRect(xPos, yPos, TILE_WIDTH_PX, TILE_HEIGHT_PX);
          break;
      }
    }
  }
}

function isSameTile(a: TilePosition | null, b: TilePosition | null) {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function getBoard(state: GameState) {
  const { snake, fruit, isGameOver, board, lastSnakeSegment } = state;
  if (lastSnakeSegment) {
    board[lastSnakeSegment[0]][lastSnakeSegment[1]] = {
      type: TileType.Empty,
      color: "black",
    };
  }
  snake.forEach((segment, index) => {
    board[segment[0]][segment[1]] = {
      type: index === 0 ? TileType.Head : TileType.Body,
      color: getColor(index, snake.length, isGameOver),
    };
  });
  if (fruit) board[fruit[0]][fruit[1]] = { type: TileType.Fruit, color: "black" };
  return board;
}

const randomPos = () => Math.floor(Math.random() * BOARD_SIZE);

function getNewFruitPosition(state: GameState) {
  const newPosition: TilePosition = [randomPos(), randomPos()];

  for (let i = 0; i < state.snake.length; i++) {
    if (isSameTile(state.snake[i], newPosition)) {
      return getNewFruitPosition(state);
    }
  }
  return newPosition;
}

function tick(state: GameState, timestamp: number, lastTimestamp: number) {
  const deltaT = timestamp - lastTimestamp;
  // console.log("last", lastTimestamp, "current", timestamp, "delta", deltaT);
  // if (deltaT < 100 && timestamp < 5000) {
  if (deltaT < 100) {
    requestAnimationFrame((timestamp) => tick(gameState, timestamp, lastTimestamp));
    return;
  }
  lastTimestamp = timestamp;
  const { snake, direction, fruit } = state;
  let newHead: [number, number] = [0, 0];
  let newX, newY;

  switch (direction) {
    case Direction.Right:
      newX = state.snake[0][0] + 1;
      if (newX >= BOARD_SIZE) {
        if (WALLS_WRAP) newX = 0;
        else state.isGameOver = true;
      }
      newHead = [newX, state.snake[0][1]];
      break;

    case Direction.Left:
      newX = state.snake[0][0] - 1;
      if (newX < 0) {
        if (WALLS_WRAP) newX = BOARD_SIZE - 1;
        else state.isGameOver = true;
      }
      newHead = [newX, state.snake[0][1]];
      break;

    case Direction.Down:
      newY = state.snake[0][1] + 1;
      if (newY >= BOARD_SIZE) {
        if (WALLS_WRAP) newY = 0;
        else state.isGameOver = true;
      }
      newHead = [state.snake[0][0], newY];
      break;

    case Direction.Up:
      newY = state.snake[0][1] - 1;
      if (newY < 0) {
        if (WALLS_WRAP) newY = BOARD_SIZE - 1;
        else state.isGameOver = true;
      }
      newHead = [state.snake[0][0], newY];
      break;
  }

  // don't allow reversing into the body
  if (isSameTile(newHead, snake[1])) {
    state.direction = state.prevDirection;
    return;
  }

  // check for collision with body
  for (let i = 0; i < snake.length; i++) {
    if (isSameTile(snake[i], newHead)) {
      state.isGameOver = true;
    }
  }

  if (state.isGameOver) {
    state.board = getBoard(state);
    draw(state);
    return;
  }

  let ateFruit = false;
  if (isSameTile(newHead, fruit)) {
    ateFruit = true;
    state.snake.splice(1, 0, snake[0]);
    state.fruit = getNewFruitPosition(state);
  }

  state.lastSnakeSegment = snake[snake.length - 1];
  state.snake = snake.map((segment, index) => {
    if (index === 0) return newHead;
    if (ateFruit) return segment;
    return snake[index - 1];
  });

  state.board = getBoard(state);
  // console.log(state.snake);
  draw(state);
  // if (timestamp < 5000) 
    requestAnimationFrame((timestamp) => tick(gameState, timestamp, lastTimestamp));
}

const gameState: GameState = {
  board: new Array(BOARD_SIZE)
    .fill(null)
    .map(() => new Array(BOARD_SIZE).fill({ type: TileType.Empty, color: "black" })),
  direction: Direction.Right,
  prevDirection: Direction.Right,
  snake: [
    [3, 4],
    [2, 4],
    [1, 4],
  ],
  lastSnakeSegment: null,
  fruit: null,
  isGameOver: false,
};
gameState.fruit = getNewFruitPosition(gameState);
window.addEventListener("keydown", keyboardListener(gameState));
let lastTimestamp = 0;
// const intervalId = setInterval(() => {
//   if (gameState.isGameOver) clearInterval(intervalId);
//   else tick(gameState);
// }, TICK_SPEED_MS);

requestAnimationFrame((timestamp) => tick(gameState, timestamp, lastTimestamp));
