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

const snake: GridPosition[] = [
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 2, y: 1 },
];
const debugEl = document.querySelector('#debug') as HTMLDivElement;
const prevCell: GridPosition = { x: -1, y: -1 };
// const currentCell: GridPosition = { x: 0, y: 1 };
const currentCell: GridPosition = { x: snake[snake.length - 1].x, y: snake[snake.length - 1].y };
const head: Position = { ...getCellCenter(currentCell) };
let prevHead: Position | null = null;
let lastTimestamp: number | null = null;
let pause = false;
// let direction = Direction.Right;
let direction = Direction.Down;
let prevDirection: Direction | null = null;
let distanceTravelled = 0;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function clearBackground() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
}

function drawDebug() {
  ctx.fillStyle = '#3b3b3b';
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const center = getCellCenter({ x, y });
      ctx.fillText('(' + x + ', ' + y + ')', center.x, center.y - 10); // grid positions
      ctx.fillText('(' + center.x + ', ' + center.y + ')', center.x, center.y + 10); // pixel positions
      drawDot(center, '#3b3b3b', 2);
    }
  }
  // if (prevHead) {
  //   drawDot(prevHead, '#0a5600');
  //   ctx.beginPath();
  //   ctx.moveTo(head.x, head.y);
  //   ctx.lineTo(prevHead.x, prevHead.y);
  //   ctx.stroke();
  // }
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

function getCellCenter(pos: GridPosition): Position {
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
  console.log(
    snake,
    snake.map((pos) => getCellCenter(pos))
  );

  // lineTo()
  // let cellCenter: Position;
  // ctx.strokeStyle = '#0085ee';
  // ctx.lineWidth = CELL_SIZE_PX / 4;
  // ctx.beginPath();
  // cellCenter = getCellCenter(snake[0]);
  // ctx.moveTo(cellCenter.x, cellCenter.y);
  // for (let i = 0; i < snake.length; i++) {
  //   cellCenter = getCellCenter(snake[i]);
  //   ctx.lineTo(cellCenter.x, cellCenter.y);
  // }
  // ctx.stroke();

  // arcTo()
  //TODO calculate
  const offset = 50;
  const radius = 50;
  let center: Position;
  let nextCenter: Position | null;
  let nextNextCenter: Position | null;
  // ctx.lineWidth = 5;
  ctx.lineWidth = CELL_SIZE_PX / 4;
  // ctx.strokeStyle = '#0085ee';
  const colors = ['red', 'green', 'blue', 'yellow', 'red'];
  for (let i = 0; i < snake.length; i++) {
    ctx.strokeStyle = colors[i];
    center = getCellCenter(snake[i]);
    nextCenter = i < snake.length - 1 ? getCellCenter(snake[i + 1]) : null;
    nextNextCenter = i < snake.length - 2 ? getCellCenter(snake[i + 2]) : null;

    let newX = center.x;
    let newY = center.y;
    if (i > 0) {
      if (nextCenter && nextCenter.x === center.x) {
        // Moving vertically
        newY += nextCenter.y > center.y ? offset : -offset;
      } else if (nextCenter && center.y === nextCenter.y) {
        // Moving horizontally
        newX += nextCenter.x > center.x ? offset : -offset;
      }
    }
    ctx.beginPath();
    ctx.moveTo(newX, newY);
    console.log(i, 'moveTo', { x: newX, y: newY });

    if (nextCenter && nextNextCenter) {
      ctx.arcTo(nextCenter.x, nextCenter.y, nextNextCenter.x, nextNextCenter.y, radius);
      console.log(i, colors[i], 'arcTo', nextCenter, nextNextCenter);
    } else if (nextCenter) {
      console.log(i, colors[i], 'lineTo', nextCenter);
      ctx.lineTo(nextCenter.x, nextCenter.y);
    }
    ctx.stroke();
  }

  // quadraticCurveTo()
  // let cellCenter: Position;
  // let nextCellCenter: Position | null;
  // let nextNextCellCenter: Position | null;
  // ctx.lineWidth = 10;
  // const colors = ['red', 'green', 'blue', 'yellow', 'red'];
  // for (let i = 0; i < snake.length; i++) {
  //   ctx.strokeStyle = colors[i];
  //   cellCenter = getCellCenter(snake[i]);
  //   nextCellCenter = i < snake.length - 1 ? getCellCenter(snake[i + 1]) : null;
  //   nextNextCellCenter = i < snake.length - 2 ? getCellCenter(snake[i + 2]) : null;
  //   ctx.beginPath();
  //   ctx.moveTo(cellCenter.x, cellCenter.y);
  //   console.log(i, 'moveTo', cellCenter);
  //   if (nextCellCenter && nextNextCellCenter) {
  //     ctx.quadraticCurveTo(nextCellCenter.x, nextCellCenter.y, nextNextCellCenter.x, nextNextCellCenter.y);
  //     console.log(i, colors[i], 'quadraticCurveTo', nextCellCenter, nextNextCellCenter);
  //   } else if (nextCellCenter) {
  //     console.log(i, colors[i], 'lineTo', nextCellCenter);
  //     ctx.lineTo(nextCellCenter.x, nextCellCenter.y);
  //   }
  //   ctx.stroke();
  // }
}

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (SPEED * deltaT) / 1000;
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
  if (prevDirection) {
    prevHead = { x: head.x, y: head.y };
    const cellCenter = getCellCenter({ x: currentCell.x, y: currentCell.y });

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

    prevDirection = null;
  }

  clearBackground();
  drawGrid();
  drawDebug();
  // drawSnake();
  drawDot(head);
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
drawDot(head);
