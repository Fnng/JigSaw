let CANVAS = null;
let CONTEXT = null;
let IMAGE = null;
let SCALER = 0.8;
let SIZE = { x: 0, y: 0, width: 0, height: 0, rows: 3, columns: 3 };
let PIECES = [];
let SELECTED_PIECE = null;
let CONNECTED = new Map();
let COLOUR_CANVAS = null;
let COLOUR_CONTEXT = null;
let SNAP_SOUND = new Audio("snapsound.mp3");
let START_TIME = null;
let END_TIME = null;
SNAP_SOUND.volume = 0.1;
let correction = 10;

function main() {
  CANVAS = document.getElementById("myCanvas");
  CONTEXT = CANVAS.getContext("2d");
  COLOUR_CANVAS = document.getElementById("colourCanvas");
  COLOUR_CONTEXT = COLOUR_CANVAS.getContext("2d");
  addEventListeners();

  IMAGE = document.getElementById("sample");

  handleResize();

  initializePieces(SIZE.rows, SIZE.columns);
  window.addEventListener("resize", handleResizeChange);
}

function setDifficulty() {
  let difficulty = { easy: [3, 3], medium: [5, 5], hard: [8, 8] };
  let diff = document.getElementById("difficulty").value;
  SIZE.rows = difficulty[diff][0];
  SIZE.columns = difficulty[diff][1];
}
function showMenu() {
  document.getElementById("blocker").style.display = "block";
}
function closeMenu() {
  document.getElementById("blocker").style.display = "none";
}

function restart() {
  PIECES = [];
  CONNECTED = new Map();
  document.getElementById("blocker").style.display = "none";
  document.getElementById("close-menu").style.display = "block";
  document.getElementById("start-button").innerHTML = "Restart";
  document.getElementById("finish-banner").style.display = "none";
  document.getElementById("completeimage").style.display = "block";

  initializePieces(SIZE.rows, SIZE.columns);
  START_TIME = new Date().getTime();
  END_TIME = null;
  randomizePieces();
}
function complete() {
  document.getElementById("start-button").innerHTML = "Start";
  END_TIME = new Date().getTime();
  let time = (END_TIME - START_TIME) / 1000;
  document.getElementById("blocker").style.display = "block";
  document.getElementById("finish-banner").style.display = "block";
  document.getElementById("time-done").innerHTML = time.toString() + " s";
  document.getElementById("completeimage").style.display = "none";
}
function addEventListeners() {
  CANVAS.addEventListener("mousedown", onMouseDown);
  CANVAS.addEventListener("mouseup", onMouseUp);
  CANVAS.addEventListener("mousemove", onMouseMove);
  COLOUR_CANVAS.addEventListener("mousedown", onMouseDown);
  COLOUR_CANVAS.addEventListener("mouseup", onMouseUp);
  COLOUR_CANVAS.addEventListener("mousemove", onMouseMove);
}

function handleResize() {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  COLOUR_CANVAS.width = window.innerWidth;
  COLOUR_CANVAS.height = window.innerHeight;
  let resizer =
    SCALER *
    Math.min(
      window.innerHeight / IMAGE.height,
      window.innerWidth / IMAGE.width
    );
  SIZE.height = resizer * IMAGE.height;
  SIZE.width = resizer * IMAGE.width;

  SIZE.x = CANVAS.width / 2 - SIZE.width / 2;
  SIZE.y = CANVAS.height / 2 - SIZE.height / 2;
}
function handleResizeChange() {
  COLOUR_CANVAS.width = window.innerWidth;
  COLOUR_CANVAS.height = window.innerHeight;
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  let resizer =
    SCALER *
    Math.min(
      window.innerHeight / IMAGE.height,
      window.innerWidth / IMAGE.width
    );

  for (let i = 0; i < PIECES.length; i++) {
    PIECES[i].x =
      ((PIECES[i].x - SIZE.x - PIECES[i].width) * resizer * IMAGE.width) /
        SIZE.width +
      (resizer * IMAGE.width) / SIZE.rows +
      CANVAS.width / 2 -
      (resizer * IMAGE.width) / 2;
    PIECES[i].width = (resizer * IMAGE.width) / SIZE.rows;
    PIECES[i].y =
      ((PIECES[i].y - SIZE.y - PIECES[i].height) * resizer * IMAGE.height) /
        SIZE.height +
      (resizer * IMAGE.height) / SIZE.columns +
      CANVAS.height / 2 -
      (resizer * IMAGE.height) / 2;
    PIECES[i].height = (resizer * IMAGE.height) / SIZE.columns;
    PIECES[i].draw(CONTEXT);
    PIECES[i].draw(COLOUR_CONTEXT, false);
  }
  SIZE.height = resizer * IMAGE.height;
  SIZE.width = resizer * IMAGE.width;
  SIZE.x = CANVAS.width / 2 - SIZE.width / 2;
  SIZE.y = CANVAS.height / 2 - SIZE.height / 2;
}
function generateColour() {
  return (
    "rgb(" +
    Math.floor(Math.random() * 255) +
    "," +
    Math.floor(Math.random() * 255) +
    "," +
    Math.floor(Math.random() * 255) +
    ")"
  );
}
function initializePieces(rows, columns) {
  SIZE.rows = rows;
  SIZE.columns = columns;
  const usedColours = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      let colour = generateColour();
      while (usedColours.includes(colour)) {
        colour = generateColour();
      }
      usedColours.push(colour);

      PIECES.push(new Piece(i, j, colour));
    }
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns - 1; j++) {
      let leftPiece = PIECES[i * columns + j];
      let rightPiece = PIECES[i * columns + j + 1];
      leftPiece.right = [...Array(7)].map((e) => Math.random() * 2 - 1);
      rightPiece.left = leftPiece.right;
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < columns; j++) {
      let topPiece = PIECES[i * columns + j];
      let botPiece = PIECES[(i + 1) * columns + j];
      topPiece.bot = [...Array(7)].map((e) => Math.random() * 2 - 1);
      botPiece.top = topPiece.bot;
    }
  }

  for (let i = 0; i < PIECES.length; i++) {
    PIECES[i].draw(CONTEXT);
    PIECES[i].draw(COLOUR_CONTEXT, false);
  }
}
function randomizePieces() {
  for (let i = 0; i < PIECES.length; i++) {
    PIECES[i].x = SIZE.x + (SIZE.width - PIECES[i].width) * Math.random();
    PIECES[i].y = SIZE.y + (SIZE.height - PIECES[i].height) * Math.random();
  }
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  COLOUR_CONTEXT.clearRect(0, 0, COLOUR_CANVAS.width, COLOUR_CANVAS.height);
  for (let i = 0; i < PIECES.length; i++) {
    PIECES[i].draw(CONTEXT);
    PIECES[i].draw(COLOUR_CONTEXT, false);
  }
}

function onMouseDown(evt) {
  const imgData = COLOUR_CONTEXT.getImageData(evt.x, evt.y, 1, 1).data;

  if (imgData[3] == 0) {
    return;
  }
  const clickedColour =
    "rgb(" + imgData[0] + "," + imgData[1] + "," + imgData[2] + ")";

  SELECTED_PIECE = getPressedPieceByColour(clickedColour);

  // SELECTED_PIECE = getPressedPiece(evt);

  if (SELECTED_PIECE != null) {
    for (let i = 0; i < SELECTED_PIECE.length; i++) {
      SELECTED_PIECE[i].offset = {
        x: evt.x - SELECTED_PIECE[i].x,
        y: evt.y - SELECTED_PIECE[i].y,
      };
    }
  }
}
function onMouseMove(evt) {
  if (SELECTED_PIECE != null) {
    for (let i = 0; i < SELECTED_PIECE.length; i++) {
      SELECTED_PIECE[i].x = evt.x - SELECTED_PIECE[i].offset.x;
      SELECTED_PIECE[i].y = evt.y - SELECTED_PIECE[i].offset.y;
    }

    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    COLOUR_CONTEXT.clearRect(0, 0, COLOUR_CANVAS.width, COLOUR_CANVAS.height);
    for (let i = 0; i < PIECES.length; i++) {
      PIECES[i].draw(CONTEXT);
      PIECES[i].draw(COLOUR_CONTEXT, false);
    }
  }
}
function onMouseUp(evt) {
  if (SELECTED_PIECE != null) {
    for (let i = 0; i < SELECTED_PIECE.length; i++) {
      SELECTED_PIECE[i].isClose();
    }

    SELECTED_PIECE = null;
  }
}
function getPressedPiece(loc) {
  for (let i = 0; i < PIECES.length; i++) {
    if (
      loc.x > PIECES[i].x &&
      loc.x < PIECES[i].x + PIECES[i].width &&
      loc.y > PIECES[i].y &&
      loc.y < PIECES[i].y + PIECES[i].height
    ) {
      let selected = [];

      if (PIECES[i].connection) {
        for (const piece of CONNECTED.get(PIECES[i].connection)) {
          let moveToEnd = PIECES.splice(PIECES.indexOf(piece), 1)[0];

          selected.push(moveToEnd);
          PIECES.push(moveToEnd);
        }
      } else {
        selected.push(PIECES[i]);
        let moveToEnd = PIECES.splice(i, 1)[0];
        PIECES.push(moveToEnd);
      }

      return selected;
    }
  }
  return null;
}
function getPressedPieceByColour(colour) {
  for (let i = 0; i < PIECES.length; i++) {
    if (PIECES[i].colour == colour) {
      let selected = [];

      if (PIECES[i].connection) {
        for (const piece of CONNECTED.get(PIECES[i].connection)) {
          let moveToEnd = PIECES.splice(PIECES.indexOf(piece), 1)[0];

          selected.push(moveToEnd);
          PIECES.push(moveToEnd);
        }
      } else {
        selected.push(PIECES[i]);
        let moveToEnd = PIECES.splice(i, 1)[0];
        PIECES.push(moveToEnd);
      }

      return selected;
    }
  }
  return null;
}

class Piece {
  constructor(rowIndex, colIndex, colour) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;

    this.width = SIZE.width / SIZE.rows;
    this.height = SIZE.height / SIZE.columns;
    this.x = SIZE.x + this.width * this.colIndex;
    this.y = SIZE.y + this.height * this.rowIndex;
    this.connection = null;
    this.top = [null];
    this.bot = [null];
    this.right = [null];
    this.left = [null];
    this.colour = colour;
  }
  draw(context, useImage = true) {
    context.beginPath();

    context.moveTo(this.x, this.y);

    // top
    let randomness = this.top;

    let tabDirection = Math.sign(randomness[0]);
    let unit = this.width;
    if (!useImage) {
      this.x += correction;
    }

    let tabHeight = [
      (this.width / 5) * tabDirection + this.width * 0.07 * randomness[1],
      (this.width / 5) * tabDirection + this.width * 0.07 * randomness[2],
    ];
    let shoulderWidth = [
      (unit * 3) / 8 + unit * 0.05 * randomness[3],
      (unit * 3) / 8 + unit * 0.05 * randomness[4],
    ];
    let shoulderHeight = [
      (this.width / 20) * tabDirection + this.width * 0.03 * randomness[5],
      (this.width / 20) * tabDirection + this.width * 0.03 * randomness[6],
    ];
    if (this.top[0]) {
      context.bezierCurveTo(
        this.x,
        this.y,
        this.x + (shoulderWidth[0] * 7) / 8,
        this.y - shoulderHeight[0] * 3,
        this.x + shoulderWidth[0],
        this.y - shoulderHeight[0]
      ); // left shoulder

      context.bezierCurveTo(
        this.x + shoulderWidth[0],
        this.y - shoulderHeight[0],
        this.x + shoulderWidth[0] * 1.1,
        this.y,
        this.x + shoulderWidth[0],
        this.y + shoulderHeight[0]
      ); // left neck

      context.bezierCurveTo(
        this.x + shoulderWidth[0],
        this.y + shoulderHeight[0],
        this.x + this.width / 5,
        this.y + tabHeight[0],
        this.x + this.width / 2,
        this.y + (tabHeight[0] + tabHeight[1]) / 2
      ); // left head

      context.bezierCurveTo(
        this.x + this.width / 2,
        this.y + (tabHeight[0] + tabHeight[1]) / 2,
        this.x + (this.width * 4) / 5,
        this.y + tabHeight[1],
        this.x + this.width - shoulderWidth[1],
        this.y + shoulderHeight[1]
      ); // right head

      context.bezierCurveTo(
        this.x + this.width - shoulderWidth[1],
        this.y + shoulderHeight[1],
        this.x + this.width - shoulderWidth[1] * 1.1,
        this.y,
        this.x + this.width - shoulderWidth[1],
        this.y - shoulderHeight[1]
      ); // right neck

      context.bezierCurveTo(
        this.x + this.width - shoulderWidth[1],
        this.y - shoulderHeight[1],
        this.x + this.width - shoulderWidth[1],
        this.y - shoulderHeight[1] * 3,
        this.x + this.width,
        this.y
      ); // right shoulder
    } else {
      context.lineTo(this.x + this.width, this.y);
    }

    //   // right
    randomness = this.right;
    unit = this.height;

    tabDirection = Math.sign(randomness[0]);
    let startX = this.x + this.width;

    tabHeight = [
      (this.width / 5) * tabDirection + this.width * 0.07 * randomness[1],
      (this.width / 5) * tabDirection + this.width * 0.07 * randomness[2],
    ];
    shoulderWidth = [
      unit / 3 + unit * 0.05 * randomness[3],
      unit / 3 + unit * 0.05 * randomness[4],
    ];
    shoulderHeight = [
      (unit / 20) * tabDirection + unit * 0.03 * randomness[5],
      (unit / 20) * tabDirection + unit * 0.03 * randomness[6],
    ];
    if (this.right[0]) {
      context.bezierCurveTo(
        startX,
        this.y,
        startX - shoulderHeight[0] * 3,
        this.y + (shoulderWidth[0] * 7) / 8,
        startX - shoulderHeight[0],
        this.y + shoulderWidth[0]
      ); // left shoulder

      context.bezierCurveTo(
        startX - shoulderHeight[0],
        this.y + shoulderWidth[0],
        startX,
        this.y + shoulderWidth[0] * 1.1,
        startX + shoulderHeight[0],
        this.y + shoulderWidth[0]
      ); // left neck

      context.bezierCurveTo(
        startX + shoulderHeight[0],
        this.y + shoulderWidth[0],
        startX + tabHeight[0],
        this.y + this.height / 5,
        startX + (tabHeight[0] + tabHeight[1]) / 2,
        this.y + this.height / 2
      ); // left head

      context.bezierCurveTo(
        startX + (tabHeight[0] + tabHeight[1]) / 2,
        this.y + this.height / 2,
        startX + tabHeight[1],
        this.y + (this.height * 4) / 5,
        startX + shoulderHeight[1],
        this.y + this.height - shoulderWidth[1]
      ); // right head

      context.bezierCurveTo(
        startX + shoulderHeight[1],
        this.y + this.height - shoulderWidth[1],
        startX,
        this.y + this.height - shoulderWidth[1] * 1.1,
        startX - shoulderHeight[1],
        this.y + this.height - shoulderWidth[1]
      ); // right neck

      context.bezierCurveTo(
        startX - shoulderHeight[1],
        this.y + this.height - shoulderWidth[1],
        startX - shoulderHeight[1],
        this.y + this.height - shoulderWidth[1],
        startX,
        this.y + this.height
      ); // right shoulder
    } else {
      context.lineTo(this.x + this.width, this.y + this.height);
    }

    //   //bot
    randomness = this.bot;
    unit = this.width;
    tabDirection = Math.sign(randomness[0]);

    tabHeight = [
      (unit / 5) * tabDirection + unit * 0.07 * randomness[1],
      (unit / 5) * tabDirection + unit * 0.07 * randomness[2],
    ];
    shoulderWidth = [
      (this.width - unit / 4) / 2 + unit * 0.05 * randomness[3],
      (this.width - unit / 4) / 2 + unit * 0.05 * randomness[4],
    ];
    shoulderHeight = [
      (unit / 20) * tabDirection + unit * 0.03 * randomness[5],
      (unit / 20) * tabDirection + unit * 0.03 * randomness[6],
    ];

    if (this.bot[0]) {
      context.bezierCurveTo(
        this.x + this.width,
        this.y + this.height,

        this.x + this.width - shoulderWidth[1],
        this.y + this.height - shoulderHeight[1] * 3,
        this.x + this.width - shoulderWidth[1],
        this.y + this.height - shoulderHeight[1]
      ); // right shoulder
      context.bezierCurveTo(
        this.x + this.width - shoulderWidth[1],
        this.y + this.height - shoulderHeight[1],

        this.x + this.width - shoulderWidth[1] * 1.1,
        this.y + this.height,
        this.x + this.width - shoulderWidth[1],
        this.y + this.height + shoulderHeight[1]
      ); // right neck
      context.bezierCurveTo(
        this.x + this.width - shoulderWidth[1],
        this.y + this.height + shoulderHeight[1],
        this.x + (this.width * 4) / 5,
        this.y + this.height + tabHeight[1],

        this.x + this.width / 2,
        this.y + this.height + (tabHeight[0] + tabHeight[1]) / 2
      ); // right head

      context.bezierCurveTo(
        this.x + this.width / 2,
        this.y + this.height + (tabHeight[0] + tabHeight[1]) / 2,
        this.x + this.width / 5,
        this.y + this.height + tabHeight[0],
        this.x + shoulderWidth[0],
        this.y + this.height + shoulderHeight[0]
      ); // left head

      context.bezierCurveTo(
        this.x + shoulderWidth[0],
        this.y + this.height + shoulderHeight[0],
        this.x + shoulderWidth[0] * 1.1,
        this.y + this.height,
        this.x + shoulderWidth[0],
        this.y + this.height - shoulderHeight[0]
      ); // left neck

      context.bezierCurveTo(
        this.x + shoulderWidth[0],
        this.y + this.height - shoulderHeight[0],
        this.x + (shoulderWidth[0] * 7) / 8,
        this.y + this.height - shoulderHeight[0] * 3,
        this.x,
        this.y + this.height
      ); // left shoulder
    } else {
      context.lineTo(this.x, this.y + this.height);
    }
    if (!useImage) {
      this.x += -correction;
      context.lineTo(this.x, this.y + this.height);
    }

    //   //left
    randomness = this.left;
    unit = this.height;
    tabDirection = Math.sign(randomness[0]);
    startX = this.x;

    tabHeight = [
      (this.width / 5) * tabDirection + this.width * 0.07 * randomness[1],
      (this.width / 5) * tabDirection + this.width * 0.07 * randomness[2],
    ];
    shoulderWidth = [
      unit / 3 + unit * 0.05 * randomness[3],
      unit / 3 + unit * 0.05 * randomness[4],
    ];
    shoulderHeight = [
      (unit / 20) * tabDirection + unit * 0.03 * randomness[5],
      (unit / 20) * tabDirection + unit * 0.03 * randomness[6],
    ];
    if (this.left[0]) {
      context.bezierCurveTo(
        startX,
        this.y + this.height,
        startX - shoulderHeight[1],
        this.y + this.height - shoulderWidth[1],
        startX - shoulderHeight[1],
        this.y + this.height - shoulderWidth[1]
      ); // right shoulder
      context.bezierCurveTo(
        startX - shoulderHeight[1],
        this.y + this.height - shoulderWidth[1],
        startX,
        this.y + this.height - shoulderWidth[1] * 1.1,
        startX + shoulderHeight[1],
        this.y + this.height - shoulderWidth[1]
      ); // right neck

      context.bezierCurveTo(
        startX + shoulderHeight[1],
        this.y + this.height - shoulderWidth[1],
        startX + tabHeight[1],
        this.y + (this.height * 4) / 5,
        startX + (tabHeight[0] + tabHeight[1]) / 2,
        this.y + this.height / 2
      ); // right head

      context.bezierCurveTo(
        startX + (tabHeight[0] + tabHeight[1]) / 2,
        this.y + this.height / 2,
        startX + tabHeight[0],
        this.y + this.height / 5,

        startX + shoulderHeight[0],
        this.y + shoulderWidth[0]
      ); // left head

      context.bezierCurveTo(
        startX + shoulderHeight[0],
        this.y + shoulderWidth[0],
        startX,
        this.y + shoulderWidth[0] * 1.1,
        startX - shoulderHeight[0],
        this.y + shoulderWidth[0]
      ); // left neck

      context.bezierCurveTo(
        startX - shoulderHeight[0],
        this.y + shoulderWidth[0],
        startX - shoulderHeight[0] * 3,
        this.y + (shoulderWidth[0] * 7) / 8,

        startX,
        this.y
      ); // left shoulder
    } else {
      context.lineTo(this.x, this.y);
    }

    context.save();
    context.clip();
    if (useImage) {
      context.drawImage(
        IMAGE,
        (IMAGE.width / SIZE.columns) * this.colIndex -
          IMAGE.width / SIZE.columns / 3,
        (IMAGE.height / SIZE.rows) * this.rowIndex -
          IMAGE.width / SIZE.columns / 3,
        IMAGE.width / SIZE.columns + IMAGE.width / SIZE.columns,
        IMAGE.height / SIZE.rows + IMAGE.width / SIZE.columns,
        this.x - this.width / 3,
        this.y - this.width / 3,
        this.width + this.width,
        this.height + this.width
      );
    } else {
      context.fillStyle = this.colour;

      context.fillRect(
        this.x - this.width / 3,
        this.y - this.width / 3,
        this.width + this.width,
        this.height + this.width
      );
    }

    context.restore();
    context.stroke();
  }

  snap(x, y, piece) {
    SNAP_SOUND.play();

    if (this.connection && piece.connection) {
      for (const element of CONNECTED.get(this.connection)) {
        element.x += x;
        element.y += y;
      }

      CONNECTED.get(piece.connection).push(...CONNECTED.get(this.connection));
      let holder = CONNECTED.get(this.connection);
      for (const element of CONNECTED) {
        if (element[1] == holder) {
          CONNECTED.set(element[0], CONNECTED.get(piece.connection));
        }
      }
    } else if (this.connection) {
      for (const element of CONNECTED.get(this.connection)) {
        element.x += x;
        element.y += y;
      }
      piece.connection = this.connection;
      CONNECTED.get(this.connection).push(piece);
    } else if (piece.connection) {
      this.x = this.x + x;
      this.y = this.y + y;
      this.connection = piece.connection;

      CONNECTED.get(piece.connection).push(this);
    } else {
      this.x = this.x + x;
      this.y = this.y + y;
      this.connection = CONNECTED.size + 1;
      piece.connection = CONNECTED.size + 1;
      CONNECTED.set(CONNECTED.size + 1, [this, piece]);
    }
    if (piece.connection) {
      for (const p of CONNECTED.get(piece.connection)) {
        let moveToEnd = PIECES.splice(PIECES.indexOf(p), 1)[0];

        PIECES.push(moveToEnd);
      }
    } else {
      let moveToEnd = PIECES.splice(PIECES.indexOf(piece), 1)[0];
      PIECES.push(moveToEnd);
    }

    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    COLOUR_CONTEXT.clearRect(0, 0, COLOUR_CANVAS.width, COLOUR_CANVAS.height);
    for (let i = 0; i < PIECES.length; i++) {
      PIECES[i].draw(CONTEXT);
      PIECES[i].draw(COLOUR_CONTEXT, false);
    }
    if (CONNECTED.get(1).length == SIZE.columns * SIZE.rows) {
      complete();
    }
  }
  isClose() {
    let accRange = this.width * 0.5;

    let leftConnection = PIECES.find(
      (element) =>
        element.rowIndex == this.rowIndex &&
        element.colIndex == this.colIndex - 1
    );

    let rightConnection = PIECES.find(
      (element) =>
        element.rowIndex == this.rowIndex &&
        element.colIndex == this.colIndex + 1
    );
    let topConnection = PIECES.find(
      (element) =>
        element.rowIndex == this.rowIndex - 1 &&
        element.colIndex == this.colIndex
    );
    let botConnection = PIECES.find(
      (element) =>
        element.rowIndex == this.rowIndex + 1 &&
        element.colIndex == this.colIndex
    );

    if (
      leftConnection &&
      !(
        leftConnection.connection > 0 &&
        CONNECTED.get(leftConnection.connection) ==
          CONNECTED.get(this.connection)
      )
    ) {
      if (
        this.dist(
          this.x,
          this.y,
          leftConnection.x + this.width,
          leftConnection.y
        ) < accRange
      ) {
        let xMove = leftConnection.x + this.width - this.x;
        let yMove = leftConnection.y - this.y;
        this.snap(xMove, yMove, leftConnection);
      }
    }
    if (
      rightConnection &&
      !(
        rightConnection.connection > 0 &&
        CONNECTED.get(rightConnection.connection) ==
          CONNECTED.get(this.connection)
      )
    ) {
      if (
        this.dist(
          this.x,
          this.y,
          rightConnection.x - this.width,
          rightConnection.y
        ) < accRange
      ) {
        let xMove = rightConnection.x - this.width - this.x;
        let yMove = rightConnection.y - this.y;
        this.snap(xMove, yMove, rightConnection);
      }
    }
    if (
      topConnection &&
      !(
        topConnection.connection > 0 &&
        CONNECTED.get(topConnection.connection) ==
          CONNECTED.get(this.connection)
      )
    ) {
      if (
        this.dist(
          this.x,
          this.y,
          topConnection.x,
          topConnection.y + this.height
        ) < accRange
      ) {
        let xMove = topConnection.x - this.x;
        let yMove = topConnection.y + this.height - this.y;
        this.snap(xMove, yMove, topConnection);
      }
    }
    if (
      botConnection &&
      !(
        botConnection.connection > 0 &&
        CONNECTED.get(botConnection.connection) ==
          CONNECTED.get(this.connection)
      )
    ) {
      if (
        this.dist(
          this.x,
          this.y,
          botConnection.x,
          botConnection.y - this.height
        ) < accRange
      ) {
        let xMove = botConnection.x - this.x;
        let yMove = botConnection.y - this.height - this.y;
        this.snap(xMove, yMove, botConnection);
      }
    }
  }
  dist(x1, y1, x2, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
  }
}
