function initBoard(board, count) {
    board.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${count}, 1fr)`;

    for (let i=0; i<(count**2)-1; i++) {
        const tile = document.createElement("div");
        tile.innerText = i+1
        board.append(tile);
    }

    console.log(board, `initialized ${count}x${count} board`)
}

function shuffleBoard(board) {
    
}

initBoard(document.getElementById("game-board"), 5)