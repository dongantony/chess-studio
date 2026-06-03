const board = document.getElementById("chessboard");
let gameOver = false
let lastMove = null
let selectedSquare = null
let currentTurn = "w"

let highlightedMoves = []
let hasMoved = {
    wk: false,
    bk: false,
    wkr: false,
    wqr: false,
    bkr: false,
    bqr: false
}

function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            
            const square = document.createElement("div");

            square.classList.add("square");

            if((row + col) % 2 == 0) {
                square.classList.add("light")
            } 
            else {
                square.classList.add("dark")
            }

            square.dataset.row = row;
            square.dataset.col = col;
            const isHighlighted = highlightedMoves.some(m => m.row === row && m.col === col)
            const target = gameboard[row][col]

            if(isHighlighted) {
                if(target && target[0] !== currentTurn) {
                    square.classList.add("capturehint")
                } 
                else {
                    square.classList.add("movehint")
                }
            }

            square.addEventListener("click", handleSquareClick)

            const piece = gameboard[row][col];

            if(piece) {
                square.textContent = pieces[piece]
            }

            board.appendChild(square);
        }
    }
}

function clearHighlights() {
    highlightedMoves = []
}

function handleSquareClick(event) {
    const row = Number(event.target.dataset.row)
    const col = Number(event.target.dataset.col)

    const clickedPiece = gameboard[row][col] 

    if(gameOver) return;

    if(!selectedSquare) {

        if(!clickedPiece) return;
        if(clickedPiece[0] !== currentTurn) return;

        selectedSquare = {row, col};
        
        const piece = gameboard[row][col]
        console.log("selected:", piece);
        console.log("moves:", highlightedMoves);
        highlightedMoves = getLegalMovesForPiece(piece, selectedSquare)

        return;
    }

    const from = selectedSquare
    const to = {row, col}
    const piece = gameboard[from.row][from.col]

    if(isLegalMove(piece, from, to)) {
        const isCastleMove = piece[1] === "k" && Math.abs(to.col - from.col) === 2;
        const isEnPassant = piece[1] === "p" && Math.abs(to.col - from.col) === 1 && !gameboard[to.row][to.col] &&
                            lastMove && Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
                            lastMove.to.row === from.row && lastMove.to.col === to.col

        gameboard[to.row][to.col] = piece;
        gameboard[from.row][from.col] = null;

        if(isEnPassant) {
            gameboard[from.row][to.col] = null
        }

        promotePawn(piece, to.row, to.col)
        markMoved(piece, from)
        
        if(isCastleMove) {
            if(to.col === 6) {
                const rook = gameboard[from.row][7];
                gameboard[from.row][5] = gameboard[from.row][7];
                gameboard[from.row][7] = null;

                markMoved(rook, {row: from.row, col: 7})
            }
            
            if(to.col === 2) {
                const rook = gameboard[from.row][0];
                gameboard[from.row][3] = gameboard[from.row][0];
                gameboard[from.row][0] = null;

                markMoved(rook, {row: from.row, col: 0})
            }
        }

        lastMove = {piece, from: {...from}, to: {...to}}
        currentTurn = (currentTurn === "w" ? "b" : "w") 

        if(isCheckmate(currentTurn)) {
            gameOver = true;
            const winner = currentTurn === "w" ? "Black" : "White";
            alert(`Checkmate! ${winner} wins!`);
        }
        else if(isStalemate(currentTurn)) {
            gameOver = true;
            alert("Stalemate! It's a draw!");
        }
        else if(isInsufficientMaterial()) {
            gameOver = true;
            alert("Draw due to insufficient material!");
        }
        else if(isKingInCheck(currentTurn)) {
            alert("Check!");
        }
    } 
    selectedSquare = null
    clearHighlights();
    renderBoard();
}

renderBoard();