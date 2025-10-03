import { AStar } from "./AStar.js";

const mainBoard = document.getElementById("game-board");
function initBoard(board, count) {
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

    for (let i=0; i<(count**2)-1; i++) {
        const tile = document.createElement("div");
        
        const row = Math.floor(i/count)
        const col = (i%count)
        tile.style.gridRow = row+1
        tile.style.gridColumn = col+1
        board.board[row][col] = tile

        tile.innerText = i+1
        board.append(tile);
    }
    const empty = document.createElement("div");
    empty.style.backgroundColor = "white";
    empty.className = "empty"
    empty.style.gridArea = `${count} / ${count}`
    board.append(empty);

    console.log(board, `initialized ${count}x${count} board`)
    console.log(board.board)
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
})
initBoard(mainBoard, 3)

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

document.getElementById("button-solve").addEventListener("click", (e) => {
    const selected_algorithm = document.getElementById("selected-algo").value
    let current_board_state = stringifyBoard(mainBoard.board)
    if (selected_algorithm == "astar") {
        const moves = AStar(current_board_state)
        console.log(moves)
        performMoves(moves, 250)
    }
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