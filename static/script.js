const mainBoard = document.getElementById("game-board");
function initBoard(board, count) {
    board.innerHTML = ""
    board.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${count}, 1fr)`;

    board.board = []
    for (let i=0; i<count; i++) {
        const row = []
        for (let j=0; j<count; j++) {
            row.push(undefined)
        }
        board.board.push(row)
    }

    for (let i=0; i<(count**2); i++) {
        const tile = document.createElement("div");
        if (i==(count**2)-1) {
            tile.style.backgroundColor = "white";
            tile.className = "empty"
        } else {
            tile.innerText = i+1
        }
        const row = Math.floor(i/count)
        const col = (i%count)
        tile.style.gridArea = `${row+1} / ${col+1}`
        board.board[row][col] = tile
        board.append(tile);
    }
    console.log(board, `initialized ${count}x${count} board`)
}

function shuffleBoard(board) {
    cancelMoves()
    for (let i=0; i<500; i++) {
        const rnd = Math.floor(Math.random()*4);
        if (rnd == 0) {
            move(board, 0, 1)
        } else if (rnd == 1) {
            move(board, 0, -1)
        } else if (rnd == 2) {
            move(board, 1, 0)
        } else if (rnd == 3) {
            move(board, -1, 0)
        }
    }
}
document.getElementById("button-shuffle").addEventListener('click', () => {
    shuffleBoard(mainBoard)
    initialStateInput.value = stringifyBoard(mainBoard.board)
})

initBoard(mainBoard, 3)
document.getElementById("button-size-3").addEventListener("click", (e) => {
    cancelMoves()
    initBoard(mainBoard, 3)
    mainBoard.style.fontSize = "2rem"
})
document.getElementById("button-size-4").addEventListener("click", (e) => {
    cancelMoves()
    initBoard(mainBoard, 4)
    mainBoard.style.fontSize = "1.5rem"
})

const animationDirections = [
    ["", "moveRight", ""],
    ["moveUp", "", "moveDown"],
    ["", "moveLeft", ""],
]
function move(board, x, y) {
    const board_row_count = board.board.length
    const board_col_count = board.board[0].length

    const empty = board.querySelector(".empty")
    let empty_row = parseInt(empty.style.gridRow)
    let empty_col = parseInt(empty.style.gridColumn)
    if (
        0 > empty_row-1+y ||
        board_row_count <= empty_row-1+y ||
        0 > empty_col-1+x ||
        board_col_count <= empty_col-1+x
    ) return;
    const to_swap = board.board[empty_row-1+y][empty_col-1+x]
    to_swap.style.gridRow = empty_row
    to_swap.style.gridColumn = empty_col
    empty.style.gridRow = empty_row+y
    empty.style.gridColumn = empty_col+x

    const animName = animationDirections[x+1][y+1]
    to_swap.style.animation = `.2s linear ${animName}`
    to_swap.addEventListener("animationend", (e) => {
        e.target.style.animation = ""
    })

    board.board[empty_row-1+y][empty_col-1+x] = empty
    board.board[empty_row-1][empty_col-1] = to_swap
}

const controls = [
    ["W", "w", "ArrowUp"],
    ["S", "s", "ArrowDown"],
    ["A", "a", "ArrowLeft"],
    ["D", "d", "ArrowRight"],
]
document.addEventListener("keydown", (e) => {
    if (controls[0].includes(e.key)) {
        move(mainBoard, 0, 1)
    } else if (controls[1].includes(e.key)) {
        move(mainBoard, 0, -1)
    } else if (controls[2].includes(e.key)) {
        move(mainBoard, 1, 0)
    } else if (controls[3].includes(e.key)) {
        move(mainBoard, -1, 0)
    }
})

function stringifyBoard(board) {
    let current_board_state = []
    for (const row of board) {
        for (const cell of row) {
            current_board_state.push(cell.className == "empty" ? "0" : cell.innerText)
        }
    }
    return current_board_state.join(',')
}

function animateValue(element, value, time, endStr="") {
    let start = 0;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / time, 1);
        element.innerText = `${Math.floor(progress * value)}${endStr}`;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

const statistics = document.getElementById("statistics")
document.getElementById("button-solve").addEventListener("click", (e) => {
    const selected_algorithm = document.getElementById("selected-algo").value
    let current_board_state = stringifyBoard(mainBoard.board)
    let algoWorker = null
    if (selected_algorithm == "astar-manhattan") {
        algoWorker = new Worker("/static/AStarManhattan.js")
    } else if (selected_algorithm == "astar-euclidian") {
        algoWorker = new Worker("/static/AStarEuclidian.js")
    } else if (selected_algorithm == "greedy-manhattan") {
        algoWorker = new Worker("/static/GreedyManhattan.js")
    } else if (selected_algorithm == "greedy-euclidian") {
        algoWorker = new Worker("/static/GreedyEuclidian.js")
    }
    algoWorker.postMessage(current_board_state)
    const startTime = new Date()
    let endTime = null
    algoWorker.onmessage = (e) => {
        endTime = new Date()
        console.log(e.data)
        const moves = e.data[0]
        const traversed = e.data[1]
        const time = e.data[2]
        if (moves.length < 1) {
            console.log("No Moves Generated")
            return
        }
        statistics.querySelector("p:nth-child(2)").innerText = `${time}ms`
        const travAnimTime = Math.min(traversed*1.5, 6*1000)
        animateValue(statistics.querySelector("p:nth-child(4)"), traversed, travAnimTime)
        setTimeout(() => {
            animateValue(statistics.querySelector("p:nth-child(6)"), moves.length, moves.length*20)
        }, travAnimTime)
        performMoves(moves, 250)
    }
    function trackTime() {
        const now = new Date()
        statistics.querySelector("p:nth-child(2)").innerText = `${now-startTime}ms`
        if (!endTime) requestAnimationFrame(trackTime)
    }
    requestAnimationFrame(trackTime)
})

let scheduledMoves = []

function cancelMoves() {
    for (const move of scheduledMoves) {
        clearTimeout(move)
    }
}

function scheduleMove(movex, movey, time) {
    const scheduledMove = setTimeout(() => {
        move(mainBoard, movex, movey)
    }, time);
    scheduledMoves.push(scheduledMove)
}

function performMoves(moves, interval) {
    for (let i=0; i<moves.length;i++) {
        const step = moves[i]
        if (step == "up") {
            scheduleMove(0, 1, i*interval)
        } else if (step == "down") {
            scheduleMove(0, -1, i*interval)
        } else if (step == "left") {
            scheduleMove(1, 0, i*interval)
        } else if (step == "right") {
            scheduleMove(-1, 0, i*interval)
        }
    }
}

let delayedSetState = null
const initialStateInput = document.getElementById("initial-state")
const iniitializeButton = document.getElementById("button-initialize")
initialStateInput.addEventListener("keydown", (e) => {
    if (delayedSetState) clearInterval(delayedSetState)
    delayedSetState = setTimeout(() => {
        setBoardState(mainBoard, e.target.value)
    }, 100);
})
iniitializeButton.addEventListener("click", (e) => {
    setBoardState(mainBoard, initialStateInput.value)
})
function setBoardState(board, state) {
    state = state.split(",")
    let size = Math.sqrt(state.length)
    if (!Number.isInteger(size) || size < 2) return;
    cancelMoves()
    board.board = []
    board.innerHTML = ""
    for (let i=0; i<size; i++) {
        const row = []
        for (let j=0; j<size; j++) {
            row.push(undefined)
        }
        board.board.push(row)
    }

    for (let i=0; i<state.length; i++) {
        const cell = state[i]
        const row = Math.floor(i/size)
        const col = (i%size)
        const tile = document.createElement("div");
        if (cell == 0) {
            tile.style.backgroundColor = "white";
            tile.className = "empty"
        } else {
            tile.innerText = cell
        }
        board.board[row][col] = tile
        tile.style.gridArea = `${row+1} / ${col+1}`
        board.append(tile);
    }
}