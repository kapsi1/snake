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
console.log('CELL_SIZE_PX', CELL_SIZE_PX);
const BACKGROUND_COLOR = 'black';
const DOT_RADIUS = 5;
const SPEED = CELL_SIZE_PX / 5; // px/s

let dot: Position;
let prevDot: Position | null = null;
let lastTimestamp: number | null = null;
let pause = false;
let direction = Direction.Right;
let prevDirection: Direction | null = null;
let frameCount = 0;
let prevCell: GridPosition = { x: -1, y: -1 };
let currentCell: GridPosition;
// let distanceToCenter: Position = { x: 0, y: 0 };
let distanceTravelled = 0;

function clearBackground() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
}

function drawDebug() {
  ctx.fillStyle = '#3b3b3b';
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const center = cellCenterPoint(x, y);
      ctx.fillText(`${center.x}, ${center.y}`, center.x, center.y);
    }
  }
  // ctx.fillText(`${distanceToCenter.x}, ${distanceToCenter.y}`, CANVAS_WIDTH_PX - 50, 50);
}

function drawGrid() {
  ctx.strokeStyle = '#3b3b3b';

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

function cellCenterPoint(gridX: number, gridY: number): Position {
  return {
    x: gridX * CELL_SIZE_PX + CELL_SIZE_PX / 2,
    y: gridY * CELL_SIZE_PX + CELL_SIZE_PX / 2,
  };
}

function cellTopLeftPoint(gridX: number, gridY: number): Position {
  return {
    x: gridX * CELL_SIZE_PX,
    y: gridY * CELL_SIZE_PX,
  };
}

function getCurrentCell(): GridPosition {
  return {
    x: Math.floor(dot.x / CELL_SIZE_PX),
    y: Math.floor(dot.y / CELL_SIZE_PX),
  };
}

function drawDot(pos: Position, options?: { color?: string; radius?: number }) {
  ctx.fillStyle = options?.color || '#0085ee';
  const radius = options?.radius || DOT_RADIUS;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// function distanceTravelled(): number {
//   const topLeftPoint = cellTopLeftPoint(currentCell.x, currentCell.y);
//   switch (prevDirection!) {
//     case Direction.Right:
//       return dot.x - topLeftPoint.x;
//     case Direction.Left:
//       return dot.x - topLeftPoint.x + CELL_SIZE_PX;
//     case Direction.Down:
//       return dot.y - topLeftPoint.y;
//     case Direction.Up:
//       return dot.y - topLeftPoint.y + CELL_SIZE_PX;
//   }
// }

// function isOppositeDirection(): boolean {
//   if (direction === Direction.Right && prevDirection === Direction.Left) return true;
//   if (direction === Direction.Left && prevDirection === Direction.Right) return true;
//   if (direction === Direction.Up && prevDirection === Direction.Down) return true;
//   if (direction === Direction.Down && prevDirection === Direction.Up) return true;
//   return false;
// }

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

  if (direction === Direction.Right) dot.x += deltaPx;
  if (direction === Direction.Left) dot.x -= deltaPx;
  if (direction === Direction.Up) dot.y -= deltaPx;
  if (direction === Direction.Down) dot.y += deltaPx;

  // distanceToCenter.x = Math.round(dot.x - center.x);
  // distanceToCenter.y = Math.round(dot.y - center.y);

  if (prevDirection) {
    const center = cellCenterPoint(currentCell.x, currentCell.y);
    // let distance = distanceTravelled();
    prevDot = { x: dot.x, y: dot.y };
    // let distanceToEdge: number;

    switch (direction) {
      case Direction.Right:
        dot = { x: center.x + distanceTravelled, y: center.y };
        break;
      case Direction.Left:
        dot = { x: center.x - distanceTravelled, y: center.y };
        break;
      case Direction.Down:
        dot = { x: center.x, y: center.y + distanceTravelled };
        break;
      case Direction.Up:
        dot = { x: center.x, y: center.y - distanceTravelled };
        break;
    }

    // let distanceToEdge = { x: CELL_SIZE_PX / 2 + distanceToCenter.x, y: CELL_SIZE_PX / 2 + distanceToCenter.y };

    console.log(
      prevDirection,
      '->',
      direction,
      'center',
      center,
      'distanceTravelled',
      distanceTravelled,
      // 'distance',
      // distance,
      // 'distanceToCenter',
      // distanceToCenter,
      'dot',
      prevDot,
      '->',
      dot
    );
    prevDirection = null;
  }

  clearBackground();
  drawGrid();
  drawDebug();
  drawDot(dot);
  ctx.fillText;
  if (prevDot) {
    drawDot(prevDot, { color: '#0a5600' });
    // ctx.beginPath();
    // ctx.moveTo(dot.x, dot.y);
    // ctx.lineTo(target.x, target.y);
    // ctx.moveTo(centerPoint.x, centerPoint.y);
    // ctx.lineTo(dot.x, dot.y);
    // ctx.moveTo(centerPoint.x, centerPoint.y);
    // ctx.lineTo(target.x, target.y);
    // ctx.stroke();
  }
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

function setup() {
  dot = cellCenterPoint(0, 1);
  drawDot(dot);
  drawGrid();
  requestAnimationFrame(tick);
}

setup();
