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
const COLOR = '#0085ee';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
const prevHeadCell: GridPosition = { x: -1, y: -1 };
// const snake: GridPosition[] = [
//   { x: 0, y: 0 },
//   { x: 0, y: 1 },
//   { x: 1, y: 1 },
//   { x: 1, y: 0 },
//   { x: 2, y: 0 },
//   { x: 2, y: 1 },
//   { x: 2, y: 2 },
//   { x: 1, y: 2 },
//   { x: 0, y: 2 }
// ];
// const snake: GridPosition[] = [
//   { x: 0, y: 0 },
//   { x: 1, y: 0 },
//   { x: 2, y: 0 },
//   { x: 2, y: 1 },
//   { x: 1, y: 1 },
//   { x: 0, y: 1 },
//   { x: 0, y: 2 },
//   { x: 1, y: 2 },
//   { x: 2, y: 2 },
// ];
const snake: GridPosition[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 2, y: 1 },
  { x: 2, y: 2 },
  { x: 1, y: 2 },
  { x: 0, y: 2 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];
const headCell: GridPosition = { x: snake[0].x, y: snake[0].y };
let prevHead: Position | null = null;
const center = getCellCenter(headCell);
// const head: Position = { x: center.x, y: center.y };
const head: Position = { x: center.x - 50, y: center.y };
// const head: Position = { x: center.x, y: center.y + 75 };
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
  const color = '#b6b6b6';
  ctx.fillStyle = color;
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const center = getCellCenter({ x, y });
      ctx.fillText('(' + x + ', ' + y + ')', center.x, center.y - 10); // grid positions
      ctx.fillText('(' + center.x + ', ' + center.y + ')', center.x, center.y + 10); // pixel positions
      drawDot(center, color, 2);
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
  ctx.fillStyle = color || 'white';
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
  const lineOffset = 50;
  const radius = 50;
  let startPoint: Position;
  let midPoint: Position | null;
  let endPoint: Position | null;
  const headCellCenter = getCellCenter(headCell);
  // Offset from head position to the center of cell
  const headOffset = { x: head.x - headCellCenter.x, y: head.y - headCellCenter.y };
  console.log('head', head, 'headCellCenter', headCellCenter, 'headOffset', headOffset);
  // ctx.lineWidth = 5;
  ctx.lineWidth = CELL_SIZE_PX / 4;
  // ctx.lineWidth = CELL_SIZE_PX / 8;
  ctx.strokeStyle = COLOR;

  // Head and first point
  // ctx.beginPath();
  // ctx.moveTo(head.x, head.y);
  // console.log('moveTo', head);
  // const center = getCellCenter(snake[1]);
  // ctx.lineTo(center.x, center.y);
  // console.log('lineTo', center);
  // ctx.stroke();

  const colors = ['darkred', 'green', 'blue', 'orange', 'brown', 'darkred', 'green', 'blue', 'orange', 'brown'];
  let isCorner = false;

  for (let i = 0; i < snake.length - 1; i++) {
    ctx.strokeStyle = colors[i];
    startPoint = getCellCenter(snake[i]);
    midPoint = getCellCenter(snake[i + 1]);
    if (i < snake.length - 2) endPoint = getCellCenter(snake[i + 2]);
    else endPoint = { x: midPoint.x, y: midPoint.y };
    console.group(i, colors[i]);    

    // let startX = startPoint.x;
    // let startY = startPoint.y;
    // let endX = endPoint.x;
    // let endY = endPoint.y;
    // console.log('startX', startX, 'startY', startY);

    // Adjust ends of the snake
    if (i === 0) {
      startPoint.x += headOffset.x;
      startPoint.y += headOffset.y;
    } else if (i === snake.length - 2) {
      endPoint.x += headOffset.x;
      midPoint.x = endPoint.x;
      endPoint.y += headOffset.y;
      midPoint.y = endPoint.y;
    }

    // If this segment starts on a corner, offset the start point,
    // so it doesn't go outside of the rounded corner line
    if (isCorner) {
      if (midPoint.y === startPoint.y) {
        // Vertical -> horizontal
        startPoint.x += midPoint.x > startPoint.x ? lineOffset : -lineOffset;
        // console.log('startX2', startX);
      } else {
        // Horizontal -> vertical
        startPoint.y += midPoint.y > startPoint.y ? lineOffset : -lineOffset;
        // console.log('startY2', startY);
      }
    }
    console.log('start', startPoint, 'mid', midPoint, 'end', endPoint, 'isCorner', isCorner);
    isCorner = startPoint.x !== endPoint.x && startPoint.y !== endPoint.y;

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    console.log('moveTo', startPoint);

    // if (i < snake.length - 1) {
    ctx.arcTo(midPoint.x, midPoint.y, endPoint.x, endPoint.y, radius);
    console.log('arcTo', midPoint, endPoint);
    // } else {
    // console.log(i, colors[i - 2], 'lineTo', midPoint');
    // ctx.lineTo(midPoint'.x, midPoint'.y);
    // console.log(i, colors[i - 2], 'lineTo', endPoint);
    // ctx.lineTo(endPoint.x + headOffset.x, endPoint.y + headOffset.y);
    // }
    ctx.stroke();    
    console.groupEnd();
  }
  drawDot(endPoint!, 'red');

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

  const c = getCurrentCell();
  headCell.x = c.x;
  headCell.y = c.y;

  // Moved to a new cell
  if (headCell.x !== prevHeadCell.x || headCell.y !== prevHeadCell.y) {
    prevHeadCell.x = headCell.x;
    prevHeadCell.y = headCell.y;
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
    const cellCenter = getCellCenter({ x: headCell.x, y: headCell.y });

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
