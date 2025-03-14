import { ctx, CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from './setupCanvas';
import { Direction } from './types';

type GridPosition = {
  x: number;
  y: number;
};

type Position = {
  x: number;
  y: number;
};

const BOARD_SIZE = 3;
const CELL_SIZE_PX = Math.floor(CANVAS_WIDTH_PX / BOARD_SIZE);
const BACKGROUND_COLOR = 'black';
const DOT_RADIUS = 5;
const SPEED = CELL_SIZE_PX / 5; // px/s

const snake: GridPosition[] = [
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
];
const prevCell: GridPosition = { x: -1, y: -1 };
let currentCell: GridPosition = { x: 0, y: 1 };
const point: Position = { ...cellCenterPoint(currentCell) };
const prevPoint: Position | null = null;
let lastTimestamp: number | null = null;
let pause = false;
let direction = Direction.Right;
let prevDirection: Direction | null = null;
let frameCount = 0;
let distanceTravelled = 0;

ctx.lineCap = 'round';

function clearBackground() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
}

function drawDebug() {
  ctx.fillStyle = '#3b3b3b';
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const center = cellCenterPoint({ x, y });
      // ctx.fillText(`${center.x}, ${center.y}`, center.x, center.y);
      ctx.fillText(`${x}, ${y}`, center.x, center.y);
    }
  }
  if (prevPoint) drawDot(prevPoint, { color: '#0a5600' });
}

function drawGrid() {
  ctx.strokeStyle = '#3b3b3b';
  ctx.lineWidth = 1;

  for (let x = 1; x < BOARD_SIZE; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE_PX + 0.5, 0);
    ctx.lineTo(x * CELL_SIZE_PX + 0.5, CANVAS_WIDTH_PX);
    ctx.stroke();
  }
  for (let y = 1; y < BOARD_SIZE; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE_PX + 0.5);
    ctx.lineTo(CANVAS_WIDTH_PX, y * CELL_SIZE_PX + 0.5);
    ctx.stroke();
  }
}

function cellCenterPoint(pos: GridPosition): Position {
  return {
    x: pos.x * CELL_SIZE_PX + CELL_SIZE_PX / 2,
    y: pos.y * CELL_SIZE_PX + CELL_SIZE_PX / 2,
  };
}

function getCurrentCell(): GridPosition {
  return {
    x: Math.floor(point.x / CELL_SIZE_PX),
    y: Math.floor(point.y / CELL_SIZE_PX),
  };
}

function drawDot(pos: Position, color?: string) {
  ctx.fillStyle = color || '#0085ee';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  let cellCenter: Position;
  ctx.strokeStyle = '#0085ee';
  ctx.lineWidth = 20;

  // let point =
  ctx.beginPath();
  for (let i = 0; i < snake.length; i++) {
    cellCenter = cellCenterPoint(snake[i]);
    // ctx.moveTo(cellCenter.x, cellCenter.y);
    // ctx.lineTo(cellCenter.x + 100, cellCenter.y + 100);
    drawDot(cellCenter);
  }
  // ctx.stroke();
}

function tick(timestamp: number) {
  if (pause) return;
  frameCount++;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  currentCell = getCurrentCell();
  if (currentCell.x !== prevCell.x || currentCell.y !== prevCell.y) {
    prevCell.x = currentCell.x;
    prevCell.y = currentCell.y;
    distanceTravelled = 0;
  }

  const deltaPx = (SPEED * deltaT) / 1000;
  distanceTravelled += deltaPx;

  if (direction === Direction.Right) point.x += deltaPx;
  if (direction === Direction.Left) point.x -= deltaPx;
  if (direction === Direction.Up) point.y -= deltaPx;
  if (direction === Direction.Down) point.y += deltaPx;

  // We want to keep time spent in each cell constant.
  // When changing directions, start moving from center of current cell,
  // and add distance travelled in this cell
  // TODO animate instead of teleporting
  if (prevDirection) {
    // prevDot = { x: dot.x, y: dot.y };
    const cellCenter = cellCenterPoint({ x: currentCell.x, y: currentCell.y });
    switch (direction) {
      case Direction.Right:
        point.x = cellCenter.x + distanceTravelled;
        point.y = cellCenter.y;
        break;
      case Direction.Left:
        point.x = cellCenter.x - distanceTravelled;
        point.y = cellCenter.y;
        break;
      case Direction.Down:
        point.x = cellCenter.x;
        point.y = cellCenter.y + distanceTravelled;
        break;
      case Direction.Up:
        point.x = cellCenter.x;
        point.y = cellCenter.y - distanceTravelled;
        break;
    }

    prevDirection = null;
  }

  clearBackground();
  drawGrid();
  drawDebug();
  // drawDot(point);
  drawSnake();
  ctx.fillText;
  requestAnimationFrame(tick);
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      pause = !pause;
      if (!pause) {
        lastTimestamp = null;
        requestAnimationFrame(tick);
      }
      break;
    case 'w':
      if (direction !== Direction.Up && direction !== Direction.Down) {
        prevDirection = direction;
        direction = Direction.Up;
      }
      break;
    case 's':
      if (direction !== Direction.Down && direction !== Direction.Up) {
        prevDirection = direction;
        direction = Direction.Down;
      }
      break;
    case 'd':
      if (direction !== Direction.Right && direction !== Direction.Left) {
        prevDirection = direction;
        direction = Direction.Right;
      }
      break;
    case 'a':
      if (direction !== Direction.Left && direction !== Direction.Right) {
        prevDirection = direction;
        direction = Direction.Left;
      }
      break;
  }
});

// requestAnimationFrame(tick);

drawGrid();
drawSnake();
drawDebug();
