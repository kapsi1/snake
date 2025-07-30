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

const BOARD_SIZE = 5;
// const BOARD_SIZE = 3;
const CELL_SIZE_PX = Math.floor(CANVAS_WIDTH_PX / BOARD_SIZE);
const BACKGROUND_COLOR = 'black';
const DOT_RADIUS = 5;
const SPEED = CELL_SIZE_PX / 5; // px/s
const SNAKE_COLOR = '#0085ee';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
const snakeGrid: GridPosition[] = [
  // { x: 3, y: 3 },
  // { x: 3, y: 2 },
  // { x: 2, y: 2 },
  { x: 1, y: 3 },
  { x: 1, y: 2 },
  { x: 0, y: 2 },
  { x: 0, y: 1 },
  { x: 0, y: 0 },
];
// debugEl.textContent = 'snake: ' + snake.map((s) => '(' + s.x + ', ' + s.y + ')').join('');
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
// const snake: GridPosition[] = [
//   { x: 0, y: 0 },
//   { x: 1, y: 0 },
//   { x: 2, y: 0 },
//   { x: 2, y: 1 },
//   { x: 2, y: 2 },
//   { x: 1, y: 2 },
//   { x: 0, y: 2 },
//   { x: 0, y: 1 },
//   { x: 1, y: 1 },
// ];
// 5 x 5
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
//   { x: 3, y: 2 },
//   { x: 3, y: 1 },
//   { x: 3, y: 0 },
//   { x: 4, y: 0 },
//   { x: 4, y: 1 },
//   { x: 4, y: 2 },
//   { x: 4, y: 3 },
//   { x: 4, y: 4 },
//   { x: 3, y: 4 },
//   { x: 2, y: 4 },
//   { x: 1, y: 4 },
//   { x: 0, y: 4 },
//   { x: 0, y: 3 },
//   { x: 1, y: 3 },
//   { x: 2, y: 3 },
//   { x: 3, y: 3 },
// ];
const snake = snakeGrid.map((s) => getCellCenter(s));
const headCell: GridPosition = getGridCell(snake[0]);
// const center = getCellCenter(headCell);
// const head: Position = { x: center.x, y: center.y };
// const head: Position = { x: center.x - 50, y: center.y };
// const head: Position = { x: center.x, y: center.y + 45 };
// let prevHead: Position | null = null;
// const prevHeadCell: GridPosition = { x: headCell.x, y: headCell.y };
const prevHeadCell: GridPosition = { x: headCell.x, y: headCell.y };
let lastTimestamp: number | null = null;
let pause = false;
// let direction = Direction.Right;
let direction = Direction.Right;
let prevDirection: Direction | null = null;
let distanceTravelled = 0;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function clearBackground() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
}

function drawDebug() {
  drawDot(snake[0]);
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

function posToString(name: string, pos: Position | GridPosition, noRounding = false) {
  if (noRounding) return name + '(' + pos.x + ',' + pos.y + ') ';
  else return name + '(' + Math.round(pos.x) + ',' + Math.round(pos.y) + ') ';
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

function getCellCenter(gridPos: GridPosition): Position {
  return {
    x: gridPos.x * CELL_SIZE_PX + CELL_SIZE_PX / 2,
    y: gridPos.y * CELL_SIZE_PX + CELL_SIZE_PX / 2,
  };
}

function getGridCell(pixelPos: Position): GridPosition {
  return {
    x: Math.floor(pixelPos.x / CELL_SIZE_PX),
    y: Math.floor(pixelPos.y / CELL_SIZE_PX),
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
  // console.log(
  //   // snake,
  //   snake.map((pos) => getCellCenter(pos))
  // );

  // arcTo()
  //TODO calculate
  const lineOffset = 50;
  const radius = 50;
  let startPoint: Position;
  let midPoint: Position | null;
  let endPoint: Position | null;
  const headCellCenter = getCellCenter(headCell);
  // Offset from head position to the center of head cell
  const headOffset = { x: snake[0].x - headCellCenter.x, y: snake[0].y - headCellCenter.y };
  // console.log('head', head, 'headCellCenter', headCellCenter, 'headOffset', headOffset);
  ctx.lineWidth = CELL_SIZE_PX / 4;
  // ctx.strokeStyle = COLOR;

  const colors = ['darkred', 'green', 'blue', 'orange', 'brown'];
  let isCorner = false;
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#3b3b3b9c'; //cell background

  ctx.strokeStyle = colors[0];
  startPoint = getCellCenter(snakeGrid[0]);
  startPoint.x += headOffset.x;
  startPoint.y += headOffset.y;
  endPoint = getCellCenter(snakeGrid[1]);
  // midPoint = { x: startPoint.x - (startPoint.x - endPoint.x) / 2, y: startPoint.y - (startPoint.y - endPoint.y) / 2 };
  midPoint = { x: startPoint.x - (startPoint.x - endPoint.x) / 2, y: endPoint.y };
  // console.log('head start', startPoint, 'mid', midPoint, 'end', endPoint);

  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.quadraticCurveTo(midPoint.x, midPoint.y, endPoint.x, endPoint.y);
  ctx.stroke();

  for (let i = 1; i < snake.length - 1; i++) {
    // console.group(i, colors[i % colors.length]);
    ctx.strokeStyle = colors[i % colors.length];
    // startPoint = getCellCenter(snakeGrid[i]); //TODO keep cell centers in an array, update on cell switch
    startPoint = snake[i]; //TODO keep cell centers in an array, update on cell switch
    // console.log('start1', structuredClone(startPoint));
    // midPoint = getCellCenter(snakeGrid[i + 1]);
    midPoint = snake[i + 1];
    if (i < snake.length - 2) {
      // endPoint = getCellCenter(snakeGrid[i + 2]);
      endPoint = snake[i + 2];
      // console.log('endPoint1', endPoint);
    } else {
      endPoint = { x: midPoint.x, y: midPoint.y };
      // console.log('endPoint2', endPoint);
    }

    // // Adjust ends of the snake
    // if (i === 0) {
    //   startPoint.x += headOffset.x;
    //   startPoint.y += headOffset.y;
    //   // console.log('start2', structuredClone(startPoint));
    // } else if (i === snake.length - 2) {
    //   // endPoint.x += headOffset.x;
    //   // midPoint.x = endPoint.x;
    //   // endPoint.y += headOffset.y;
    //   // midPoint.y = endPoint.y;
    // }

    // If this segment starts on a corner, offset the start point,
    // so it doesn't go outside of the rounded corner line
    if (isCorner) {
      if (midPoint.y === startPoint.y) {
        // Vertical -> horizontal
        startPoint.x += midPoint.x > startPoint.x ? lineOffset : -lineOffset;
        // console.log('startX2', startPoint.x);
      } else {
        // Horizontal -> vertical
        startPoint.y += midPoint.y > startPoint.y ? lineOffset : -lineOffset;
        // console.log('startY2', startPoint.y);
      }
    }
    // console.log('start', startPoint, 'mid', midPoint, 'end', endPoint, 'isCorner', isCorner);
    isCorner = startPoint.x !== endPoint.x && startPoint.y !== endPoint.y;

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    // console.log('moveTo', startPoint);
    ctx.arcTo(midPoint.x, midPoint.y, endPoint.x, endPoint.y, radius);
    // console.log('arcTo', midPoint, endPoint);
    ctx.stroke();
    // console.groupEnd();

    // fill snake cells
    // const cc = getCellCenter(snakeGrid[i]);
    ctx.fillRect(snake[i].x - CELL_SIZE_PX / 2, snake[i].y - CELL_SIZE_PX / 2, CELL_SIZE_PX, CELL_SIZE_PX);
  }
  // const cc = getCellCenter(snakeGrid[snakeGrid.length - 1]);
  const lastSegment = snake[snake.length - 1];
  ctx.fillRect(lastSegment.x - CELL_SIZE_PX / 2, lastSegment.y - CELL_SIZE_PX / 2, CELL_SIZE_PX, CELL_SIZE_PX);
  drawDot(endPoint!, 'red');
  ctx.globalAlpha = 1;
}

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  const c = getGridCell(snake[0]);
  headCell.x = c.x;
  headCell.y = c.y;

  // Moved to a new cell
  if (headCell.x !== prevHeadCell.x || headCell.y !== prevHeadCell.y) {
    prevHeadCell.x = headCell.x;
    prevHeadCell.y = headCell.y;
    distanceTravelled = 0;
    // snake.unshift({ x: headCell.x, y: headCell.y });
    const headCellCenter = getCellCenter(snake[0]);
    snake.splice(1, 0, { x: headCellCenter.x, y: headCellCenter.y });
    snake.pop();
    // snakeGrid.unshift({ x: headCell.x, y: headCell.y });
    // snakeGrid.pop();
    // const removed = snake.pop();
    // console.log('add', headCell, 'remove', removed);
    // debugEl.textContent = 'snake: ' + snake.map((s) => '(' + s.x + ', ' + s.y + ')').join('');
  }

  distanceTravelled += deltaPx;
  if (direction === Direction.Right) snake[0].x += deltaPx;
  if (direction === Direction.Left) snake[0].x -= deltaPx;
  if (direction === Direction.Up) snake[0].y -= deltaPx;
  if (direction === Direction.Down) snake[0].y += deltaPx;

  // We want to keep time spent in each cell constant.
  // When changing directions, start moving from center of current cell,
  // and add distance travelled in this cell
  if (prevDirection) {
    // prevHead = { x: head.x, y: head.y };
    // const cellCenter = getCellCenter({ x: headCell.x, y: headCell.y });
    const headCellCenter = getCellCenter(snake[0]);

    switch (direction) {
      case Direction.Right:
        snake[0].x = headCellCenter.x + distanceTravelled;
        snake[0].y = headCellCenter.y;
        break;
      case Direction.Left:
        snake[0].x = headCellCenter.x - distanceTravelled;
        snake[0].y = headCellCenter.y;
        break;
      case Direction.Down:
        snake[0].x = headCellCenter.x;
        snake[0].y = headCellCenter.y + distanceTravelled;
        break;
      case Direction.Up:
        snake[0].x = headCellCenter.x;
        snake[0].y = headCellCenter.y - distanceTravelled;
        break;
    }

    prevDirection = null;
  }

  debugEl.textContent =
    'snake [' +
    snake.map((s) => '(' + Math.round(s.x) + ',' + Math.round(s.y) + ')') +
    ']\n' +
    posToString('head', snake[0]) +
    posToString('headCell', headCell) +
    posToString('prevHeadCell', prevHeadCell);

  clearBackground();
  drawGrid();
  drawSnake();
  drawDebug();
  drawDot(snake[0]);
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
