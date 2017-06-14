/**
 * Created by Filip on 1.6.2017.
 */
let canvas = document.getElementById("brickCanvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let dx = 2;
let dy = -2;

let rightPressed = false;
let leftPressed = false;
const brickRowCount = 10;
const brickColumnCount = 10;
let ballRadius = canvas.width / 100, brickOffsetTop = canvas.height * 0.07, brickOffsetLeft = canvas.width * 0.03,
    brickWidth = (canvas.width - 2 * brickOffsetLeft) / (brickRowCount + 1),
    brickHeight = (canvas.height - 4 * brickOffsetTop) / (brickColumnCount + 1),
    brickPadding = brickWidth / brickRowCount;
let ballCount = 10;
let magic = Math.ceil(ballRadius);
let score = 0, highscore = 0;

let mouseX = 0;
let mouseY = 0;
let aimX = canvas.width / 2, aimY = canvas.height - brickOffsetTop;
let play = false;


const endGame = new Audio("gameover.wav")
const bounce = new Audio("bounce3.wav");
const beeps = [];
for (let bee = 0; bee < ballCount; bee++) {
    beeps[bee] = bounce.cloneNode();
}
const bounce2 = new Audio("bounce2.wav");
const beeps2 = [];
for (let bee = 0; bee < ballCount; bee++) {
    beeps2[bee] = bounce2.cloneNode();
}
class Brick {
    constructor(x, y, hits) {
        this.x = x;
        this.y = y;
        this.hits = hits;
    }
}
let bricks = [];
function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = new Brick(0, 0, 0);//{ x: 0, y: 0, status: 1 };
        }
    }
    for (let r = 0; r < brickRowCount; r++) {
        bricks[0][r].hits = (Math.random() * 10) >= 1 ? ballCount : 0;
    }
}
initBricks();


function shiftAddBricks() {

    for (let r = 0; r < brickRowCount; r++) {
        if (bricks[ballCount - 1][r].hits > 0) return true;//if there is a brick with hits on the last row, end the game
    }
    for (let c = brickColumnCount - 1; c > 0; c--) {
        for (let r = 0; r < brickRowCount; r++) {
            let brick = bricks[c][r];
            let brickShift = bricks[c - 1][r];
            brick.x = brickShift.x;
            brick.y = brickShift.y;
            brick.hits = brickShift.hits;
        }
    }
    for (let r = 0; r < brickRowCount; r++) {
        bricks[0][r].hits = (Math.random() * 10) >= 1 ? ballCount : 0;
    }
}
class Ball {
    constructor(x, y, dx, dy, inGame, putInto) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.inGame = inGame;
        this.putInto = putInto;
    }
}
let balls = [];
for (let b = 0; b < ballCount; b++) {
    balls[b] = new Ball(aimX, aimY, 2, -2, true);
}
window.addEventListener('resize', resizeCanvas, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("mousemove", mouseMoveHandler, false);
canvas.addEventListener("click", mouseClickHandler, false);
function resizeCanvas() {
    aimX = (aimX / canvas.width) * window.innerWidth;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;
    ballRadius = canvas.width / 100, brickOffsetTop = canvas.height * 0.07, brickOffsetLeft = canvas.width * 0.03,
        brickWidth = (canvas.width - 2 * brickOffsetLeft) / (brickRowCount + 1), brickHeight = (canvas.height - 4 * brickOffsetTop) / (brickColumnCount + 1),
        brickPadding = brickWidth / brickRowCount;
    aimY = canvas.height - brickOffsetTop;
    magic = Math.ceil(ballRadius);
}
function CASStorage() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("highscore") !== null) {
            highscore = localStorage.getItem("highscore");
            if (score > highscore) {
                highscore = score;
                localStorage.setItem("highscore", highscore);
            }
        } else {
            localStorage.setItem("highscore", highscore);
        }

    }
}
function keyDownHandler(e) {
    if (e.keyCode === 39) {
        rightPressed = true;
    }
    else if (e.keyCode === 37) {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if (e.keyCode === 39) {
        rightPressed = false;
    }
    else if (e.keyCode === 37) {
        leftPressed = false;
    }
}
function mouseMoveHandler(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}
function mouseClickHandler(e) {
    if (!play) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        dx = (mouseX - aimX);
        dy = (mouseY - aimY);
        let v = Math.sqrt((dx * dx) + (dy * dy)) / 3;
        dx /= v;
        dy /= v;
        play = true;
        releaseCounter = 0;
        for (let b = 0; b < ballCount; b++) {
            balls[b].inGame = true;
            balls[b].putInto = true;
            balls[b].dx = dx;
            balls[b].dy = dy;
            balls[b].x = aimX;// - ballRadius*b*dx;
            balls[b].y = aimY;// - ballRadius*b*dy;
        }
    }
}
function collisionDetection() {//

    for (let col = 0; col < brickColumnCount; col++) {
        for (let row = 0; row < brickRowCount; row++) {
            let brick = bricks[col][row];
            if (brick.hits > 0) {
                for (let ba = 0; ba < ballCount; ba++) {
                    let ball = balls[ba];
                    if (!ball.inGame) continue;

                    //new mechanics to detect both x y bounce
                    ///bouncing in x axis
                    if ((ball.x + ball.dx + ballRadius >= brick.x) && (ball.x + ballRadius <= brick.x) ||
                        (ball.x + ball.dx - ballRadius <= brick.x + brickWidth) && (ball.x - ballRadius >= brick.x + brickWidth)
                    ) {
                        if ((ball.y + ball.dy - ballRadius <= brick.y + brickHeight) && (ball.y + ball.dy + ballRadius >= brick.y)) {
                            ball.dx = -ball.dx;
                            brick.hits--;
                            score++;
                            beeps[ba].play();// bounce.play();
                            CASStorage();
                            continue;
                        }
                    }
                    if ((ball.y + ball.dy + ballRadius >= brick.y) && (ball.y + ballRadius <= brick.y) ||
                        (ball.y + ball.dy - ballRadius <= brick.y + brickHeight) && (ball.y - ballRadius >= brick.y + brickHeight)
                    ) {
                        if ((ball.x + ball.dx - ballRadius <= brick.x + brickWidth) && (ball.x + ball.dx + ballRadius >= brick.x)) {
                            ball.dy = -ball.dy;
                            brick.hits--;
                            beeps[ba].play();//bounce.play();
                            score++;
                            CASStorage();
                        }
                    }
                }
            }
        }
    }

}


function drawBall(xx, yy) {
    if (xx < 0 || xx > canvas.width || yy < 0 || yy > canvas.height) return;
    ctx.beginPath();
    ctx.arc(xx, yy, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}
function drawBottom() {
    ctx.beginPath();
    ctx.rect(0, canvas.height - brickOffsetTop, canvas.width, brickOffsetTop);
    ctx.fillStyle = "#dd8b00";
    ctx.fill();
    ctx.closePath();
}
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].hits > 0) {
                const brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                const brickTextX = brickX + brickWidth / 2;
                const brickTextY = brickY + brickHeight / 2 + 5;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#dd8b00";
                ctx.fill();
                ctx.closePath();
                ctx.font = "14px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "center";
                ctx.fillText(bricks[c][r].hits, brickTextX, brickTextY);
            }
        }
    }
}
function drawScore() {
    /*ctx.font = "16px Arial";
     ctx.fillStyle = "#dd8b00";
     ctx.textAlign="left";
     ctx.fillText("Score: " + score + " HighScore: "+highscore, 8, 20);*/
    document.querySelector("#info").innerText = "Score: " + score + " HighScore: " + highscore;
}

function drawMouseAim() {
    ctx.beginPath();
    ctx.setLineDash([1, 15]);
    ctx.moveTo(aimX, aimY);
    ctx.lineTo(mouseX, mouseY);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.closePath();
}
let releaseCounter = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawScore();
    drawMouseAim();
    drawBottom();
    if (play) {


        collisionDetection();
        let balling = false;
        for (let b = 0; b < ballCount; b++) {
            let ball = balls[b];
            if (!ball.inGame && !ball.putInto) continue;
            drawBall(ball.x, ball.y);

            if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
                ball.dx = -ball.dx;
                beeps2[b].play();
            }
            if (ball.y + ball.dy < ballRadius) {
                ball.dy = -ball.dy;
                beeps2[b].play();
            }
            else if (ball.y + ball.dy > canvas.height - ballRadius) { // ball gets out of bottom border
//if first ball, --live, set x etc, else nothing?

                if (!ball.putInto) {
                    ball.inGame = false;
                }

            } else {
                balling = true; //if there is a ball still pinging
                if (!ball.putInto) {
                    ball.x += ball.dx;
                    ball.y += ball.dy;
                } else {

                    if (releaseCounter % magic === 0) {
                        //console.log(releaseCounter/10);
                        if (b === releaseCounter / magic) {
                            console.log(ballRadius);
                            //console.log("putting ball "+b);
                            ball.putInto = false;
                            ball.inGame = true;
                        }
                    }
                }
            }

        }
        if (!balling) {
            if (shiftAddBricks()) {
                // alert("GAME OVER");
                document.querySelector("#info").innerText = "GAME OVER!! Score: " + score + " HighScore: " + highscore;
                endGame.play();


                setTimeout(function () {
                    document.location.reload();
                }, 500);
            }
            play = false;
            aimX = balls[0].x;

        } else releaseCounter++;

    }

    requestAnimationFrame(draw);

}
CASStorage();
draw();

let menuVisible = false;
const menuButton = document.querySelector('.menu-button');

menuButton.addEventListener('click', toggleMenuState);

function toggleMenuState() {
    menuVisible = !menuVisible;
    if (menuVisible) {
        document.body.classList.add('menu-visible');
    } else {
        document.body.classList.remove('menu-visible');
    }
}