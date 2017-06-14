"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Filip on 1.6.2017.
 */
var canvas = document.getElementById("brickCanvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

var dx = 2;
var dy = -2;

var rightPressed = false;
var leftPressed = false;
var brickRowCount = 10;
var brickColumnCount = 10;
var ballRadius = canvas.width / 100,
    brickOffsetTop = canvas.height * 0.07,
    brickOffsetLeft = canvas.width * 0.03,
    brickWidth = (canvas.width - 2 * brickOffsetLeft) / (brickRowCount + 1),
    brickHeight = (canvas.height - 4 * brickOffsetTop) / (brickColumnCount + 1),
    brickPadding = brickWidth / brickRowCount;
var ballCount = 10;
var score = 0,
    highscore = 0;

var mouseX = 0;
var mouseY = 0;
var aimX = canvas.width / 2,
    aimY = canvas.height - brickOffsetTop;
var play = false;

var bounce = new Audio("bounce3.wav");
var beeps = [];
for (var bee = 0; bee < ballCount; bee++) {
    beeps[bee] = bounce.cloneNode();
}
var bounce2 = new Audio("bounce2.wav");
var beeps2 = [];
for (var _bee = 0; _bee < ballCount; _bee++) {
    beeps2[_bee] = bounce2.cloneNode();
}

var Brick = function Brick(x, y, hits) {
    _classCallCheck(this, Brick);

    this.x = x;
    this.y = y;
    this.hits = hits;
};

var bricks = [];
function initBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = new Brick(0, 0, 0); //{ x: 0, y: 0, status: 1 };
        }
    }
    for (var _r = 0; _r < brickRowCount; _r++) {
        bricks[0][_r].hits = Math.random() * 10 >= 1 ? ballCount : 0;
    }
}
initBricks();

function shiftAddBricks() {

    for (var r = 0; r < brickRowCount; r++) {
        if (bricks[ballCount - 1][r].hits > 0) return true; //if there is a brick with hits on the last row, end the game
    }
    for (var c = brickColumnCount - 1; c > 0; c--) {
        for (var _r2 = 0; _r2 < brickRowCount; _r2++) {
            var brick = bricks[c][_r2];
            var brickShift = bricks[c - 1][_r2];
            brick.x = brickShift.x;
            brick.y = brickShift.y;
            brick.hits = brickShift.hits;
        }
    }
    for (var _r3 = 0; _r3 < brickRowCount; _r3++) {
        bricks[0][_r3].hits = Math.random() * 10 >= 1 ? ballCount : 0;
    }
}

var Ball = function Ball(x, y, dx, dy, inGame, putInto) {
    _classCallCheck(this, Ball);

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.inGame = inGame;
    this.putInto = putInto;
};

var balls = [];
for (var b = 0; b < ballCount; b++) {
    balls[b] = new Ball(aimX, aimY, 2, -2, true);
}
window.addEventListener('resize', resizeCanvas, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("mousemove", mouseMoveHandler, false);
canvas.addEventListener("click", mouseClickHandler, false);
function resizeCanvas() {
    aimX = aimX / canvas.width * window.innerWidth;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;
    ballRadius = canvas.width / 100, brickOffsetTop = canvas.height * 0.07, brickOffsetLeft = canvas.width * 0.03, brickWidth = (canvas.width - 2 * brickOffsetLeft) / (brickRowCount + 1), brickHeight = (canvas.height - 4 * brickOffsetTop) / (brickColumnCount + 1), brickPadding = brickWidth / brickRowCount;
    aimY = canvas.height - brickOffsetTop;
}
function CASStorage() {
    if (typeof Storage !== "undefined") {
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
    } else if (e.keyCode === 37) {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if (e.keyCode === 39) {
        rightPressed = false;
    } else if (e.keyCode === 37) {
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

        dx = mouseX - aimX;
        dy = mouseY - aimY;
        var v = Math.sqrt(dx * dx + dy * dy) / 3;
        dx /= v;
        dy /= v;
        play = true;
        releaseCounter = 0;
        for (var _b = 0; _b < ballCount; _b++) {
            balls[_b].inGame = true;
            balls[_b].putInto = true;
            balls[_b].dx = dx;
            balls[_b].dy = dy;
            balls[_b].x = aimX; // - ballRadius*b*dx;
            balls[_b].y = aimY; // - ballRadius*b*dy;
        }
    }
}
function collisionDetection() {
    //

    for (var col = 0; col < brickColumnCount; col++) {
        for (var row = 0; row < brickRowCount; row++) {
            var brick = bricks[col][row];
            if (brick.hits > 0) {
                for (var ba = 0; ba < ballCount; ba++) {
                    var ball = balls[ba];
                    if (!ball.inGame) continue;

                    //new mechanics to detect both x y bounce
                    ///bouncing in x axis
                    if (ball.x + ball.dx + ballRadius >= brick.x && ball.x + ballRadius <= brick.x || ball.x + ball.dx - ballRadius <= brick.x + brickWidth && ball.x - ballRadius >= brick.x + brickWidth) {
                        if (ball.y + ball.dy - ballRadius <= brick.y + brickHeight && ball.y + ball.dy + ballRadius >= brick.y) {
                            ball.dx = -ball.dx;
                            brick.hits--;
                            score++;
                            beeps[ba].play(); // bounce.play();
                            CASStorage();
                            continue;
                        }
                    }
                    if (ball.y + ball.dy + ballRadius >= brick.y && ball.y + ballRadius <= brick.y || ball.y + ball.dy - ballRadius <= brick.y + brickHeight && ball.y - ballRadius >= brick.y + brickHeight) {
                        if (ball.x + ball.dx - ballRadius <= brick.x + brickWidth && ball.x + ball.dx + ballRadius >= brick.x) {
                            ball.dy = -ball.dy;
                            brick.hits--;
                            beeps[ba].play(); //bounce.play();
                            score++;
                            CASStorage();
                        }
                    }

                    /*  if (ball.x > brick.x && ball.x < brick.x + brickWidth && ball.y > brick.y && ball.y < brick.y + brickHeight) {
                          ball.dy = -ball.dy;
                          brick.hits--;
                          score++;
                          if (score === brickRowCount * brickColumnCount *10) {
                              alert("YOU WIN, CONGRATS!");
                              document.location.reload();
                          }
                      }
                      */
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
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].hits > 0) {
                var brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
                var brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
                var brickTextX = brickX + brickWidth / 2;
                var brickTextY = brickY + brickHeight / 2 + 5;
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
var releaseCounter = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawScore();
    drawMouseAim();
    drawBottom();
    if (play) {

        collisionDetection();
        var balling = false;
        for (var _b2 = 0; _b2 < ballCount; _b2++) {
            var ball = balls[_b2];
            if (!ball.inGame && !ball.putInto) continue;
            drawBall(ball.x, ball.y);

            if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
                ball.dx = -ball.dx;
                beeps2[_b2].play();
            }
            if (ball.y + ball.dy < ballRadius) {
                ball.dy = -ball.dy;
                beeps2[_b2].play();
            } else if (ball.y + ball.dy > canvas.height - ballRadius) {
                // ball gets out of bottom border
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

                    if (releaseCounter % 10 === 0) {
                        console.log(releaseCounter / 10);
                        if (_b2 === releaseCounter / 10) {
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
                alert("GAME OVER");
                document.location.reload();
            }
            play = false;
            aimX = balls[0].x;
        } else releaseCounter++;
    }

    requestAnimationFrame(draw);
}
CASStorage();
draw();

var menuVisible = false;
var menuButton = document.querySelector('.menu-button');

menuButton.addEventListener('click', toggleMenuState);

function toggleMenuState() {
    menuVisible = !menuVisible;
    if (menuVisible) {
        document.body.classList.add('menu-visible');
    } else {
        document.body.classList.remove('menu-visible');
    }
}