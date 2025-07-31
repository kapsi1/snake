import { Tile, TileType, TilePosition, Direction, GameState } from './types';
import { ctx, CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from './setupCanvas';

const BOARD_SIZE = 15;
const TILE_WIDTH_PX = Math.floor(CANVAS_WIDTH_PX / BOARD_SIZE);
const TILE_HEIGHT_PX = Math.floor(CANVAS_HEIGHT_PX / BOARD_SIZE);
const WALLS_WRAP = true;
const BACKGROUND_COLOR = 'black';
const ANIMATION_FRAME_LENGTH = 500;

const randomPos = () => Math.floor(Math.random() * BOARD_SIZE);
const state: GameState = {
  direction: Direction.Right,
  prevDirection: Direction.Right,
  snake: [
    [3, 4],
    [2, 4],
    [1, 4],
  ],
  fruit: null,
  isPaused: false,
  isGameOver: false,
};
state.fruit = getNewFruitPosition();
let lastTimestamp = 0;
let score = 0;
const scoreEl = document.querySelector('#score span') as HTMLSpanElement;
const highScoreEl = document.querySelector('#high-score span') as HTMLSpanElement;
const highScore = localStorage.getItem('highScore') || '0';
highScoreEl.textContent = highScore;
const pauseEl = document.querySelector('#pause') as HTMLDivElement;

function getTileColor(tileIndex: number, totalTiles: number, isGameOver: boolean): string {
  const lightness = Math.max(0.25, 1 - tileIndex / totalTiles) * 100;
  if (isGameOver) return `hsl(0 100 ${lightness / 2})`;
  return `hsl(100 0 ${lightness})`;
}

function drawDebugText(x: number, y: number) {
  const xPos = x * TILE_WIDTH_PX;
  const yPos = y * TILE_HEIGHT_PX;
  ctx.fillStyle = 'lightgray';
  ctx.font = `10px serif`;
  ctx.fillText(`${x}, ${y}`, xPos + 20, yPos + 20);
}

function clearTile(x: number, y: number) {
  const xPos = x * TILE_WIDTH_PX;
  const yPos = y * TILE_HEIGHT_PX;
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(xPos, yPos, TILE_WIDTH_PX, TILE_HEIGHT_PX);
  // drawDebugText(x, y);
}

function drawTile(x: number, y: number, tile: Tile) {
  const xPos = x * TILE_WIDTH_PX;
  const yPos = y * TILE_HEIGHT_PX;
  ctx.fillStyle = tile.color as string;
  ctx.fillRect(xPos, yPos, TILE_WIDTH_PX, TILE_HEIGHT_PX);

  if (tile.type === TileType.Fruit) {
    ctx.font = `${TILE_WIDTH_PX / 1.5}px serif`;
    const fontXPos = xPos + TILE_WIDTH_PX / 2;
    const fontYPos = yPos + TILE_HEIGHT_PX / 2;
    ctx.fillText('🍒', fontXPos, fontYPos);
  }
  // drawDebugText(x, y);
}

function isSameTile(a: TilePosition | null, b: TilePosition | null) {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function drawFruit() {
  drawTile(state.fruit![0], state.fruit![1], { type: TileType.Fruit, color: BACKGROUND_COLOR });
}

function drawSnake() {
  const { snake, isGameOver } = state;
  snake.forEach((segment: TilePosition, index: number) => {
    const tile: Tile = {
      type: TileType.Snake,
      color: getTileColor(index, snake.length, isGameOver),
    };
    clearTile(segment[0], segment[1]);
    drawTile(segment[0], segment[1], tile);
  });
}

function getNewFruitPosition() {
  const newPosition: TilePosition = [randomPos(), randomPos()];
  for (let i = 0; i < state.snake.length; i++) {
    if (isSameTile(state.snake[i], newPosition)) {
      return getNewFruitPosition();
    }
  }
  return newPosition;
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (state.isGameOver) return;
  state.prevDirection = state.direction;
  switch (event.key) {
    case ' ': // Spacebar
      state.isPaused = !state.isPaused;
      pauseEl.style.display = state.isPaused ? 'flex' : 'none';
      if (!state.isPaused) requestAnimationFrame(tick);
      break;
    case 'Escape':
      state.isGameOver = true;
      break;
    case 'w':
    case 'ArrowUp':
      state.direction = Direction.Up;
      break;
    case 's':
    case 'ArrowDown':
      state.direction = Direction.Down;
      break;
    case 'd':
    case 'ArrowRight':
      state.direction = Direction.Right;
      break;
    case 'a':
    case 'ArrowLeft':
      state.direction = Direction.Left;
      break;
  }
  // Don't allow reversing into body
  if (
    (state.prevDirection === Direction.Up && state.direction === Direction.Down) ||
    (state.prevDirection === Direction.Down && state.direction === Direction.Up) ||
    (state.prevDirection === Direction.Left && state.direction === Direction.Right) ||
    (state.prevDirection === Direction.Right && state.direction === Direction.Left)
  ) {
    state.direction = state.prevDirection;
  }
});

function tick(timestamp: number) {
  const deltaT = timestamp - lastTimestamp;
  // console.log('last', lastTimestamp, 'current', timestamp, 'delta', deltaT);
  if (deltaT < ANIMATION_FRAME_LENGTH) {
    requestAnimationFrame(tick);
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

  // Don't allow reversing into body
  // Keyboard listener should catches of those cases, but it can still happen when keys are pressed quickly
  if (isSameTile(newHead, snake[1])) {
    state.direction = state.prevDirection;
    requestAnimationFrame(tick);
    return;
  }

  // Check for collision with body
  // Head can't collide with first 2 body tiles
  for (let i = 3; i < snake.length; i++) {
    if (isSameTile(newHead, snake[i])) {
      state.isGameOver = true;
    }
  }

  if (state.isGameOver) {
    drawSnake();
    return;
  }

  let ateFruit = false;
  if (isSameTile(newHead, fruit)) {
    ateFruit = true;
    score++;
    scoreEl.textContent = score.toString();
    let highScore = parseInt(localStorage.getItem('highScore') || '0');
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore.toString());
      highScoreEl.textContent = highScore.toString();
    }
    state.snake.splice(1, 0, [snake[0][0], snake[0][1]]);
    state.fruit = getNewFruitPosition();
    drawFruit();
  }

  const lastSnakeSegment = snake[snake.length - 1];
  clearTile(lastSnakeSegment[0], lastSnakeSegment[1]);
  state.snake = snake.map((segment, index) => {
    if (index === 0) return newHead;
    if (ateFruit) return segment;
    return snake[index - 1];
  });
  drawSnake();
  if (!state.isPaused) requestAnimationFrame(tick);
}

drawSnake();
drawFruit();
requestAnimationFrame(tick);
