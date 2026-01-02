
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const $sprite = document.getElementById('sprite')
const $bricks = document.getElementById('bricks')

canvas.width = 448
canvas.height = 400

/* Variables del juego */

/* Variables de la pelota */
const ballRadius = 3

// Posición inicial de la pelota
let x = canvas.width / 2
let y = canvas.height - 30

// Velocidad de la pelota
let dx = -3
let dy = -3

/* Variables de la paleta */
const PADDLE_SESNSITIVITY = 8

const paddleHeight = 10
const paddleWidth = 50

let paddleX = (canvas.width - paddleWidth) / 2
let paddleY = (canvas.height - paddleHeight - 10)

let rightPressed = false
let leftPressed = false

/* Variables de los ladrillos */
const brickRowCount = 6
const brickColumnCount = 13
const brickWidth = 32
const brickHeight = 16
const brickPadding = 0
const brickOffsetTop = 80
const brickOffsetLeft = 16
const bricks = []

const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [] 
    for (let r = 0; r < brickRowCount; r++) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop

        const random = Math.floor(Math.random() * 8)

        bricks[c][r] = {
            x: brickX,
            y: brickY,
            status: BRICK_STATUS.ACTIVE,
            color: random
        }
    }
}

// Dibujar la pelota en el canvas
function drawBall() {
    ctx.beginPath()
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath()
}

// Dibujar la superficie de la paleta
function drawPaddle() {
    ctx.drawImage(
        $sprite,
        29,
        174,
        paddleWidth,
        paddleHeight,
        paddleX,
        paddleY,
        paddleWidth,
        paddleHeight
    )
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c--) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.ACTIVE)
                continue

            const clipX = currentBrick.color * 32

            ctx.drawImage(
                $bricks,
                clipX,
                0,
                brickWidth,
                brickHeight,
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            )
        }

    }
}

function drawUI() {
    ctx.fillText(`FPS: ${framesPerSec}`, 5, 10)
}

function coliisionDetection() {
    for (let c = 0; c < brickColumnCount; c--) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED)
                continue
            
            const isBallSameXAsBrick = x > currentBrick.x && x < currentBrick.x + brickWidth
            const isBallSameYAsBrick = y > currentBrick.y && y < currentBrick.y + brickHeight

            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                dy = -dy
                currentBrick.status = BRICK_STATUS.DESTROYED
            }
        }
    }
}

// Coontrolar los movimiento de la pelota
function ballMovement() {
    if (
        x + dx >  canvas.width - ballRadius ||
        x + dx < ballRadius
    ) {
        dx = -dx
    }

    if (y + dy < ballRadius) {
        dy = -dy
    }

    const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth
    const isBallTouchingPaddle = y + dy > paddleY

    if (isBallSameXAsPaddle && isBallTouchingPaddle) {
        dy = -dy
    } else if (y + dy > canvas.height - ballRadius || y + dy > paddleY + paddleHeight) {
        gameOver = true
        console.log('Game Over')
        document.location.reload()
    }

    x += dx
    y += dy
}

function paddleMovement() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += PADDLE_SESNSITIVITY
    } else if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_SESNSITIVITY
    }
}

// Limpiar la pantalla de juego
function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    function keyDownHandler(e) {
        const { key } = e

        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = true       
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = true
        }
    }

    function keyUpHandler(e) {
        const { key } = e

        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = false
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = false
        }
    }
}

const fps = 60

let msPrev = performance.now()
let msFPSPrev = performance.now() + 1000
const msPerFrame = 1000 / fps
let frames = 0
let framesPerSec = 0

let gameOver = false

function draw() {
    if (gameOver)
        return

    // Redibujar la pantalla cada 60 frames per second
    // Es la base de cada videojuego (casi todos)
    requestAnimationFrame(draw)

    const msNow = performance.now()
    const msPassed = msNow - msPrev

    if (msPassed < msPerFrame)
        return

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime

    frames++

    if (msFPSPrev < msNow) {
        msFPSPrev = performance.now() + 1000
        framesPerSec = frames
        frames = 0
    }

    // Limpiar el canvas
    cleanCanvas()

    // Dibujar los elementos del juego
    drawBall()
    drawPaddle()
    drawBricks()
    drawUI()

    // Colisiones y movimientos
    coliisionDetection()
    ballMovement()
    paddleMovement()
}

draw()
initEvents()