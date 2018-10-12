// Constants
const GRID_CELL_SIZE = 15;
const GRID_SIZE = 40;
const MARGIN = 2;
const DOUBLE_MARGIN = MARGIN * 2;

/*
 * Speed enumeration
 */
enum Speed {
    SLOW = 200,
    MEDIUM = 150,
    FAST = 100,
}

/*
 * Direction enumeration
 */
enum Direction {
    UP,
    LEFT,
    DOWN,
    RIGHT
}

/*
 * Position class
 */
class Position {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Accessors
    getX(): number {
        return this.x;
    }
    getY(): number {
        return this.y;
    }

    public equals(other: Position): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public copy(): Position {
        return new Position(this.x, this.y);
    }

    public copyAndMove(move: Direction): Position {
        switch (move) {
            case Direction.UP:
                if (this.y == 0) return new Position(this.x, GRID_SIZE - 1);
                else return new Position(this.x, this.y - 1);
                break;
            case Direction.DOWN:
                if (this.y == GRID_SIZE - 1) return new Position(this.x, 0);
                else return new Position(this.x, this.y + 1);
                break;
            case Direction.LEFT:
                if (this.x == 0) return new Position(GRID_SIZE - 1, this.y);
                else return new Position(this.x - 1, this.y);
                break;
            case Direction.RIGHT:
                if (this.x == GRID_SIZE - 1) return new Position(0, this.y);
                else return new Position(this.x + 1, this.y);
                break;
        }
    }

    public draw(canvas: any, color: String) {
        canvas.fillStyle = color;
        canvas.fillRect(
            this.getPixelPosX() + MARGIN,
            this.getPixelPosY() + MARGIN,
            GRID_CELL_SIZE - DOUBLE_MARGIN,
            GRID_CELL_SIZE - DOUBLE_MARGIN
        );
    }

    private getPixelPosX() {
        return this.x * GRID_CELL_SIZE;
    }
    private getPixelPosY() {
        return this.y * GRID_CELL_SIZE;
    }
}

/*
 * Snake class
 */
class Snake {
    private queue: Position[];
    private currentDirection: Direction;
    private color: String;

    constructor() {
        // Define inital snake color
        this.color = getRandomColor();

        // Define initial snake position
        this.queue = new Array();
        this.queue.push(new Position(0, 0));

        // Define initial move direction
        this.currentDirection = Direction.DOWN;
    }

    // Accessors
    public getHeadPos(): Position {
        return this.queue[this.queue.length - 1];
    }
    public getCurrentDir(): Direction {
        return this.currentDirection;
    }

    // Change snake direction
    public changeDirection(newDirection: Direction) {
        if (!oppositeDirections(this.currentDirection, newDirection)) {
            this.currentDirection = newDirection;
        }
    }

    // Move snake
    public move(): boolean {
        let newHeadPos = this.getHeadPos().copyAndMove(this.currentDirection);
        for (let cell of this.queue) {
            if (newHeadPos.equals(cell)) {
                return false;
            }
        }
        this.queue.push(newHeadPos);
        this.queue.shift();
        return true;
    }

    // Compute extremity Direction
    private extremityDirection(): Direction {
        if (this.queue.length > 1) {
            let extremityPos = this.queue[0];
            let previousExtremityPos = this.queue[1];
            if (previousExtremityPos.getX() > extremityPos.getX()) return Direction.RIGHT;
            if (previousExtremityPos.getX() < extremityPos.getX()) return Direction.LEFT;
            if (previousExtremityPos.getY() > extremityPos.getY()) return Direction.DOWN;
            if (previousExtremityPos.getY() < extremityPos.getY()) return Direction.UP;
        }
        return this.currentDirection;
    }

    // Elongate snake
    public elongate() {
        // Change snake color
        this.color = getRandomColor();
        // Elongate snake
        let extremityPos = this.queue[0];
        switch (this.extremityDirection()) {
            case Direction.UP:
                this.queue.unshift(new Position(extremityPos.getX(), extremityPos.getY() + 1));
                break;
            case Direction.DOWN:
                this.queue.unshift(new Position(extremityPos.getX(), extremityPos.getY() - 1));
                break;
            case Direction.LEFT:
                this.queue.unshift(new Position(extremityPos.getX() + 1, extremityPos.getY()));
                break;
            case Direction.RIGHT:
                this.queue.unshift(new Position(extremityPos.getX() - 1, extremityPos.getY()));
                break;
        }
    }

    // Draw snake in canvas
    public draw(canvas: any) {
        for (let cell of this.queue) {
            cell.draw(canvas, this.color);
        }
    }
}

/*
 * Game Class
 */
class Game {
    private canvas: any;
    private speed: Speed;
    public snake: Snake;
    private foodPos: Position;
    private score: number;
    private lose: boolean;

    constructor(canvas: any, speed: Speed) {
        this.canvas = canvas;
        this.speed = speed;
        this.snake = new Snake();
        this.foodPos = new Position(0, 0);
        this.score = 0;
        this.lose = false;
        this.moveFood();
    }

    // Accessors
    public getSpeed(): Speed {
        return this.speed;
    }
    public finish(): boolean {
        return this.lose;
    }

    private moveFood() {
        this.foodPos = new Position(
            Math.floor(Math.random() * GRID_SIZE),
            Math.floor(Math.random() * GRID_SIZE)
        );
    }

    moveSnake() {
        /*let snakeHeadPos = this.snake.getHeadPos();
        switch (this.snake.getCurrentDir()) {
            case Direction.UP: if (snakeHeadPos.getY() <= 0) {
                this.lose = true;
            }
                break;
            case Direction.DOWN: if (snakeHeadPos.getY() >= GRID_SIZE - 1) {
                this.lose = true;
            }
                break;
            case Direction.LEFT: if (snakeHeadPos.getX() <= 0) {
                this.lose = true;
            }
                break;
            case Direction.RIGHT: if (snakeHeadPos.getX() >= GRID_SIZE - 1) {
                this.lose = true;
            }
                break;
            default: break;
        }*/
        if (!this.lose) {
            if (!this.snake.move()) {
                this.lose = true;
                console.log("enableButtons()");
                enableButtons();
            }
            if (!this.lose) {
                if (this.foodPos.equals(this.snake.getHeadPos())) {
                    this.score++;
                    this.snake.elongate();
                    console.log("Score=" + this.score);
                    $("#score").text(this.score.toString());
                    this.moveFood();
                }
            }
        }
    }

    public draw() {
        this.canvas.clearRect(0, 0, innerWidth, innerHeight);
        this.foodPos.draw(this.canvas, "white");
        this.snake.draw(this.canvas);
        if (this.lose) {
            $("#label").html("perdu");
        }
    }
}

/*
 * TOOLS FUNCTIONS
 */
function getRandomColor(): String {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
}
function oppositeDirections(d1: Direction, d2: Direction) {
    return Math.abs(d1-d2)==2;
}

/*
 * $("*").keydown((event: any) => { pressKey(event, snake) })
 * keyCode : 37, 38, 39, 40 (L, U, R, D)
 */

/*
 * EVENTS FUNCTIONS
 */
function keydownEvent(event: any, game: Game) {
    switch (event.keyCode) {
        case 37: game.snake.changeDirection(Direction.LEFT); break;
        case 38: game.snake.changeDirection(Direction.UP); break;
        case 39: game.snake.changeDirection(Direction.RIGHT); break;
        case 40: game.snake.changeDirection(Direction.DOWN); break;
        default: break;
    }
}

/*
 * MAIN FRAME FUNCTION
 */
function onFrame(game: Game) {
    game.moveSnake();
    game.draw();
    if (!game.finish()) {
        setTimeout(() => {
            onFrame(game);
        }, game.getSpeed());
    }
}

/*
 * START FUNCTION
 */
function start(canvas: any, speed: Speed) {
    // Create Game
    let game = new Game(canvas, speed);

    // Create keydown listener
    $("*").keydown((event: any) => { keydownEvent(event, game) });

    // Start animation
    onFrame(game);
}

/*
 * DOM FUNCTIONS (Disable/Enable html elements)
 */

function disableButtons() {
    $("#start_slow").attr("disabled", "true");
    $("#start_medium").attr("disabled", "true");
    $("#start_fast").attr("disabled", "true");
}

function enableButtons() {
    $("#start_slow").attr("disabled", "false");
    $("#start_medium").attr("disabled", "false");
    $("#start_fast").attr("disabled", "false");
}

/*
 * Code call when HTML Document is ready
 */
$("document").ready(() => {
    console.log("Document ready !");

    // Init canvas
    let canvasHTML: any = document.getElementById("myCanvas");
    if (canvasHTML != null) {
        let canvas = canvasHTML.getContext("2d");

        // Create buttons listeners
        $("#start_slow").click(() => {
            disableButtons();
            start(canvas, Speed.SLOW);
        });
        $("#start_medium").click(() => {
            disableButtons();
            start(canvas, Speed.MEDIUM)
        });
        $("#start_fast").click(() => {
            disableButtons();
            start(canvas, Speed.FAST)
        });
    }
});
