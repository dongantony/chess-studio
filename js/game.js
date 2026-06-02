const board = document.getElementById("chessboard");
let gameOver = false
let selectedSquare = null
let currentTurn = "w"
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
            square.addEventListener("click", handleSquareClick)

            const piece = gameboard[row][col];

            if(piece) {
                square.textContent = pieces[piece]
            }

            board.appendChild(square);
        }
    }
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

        event.target.classList.add("selected");

        return;
    }

    const from = selectedSquare
    const to = {row, col}
    const piece = gameboard[from.row][from.col]

    if(isLegalMove(piece, from, to)) {
        const isCastleMove = piece[1] === "k" && Math.abs(to.col - from.col) === 2;

        gameboard[to.row][to.col] = piece;
        gameboard[from.row][from.col] = null;

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

        currentTurn = (currentTurn === "w" ? "b" : "w") 

        if(isCheckmate(currentTurn)) {
            gameOver = true;
            const winner = currentTurn === "w" ? "Black" : "White";
            alert(`Checkmate! ${winner} wins!`);
        }
        else if(isKingInCheck(currentTurn)) {
            alert("Check!");
        }
        else if(isStalemate(currentTurn)) {
            gameOver = true;
            alert("Stalemate! It's a draw!");
        }
    } 
    selectedSquare = null
    renderBoard();
}

renderBoard();