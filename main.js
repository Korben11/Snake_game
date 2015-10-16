/*
    TODO: SECOND SNAKE
    TODO: PATH FINDING
*/

//Constants
var COLS = 26,
    ROWS = 26,
    SPEED = 5,
    BONUS_FRUIT_FREQUENCY = 150; // speed: smaller value = bigger speed
//IDs
var EMPTY = 0,
    SNAKE = 1,
    FRUIT = 2,
    BONUS_FRUIT = 3,
    YELLOW_SNAKE = 4;
// Directions
var LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3;
// KeyCodes
var KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40;
var Y_LEFT = 65,
    Y_UP = 87,
    Y_RIGHT = 68,
    Y_DOWN = 83;

// var grid = new PF.Grid(COLS, ROWS);

var grid = {
    width: null,
    height: null,
    _grid: null,

    init: function (gridValue, width, height) {
        "use strict";
        this.width = width;
        this.height = height;

        this._grid = [];
        for (var x = 0; x < width; x++) {
            this._grid.push([]);
            for (var y = 0; y < height; y++)
                this._grid[x].push(gridValue);
        }
    },

    set: function (val, x, y) {
        this._grid[x][y] = val;
    },

    get: function (x, y) {
        return this._grid[x][y];
    }
}

function Snake(direction) {
    this.direction = direction,
        this.last = null,
        this._queue = [],

        this.init = function (x, y) {
            for (var i = 0; i < 3; i++)
                this._queue.unshift({
                    x: x,
                    y: y
                });
            this.last = this._queue[0];
        }

    this.insert = function (x, y) {
            this._queue.unshift({
                x: x,
                y: y
            });
            this.last = this._queue[0];
        },

        this.remove = function () {
            return this._queue.pop();
        }
}

function setFood(fruit) {
    var empty = [];
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) {
                empty.push({
                    x: x,
                    y: y
                });
            }
        }
    }
    var randPos = empty[Math.floor(Math.random() * empty.length)];
    grid.set(fruit, randPos.x, randPos.y);
    return randPos;
}

// Game objects
var canvas, ctx, keyState, frames, score, bonusFruit, snake, AISnake; // ctx = context

function main() {
    canvas = document.createElement("canvas");
    canvas.width = COLS * 20;
    canvas.height = ROWS * 20;
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    ctx.font = "12px Arial";

    frames = 0;
    keyState = {};
    document.addEventListener("keydown", function (evt) {
        keyState[evt.keyCode] = true;
        console.log(keyState);
    });
    document.addEventListener("keyup", function (evt) {
        delete keyState[evt.keyCode];
    });

    init();
    loop();
}

function initCanvas() {
    "use strict";
    main();
}

function init() {
    score = 0;

    grid.init(EMPTY, COLS, ROWS);

    bonusFruit = setFood(EMPTY);

    var snakeStartPoint = {
        x: Math.floor(COLS / 4),
        y: ROWS - 1
    };
    snake = new Snake(UP);
    snake.init(snakeStartPoint.x, snakeStartPoint.y);
    grid.set(SNAKE, snakeStartPoint.x, snakeStartPoint.y);

    setFood(FRUIT);
}

function loop() {
    update();
    draw();

    window.requestAnimationFrame(loop, canvas);
}

function update() {
    frames++;

    if (keyState[KEY_LEFT] && snake.direction !== RIGHT) snake.direction = LEFT;
    if (keyState[KEY_UP] && snake.direction !== DOWN) snake.direction = UP;
    if (keyState[KEY_RIGHT] && snake.direction !== LEFT) snake.direction = RIGHT;
    if (keyState[KEY_DOWN] && snake.direction !== UP) snake.direction = DOWN;




    if (frames % SPEED === 0) {
        var nx = snake.last.x;
        var ny = snake.last.y;

        switch (snake.direction) {
        case LEFT:
            nx--;
            break;
        case UP:
            ny--;
            break;
        case RIGHT:
            nx++;
            break;
        case DOWN:
            ny++;
            break;
        }

        // went out of map teleport on other side
        if (0 > ny) // went out from top
            ny = grid.height - 1; // teleport to the bottom
        else if (ny > grid.height - 1) // wetn out from bottom
            ny = 0; // teleport to the top
        else if (0 > nx)
            nx = grid.width - 1;
        else if (nx > grid.width - 1)
            nx = 0;

        // collision with snake
        if (grid.get(nx, ny) === SNAKE) {
            return init();
        }

        if (grid.get(nx, ny) === BONUS_FRUIT) {
            var tail = {
                x: nx,
                y: ny
            };
            score += 3;
        } else if (grid.get(nx, ny) === FRUIT) {
            var tail = {
                x: nx,
                y: ny
            };
            score++;
            setFood(FRUIT);
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
            tail.x = nx;
            tail.y = ny;
        }

        grid.set(SNAKE, tail.x, tail.y);

        snake.insert(tail.x, tail.y);
    }

    if (frames % BONUS_FRUIT_FREQUENCY === 0) {
        if (grid.get(bonusFruit.x, bonusFruit.y) === BONUS_FRUIT)
            grid.set(EMPTY, bonusFruit.x, bonusFruit.y);
        else
            bonusFruit = setFood(BONUS_FRUIT);
    }
}

function draw() {
    var tw = canvas.width / grid.width;
    var th = canvas.height / grid.height;

    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            switch (grid.get(x, y)) {
            case EMPTY:
                ctx.fillStyle = "#000";
                break;
            case SNAKE:
                ctx.fillStyle = "#0ff";
                break;
            case FRUIT:
                ctx.fillStyle = "#f00";
                break;
            case BONUS_FRUIT:
                ctx.fillStyle = "#0f0";
                break;
            }
            ctx.fillRect(x * tw, y * th, tw, th);
        }
    }

    ctx.fillStyle = "#0ff";
    ctx.fillText("Score: " + score, 10, canvas.height - 10);
}