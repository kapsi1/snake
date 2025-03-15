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
const SPEED = CELL_SIZE_PX / 10; // px/s
console.log('SPEED', SPEED);

const snake: GridPosition[] = [
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 2, y: 1 },
];
let debugEl = document.querySelector('#debug') as HTMLDivElement;
const prevCell: GridPosition = { x: -1, y: -1 };
const currentCell: GridPosition = { x: 0, y: 1 };
const head: Position = { ...cellCenterPoint(currentCell) };
let prevHead: Position | null = null;
const catchupHead: Position = { x: 0, y: 0 };
let lastTimestamp: number | null = null;
let pause = false;
let direction = Direction.Right;
let prevDirection: Direction | null = null;

let deltaT: number;
let deltaPx: number;
let distanceTravelled = 0;
const headDiffNormalizedVector: Position = { x: 0, y: 0 };
let headDistance: number;
const halfPoint: Position = { x: 0, y: 0 };
const headDiffVector = { x: 0, y: 0 };
let remainingCellDistance: number;
let remainingTimeInCell: number;
let catchupSpeed: number;
let catchupDeltaPx: number;

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
      ctx.fillText(center.x + ', ' + center.y, center.x, center.y); // pixel positions
      // ctx.fillText(x + ', ' + y, center.x, center.y); // grid positions
    }
  }
  if (prevHead) {
    drawDot(prevHead, '#0a5600');
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.lineTo(prevHead.x, prevHead.y);
    ctx.stroke();
  }
}

function printDebug() {
  debugEl.innerHTML =
    'prevHead(' +
    Math.trunc(prevHead?.x || 0) +
    ', ' +
    Math.trunc(prevHead?.y || 0) +
    ') head(' +
    Math.trunc(head.x) +
    ', ' +
    Math.trunc(head.y) +
    ') prevHead(' +
    Math.trunc(prevHead?.x || 0) +
    ', ' +
    Math.trunc(prevHead?.y || 0) +
    ') catchupHead(' +
    Math.trunc(catchupHead.x) +
    ', ' +
    Math.trunc(catchupHead.y) +
    ') catchupSpeed: ' +
    catchupSpeed.toFixed(2) +
    // ' deltaT: ' +
    // deltaT.toFixed(2) +
    // ' deltaPx: ' +
    // deltaPx.toFixed(4) +
    ' catchupDeltaPx: ' +
    catchupDeltaPx.toFixed(4) +
    ' remainingTimeInCell: ' +
    remainingTimeInCell.toFixed(2) +
    ' headDistance: ' +
    Math.trunc(headDistance);
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
    x: Math.floor(head.x / CELL_SIZE_PX),
    y: Math.floor(head.y / CELL_SIZE_PX),
  };
}

function roundPos(pos: Position): Position {
  return { x: Math.round(pos.x), y: Math.round(pos.y) };
}

function drawDot(pos: Position, color?: string, radius = DOT_RADIUS) {
  ctx.fillStyle = color || '#0085ee';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  let cellCenter: Position;
  let nextCellCenter: Position | null;
  const colors = ['red', 'green', 'blue', 'yellow', 'red'];
  // ctx.strokeStyle = '#0085ee';
  // ctx.lineWidth = CELL_SIZE_PX / 4;
  ctx.lineWidth = 5;
  // ctx.lineJoin = 'round';

  cellCenter = cellCenterPoint(snake[0]);
  // ctx.beginPath();
  for (let i = 0; i < snake.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(cellCenter.x, cellCenter.y);
    cellCenter = cellCenterPoint(snake[i]);
    // ctx.lineTo(cellCenter.x, cellCenter.y);
    nextCellCenter = i < snake.length - 1 ? cellCenterPoint(snake[i + 1]) : null;
    console.log(colors[i], cellCenter, nextCellCenter);
    if (nextCellCenter) {
      ctx.arcTo(cellCenter.x, cellCenter.y, nextCellCenter.x, nextCellCenter.y, 100);
    }
    // else ctx.lineTo(cellCenter.x, cellCenter.y);
    ctx.stroke();
  }
  // ctx.stroke();
}

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  deltaT = timestamp - lastTimestamp;
  deltaPx = (SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  const cc = getCurrentCell();
  currentCell.x = cc.x;
  currentCell.y = cc.y;

  if (currentCell.x !== prevCell.x || currentCell.y !== prevCell.y) {
    prevCell.x = currentCell.x;
    prevCell.y = currentCell.y;
    distanceTravelled = 0;
  }

  distanceTravelled += deltaPx;

  if (direction === Direction.Right) head.x += deltaPx;
  if (direction === Direction.Left) head.x -= deltaPx;
  if (direction === Direction.Up) head.y -= deltaPx;
  if (direction === Direction.Down) head.y += deltaPx;

  // We want to keep time spent in each cell constant.
  // When changing directions, start moving from center of current cell,
  // and add distance travelled in this cell
  // TODO animate instead of teleporting
  if (prevDirection) {
    prevHead = { x: head.x, y: head.y };
    const cellCenter = cellCenterPoint({ x: currentCell.x, y: currentCell.y });

    switch (direction) {
      case Direction.Right:
        head.x = cellCenter.x + distanceTravelled;
        head.y = cellCenter.y;
        break;
      case Direction.Left:
        head.x = cellCenter.x - distanceTravelled;
        head.y = cellCenter.y;
        break;
      case Direction.Down:
        head.x = cellCenter.x;
        head.y = cellCenter.y + distanceTravelled;
        break;
      case Direction.Up:
        head.x = cellCenter.x;
        head.y = cellCenter.y - distanceTravelled;
        break;
    }

    catchupHead.x = prevHead.x;
    catchupHead.y = prevHead.y;

    // In the remaining time allowed for the cell, catch up to the new head position
    headDiffVector.x = head.x - prevHead.x;
    headDiffVector.y = head.y - prevHead.y;
    headDistance = Math.hypot(headDiffVector.x, headDiffVector.y);
    headDiffNormalizedVector.x = headDiffVector.x / headDistance;
    headDiffNormalizedVector.y = headDiffVector.y / headDistance;
    remainingCellDistance = CELL_SIZE_PX - distanceTravelled;
    remainingTimeInCell = remainingCellDistance / SPEED;
    catchupSpeed = headDistance / remainingTimeInCell;

    console.log(
      'head',
      roundPos(prevHead),
      '->',
      roundPos(head),
      // 'distanceTravelled',
      // Math.round(distanceTravelled),
      // 'remainingCellDistance',
      // Math.round(remainingCellDistance),
      // 'remainingTimeInCell',
      // Math.trunc(remainingTimeInCell),
      'headDiffVector',
      roundPos(headDiffVector),
      'headDistance',
      Math.round(headDistance),
      'headDiffNormalizedVector',
      headDiffNormalizedVector,
      'catchupSpeed',
      Math.round(catchupSpeed)
    );

    prevDirection = null;
  }

  if (prevHead) {
    headDiffVector.x = head.x - prevHead.x;
    headDiffVector.y = head.y - prevHead.y;
    headDistance = Math.hypot(headDiffVector.x, headDiffVector.y);
    headDiffNormalizedVector.x = headDiffVector.x / headDistance;
    headDiffNormalizedVector.y = headDiffVector.y / headDistance;
    remainingCellDistance = CELL_SIZE_PX - distanceTravelled;
    remainingTimeInCell = remainingCellDistance / SPEED;
    catchupSpeed = headDistance / remainingTimeInCell;
    // halfPoint.x = prevHead.x + (headDiffNormalizedVector.x * headDistance) / 2;
    // halfPoint.y = prevHead.y + (headDiffNormalizedVector.y * headDistance) / 2;
    catchupDeltaPx = (catchupSpeed * deltaT) / 1000;
    catchupHead.x += headDiffNormalizedVector.x * catchupDeltaPx;
    catchupHead.y += headDiffNormalizedVector.y * catchupDeltaPx;
  }

  clearBackground();
  drawGrid();
  drawDebug();
  // drawSnake();
  drawDot(head);
  if (prevHead) {
    // drawDot(halfPoint, 'white', 2);
    drawDot(catchupHead, 'white', 2);
    printDebug();
  }
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

requestAnimationFrame(tick);

// drawGrid();
// drawSnake();
// drawDebug();
